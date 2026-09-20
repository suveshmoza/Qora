const mocks = vi.hoisted(() => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../shared/db.js', () => ({
  pool: mocks.pool,
}));

import { SYSTEM_SCHEMAS } from '../../shared/sql/system-schemas.js';
import { listSchemas } from './query.js';

describe('listSchemas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns schema names', async () => {
    mocks.pool.query.mockResolvedValue({
      rows: [{ schema_name: 'analytics' }, { schema_name: 'public' }],
    });

    const result = await listSchemas();

    expect(result).toEqual(['analytics', 'public']);
  });

  it('excludes system schemas', async () => {
    mocks.pool.query.mockResolvedValue({
      rows: [{ schema_name: 'analytics' }],
    });

    await listSchemas();

    expect(mocks.pool.query).toHaveBeenCalledWith(expect.stringContaining('nspname <> ALL'), [
      SYSTEM_SCHEMAS,
    ]);
  });

  it('returns an empty array when no schemas exist', async () => {
    mocks.pool.query.mockResolvedValue({
      rows: [],
    });

    await expect(listSchemas()).resolves.toEqual([]);
  });
});
