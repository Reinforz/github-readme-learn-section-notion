const core = require('@actions/core');
const { NotionEndpoints } = require('@nishans/endpoints');
const fs = require('fs');
const { commitFile } = require('./utils');
const path = require('path');

async function main() {
  try {
    const databaseId = core.getInput('database_id');
    const NOTION_TOKEN_V2 = core.getInput('token_v2');

    const collectionViewData = await NotionEndpoints.Queries.syncRecordValues(
      {
        requests: [
          {
            id: databaseId,
            table: 'block',
            version: -1
          }
        ]
      },
      {
        token: NOTION_TOKEN_V2
      }
    );

    core.info('Fetched database');

    // If a database with the passed id doesn't exist
    if (!collectionViewData.recordMap.block[databaseId].value) {
      return core.setFailed(
        `Either your NOTION_TOKEN_V2 has expired or a database with id:${databaseId} doesn't exist`
      );
    }

    const collection_id =
      collectionViewData.recordMap.block[databaseId].value.collection_id;
    const collectionData = await NotionEndpoints.Queries.syncRecordValues(
      {
        requests: [
          {
            id: collection_id,
            table: 'collection',
            version: -1
          }
        ]
      },
      {
        token: NOTION_TOKEN_V2
      }
    );

    core.info('Fetched collection');

    const { recordMap } = await NotionEndpoints.Queries.queryCollection(
      {
        collectionId: collection_id,
        collectionViewId: '',
        query: {},
        loader: {
          type: 'table',
          loadContentCover: false,
          limit: 10000,
          userTimeZone: ''
        }
      },
      {
        token: NOTION_TOKEN_V2
      }
    );

    core.info('Fetched rows');

    const collection = collectionData.recordMap.collection[collection_id].value;
    const { schema } = collection;

    // Validate collection schema
    const schema_entries = Object.entries(schema),
      icon_schema_entry = schema_entries.find(
        ([, schema_entry_value]) =>
          schema_entry_value.type === 'url' &&
          schema_entry_value.name === 'Icon'
      ),
      category_schema_entry = schema_entries.find(
        ([, schema_entry_value]) =>
          schema_entry_value.type === 'multi_select' &&
          schema_entry_value.name === 'Category'
      );
    if (!icon_schema_entry)
      return core.setFailed(
        "Couldn't find Icon named url type column in the database"
      );
    if (!category_schema_entry)
      return core.setFailed(
        "Couldn't find Category named multi_select type column in the database"
      );

    const rows = Object.values(recordMap.block)
      .filter((block) => block.value.id !== databaseId)
      .map((block) => block.value);

    const README_PATH = path.resolve(__dirname, '../README.md');
    core.info(`Reading from ${README_PATH}`);

    const readmeLines = fs.readFileSync(README_PATH, 'utf-8').split('\n');
    console.log(readmeLines);
    // Find the index corresponding to <!--START_SECTION:notion_learn--> comment
    let startIdx = readmeLines.findIndex(
      (content) => content.trim() === '<!--START_SECTION:notion_learn-->'
    );

    // Early return in case the <!--START_SECTION:notion_learn--> comment was not found
    if (startIdx === -1) {
      return core.setFailed(
        `Couldn't find the <!--START_SECTION:notion_learn--> comment. Exiting!`
      );
    }

    // Find the index corresponding to <!--END_SECTION:notion_learn--> comment
    const endIdx = readmeLines.findIndex(
      (content) => content.trim() === '<!--END_SECTION:notion_learn-->'
    );

    const newLines = rows.map(
      (row, idx) => `${idx + 1}. ${row.properties.title[0][0]}`
    );

    const finalLines = [
      ...readmeLines.slice(0, startIdx + 1),
      ...newLines,
      ...readmeLines.slice(endIdx)
    ];

    core.info(`Writing to ${README_PATH}`);

    fs.writeFileSync(README_PATH, finalLines.join('\n'));

    try {
      await commitFile();
    } catch (err) {
      tools.log.debug('Something went wrong');
      return core.setFailed(err.message);
    }
  } catch (error) {
    return core.setFailed(error.message);
  }
}

main();
