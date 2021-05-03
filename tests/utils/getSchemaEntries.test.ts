import * as core from '@actions/core';
import { getSchemaEntries } from '../../src/utils/getSchemaEntries';

afterEach(() => {
  jest.restoreAllMocks();
});

it(`Should find both color and category entries`, () => {
  const color_schema_unit = {
      type: 'text',
      name: 'Color'
    } as const,
    category_schema_unit = {
      type: 'multi_select',
      name: 'Category',
      options: []
    } as any;
  const [category_schema_entry, color_schema_entry] = getSchemaEntries({
    color: color_schema_unit,
    category: category_schema_unit
  });

  expect(category_schema_entry).toStrictEqual([
    'category',
    category_schema_unit
  ]);

  expect(color_schema_entry).toStrictEqual(['color', color_schema_unit]);
});

it(`Should not find both color and category entries`, () => {
  const color_schema_unit = {
      type: 'text',
      name: 'color'
    } as const,
    category_schema_unit = {
      type: 'multi_select',
      name: 'category',
      options: []
    } as any;
  const setFailedMock = jest.spyOn(core, 'setFailed');

  const [category_schema_entry, color_schema_entry] = getSchemaEntries({
    color: color_schema_unit,
    category: category_schema_unit
  });

  expect(setFailedMock).toHaveBeenNthCalledWith(
    1,
    "Couldn't find Category named multi_select type column in the database"
  );
  expect(setFailedMock).toHaveBeenNthCalledWith(
    2,
    "Couldn't find Color named text type column in the database"
  );
  expect(category_schema_entry).toStrictEqual(undefined);
  expect(color_schema_entry).toStrictEqual(undefined);
});
