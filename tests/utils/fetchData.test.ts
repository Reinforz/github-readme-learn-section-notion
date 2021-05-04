import * as core from '@actions/core';
import { NotionEndpoints } from '@nishans/endpoints';
import { fetchData } from '../../src/utils/fetchData';

afterEach(() => {
  jest.restoreAllMocks();
});

it(`Should fetch data successfully`, async () => {
  const fetInputMock = jest
    .spyOn(core, 'getInput')
    .mockImplementationOnce(() => 'token_v2');
  const syncRecordValuesMock = jest
    .spyOn(NotionEndpoints.Queries, 'syncRecordValues')
    .mockImplementationOnce(async () => {
      return {
        recordMap: {
          block: {
            block_1: {
              role: 'comment_only',
              value: {
                id: 'block_1'
              }
            }
          } as any
        }
      };
    });

  const data = await fetchData('block_1', 'block');

  expect(fetInputMock).toHaveBeenCalledWith('token_v2');
  expect(data).toStrictEqual({
    id: 'block_1'
  });
  expect(syncRecordValuesMock).toHaveBeenCalledWith(
    {
      requests: [
        {
          id: 'block_1',
          table: 'block',
          version: -1
        }
      ]
    },
    {
      token: 'token_v2',
      user_id: ''
    }
  );
});

it(`Should not fetch data`, async () => {
  const fetInputMock = jest
    .spyOn(core, 'getInput')
    .mockImplementationOnce(() => 'token_v2');
  const setFailed = jest.spyOn(core, 'setFailed');
  const syncRecordValuesMock = jest
    .spyOn(NotionEndpoints.Queries, 'syncRecordValues')
    .mockImplementationOnce(async () => {
      return {
        recordMap: {
          block: {
            block_1: {
              role: 'comment_only'
            }
          } as any
        }
      };
    });

  const data = await fetchData('block_1', 'block');

  expect(fetInputMock).toHaveBeenCalledWith('token_v2');
  expect(data).toStrictEqual(undefined);
  expect(syncRecordValuesMock).toHaveBeenCalledWith(
    {
      requests: [
        {
          id: 'block_1',
          table: 'block',
          version: -1
        }
      ]
    },
    {
      token: 'token_v2',
      user_id: ''
    }
  );
  expect(setFailed).toHaveBeenCalledWith(
    `Either your NOTION_TOKEN_V2 has expired or a block with id:block_1 doesn't exist`
  );
});
