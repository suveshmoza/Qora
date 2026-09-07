import { childLogger } from './logger.js';

const log = childLogger({ component: 'audit' });

export interface AuditEntry {
  sql: string;
  status: 'success' | 'error' | 'rejected';
  rowCount?: number;
  error?: string | undefined;
  latencyMs?: number;
}

export function logQuery(entry: AuditEntry): void {
  const { status, sql, rowCount, error, latencyMs } = entry;
  log.info(
    {
      event: 'query',
      status,
      sql,
      ...(rowCount !== undefined ? { rowCount } : {}),
      ...(error !== undefined ? { error } : {}),
      ...(latencyMs !== undefined ? { latencyMs } : {}),
    },
    'query audited',
  );
}
