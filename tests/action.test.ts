import * as core from '@actions/core';
import { NotionEndpoints } from '@nishans/endpoints';
import { MultiSelectSchemaUnit, Schema } from '@nishans/types';
import fs from 'fs';
import { action } from '../src/action';
import { ActionUtils } from '../src/utils';

afterEach(() => {
  jest.restoreAllMocks();
});

it(`Should work`, async () => {
  const GITHUB_WORKSPACE = `https://github.com/Devorein/github-readme-learn-section-notion`;
  process.env.GITHUB_WORKSPACE = GITHUB_WORKSPACE;

  const category_schema_unit: MultiSelectSchemaUnit = {
      name: 'Category',
      options: [
        {
          color: 'teal',
          id: '1',
          value: 'Runtime'
        },
        {
          color: 'yellow',
          id: '2',
          value: 'Library'
        }
      ],
      type: 'multi_select'
    },
    block_3 = {
      id: 'block_3',
      properties: {
        title: [['Node.js']],
        color: 'green',
        category: [['Runtime']]
      }
    } as any,
    block_2 = {
      id: 'block_2',
      properties: {
        title: [['React']],
        color: 'blue',
        category: [['Library']]
      }
    } as any,
    schema = {
      title: {
        type: 'title',
        name: 'Name'
      },
      color: {
        type: 'text',
        name: 'Color'
      },
      category: category_schema_unit
    } as Schema,
    recordMap = {
      block: {
        block_1: {
          role: 'editor',
          value: {
            id: 'block_1'
          }
        },
        block_2: {
          role: 'editor',
          value: block_2
        },
        block_3: {
          role: 'editor',
          value: block_3
        }
      }
    } as any;

  const getInputMock = jest
    .spyOn(core, 'getInput')
    .mockImplementationOnce(() => 'token_v2')
    .mockImplementationOnce(() => 'block_1');
  const coreInfo = jest.spyOn(core, 'info');
  const fetchDataMock = jest
    .spyOn(ActionUtils, 'fetchData')
    .mockImplementationOnce(async () => {
      return {
        collection_id: 'collection_1'
      } as any;
    })
    .mockImplementationOnce(async () => {
      return {
        schema
      } as any;
    });
  const queryCollectionMock = jest
    .spyOn(NotionEndpoints.Queries, 'queryCollection')
    .mockImplementationOnce(async () => {
      return {
        recordMap
      } as any;
    });

  jest.spyOn(ActionUtils, 'getSchemaEntries').mockImplementationOnce(() => {
    return [
      ['category', category_schema_unit],
      ['color', { name: 'Color', type: 'text' }]
    ];
  });

  jest
    .spyOn(ActionUtils, 'modifyRows')
    .mockImplementationOnce(() => [block_3, block_2]);

  jest.spyOn(ActionUtils, 'constructCategoriesMap').mockImplementationOnce(
    () =>
      new Map([
        [
          'Runtime',
          {
            color: 'teal',
            items: []
          }
        ],
        [
          'Library',
          {
            color: 'yellow',
            items: []
          }
        ]
      ])
  );
  const readFileSyncMock = jest
    .spyOn(fs, 'readFileSync')
    .mockImplementationOnce(
      () =>
        '# Header\nfirst\n<!--START_SECTION:learn-->\n<!--END_SECTION:learn-->\nsecond'
    );
  jest
    .spyOn(ActionUtils, 'checkForSections')
    .mockImplementationOnce(() => [2, 3]);

  jest.spyOn(ActionUtils, 'constructNewContents').mockImplementation(() => {
    return ['new line 1', 'new line 2'];
  });
  const writeFileSyncMock = jest
    .spyOn(fs, 'writeFileSync')
    .mockImplementationOnce(() => undefined);
  jest
    .spyOn(ActionUtils, 'commitFile')
    .mockImplementationOnce(async () => undefined);

  await action();

  expect(coreInfo).toHaveBeenNthCalledWith(1, 'Fetched database');
  expect(coreInfo).toHaveBeenNthCalledWith(2, 'Fetched collection');
  expect(coreInfo).toHaveBeenNthCalledWith(3, 'Fetched rows');
  expect(coreInfo).toHaveBeenNthCalledWith(
    4,
    `Reading from ${GITHUB_WORKSPACE}/README.md`
  );
  expect(coreInfo).toHaveBeenNthCalledWith(
    5,
    `Writing to ${GITHUB_WORKSPACE}/README.md`
  );
  expect(getInputMock).toHaveBeenNthCalledWith(1, 'token_v2');
  expect(getInputMock).toHaveBeenNthCalledWith(2, 'database_id');
  expect(fetchDataMock).toHaveBeenNthCalledWith(1, 'block_1', 'block');
  expect(fetchDataMock).toHaveBeenNthCalledWith(
    2,
    'collection_1',
    'collection'
  );
  expect(queryCollectionMock).toHaveBeenCalledWith(
    {
      collectionId: 'collection_1',
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
      token: 'token_v2',
      user_id: ''
    }
  );
  expect(readFileSyncMock).toHaveBeenCalledWith(
    `${GITHUB_WORKSPACE}/README.md`,
    'utf-8'
  );
  expect(writeFileSyncMock).toHaveBeenCalledWith(
    `${GITHUB_WORKSPACE}/README.md`,
    '# Header\nfirst\n<!--START_SECTION:learn-->\nnew line 1\nnew line 2\n<!--END_SECTION:learn-->\nsecond',
    'utf-8'
  );
});
