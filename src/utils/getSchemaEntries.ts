import * as core from '@actions/core';
import {
  Schema,
  SelectSchemaUnit,
  TextSchemaUnit,
  TitleSchemaUnit
} from '@nishans/types';

export const getSchemaEntries = (schema: Schema) => {
  const schemaEntries = Object.entries(schema);
  let categorySchemaEntry: [string, SelectSchemaUnit] | undefined = undefined,
    nameSchemaEntry: [string, TitleSchemaUnit] | undefined = undefined,
    colorSchemaEntry: [string, TextSchemaUnit] | undefined = undefined,
    base64SchemaEntry: [string, TextSchemaUnit] | undefined = undefined;

  schemaEntries.forEach((schemaEntry) => {
    if (schemaEntry[1].type === 'text' && schemaEntry[1].name === 'Color') {
      colorSchemaEntry = schemaEntry as [string, TextSchemaUnit];
    } else if (
      schemaEntry[1].type === 'title' &&
      schemaEntry[1].name === 'Name'
    ) {
      nameSchemaEntry = schemaEntry as [string, TitleSchemaUnit];
    } else if (
      schemaEntry[1].type === 'select' &&
      schemaEntry[1].name === 'Category'
    ) {
      categorySchemaEntry = schemaEntry as [string, SelectSchemaUnit];
    } else if (
      schemaEntry[1].type === 'text' &&
      schemaEntry[1].name === 'Base64'
    ) {
      base64SchemaEntry = schemaEntry as [string, TextSchemaUnit];
    }
  });

  if (!categorySchemaEntry)
    core.setFailed(
      "Couldn't find Category named select type column in the database"
    );
  if (!nameSchemaEntry)
    core.setFailed(
      "Couldn't find Color named text type column in the database"
    );
  if (!colorSchemaEntry)
    core.setFailed(
      "Couldn't find Name named title type column in the database"
    );
  return [
    categorySchemaEntry,
    colorSchemaEntry,
    nameSchemaEntry,
    base64SchemaEntry
  ] as const;
};
