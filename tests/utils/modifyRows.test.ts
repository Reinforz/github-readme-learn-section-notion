import { modifyRows } from '../../src/utils/modifyRows';

it('Should work', () => {
  const rows = modifyRows(
    {
      block: {
        block_1: {
          role: 'editor',
          value: {
            properties: {
              title: [['A']]
            }
          } as any
        },
        block_2: {
          role: 'editor',
          value: {
            properties: {
              title: [['C']]
            }
          } as any
        },
        block_3: {
          role: 'editor',
          value: {
            properties: {
              title: [['B']]
            }
          } as any
        }
      }
    },
    'block_4'
  );
  expect(rows).toStrictEqual([
    {
      properties: {
        title: [['A']]
      }
    },
    {
      properties: {
        title: [['B']]
      }
    },
    {
      properties: {
        title: [['C']]
      }
    }
  ]);
});
