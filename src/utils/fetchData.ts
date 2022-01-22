import * as core from '@actions/core';
import { HttpClient } from '@actions/http-client';
import { RecordMap, TData } from '@nishans/types';

export const fetchData = async <T extends TData>(
  id: string,
  table: keyof RecordMap,
  http: HttpClient
) => {
  const response = await http.post(
    `https://www.notion.so/api/v3/syncRecordValues`,
    JSON.stringify({
      requests: [
        {
          id,
          table,
          version: -1
        }
      ]
    })
  );

  const body = JSON.parse(await response.readBody()) as {
    recordMap: RecordMap;
  };

  const data = body.recordMap[table]![id].value as T;

  if (!data) {
    core.setFailed(
      `Either your NOTION_TOKEN_V2 has expired or a ${table} with id:${id} doesn't exist`
    );
  }

  return data;
};
