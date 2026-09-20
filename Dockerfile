# syntax=docker/dockerfile:1

FROM node:current-bookworm-slim AS base
RUN npm install -g pnpm@11.25.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# tsc build does not need native postinstall scripts; avoid pnpm strictDepBuilds failure on esbuild
RUN pnpm install --frozen-lockfile --config.strict-dep-builds=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src
RUN pnpm build && pnpm prune --prod

FROM node:current-bookworm-slim AS app
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 qora \
  && useradd --system --uid 1001 --gid qora qora
COPY --from=build --chown=qora:qora /app/package.json ./
COPY --from=build --chown=qora:qora /app/node_modules ./node_modules
COPY --from=build --chown=qora:qora /app/dist ./dist
USER qora
EXPOSE 8080
CMD ["node", "dist/server.js"]
