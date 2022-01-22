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
          },
          {
            title: [['Terraform']],
            base64: [['base64']]
          }
        ],
        color: 'teal'
      }
    ]
  ]) as any;

  const newContents = constructNewContents(categories_map, 'color', 'base64');
  expect(newContents).toStrictEqual([
    '<h3><img height="20px" src="https://img.shields.io/badge/Tech%20Tools-467870"/></h3>',
    '<span><img src="https://img.shields.io/badge/-React-blue?style=flat-square&amp;logo=React" alt="React"/></span>',
    '<span><img src="https://img.shields.io/badge/-Apollo%20Graphql-black?style=flat-square&amp;logo=Apollo%20Graphql" alt="Apollo Graphql"/></span>',
    '<span><img src="https://img.shields.io/badge/-Terraform-black?style=flat-square&amp;logo=base64" alt="Terraform"/></span>',
    '<hr>'
  ]);
});

it('Should throw error if title not present', () => {
  const categories_map = new Map([
    [
      'Tech Tools',
      {
        items: [{}],
        color: 'teal'
      }
    ]
  ]) as any;

  expect(() =>
    constructNewContents(categories_map, 'color', 'base64')
  ).toThrow();
});
