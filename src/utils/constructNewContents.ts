import { TTextColor } from '@nishans/types';
import qs from 'querystring';
import { ICategoryMap } from '../types';

const ColorMap: Record<TTextColor | 'green', string> = {
  default: '505558',
  gray: '979a9b',
  brown: '695b55',
  orange: '9f7445',
  yellow: '9f9048',
  green: '467870',
  blue: '487088',
  purple: '6c598f',
  pink: '904d74',
  red: '9f5c58',
  teal: '467870'
};

export const constructNewContents = (
  categoriesMap: ICategoryMap,
  colorSchemaUnitKey: string,
  base64SchemaUnitKey: string
) => {
  const newContents: string[] = [];
  for (const [category, categoryInfo] of categoriesMap) {
    const content = [
      `<h3><img height="20px" src="https://img.shields.io/badge/${qs.escape(
        category
      )}-${ColorMap[categoryInfo.color]}"/></h3>`
    ];
    categoryInfo.items.forEach((item) => {
      const title = item.title && item.title[0][0];
      if (!title)
        throw new Error(`Each row must have value in the Name column`);
      let logo: string = qs.escape(title);
      // At first check if the user provided a base64 encoded svg logo
      if (item[base64SchemaUnitKey]?.[0][0]) {
        logo = item[base64SchemaUnitKey][0][0];
      }
      content.push(
        `<span><img src="https://img.shields.io/badge/-${qs.escape(title)}-${
          item[colorSchemaUnitKey]?.[0][0] ?? 'black'
        }?style=flat-square&amp;logo=${logo}" alt="${title}"/></span>`
      );
    });
    newContents.push(...content, '<hr>');
  }
  return newContents;
};
