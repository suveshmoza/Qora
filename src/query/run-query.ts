import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { logQuery } from '../audit.js';
import { executeQuery } from '../db.js';
import { DEFAULT_ROW_LIMIT, enforceRowLimit, validateSql } from '../validater.js';
import { formatQueryResult } from './format-result.js';

export async function runQuery(sql: string): Promise<CallToolResult> {
  const validation = validateSql(sql);
  if (!validation.ok) {
    logQuery({ sql, status: 'rejected', error: validation.error });
    return { content: [{ type: 'text', text: `Query rejected: ${validation.error}` }] };
  }

  const limitedSql = enforceRowLimit(sql, DEFAULT_ROW_LIMIT);
  const start = Date.now();
  try {
    const { columns, rows } = await executeQuery(limitedSql);
    const latencyMs = Date.now() - start;
    logQuery({
      sql: limitedSql,
      status: 'success',
      rowCount: rows.length,
      latencyMs,
    });

    const payload = formatQueryResult(columns, rows);

    return { content: [{ type: 'text', text: JSON.stringify(payload) }] };
  } catch (e) {
    const latencyMs = Date.now() - start;
    const message = e instanceof Error ? e.message : String(e);
    logQuery({ sql: limitedSql, status: 'error', error: message, latencyMs });
    return { content: [{ type: 'text', text: `Query failed: ${message}` }] };
  }
}
