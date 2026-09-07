import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { pool } from '../db.js';

export function registerDescribeTable(server: McpServer): void {
  server.registerTool(
    'describe_table',
    {
      title: 'Describe table',
      description:
        "Get column names, data types, and nullability for a specific table. Call this before querying a table you haven't seen the schema for.",
      inputSchema: z.object({
        schema: z.string().describe('Schema that owns the table'),
        table_name: z.string().describe('Table or view name'),
      }),
    },
    async ({ schema, table_name }) => {
      const result = await pool.query<{
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [schema, table_name],
      );
      if (result.rows.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `Table '${schema}.${table_name}' not found (or not visible to this role).`,
            },
          ],
        };
      }
      const lines = [`Columns of ${schema}.${table_name}:`];
      for (const r of result.rows) {
        lines.push(
          `- ${r.column_name} — ${r.data_type}${r.is_nullable === 'YES' ? '' : ' (NOT NULL)'}`,
        );
      }
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    },
  );
}
