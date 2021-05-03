import { IPage, RecordMap } from '@nishans/types';

export const modifyRows = (
  recordMap: Pick<RecordMap, 'block'>,
  databaseId: string
) => {
  return Object.values(recordMap.block)
    .filter((block) => block.value.id !== databaseId)
    .map((block) => block.value as IPage)
    .sort((rowA, rowB) =>
      rowA.properties.title[0][0] > rowB.properties.title[0][0] ? 1 : -1
    );
};
