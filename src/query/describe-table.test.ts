const mocks = vi.hoisted(() => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../db.js', () => ({
  pool: mocks.pool,
}));

import { describeTable } from './describe-table.js';

describe('describeTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns columns for a table', async () => {
    mocks.pool.query.mockResolvedValue({
      rows: [
        { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
        { column_name: 'email', data_type: 'text', is_nullable: 'YES' },
      ],
    });

    const result = await describeTable('analytics', 'orders');

    expect(mocks.pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE table_schema = $1 AND table_name = $2'),
      ['analytics', 'orders'],
    );

    expect(result).toEqual([
      { column_name: 'id', data_type: 'integer', is_nullable: 'NO' },
      { column_name: 'email', data_type: 'text', is_nullable: 'YES' },
    ]);
  });

  it('returns an empty array when the table is missing', async () => {
    mocks.pool.query.mockResolvedValue({ rows: [] });

    await expect(describeTable('public', 'missing')).resolves.toEqual([]);
  });
});
