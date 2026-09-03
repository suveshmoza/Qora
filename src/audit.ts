export interface AuditEntry {
  sql: string;
  status: 'success' | 'error' | 'rejected';
  rowCount?: number;
  error?: string;
  latencyMs?: number;
}

export function logQuery(entry: AuditEntry) {
  const record = {
    ts: new Date().toISOString(),
    ...entry,
  };

  console.log(JSON.stringify(record));
}
