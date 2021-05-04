import * as core from '@actions/core';
import { MultiSelectSchemaUnit, Schema, TextSchemaUnit } from '@nishans/types';

export const getSchemaEntries = (schema: Schema) => {
  const schema_entries = Object.entries(schema),
    category_schema_entry = schema_entries.find(
      ([, schema_entry_value]) =>
        schema_entry_value.type === 'select' &&
        schema_entry_value.name === 'Category'
    ) as [string, MultiSelectSchemaUnit],
    name_schema_entry = schema_entries.find(
      ([, schema_entry_value]) =>
        schema_entry_value.type === 'title' &&
        schema_entry_value.name === 'Name'
    ) as [string, MultiSelectSchemaUnit],
    color_schema_entry = schema_entries.find(
      ([, schema_entry_value]) =>
        schema_entry_value.type === 'text' &&
        schema_entry_value.name === 'Color'
    ) as [string, TextSchemaUnit];

  if (!category_schema_entry)
    core.setFailed(
      "Couldn't find Category named multi_select type column in the database"
    );
  if (!color_schema_entry)
    core.setFailed(
      "Couldn't find Color named text type column in the database"
    );
  if (!name_schema_entry)
    core.setFailed(
      "Couldn't find Name named title type column in the database"
    );
  return [
    category_schema_entry,
    color_schema_entry,
    name_schema_entry
  ] as const;
};
