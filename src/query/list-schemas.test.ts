const mocks = vi.hoisted(() => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../db.js', () => ({
  pool: mocks.pool,
}));

import { listSchemas } from '../query/list-schemas.js';
import { SYSTEM_SCHEMAS } from '../tools/utils/system-schemas.js';

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
