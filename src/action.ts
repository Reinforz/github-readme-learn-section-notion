import * as core from '@actions/core';
import { NotionEndpoints } from '@nishans/endpoints';
import { ICollection, TCollectionBlock } from '@nishans/types';
import fs from 'fs';
import { ActionUtils } from './utils';

export async function action() {
  const NOTION_TOKEN_V2 = core.getInput('token_v2');
  let id = core.getInput('database_id').replace(/-/g, '');
  const databaseId = `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(
    12,
    4
  )}-${id.substr(16, 4)}-${id.substr(20)}`;

  const collectionView = await ActionUtils.fetchData<TCollectionBlock>(
    databaseId,
    'block'
  );
  core.info('Fetched database');

  const collection_id = collectionView.collection_id;
  const collection = await ActionUtils.fetchData<ICollection>(
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
  const [
    category_schema_entry,
    color_schema_entry
  ] = ActionUtils.getSchemaEntries(schema);

  const rows = ActionUtils.modifyRows(recordMap, databaseId);
  const categories_map = ActionUtils.constructCategoriesMap(
    category_schema_entry[1]
  );
  ActionUtils.populateCategoriesMapItems(
    rows,
    category_schema_entry[0],
    categories_map
  );

  const README_PATH = `${process.env.GITHUB_WORKSPACE}/README.md`;
  core.info(`Reading from ${README_PATH}`);

  const readmeLines = fs.readFileSync(README_PATH, 'utf-8').split('\n');

  const [startIdx, endIdx] = ActionUtils.checkForSections(readmeLines);
  const newLines = ActionUtils.constructNewContents(
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
  await ActionUtils.commitFile();
}
