import { describe, expect, it, vi } from 'vitest';

vi.mock('./config/env.js', () => ({
  env: {
    LOG_LEVEL: 'info',
    NODE_ENV: 'test',
    TRANSPORT: 'stdio',
    LOG_PRETTY: false,
  },
}));

import { createLogger } from './logger.js';

describe('createLogger', () => {
  it('creates a logger with the expected configuration', () => {
    const logger = createLogger({
      level: 'info',
      nodeEnv: 'test',
      transport: 'stdio',
      pretty: false,
    });

    expect(logger).toBeDefined();
    expect(logger.child).toBeTypeOf('function');
    expect(logger.info).toBeTypeOf('function');
  });
});
