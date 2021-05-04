import * as core from '@actions/core';
import { NotionEndpoints } from '@nishans/endpoints';
import { ICollection, TCollectionBlock } from '@nishans/types';
import fs from 'fs';
import { checkForSections } from './utils/checkForSections';
import { commitFile } from './utils/commitFile';
import { constructCategoriesMap } from './utils/constructCategoriesMap';
import { constructNewContents } from './utils/constructNewContents';
import { fetchData } from './utils/fetchData';
import { getSchemaEntries } from './utils/getSchemaEntries';
import { modifyRows } from './utils/modifyRows';

async function main() {
  try {
    const NOTION_TOKEN_V2 = core.getInput('token_v2');
    const databaseId = core.getInput('database_id');

    const collectionView = await fetchData<TCollectionBlock>(
      databaseId,
      'block'
    );
    core.info('Fetched database');

    const collection_id = collectionView.collection_id;
    const collection = await fetchData<ICollection>(
      collection_id,
      'collection'
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

      fs.writeFileSync(README_PATH, finalLines.join('\n'), 'utf-8');

      try {
        await commitFile();
      } catch (err) {
        core.setFailed(err.message);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
