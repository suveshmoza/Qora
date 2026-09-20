import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { formatTables } from './format.js';
import { listTables } from './query.js';

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
      annotations: {
        title: 'List tables',
        readOnlyHint: true,
      },
    },
    async ({ schema }) => {
      const tables = await listTables(schema);
      return {
        content: [
          {
            type: 'text',
            text: formatTables(tables, schema),
          },
        ],
      };
    },
  );
}
