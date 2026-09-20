import { TableInfo } from './list-tables.js';

export function formatTables(tables: TableInfo[], schema?: string): string {
  if (tables.length === 0) {
    return schema ? `No tables found in schema ${schema}` : `No tables found.`;
  }

  return tables
    .map((table) => `- ${table.table_schema}.${table.table_name} (${table.table_type})`)
    .join('\n');
}
