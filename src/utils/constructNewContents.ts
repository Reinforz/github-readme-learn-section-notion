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
  categories_map: ICategoryMap,
  color_schema_unit_key: string
) => {
  const newContents: string[] = [];

  for (const [category, category_info] of categories_map) {
    const content = [
      `<h3><img height="20px" src="https://img.shields.io/badge/${category}-${
        ColorMap[category_info.color]
      }"/></h3>`
    ];
    category_info.items.forEach((item) =>
      content.push(
        `<span><img src="https://img.shields.io/badge/-${qs.escape(
          item.title[0][0]
        )}-${
          item[color_schema_unit_key][0][0]
        }?style=flat-square&amp;logo=${qs.escape(item.title[0][0])}" alt="${
          item.title[0][0]
        }"/></span>`
      )
    );
    newContents.push(...content, '<hr>');
  }
  return newContents;
};
