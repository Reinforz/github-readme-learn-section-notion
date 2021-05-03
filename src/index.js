const core = require('@actions/core');
const { NotionEndpoints } = require('@nishans/endpoints');
const fs = require('fs');
const { commitFile } = require('./utils');
const qs = require('querystring');

const ColorMap = {
  default: '505558',
  gray: '979a9b',
  brown: '695b55',
  orange: '9f7445',
  yellow: '9f9048',
  green: '467870',
  blue: '487088',
  purple: '6c598f',
  pink: '904d74',
  red: '9f5c58'
};

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
        token: NOTION_TOKEN_V2,
        user_id: ''
      }
    );

    core.info('Fetched database');

    const collectionView = collectionViewData.recordMap.block[databaseId].value;

    // If a database with the passed id doesn't exist
    if (!collectionView) {
      return core.setFailed(
        `Either your NOTION_TOKEN_V2 has expired or a database with id:${databaseId} doesn't exist`
      );
    }

    const collection_id = collectionView.collection_id;
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
        token: NOTION_TOKEN_V2,
        user_id: ''
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
        token: NOTION_TOKEN_V2,
        user_id: ''
      }
    );

    core.info('Fetched rows');

    const collection = collectionData.recordMap.collection[collection_id].value;
    const { schema } = collection;

    // Validate collection schema
    const schema_entries = Object.entries(schema),
      category_schema_entry = schema_entries.find(
        ([, schema_entry_value]) =>
          schema_entry_value.type === 'multi_select' &&
          schema_entry_value.name === 'Category'
      ),
      color_schema_entry = schema_entries.find(
        ([, schema_entry_value]) =>
          schema_entry_value.type === 'text' &&
          schema_entry_value.name === 'Color'
      );

    if (!category_schema_entry)
      return core.setFailed(
        "Couldn't find Category named multi_select type column in the database"
      );
    if (!category_schema_entry)
      return core.setFailed(
        "Couldn't find Color named text type column in the database"
      );

    const rows = Object.values(recordMap.block)
      .filter((block) => block.value.id !== databaseId)
      .map((block) => block.value);

    if (rows.length === 0) return core.error('No database rows detected');
    else {
      const categories = category_schema_entry[1].options
        .map((option) => ({
          color: option.color,
          value: option.value
        }))
        .sort((categoryA, categoryB) =>
          categoryA.value > categoryB.value ? 1 : -1
        );

      const categories_map = new Map();

      categories.forEach((category) => {
        categories_map.set(category.value, {
          items: [],
          ...category
        });
      });

      rows
        .sort((rowA, rowB) =>
          rowA.properties.title[0][0] > rowB.properties.title[0][0] ? 1 : -1
        )
        .forEach((row) => {
          const category = row.properties[category_schema_entry[0]][0][0];
          if (!category) throw new Error('Each row must have a category value');
          const category_value = categories_map.get(category);
          category_value.items.push(row.properties);
        });

      const newLines = [];

      for (const [category, category_info] of categories_map) {
        const content = [
          `<h3><img height="20px" src="https://img.shields.io/badge/${category}-${
            ColorMap[category_info.color]
          }"/></h3>`
        ];
        category_info.items.forEach((item) =>
          content.push(
            `<img src="https://img.shields.io/badge/-${qs.escape(
              item.title[0][0]
            )}-${
              item[color_schema_entry[0]][0][0]
            }?style=flat-square&amp;logo=${qs.escape(item.title[0][0])}" alt="${
              item.title[0][0]
            }"/>`
          )
        );
        newLines.push(...content, '<hr>');
      }

      const README_PATH = `${process.env.GITHUB_WORKSPACE}/README.md`;
      core.info(`Reading from ${README_PATH}`);

      const readmeLines = fs.readFileSync(README_PATH, 'utf-8').split('\n');
      let startIdx = readmeLines.findIndex(
        (content) => content.trim() === '<!--START_SECTION:learn-->'
      );

      if (startIdx === -1) {
        return core.setFailed(
          `Couldn't find the <!--START_SECTION:learn--> comment. Exiting!`
        );
      }

      const endIdx = readmeLines.findIndex(
        (content) => content.trim() === '<!--END_SECTION:learn-->'
      );

      if (endIdx === -1) {
        return core.setFailed(
          `Couldn't find the <!--END_SECTION:learn--> comment. Exiting!`
        );
      }

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
        return core.setFailed(err.message);
      }
    }
  } catch (error) {
    return core.setFailed(error.message);
  }
}

main();
