<div align="center">
  <picture>
    <img src="https://iili.io/n2OKs7n.md.jpg" alt="qora-logo" width="128" height="128">
  </picture>

  <h1>Qora</h1>
  </div>

**Talk to your data. Get clear answers, insights, and analysis.**

Qora lets AI assistants like Cursor and Claude safely explore your database and answer questions about your data in plain English.

Ask things like:

> "How many orders did we receive last month?"

> "Which products are selling the most?"

> "Show me the tables related to customers."

Qora looks up the answers directly from your database and gives them back to your AI assistant.

**Qora is read-only by design.** It can inspect and query your data, but it cannot insert, update, or delete anything.

## How it works

```mermaid
flowchart LR
  You["You ask a question"] --> AI["AI assistant<br/>(Cursor, Claude, …)"]
  AI -->|"uses Qora tools"| Qora["Qora"]
  Qora -->|"explore & read-only queries"| DB[("Your database")]
  DB -->|"rows & schema info"| Qora
  Qora -->|"safe results"| AI
  AI -->|"clear answer"| You
```

1. You ask something.
2. Your AI assistant calls Qora.
3. Qora looks up schemas/tables or runs a read-only query.
4. Results go back to the assistant, which answers you.

## What can Qora do?

- **Explore your data**: See what schemas and tables are available in your database.
- **Understand your database**: Inspect tables and their columns without opening a database client.
- **Ask questions**: Ask things like "How many customers signed up this month?" or "What's the average order value?"
- **Analyze your data**: Find trends, compare numbers, and understand what's happening in your business.

## Read-only by design

There are multiple layers of protection:

1. **Read-only queries**: Qora only allows queries that retrieve data.
2. **Read-only database user**: Connect Qora using a database account that cannot modify data.
3. **Result limits**: Responses are limited in size to prevent accidentally returning huge amounts of data.
4. **Host restrictions**: Web access can be restricted to specific hosts.

Even if an AI assistant makes a mistake, Qora is designed to prevent it from modifying your database.

## Getting started

### Requirements

- Node.js
- pnpm
- PostgreSQL

Create a PostgreSQL user with read-only access and add its connection string to `.env`.

```bash
pnpm install
cp .env.example .env
```

Then configure:

```env
DATABASE_URL=postgresql://readonly_user:password@localhost:5432/prod
```

### Try it with sample data

A sample database is included in [`seed.sql`](./seed.sql).

Create a database called `prod`, then load the sample data:

```bash
psql -d prod -f seed.sql
```

## Start Qora

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

## Connect Qora to Cursor or Claude Desktop

Qora uses the **Model Context Protocol (MCP)**, an open standard that allows AI assistants to securely use external tools and data.

Add Qora to your MCP configuration:

```json
{
  "mcpServers": {
    "qora": {
      "command": "node",
      "args": ["--env-file=.env", "./node_modules/tsx/dist/cli.mjs", "src/server.ts"],
      "cwd": "/absolute/path/to/qora",
      "env": {
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

Once connected, your AI assistant can use Qora to explore and query your database.

## Use Qora over the web

Qora can also run as an HTTP-based MCP server.

Start Qora:

```bash
TRANSPORT=http pnpm start
```

Your MCP endpoint will be available at:

```text
http://your-host:8080/mcp
```

For a quick private tunnel during development:

```bash
ngrok http 8080
```

> **Important:** Don't expose your database or Qora endpoint publicly without appropriate authentication and network controls.

## What Qora gives your AI assistant

| Tool             | What it does                          |
| ---------------- | ------------------------------------- |
| `list_schemas`   | See the main areas of your data       |
| `list_tables`    | See what tables exist                 |
| `describe_table` | Understand what's inside a table      |
| `run_query`      | Ask the database a read-only question |

The AI can combine these tools to first understand your database and then find the information it needs.

## Configuration

Copy [`.env.example`](./.env.example) and configure:

| Setting         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `DATABASE_URL`  | PostgreSQL connection string. Use a read-only database user. |
| `TRANSPORT`     | `stdio` for local AI apps or `http` for web access           |
| `NODE_ENV`      | `development`, `production`, or `test`                       |
| `ALLOWED_HOSTS` | Hosts allowed to access the HTTP endpoint                    |
| `LOG_LEVEL`     | Logging level                                                |
| `LOG_PRETTY`    | Make logs easier to read locally                             |

## Development

| Command      | Description                 |
| ------------ | --------------------------- |
| `pnpm dev`   | Start Qora with auto-reload |
| `pnpm build` | Build for production        |
| `pnpm start` | Run the production build    |
| `pnpm fmt`   | Format the code             |
| `pnpm lint`  | Check the code              |
