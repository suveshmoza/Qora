import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NODE_ENV: 'test',
      TRANSPORT: 'stdio',
      LOG_LEVEL: 'info',
      LOG_PRETTY: 'false',
    },
  },
});
