import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { pool } from '../db.js';
import { SYSTEM_SCHEMAS } from './utils/system-schemas.js';

export function registerListTables(server: McpServer): void {
  server.registerTool(
    'list_tables',
    {
      title: 'List tables',
      description:
        'List tables and views the agent can query. Optionally filter by schema. Always call this (or describe_table) before writing a query against an unfamiliar table.',
      inputSchema: z.object({
        schema: z
          .string()
          .optional()
          .describe(
            'Optional schema name. If omitted, lists tables across all non-system schemas.',
          ),
      }),
    },
    async ({ schema }) => {
      const result = schema
        ? await pool.query<{ table_schema: string; table_name: string; table_type: string }>(
            `SELECT table_schema, table_name, table_type
             FROM information_schema.tables
             WHERE table_schema = $1
             ORDER BY table_name`,
            [schema],
          )
        : await pool.query<{ table_schema: string; table_name: string; table_type: string }>(
            `SELECT table_schema, table_name, table_type
             FROM information_schema.tables
             WHERE table_schema <> ALL($1::text[])
               AND table_schema NOT LIKE 'pg\\_%' ESCAPE '\\'
             ORDER BY table_schema, table_name`,
            [SYSTEM_SCHEMAS],
          );

      const text =
        result.rows.length === 0
          ? schema
            ? `No tables found in schema '${schema}'.`
            : 'No tables found.'
          : result.rows
              .map((r) => `- ${r.table_schema}.${r.table_name} (${r.table_type})`)
              .join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );
}
