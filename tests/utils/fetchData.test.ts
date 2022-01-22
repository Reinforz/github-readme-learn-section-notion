import * as core from '@actions/core';
import { HttpClient } from '@actions/http-client';
import { fetchData } from '../../src/utils/fetchData';

afterEach(() => {
  jest.restoreAllMocks();
});

it(`Should fetch data successfully`, async () => {
  let http = new HttpClient();

  const syncRecordValuesMock = jest
    .spyOn(http, 'post' as any)
    .mockImplementationOnce(async () => {
      return {
        async readBody() {
          return JSON.stringify({
            recordMap: {
              block: {
                block_1: {
                  role: 'comment_only',
                  value: {
                    id: 'block_1'
                  }
                }
              }
            }
          });
        }
      };
    });

  const data = await fetchData('block_1', 'block', http);

  expect(data).toStrictEqual({
    id: 'block_1'
  });
  expect(syncRecordValuesMock).toHaveBeenCalledWith(
    `https://www.notion.so/api/v3/syncRecordValues`,
    JSON.stringify({
      requests: [
        {
          id: 'block_1',
          table: 'block',
          version: -1
        }
      ]
    })
  );
});

it(`Should not fetch data`, async () => {
  let http = new HttpClient();
  const setFailed = jest.spyOn(core, 'setFailed');
  const syncRecordValuesMock = jest
    .spyOn(http, 'post' as any)
    .mockImplementationOnce(async () => {
      return {
        async readBody() {
          return JSON.stringify({
            recordMap: {
              block: {
                block_1: {
                  role: 'comment_only'
                }
              } as any
            }
          });
        }
      };
    });

  const data = await fetchData('block_1', 'block', http);

  expect(data).toStrictEqual(undefined);
  expect(syncRecordValuesMock).toHaveBeenCalledWith(
    `https://www.notion.so/api/v3/syncRecordValues`,
    JSON.stringify({
      requests: [
        {
          id: 'block_1',
          table: 'block',
          version: -1
        }
      ]
    })
  );
  expect(setFailed).toHaveBeenCalledWith(
    `Either your NOTION_TOKEN_V2 has expired or a block with id:block_1 doesn't exist`
  );
});
