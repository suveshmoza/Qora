import pino from 'pino';

import { env } from './config/env.js';

export const logger = pino(
  {
    name: 'qora',
    level: env.LOG_LEVEL,
    base: {
      service: 'qora',
      env: env.NODE_ENV,
      transport: env.TRANSPORT,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(env.LOG_PRETTY
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              destination: 2, // stderr
            },
          },
        }
      : {}),
  },
  env.LOG_PRETTY ? undefined : pino.destination(2),
);

export function childLogger(bindings: pino.Bindings): pino.Logger {
  return logger.child(bindings);
}
