import pino from 'pino';

import { env } from '../config/env.js';

interface LoggerConfig {
  level: string;
  nodeEnv: string;
  transport: string;
  pretty: boolean;
}

export function createLogger(config: LoggerConfig) {
  return pino(
    {
      name: 'qora',
      level: config.level,
      base: {
        service: 'qora',
        env: config.nodeEnv,
        transport: config.transport,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      ...(config.pretty
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
    config.pretty ? undefined : pino.destination(2),
  );
}

export const logger = createLogger({
  level: env.LOG_LEVEL,
  nodeEnv: env.NODE_ENV,
  transport: env.TRANSPORT,
  pretty: env.LOG_PRETTY,
});

export function childLogger(bindings: pino.Bindings): pino.Logger {
  return logger.child(bindings);
}
