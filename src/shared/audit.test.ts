import { beforeEach, describe, expect, it, vi } from 'vitest';

const { info } = vi.hoisted(() => ({
  info: vi.fn(),
}));

vi.mock('./logger.js', () => ({
  childLogger: vi.fn(() => ({
    info,
  })),
}));

import { logQuery } from './audit.js';

describe('logQuery', () => {
  beforeEach(() => {
    info.mockClear();
  });

  it('logs a successful query', () => {
    logQuery({
      sql: 'SELECT * FROM users',
      status: 'success',
      rowCount: 10,
      latencyMs: 25,
    });

    expect(info).toHaveBeenCalledWith(
      {
        event: 'query',
        status: 'success',
        sql: 'SELECT * FROM users',
        rowCount: 10,
        latencyMs: 25,
      },
      'query audited',
    );
  });
});
