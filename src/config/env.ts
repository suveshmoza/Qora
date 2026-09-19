import { z } from 'zod';

const portSchema = z.preprocess(
  (value) => (value === undefined || value === '' ? '8080' : value),
  z
    .string()
    .regex(/^\d+$/, 'PORT must be an integer string')
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
);

const allowedHostsSchema = z.preprocess(
  (value) => (value === undefined || value === '' ? '*' : value),
  z.string().transform((raw) => {
    const trimmed = raw.trim();
    if (trimmed === '*') {
      return { kind: 'open' as const };
    }
    const hosts = trimmed
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);
    if (hosts.length === 0) {
      return { kind: 'open' as const };
    }
    return { kind: 'allowlist' as const, hosts };
  }),
);

const optionalBoolFromEnv = z.preprocess(
  (value) => (value === undefined || value === '' ? undefined : value),
  z
    .enum(['true', 'false'])
    .optional()
    .transform((value): boolean | undefined => {
      if (value === undefined) return undefined;
      return value === 'true';
    }),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.url(),
    HOST: z.string().min(1).default('127.0.0.1'),
    PORT: portSchema,
    // http = Streamable HTTP (ngrok/remote); stdio = Cursor/Claude Desktop
    TRANSPORT: z.enum(['http', 'stdio']).default('stdio'),
    ALLOWED_HOSTS: allowedHostsSchema,
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    // Optional override: default pretty on in development/test, always off in production
    LOG_PRETTY: optionalBoolFromEnv,
  })
  .superRefine((data, ctx) => {
    if (
      data.NODE_ENV === 'production' &&
      data.TRANSPORT === 'http' &&
      data.ALLOWED_HOSTS.kind === 'open'
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['ALLOWED_HOSTS'],
        message:
          'ALLOWED_HOSTS=* is not allowed in production HTTP mode. Set an explicit allowlist (e.g. api.example.com).',
      });
    }
  })
  .transform((data) => ({
    ...data,
    // production → always JSON; development/test → pretty unless LOG_PRETTY overrides
    LOG_PRETTY: data.NODE_ENV === 'production' ? false : (data.LOG_PRETTY ?? true),
  }));

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment variables:\n${errors}`);
  }

  return result.data;
}

export const env = loadEnv();
