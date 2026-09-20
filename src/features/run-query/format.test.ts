import { formatQueryResult } from './format.js';

describe('formatQueryResult', () => {
  it('converts rows into objects', () => {
    const result = formatQueryResult(
      ['id', 'name'],
      [
        [1, 'Alice'],
        [2, 'Bob'],
      ],
    );

    expect(result).toEqual({
      columns: ['id', 'name'],
      rowCount: 2,
      rows: [
        {
          id: 1,
          name: 'Alice',
        },
        {
          id: 2,
          name: 'Bob',
        },
      ],
    });
  });

  it('converts undefined values to null', () => {
    const result = formatQueryResult(['id', 'name'], [[1, undefined]]);
    expect(result).toEqual({
      columns: ['id', 'name'],
      rowCount: 1,
      rows: [
        {
          id: 1,
          name: null,
        },
      ],
    });
  });
});
