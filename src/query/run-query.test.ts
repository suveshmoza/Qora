const mocks = vi.hoisted(() => ({
  logQuery: vi.fn(),
  executeQuery: vi.fn(),
  validateSql: vi.fn(),
  enforceRowLimit: vi.fn(),
}));

vi.mock('../audit.js', () => ({
  logQuery: mocks.logQuery,
}));

vi.mock('../db.js', () => ({
  executeQuery: mocks.executeQuery,
}));

vi.mock('../validater.js', () => ({
  DEFAULT_ROW_LIMIT: 1000,
  validateSql: mocks.validateSql,
  enforceRowLimit: mocks.enforceRowLimit,
}));

describe('runQuery', () => {
  it('executes a valid query and returns formatted results', async () => {});
});

import { runQuery } from './run-query.js';

describe('runQuery', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid SQL', async () => {
    mocks.validateSql.mockReturnValue({
      ok: false,
      error: 'Only SELECT queries are allowed',
    });
    const result = await runQuery('DELETE FROM users');

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Query rejected: Only SELECT queries are allowed',
        },
      ],
    });
    expect(mocks.executeQuery).not.toHaveBeenCalled();
    expect(mocks.logQuery).toHaveBeenCalledWith({
      sql: 'DELETE FROM users',
      status: 'rejected',
      error: 'Only SELECT queries are allowed',
    });
  });

  it('executes a valid query and returns the formatted result', async () => {
    mocks.validateSql.mockReturnValue({ ok: true });
    mocks.enforceRowLimit.mockReturnValue('SELECT id, name FROM users LIMIT 1000');

    mocks.executeQuery.mockResolvedValue({
      columns: ['id', 'name'],
      rows: [
        [1, 'Alice'],
        [2, 'Bob'],
      ],
    });

    const result = await runQuery('SELECT id, name FROM users');

    expect(mocks.validateSql).toHaveBeenCalledWith('SELECT id, name FROM users');
    expect(mocks.enforceRowLimit).toHaveBeenCalledWith('SELECT id, name FROM users', 1000);
    expect(mocks.executeQuery).toHaveBeenCalledWith('SELECT id, name FROM users LIMIT 1000');

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            columns: ['id', 'name'],
            rowCount: 2,
            rows: [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Bob' },
            ],
          }),
        },
      ],
    });
  });

  it('converts missing row values to null', async () => {
    mocks.validateSql.mockReturnValue({ ok: true });
    mocks.enforceRowLimit.mockReturnValue('SELECT * FROM users');

    mocks.executeQuery.mockResolvedValue({
      columns: ['id', 'name', 'email'],
      rows: [
        [1, 'Alice', undefined],
        [2, 'Bob', null],
      ],
    });

    const result = await runQuery('SELECT * FROM users');

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            columns: ['id', 'name', 'email'],
            rowCount: 2,
            rows: [
              { id: 1, name: 'Alice', email: null },
              { id: 2, name: 'Bob', email: null },
            ],
          }),
        },
      ],
    });
  });

  it('returns an error when database execution fails', async () => {
    mocks.validateSql.mockReturnValue({ ok: true });
    mocks.enforceRowLimit.mockReturnValue('SELECT * FROM users LIMIT 1000');

    mocks.executeQuery.mockRejectedValue(new Error('connection refused'));

    const result = await runQuery('SELECT * FROM users');

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Query failed: connection refused',
        },
      ],
    });

    expect(mocks.logQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: 'SELECT * FROM users LIMIT 1000',
        status: 'error',
        error: 'connection refused',
      }),
    );
  });

  it('handles non-Error thrown values', async () => {
    mocks.validateSql.mockReturnValue({ ok: true });
    mocks.enforceRowLimit.mockReturnValue('SELECT * FROM users');

    mocks.executeQuery.mockRejectedValue('database exploded');

    const result = await runQuery('SELECT * FROM users');

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Query failed: database exploded',
        },
      ],
    });
  });

  it('logs successful queries', async () => {
    mocks.validateSql.mockReturnValue({ ok: true });
    mocks.enforceRowLimit.mockReturnValue('SELECT * FROM users LIMIT 1000');

    mocks.executeQuery.mockResolvedValue({
      columns: ['id'],
      rows: [[1], [2]],
    });

    await runQuery('SELECT * FROM users');

    expect(mocks.logQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: 'SELECT * FROM users LIMIT 1000',
        status: 'success',
        rowCount: 2,
      }),
    );

    expect(mocks.logQuery).toHaveBeenCalledTimes(1);
  });
});
