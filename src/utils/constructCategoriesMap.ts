import { MultiSelectSchemaUnit } from '@nishans/types';
import { ICategoryMap } from '../types';

export const constructCategoriesMap = (schema_unit: MultiSelectSchemaUnit) => {
  const categories = schema_unit.options
    .map((option) => ({
      color: option.color,
      value: option.value
    }))
    .sort((categoryA, categoryB) =>
      categoryA.value > categoryB.value ? 1 : -1
    );

  const categories_map: ICategoryMap = new Map();

  categories.forEach((category) => {
    categories_map.set(category.value, {
      items: [],
      ...category
    });
  });
  return categories_map;
};
