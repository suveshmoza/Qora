import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { formatColumns } from './format.js';
import { describeTable } from './query.js';

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
      annotations: {
        title: 'Describe table',
        readOnlyHint: true,
      },
    },
    async ({ schema, table_name }) => {
      const columns = await describeTable(schema, table_name);
      return {
        content: [
          {
            type: 'text',
            text: formatColumns(columns, schema, table_name),
          },
        ],
      };
    },
  );
}
