import { pool } from '../db.js';

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

export async function describeTable(schema: string, tableName: string): Promise<ColumnInfo[]> {
  const result = await pool.query<ColumnInfo>(
    `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
    [schema, tableName],
  );

  return result.rows.map((row) => ({
    column_name: row.column_name,
    data_type: row.data_type,
    is_nullable: row.is_nullable,
  }));
}
