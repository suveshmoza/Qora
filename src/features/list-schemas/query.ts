import { pool } from '../../shared/db.js';
import { SYSTEM_SCHEMAS } from '../../shared/sql/system-schemas.js';

export async function listSchemas(): Promise<string[]> {
  const result = await pool.query<{ schema_name: string }>(
    `SELECT nspname AS schema_name
       FROM pg_catalog.pg_namespace
       WHERE nspname <> ALL($1::text[])
         AND nspname NOT LIKE 'pg\\_%' ESCAPE '\\'
       ORDER BY nspname`,
    [SYSTEM_SCHEMAS],
  );
  return result.rows.map((row) => row.schema_name);
}
