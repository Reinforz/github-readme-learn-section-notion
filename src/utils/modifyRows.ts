import { IPage, RecordMap } from '@nishans/types';

/**
 * Sorts an array of page blocks by their title
 * @param recordMap Record map to sort blocks from
 * @param databaseId Database id to filter block
 * @returns An array of pages sorted by their title
 */
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
