# Sprint 1.4 — DONE (real LLM ready · /search · share · DB scaffold · docker-compose)

> Live on http://localhost:5454. Continues from `SPRINT_1_3_PROGRESS.md`.

## Headline
LLM provider abstraction live — Anthropic Claude when `ANTHROPIC_API_KEY` is set, deterministic
fake-mode otherwise. Full-text `/search`. Per-event share button. Drizzle + Postgres schema
scaffold. docker-compose.yml for Postgres+PostGIS+Redis+MinIO. Makefile.

## Done

### LLM (`lib/llm.ts` + `/api/copilot`)
- [x] `generate({ system, messages, maxTokens })` provider-agnostic
- [x] Anthropic Claude call when `ANTHROPIC_API_KEY` env set
- [x] Falls back to deterministic fake-mode on missing key or API error
- [x] `/api/copilot` builds structured context block (top 10 events) + stats
- [x] Response always includes deterministic stats prefix so UI is useful regardless of mode
- [x] Verified: returns `meta.mode = "fake"` without key

### `/search`
- [x] Server-rendered route at `/search?q=…`
- [x] Searches across events, equipment, conflicts, glossary, companies, tools, regions
- [x] Naive substring scoring with field-weighted boosts
- [x] Empty-query landing indexed; result pages `noindex`
- [x] Locale-aware: searches summaries / names in user's locale
- [x] Header search icon (⌕) on every page
- [x] Verified: `?q=kharkiv` returns relevant hits

### Share button
- [x] `<ShareButton />` client component on event detail
- [x] Uses Web Share API where available; falls back to clipboard copy
- [x] Copy confirmation state ("Copied")
- [x] URL is locale-aware canonical (via `absoluteUrl` + `urls.event`)

### Database scaffold (`packages/db`)
- [x] Drizzle ORM + `postgres` driver
- [x] Schema for: orgs, users, memberships, sources, events, event_sources, event_media, regions, aois, alert_rules
- [x] Indexes on event class, occurredAt, verification, country/admin
- [x] PostGIS-ready (geom column added in follow-up migration)
- [x] `drizzle.config.ts` reads `DATABASE_URL`
- [x] Lazy `db()` client — package importable without DB running
- [x] `pnpm --filter @aegis/db generate / migrate / studio` scripts

### docker-compose.yml
- [x] PostGIS 16 + PostgreSQL
- [x] Redis 7-alpine
- [x] MinIO (S3-compatible) with admin console on :9001
- [x] Healthchecks per service
- [x] Named volumes for persistence
- [x] Comments explain bring-up + migration flow

### Makefile
- [x] `make install / up / down / dev / test / typecheck / lint / build`
- [x] `make db-generate / db-migrate / db-studio`
- [x] `make clean`

### .env.example
- [x] Added DATABASE_URL, REDIS_URL, S3_*, ANTHROPIC_API_KEY, ANTHROPIC_MODEL
- [x] Aligned with docker-compose defaults

## Verification

```bash
# /search works
curl -I 'http://localhost:5454/search?q=kharkiv'   # 200

# Copilot reports fake-mode without key
curl -X POST -H 'content-type: application/json' \
  -d '{"prompt":"summarize","country":"ua","hours":24}' \
  http://localhost:5454/api/copilot | grep mode
# "mode":"fake"

# To switch to real Claude:
#   echo 'ANTHROPIC_API_KEY=sk-...' >> apps/web/.env.local
#   restart dev server
# Then `meta.mode` becomes "anthropic" and `meta.model` is Claude haiku 4.5.

# To spin up DB:
make up
make db-generate     # creates migrations/0000_*.sql
make db-migrate      # applies to localhost:5432
```

## Files added

- `apps/web/src/lib/llm.ts`
- `apps/web/src/lib/search-index.ts`
- `apps/web/src/app/[locale]/search/page.tsx`
- `apps/web/src/components/ShareButton.tsx`
- `packages/db/package.json`
- `packages/db/tsconfig.json`
- `packages/db/drizzle.config.ts`
- `packages/db/src/index.ts`
- `packages/db/src/schema.ts`
- `docker-compose.yml`
- `Makefile`

## Files changed

- `apps/web/src/app/api/copilot/route.ts` — uses `llm.generate()`
- `apps/web/src/app/[locale]/events/[id]/page.tsx` — `<ShareButton />`
- `apps/web/src/app/sitemap.ts` — `/search`
- `apps/web/src/components/Header.tsx` — search icon
- `packages/url-builder/src/index.ts` — `urls.search`
- `apps/web/package.json` — (no change; ShareButton uses Web API)
- `.env.example` — DB, Redis, S3, Anthropic vars

## Sprint 1.5 candidates
- Wire web reads to `@aegis/db` (replace seed) once docker compose is running
- Real auth — WorkOS / Clerk / Auth.js
- Cluster markers on map (supercluster)
- Per-locale slugs (translated, with 301 from EN slug)
- `/admin` route group (gated)
- Per-region admin-1 (oblasts, voivodeships)
- Real ingestion adapter: alerts.in.ua
