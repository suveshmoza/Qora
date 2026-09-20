import { pool } from '../../shared/db.js';
import { SYSTEM_SCHEMAS } from '../../shared/sql/system-schemas.js';

export interface TableInfo {
  table_schema: string;
  table_name: string;
  table_type: string;
}

export async function listTables(schema?: string): Promise<TableInfo[]> {
  let result = null;

  if (schema) {
    result = await pool.query<TableInfo>(
      `SELECT table_schema, table_name, table_type
           FROM information_schema.tables
           WHERE table_schema = $1
           ORDER BY table_name`,
      [schema],
    );
  } else {
    result = await pool.query<TableInfo>(
      `SELECT table_schema, table_name, table_type
           FROM information_schema.tables
           WHERE table_schema <> ALL($1::text[])
             AND table_schema NOT LIKE 'pg\\_%' ESCAPE '\\'
           ORDER BY table_schema, table_name`,
      [SYSTEM_SCHEMAS],
    );
  }

  return result.rows.map((row) => ({
    table_schema: row.table_schema,
    table_name: row.table_name,
    table_type: row.table_type,
  }));
}
