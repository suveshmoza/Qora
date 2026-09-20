import type { ColumnInfo } from './query.js';

export function formatColumns(columns: ColumnInfo[], schema: string, tableName: string): string {
  if (columns.length === 0) {
    return `Table '${schema}.${tableName}' not found (or not visible to this role).`;
  }

  const lines = [`Columns of ${schema}.${tableName}:`];
  for (const column of columns) {
    lines.push(
      `- ${column.column_name} — ${column.data_type}${column.is_nullable === 'YES' ? '' : ' (NOT NULL)'}`,
    );
  }
  return lines.join('\n');
}
