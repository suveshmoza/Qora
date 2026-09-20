import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { runQuery } from './run.js';

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
      annotations: {
        title: 'Run query',
        readOnlyHint: true,
      },
    },
    async ({ sql }) => runQuery(sql),
  );
}
