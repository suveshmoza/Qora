# Setup

## Requirements

- Node.js
- pnpm
- PostgreSQL

## Install

Create a PostgreSQL user with read-only access, then copy the example env file:

```bash
pnpm install
cp .env.example .env
```

Qora does **not** load `.env` automatically. Before `pnpm dev` / `pnpm start`, expose the variables listed in `[.env.example](./.env.example)` in your environment (shell export, process manager, container env, or your MCP client's `env` block).

At minimum you need:

```env
DATABASE_URL=postgresql://readonly_user:password@localhost:5432/prod
```

## Sample data

A sample database is included in `[seed.sql](./seed.sql)`.

Create a database called `prod`, then load the sample data:

```bash
psql -d prod -f seed.sql
```

## Start Qora

Load your env file into the shell first (bash/zsh):

```bash
set -a && source .env && set +a
```

### Local development

```bash
pnpm dev
```

### Connect directly from Cursor or Claude

```bash
TRANSPORT=stdio pnpm start
```

### Production

```bash
pnpm build
pnpm start
```

## Connect to Cursor or Claude Desktop

Qora uses the **Model Context Protocol (MCP)**. Add it to your MCP configuration and pass the required variables in `env`:

```json
{
  "mcpServers": {
    "qora": {
      "command": "node",
      "args": ["./node_modules/tsx/dist/cli.mjs", "src/server.ts"],
      "cwd": "/absolute/path/to/qora",
      "env": {
        "TRANSPORT": "stdio",
        "DATABASE_URL": "postgresql://readonly_user:password@localhost:5432/prod",
        "NODE_ENV": "development",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Use over HTTP

With env vars already loaded:

```bash
TRANSPORT=http pnpm start
```

Endpoint:

```text
http://your-host:8080/mcp
```

For a quick private tunnel during development:

```bash
ngrok http 8080
```

> **Important:** Don't expose your database or Qora endpoint publicly without appropriate authentication and network controls.

## Docker

The production image runs **Qora only**. It does not start Postgres and does not load `[seed.sql](./seed.sql)` - point it at your own database.

Create a `.env` (Compose reads it for substitution):

```env
DATABASE_URL=postgresql://readonly_user:password@your-db-host:5432/your_db
NODE_ENV=production
TRANSPORT=http
HOST=0.0.0.0
PORT=8080
ALLOWED_HOSTS=localhost,127.0.0.1,your.hostname
LOG_LEVEL=info
```

```bash
docker compose up --build
```

MCP endpoint: `http://localhost:8080/mcp` (or your host/port).

In production HTTP mode `ALLOWED_HOSTS` must be an explicit list (not `*`).

```bash
docker compose down
```

## Configuration

Expose the variables from `[.env.example](./.env.example)` before starting:

| Setting         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `DATABASE_URL`  | PostgreSQL connection string. Use a read-only database user. |
| `TRANSPORT`     | `stdio` for local AI apps or `http` for web access           |
| `NODE_ENV`      | `development`, `production`, or `test`                       |
| `ALLOWED_HOSTS` | Hosts allowed to access the HTTP endpoint                    |
| `LOG_LEVEL`     | Logging level                                                |
| `LOG_PRETTY`    | Make logs easier to read locally                             |
