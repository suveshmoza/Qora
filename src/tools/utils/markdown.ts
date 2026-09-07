export function toMarkdownTable(columns: string[], rows: unknown[][]): string {
  if (rows.length === 0) return 'Query returned 0 rows.';
  const header = `| ${columns.join(' | ')} |`;
  const sep = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.map((v) => formatCell(v)).join(' | ')} |`).join('\n');
  return [header, sep, body].join('\n');
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return Object.prototype.toString.call(value);
  }
}
