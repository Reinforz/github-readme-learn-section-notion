const core = require('@actions/core');
const { NotionEndpoints } = require('@nishans/endpoints');
const fs = require('fs');
const { spawn } = require('child_process');

const commitFile = async () => {
  await exec('git', [
    'config',
    '--global',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com'
  ]);
  await exec('git', ['config', '--global', 'user.name', 'readme-bot']);
  await exec('git', ['add', 'README.md']);
  await exec('git', ['commit', '-m', 'Updated readme with learn section']);
  await exec('git', ['push']);
};

const exec = (cmd, args = []) =>
  new Promise((resolve, reject) => {
    const app = spawn(cmd, args, { stdio: 'pipe' });
    let stdout = '';
    app.stdout.on('data', (data) => {
      stdout = data;
    });
    app.on('close', (code) => {
      if (code !== 0 && !stdout.includes('nothing to commit')) {
        err = new Error(`Invalid status code: ${code}`);
        err.code = code;
        return reject(err);
      }
      return resolve(code);
    });
    app.on('error', reject);
  });

async function main() {
  try {
    const databaseId = core.getInput('database_id');
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
        token: env.NOTION_TOKEN_V2
      }
    );

    core.info('Successfully fetched database');

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
        token: env.NOTION_TOKEN_V2
      }
    );

    core.info('Successfully fetched collection');

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
        token: env.NOTION_TOKEN_V2
      }
    );

    core.info('Successfully fetched rows');

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

    const readmeContent = fs.readFileSync('./test.md', 'utf-8').split('\n');
    // Find the index corresponding to <!--START_SECTION:activity--> comment
    let startIdx = readmeContent.findIndex(
      (content) => content.trim() === '<!--START_SECTION:notion_learn-->'
    );

    // Early return in case the <!--START_SECTION:activity--> comment was not found
    if (startIdx === -1) {
      return console.error(
        `Couldn't find the <!--START_SECTION:notion_learn--> comment. Exiting!`
      );
    }

    // Find the index corresponding to <!--END_SECTION:activity--> comment
    const endIdx = readmeContent.findIndex(
      (content) => content.trim() === '<!--END_SECTION:notion_learn-->'
    );

    const newLines = rows.map(
      (row, idx) => `${idx + 1}. ${row.properties.title[0][0]}`
    );

    const finalLines = [
      ...readmeContent.slice(0, startIdx + 1),
      ...newLines,
      ...readmeContent.slice(endIdx)
    ];

    fs.writeFileSync('./test.md', finalLines.join('\n'));

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
