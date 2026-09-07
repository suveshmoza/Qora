import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { pool } from '../db.js';
import { SYSTEM_SCHEMAS } from './utils/system-schemas.js';

export function registerListSchemas(server: McpServer): void {
  server.registerTool(
    'list_schemas',
    {
      title: 'List schemas',
      description:
        'List database schemas the agent can see (system schemas excluded). Call this first to discover which schemas exist, then list_tables / describe_table.',
      inputSchema: z.object({}),
    },
    async () => {
      const result = await pool.query<{ schema_name: string }>(
        `SELECT nspname AS schema_name
         FROM pg_catalog.pg_namespace
         WHERE nspname <> ALL($1::text[])
           AND nspname NOT LIKE 'pg\\_%' ESCAPE '\\'
         ORDER BY nspname`,
        [SYSTEM_SCHEMAS],
      );
      const text =
        result.rows.length === 0
          ? 'No user schemas found.'
          : result.rows.map((r) => `- ${r.schema_name}`).join('\n');
      return { content: [{ type: 'text', text }] };
    },
  );
}
