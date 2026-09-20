const mocks = vi.hoisted(() => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../shared/db.js', () => ({
  pool: mocks.pool,
}));

import { SYSTEM_SCHEMAS } from '../../shared/sql/system-schemas.js';
import { listTables } from './query.js';

describe('listTables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists tables for a specific schema', async () => {
    mocks.pool.query.mockResolvedValue({
      rows: [
        {
          table_schema: 'analytics',
          table_name: 'orders',
          table_type: 'BASE TABLE',
        },
      ],
    });

    const result = await listTables('analytics');

    expect(mocks.pool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE table_schema = $1'),
      ['analytics'],
    );

    expect(result).toEqual([
      {
        table_schema: 'analytics',
        table_name: 'orders',
        table_type: 'BASE TABLE',
      },
    ]);
  });

  it('excludes system schemas when no schema is provided', async () => {
    mocks.pool.query.mockResolvedValue({
      rows: [
        {
          table_schema: 'analytics',
          table_name: 'orders',
          table_type: 'BASE TABLE',
        },
      ],
    });

    const result = await listTables();

    expect(mocks.pool.query).toHaveBeenCalledWith(expect.stringContaining('table_schema <> ALL'), [
      SYSTEM_SCHEMAS,
    ]);

    expect(result).toEqual([
      {
        table_schema: 'analytics',
        table_name: 'orders',
        table_type: 'BASE TABLE',
      },
    ]);
  });
});
