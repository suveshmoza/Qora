import { Pool } from 'pg';

import { env } from '../config/env.js';

export const pool = new Pool({
  max: 5,
  connectionString: env.DATABASE_URL,
  idleTimeoutMillis: 30000,
});

export interface QueryResult {
  rows: unknown[][];
  columns: string[];
  rowCount: number;
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    //! extra safety measures in addition to role-level restrictions
    await client.query('SET statement_timeout = 30000');
    await client.query('SET default_transaction_read_only = on');

    const result = await client.query(sql);
    const columns = result.fields.map((field) => field.name);
    const rows = result.rows.map((row) => columns.map((c) => row[c]));
    const rowCount = result.rowCount ?? 0;
    return {
      columns,
      rows,
      rowCount,
    };
  } finally {
    client.release();
  }
}
