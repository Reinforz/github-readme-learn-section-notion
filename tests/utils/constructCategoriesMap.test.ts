import { constructCategoriesMap } from '../../src/utils/constructCategoriesMap';

it(`Should work`, () => {
  const option_1 = {
      color: 'blue',
      value: 'A'
    } as any,
    option_2 = {
      color: 'yellow',
      value: 'C'
    } as any,
    option_3 = {
      color: 'red',
      value: 'B'
    } as any;
  const categories_map = constructCategoriesMap({
    name: 'Options',
    options: [option_1, option_2, option_3],
    type: 'select'
  });

  expect(Array.from(categories_map.entries())).toStrictEqual([
    [
      'A',
      {
        items: [],
        ...option_1
      }
    ],
    [
      'B',
      {
        items: [],
        ...option_3
      }
    ],
    [
      'C',
      {
        items: [],
        ...option_2
      }
    ]
  ]);
});
