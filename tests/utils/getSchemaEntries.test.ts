import * as core from '@actions/core';
import {
  SelectSchemaUnit,
  TextSchemaUnit,
  TitleSchemaUnit
} from '@nishans/types';
import { getSchemaEntries } from '../../src/utils/getSchemaEntries';

afterEach(() => {
  jest.restoreAllMocks();
});

it(`Should find both color and category entries`, () => {
  const color_schema_unit = {
      type: 'text',
      name: 'Color'
    } as TextSchemaUnit,
    category_schema_unit = {
      type: 'select',
      name: 'Category',
      options: []
    } as SelectSchemaUnit,
    title_schema_unit = {
      type: 'title',
      name: 'Name',
      options: []
    } as TitleSchemaUnit;
  const [
    category_schema_entry,
    color_schema_entry,
    title_schema_entry
  ] = getSchemaEntries({
    color: color_schema_unit,
    category: category_schema_unit,
    title: title_schema_unit
  });

  expect(category_schema_entry).toStrictEqual([
    'category',
    category_schema_unit
  ]);

  expect(title_schema_entry).toStrictEqual(['title', title_schema_unit]);
  expect(color_schema_entry).toStrictEqual(['color', color_schema_unit]);
});

it(`Should not find both color, title, category entries`, () => {
  const color_schema_unit = {
      type: 'text',
      name: 'color'
    } as TextSchemaUnit,
    category_schema_unit = {
      type: 'select',
      name: 'category',
      options: []
    } as SelectSchemaUnit,
    title_schema_unit = {
      type: 'title',
      name: 'name',
      options: []
    } as TitleSchemaUnit;

  const setFailedMock = jest.spyOn(core, 'setFailed');

  const [
    category_schema_entry,
    color_schema_entry,
    title_schema_entry
  ] = getSchemaEntries({
    color: color_schema_unit,
    category: category_schema_unit,
    title: title_schema_unit
  });

  expect(setFailedMock).toHaveBeenNthCalledWith(
    1,
    "Couldn't find Category named select type column in the database"
  );
  expect(setFailedMock).toHaveBeenNthCalledWith(
    2,
    "Couldn't find Color named text type column in the database"
  );
  expect(setFailedMock).toHaveBeenNthCalledWith(
    3,
    "Couldn't find Name named title type column in the database"
  );
  expect(category_schema_entry).toStrictEqual(undefined);
  expect(color_schema_entry).toStrictEqual(undefined);
  expect(title_schema_entry).toStrictEqual(undefined);
});
