# Contributing

Thanks for helping improve Qora.

## Dev Container

For local work with a **sample** database, use the Dev Container. It starts Postgres, applies `[seed.sql](./seed.sql)` once on first volume create, and mounts the repo.

In Cursor / VS Code: **Dev Containers: Reopen in Container**.

Or from the CLI:

```bash
docker compose -f .devcontainer/docker-compose.yml up -d
```

Inside the container:

```bash
pnpm install
pnpm dev
```

`DATABASE_URL` is already set to the seeded `analyst_agent` role on service `db`.

Reset the sample DB volume:

```bash
docker compose -f .devcontainer/docker-compose.yml down -v
```

## Local development (without Dev Container)

See [SETUP.md](./SETUP.md) for install, env, and seed steps, then:

```bash
set -a && source .env && set +a
pnpm install
pnpm dev
```

## Scripts

| Command      | Description                 |
| ------------ | --------------------------- |
| `pnpm dev`   | Start Qora with auto-reload |
| `pnpm build` | Build for production        |
| `pnpm start` | Run the production build    |
| `pnpm test`  | Run unit tests              |
| `pnpm fmt`   | Format the code             |
| `pnpm lint`  | Check the code              |

## Before opening a PR

1. Run `pnpm fmt` and `pnpm lint`.
2. Run `pnpm test`.
3. Prefer small, focused commits (conventional commits are welcome).

## Project layout

- `src/features/` - MCP tools (query, format, registration)
- `src/shared/` - db, logging, audit, SQL validation
- `src/config/` - environment loading
- `src/server.ts` - process entrypoint
