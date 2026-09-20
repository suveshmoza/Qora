import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { formatSchemas } from './format.js';
import { listSchemas } from './query.js';

export function registerListSchemas(server: McpServer): void {
  server.registerTool(
    'list_schemas',
    {
      title: 'List schemas',
      description:
        'List database schemas the agent can see (system schemas excluded). Call this first to discover which schemas exist, then list_tables / describe_table.',
      inputSchema: z.object({}),
      annotations: {
        title: 'List schemas',
        readOnlyHint: true,
      },
    },
    async () => {
      const schemas = await listSchemas();
      return { content: [{ type: 'text', text: formatSchemas(schemas) }] };
    },
  );
}
