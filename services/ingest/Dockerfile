# ── Ingest service Dockerfile ─────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY services/ingest/package.json ./services/ingest/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile --filter @ua-map/ingest... --prod=false

FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/ingest/node_modules ./services/ingest/node_modules
COPY . .

RUN pnpm --filter @ua-map/ingest build 2>/dev/null || true

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 ingest

COPY --from=builder --chown=ingest:nodejs /app/services/ingest/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

USER ingest
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "dist/main.js"]
