import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { listSchemas } from '../query/list-schemas.js';

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
      const schemas = await listSchemas();
      const text =
        schemas.length === 0
          ? 'No user schemas found.'
          : schemas.map((schema) => `- ${schema}`).join('\n');

      return { content: [{ type: 'text', text }] };
    },
  );
}
