import { constructNewContents } from '../../src/utils/constructNewContents';

it('Should Work', () => {
  const categories_map = new Map([
    [
      'Tech Tools',
      {
        items: [
          {
            title: [['React']],
            color: [['blue']]
          },
          {
            title: [['Apollo Graphql']]
          }
        ],
        color: 'teal'
      }
    ]
  ]) as any;

  const new_contents = constructNewContents(categories_map, 'color');
  expect(new_contents).toStrictEqual([
    '<h3><img height="20px" src="https://img.shields.io/badge/Tech%20Tools-467870"/></h3>',
    '<span><img src="https://img.shields.io/badge/-React-blue?style=flat-square&amp;logo=React" alt="React"/></span>',
    '<span><img src="https://img.shields.io/badge/-Apollo%20Graphql-black?style=flat-square&amp;logo=Apollo%20Graphql" alt="Apollo Graphql"/></span>',
    '<hr>'
  ]);
});
