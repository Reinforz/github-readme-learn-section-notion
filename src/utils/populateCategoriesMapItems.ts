import { IPage } from '@nishans/types';
import { ICategoryMap } from '../types';

export const populateCategoriesMapItems = (
  rows: IPage[],
  category_schema_id: string,
  categories_map: ICategoryMap
) => {
  rows.forEach((row) => {
    const category =
      row.properties[category_schema_id] &&
      row.properties[category_schema_id][0][0];
    if (!category) throw new Error('Each row must have a category value');
    const category_value = categories_map.get(category);
    category_value!.items.push(row.properties);
  });
};
