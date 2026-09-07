import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { logQuery } from '../audit.js';
import { executeQuery } from '../db.js';
import { DEFAULT_ROW_LIMIT, enforceRowLimit, validateSql } from '../validater.js';

export function registerRunQuery(server: McpServer): void {
  server.registerTool(
    'run_query',
    {
      title: 'Run query',
      description:
        'Run a read-only SQL SELECT against Postgres. Only SELECT is permitted — ' +
        'writes, DDL, and multi-statement queries are rejected. Results capped at ' +
        '1000 rows and returned as JSON ({ columns, rowCount, rows }). Prefer ' +
        'GROUP BY / aggregation over raw dumps. Always qualify table names with ' +
        'schema, e.g. `SELECT * FROM analytics.orders`. Discover schemas/tables ' +
        'via list_schemas, list_tables, and describe_table first.',
      inputSchema: z.object({
        sql: z.string().describe('Read-only SELECT statement to execute'),
      }),
    },
    async ({ sql }) => {
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

        const payload = {
          columns,
          rowCount: rows.length,
          rows: rows.map((row) => {
            const record: Record<string, unknown> = {};
            for (let i = 0; i < columns.length; i++) {
              const column = columns[i];
              if (column === undefined) continue;
              record[column] = row[i] ?? null;
            }
            return record;
          }),
        };

        return { content: [{ type: 'text', text: JSON.stringify(payload) }] };
      } catch (e) {
        const latencyMs = Date.now() - start;
        const message = e instanceof Error ? e.message : String(e);
        logQuery({ sql: limitedSql, status: 'error', error: message, latencyMs });
        return { content: [{ type: 'text', text: `Query failed: ${message}` }] };
      }
    },
  );
}
