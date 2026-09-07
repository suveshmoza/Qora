import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { Request, Response } from 'express';

import { env } from './config/env.js';
import { logger } from './logger.js';
import { registerDescribeTable } from './tools/describe-table.js';
import { registerListSchemas } from './tools/list-schemas.js';
import { registerListTables } from './tools/list-tables.js';
import { registerRunQuery } from './tools/run-query.js';

function createServer(): McpServer {
  const server = new McpServer({
    name: 'scout',
    version: '0.0.1',
    description: 'A database query assistant for PostgreSQL',
  });

  registerListSchemas(server);
  registerListTables(server);
  registerDescribeTable(server);
  registerRunQuery(server);

  return server;
}

/**
 * StreamableHTTPServerTransport getters return `T | undefined`, which conflicts with
 * Transport's optional callbacks under exactOptionalPropertyTypes.
 */
function asTransport(transport: StreamableHTTPServerTransport): Transport {
  return transport as Transport;
}

async function startStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info({ event: 'server_start', mode: 'stdio' }, 'scout MCP server running on stdio');
}

async function startHttp(): Promise<void> {
  const { HOST: listenHost, PORT: port, ALLOWED_HOSTS: allowedHosts } = env;
  const hostCheckOpen = allowedHosts.kind === 'open';

  // host 0.0.0.0 skips localhost-only Host validation (required for ngrok).
  const app = createMcpExpressApp({
    host: hostCheckOpen ? '0.0.0.0' : listenHost,
    ...(allowedHosts.kind === 'allowlist' ? { allowedHosts: allowedHosts.hosts } : {}),
  });

  // Stateless Streamable HTTP — one transport per request (SDK simpleStatelessStreamableHttp).
  app.post(['/mcp', '/'], async (req: Request, res: Response) => {
    const server = createServer();
    try {
      const transport = new StreamableHTTPServerTransport({});
      await server.connect(asTransport(transport));
      await transport.handleRequest(req, res, req.body);
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
    } catch (e) {
      logger.error({ err: e, event: 'mcp_request_error' }, 'Error handling MCP request');
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  });

  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
  };

  app.get(['/mcp', '/'], methodNotAllowed);
  app.delete(['/mcp', '/'], methodNotAllowed);

  app.listen(port, listenHost, () => {
    const displayHost = listenHost === '0.0.0.0' || listenHost === '::' ? '127.0.0.1' : listenHost;
    logger.info(
      {
        event: 'server_start',
        mode: 'http',
        host: listenHost,
        port,
        url: `http://${displayHost}:${port}/mcp`,
      },
      'scout-mcp listening (streamable-http)',
    );
    if (hostCheckOpen) {
      logger.warn(
        { event: 'host_check_disabled' },
        'Host header validation disabled — use only behind a private tunnel (ngrok)',
      );
    }
  });
}

async function main() {
  if (env.TRANSPORT === 'http') {
    await startHttp();
    return;
  }
  await startStdio();
}

main().catch((e) => {
  logger.fatal({ err: e, event: 'fatal' }, 'Fatal error in main()');
  process.exit(1);
});
