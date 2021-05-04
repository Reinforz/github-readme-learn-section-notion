import { IPage } from '@nishans/types';
import { ICategoryMap } from '../../src/types';
import { populateCategoriesMapItems } from '../../src/utils/populateCategoriesMapItems';

it(`Should work`, () => {
  const category_map: ICategoryMap = new Map([
    [
      'Library',
      {
        color: 'teal',
        items: []
      }
    ]
  ]);
  const rows: IPage[] = [
    {
      properties: {
        title: [['React']],
        category: [['Library']]
      }
    } as any
  ];
  populateCategoriesMapItems(rows, 'category', category_map);

  expect(Array.from(category_map.entries())).toStrictEqual([
    [
      'Library',
      {
        color: 'teal',
        items: [
          {
            title: [['React']],
            category: [['Library']]
          }
        ]
      }
    ]
  ]);
});

it(`Should fail if category not provided`, () => {
  const category_map: ICategoryMap = new Map([
    [
      'Library',
      {
        color: 'teal',
        items: []
      }
    ]
  ]);
  const rows: IPage[] = [
    {
      properties: {
        title: [['React']]
      }
    } as any
  ];
  expect(() =>
    populateCategoriesMapItems(rows, 'category', category_map)
  ).toThrow();
});
