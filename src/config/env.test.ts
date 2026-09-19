import { loadEnv } from './env.js';

const validEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://localhost/test',
};

describe('loadEnv', () => {
  it('loads valid environment', () => {
    const env = loadEnv(validEnv);

    expect(env.NODE_ENV).toBe('test');
    expect(env.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(env.PORT).toBe(8080);
    expect(env.TRANSPORT).toBe('stdio');
    expect(env.LOG_PRETTY).toBe(true);
  });

  it('uses default port', () => {
    const env = loadEnv(validEnv);

    expect(env.PORT).toBe(8080);
  });

  it('parses a custom port', () => {
    const env = loadEnv({
      ...validEnv,
      PORT: '3000',
    });

    expect(env.PORT).toBe(3000);
  });

  it('parses allowed hosts', () => {
    const env = loadEnv({
      ...validEnv,
      ALLOWED_HOSTS: 'api.example.com, example.com',
    });

    expect(env.ALLOWED_HOSTS).toEqual({
      kind: 'allowlist',
      hosts: ['api.example.com', 'example.com'],
    });
  });

  it('reject an invalid database URL', () => {
    expect(() =>
      loadEnv({
        ...validEnv,
        DATABASE_URL: 'not-a-url',
      }),
    ).toThrow('Invalid environment variables');
  });

  it('rejects production HTTP with open hosts', () => {
    expect(() =>
      loadEnv({
        ...validEnv,
        NODE_ENV: 'production',
        TRANSPORT: 'http',
        ALLOWED_HOSTS: '*',
      }),
    ).toThrow('ALLOWED_HOSTS');
  });
});
