import * as core from '@actions/core';
import { NotionEndpoints } from '@nishans/endpoints';
import { RecordMap, TData } from '@nishans/types';

export const fetchData = async <T extends TData>(
  id: string,
  table: keyof RecordMap
) => {
  const NOTION_TOKEN_V2 = core.getInput('token_v2');
  const response = await NotionEndpoints.Queries.syncRecordValues(
    {
      requests: [
        {
          id,
          table,
          version: -1
        }
      ]
    },
    {
      token: NOTION_TOKEN_V2,
      user_id: ''
    }
  );

  const data = response.recordMap[table]![id].value as T;

  if (!data) {
    core.setFailed(
      `Either your NOTION_TOKEN_V2 has expired or a ${table} with id:${id} doesn't exist`
    );
  }

  return data;
};
