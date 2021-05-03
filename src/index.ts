import * as core from '@actions/core';
import { NotionEndpoints } from '@nishans/endpoints';
import { ICollection, ICollectionBlock } from '@nishans/types';
import fs from 'fs';
import { checkForSections } from './utils/checkForSections';
import { commitFile } from './utils/commitFile';
import { constructCategoriesMap } from './utils/constructCategoriesMap';
import { constructNewContents } from './utils/constructNewContents';
import { getSchemaEntries } from './utils/getSchemaEntries';
import { modifyRows } from './utils/modifyRows';

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

    const collectionView = collectionViewData.recordMap.block![databaseId]
      .value as ICollectionBlock;

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

    const collection = collectionData.recordMap.collection![collection_id]
      .value as ICollection;
    const { schema } = collection;
    const [category_schema_entry, color_schema_entry] = getSchemaEntries(
      schema
    );

    const rows = modifyRows(recordMap, databaseId);

    if (rows.length === 0) return core.error('No database rows detected');
    else {
      const categories_map = constructCategoriesMap(category_schema_entry[1]);
      rows.forEach((row) => {
        const category = row.properties[category_schema_entry[0]][0][0];
        if (!category) throw new Error('Each row must have a category value');
        const category_value = categories_map.get(category);
        category_value!.items.push(row.properties);
      });

      const README_PATH = `${process.env.GITHUB_WORKSPACE}/README.md`;
      core.info(`Reading from ${README_PATH}`);

      const readmeLines = fs.readFileSync(README_PATH, 'utf-8').split('\n');

      const [startIdx, endIdx] = checkForSections(readmeLines);
      const newLines = constructNewContents(
        categories_map,
        color_schema_entry[0]
      );

      const finalLines = [
        ...readmeLines.slice(0, startIdx + 1),
        ...newLines,
        ...readmeLines.slice(endIdx)
      ];

      core.info(`Writing to ${README_PATH}`);

      console.log(finalLines);

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
