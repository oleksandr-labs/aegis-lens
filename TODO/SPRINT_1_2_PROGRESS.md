# Sprint 1.2 — DONE (event permalinks + AI copilot + directory detail + live ticker)

> Live on http://localhost:5454. Continues from `SPRINT_1_1_PROGRESS.md`.

## Headline
Every event now has a **permalink with schema.org `Event`**. AI copilot ships in fake-mode
(grounded in seed events, real Claude API in Sprint 2). Directory has detail pages.
Equipment pages link to real event mentions. Landing shows live ticker.

## Done

### Event detail (`/events/[id]`)
- [x] Full event page: title, class badges, severity/danger/confidence/verification, MiniMap, sources, full metadata
- [x] schema.org `Event` + `BreadcrumbList` JSON-LD per event
- [x] `noindex` if `verificationState === "retracted"`
- [x] EventInspector now has "Open event detail →" button on map
- [x] hreflang per event across active locales

### AI Copilot (`/api/copilot` POST + side panel)
- [x] Deterministic fake-mode aggregator (event count, top class, avg danger, top 3 highlights)
- [x] Citations link to event detail pages
- [x] Side panel with chat history, suggested prompts, thinking spinner
- [x] Reads `useFilters()` country + hours from URL
- [x] Map workspace right rail now uses live `<Copilot />` component

### Directory detail pages
- [x] `/companies/[slug]` with schema.org `Organization`
- [x] `/tools/[slug]` with schema.org `SoftwareApplication`
- [x] `generateStaticParams` for both

### Equipment ↔ Events
- [x] `/equipment/[slug]` shows recent related events filtered by subclass keyword match
- [x] shahed-136 / bayraktar-tb2 → drone events; iskander-m → missile events
- [x] Each related event linked to its detail page

### Landing live ticker
- [x] `<LiveTicker />` client component polls `/api/events?country=ua&hours=24&limit=12` every 30s
- [x] Renders below hero with class-coded dots, time-ago, event links

### Seed fix
- [x] Dynamic `nowMs()` reference time — events always appear "hoursAgo from now"
  (was fixed 2025-05-23 → 0 events with `?hours=N` in 2026; now correctly matches)

### Sitemap
- [x] Added every event, company-detail, tool-detail to sitemap
- [x] Sitemap now contains 41 unique URLs (was 19)

### URL builder
- [x] Added `urls.event(locale, id)`, `urls.companyDetail`, `urls.toolDetail`

## Verification

```bash
# 13 seed events under 24h, top class military_action
curl -X POST -H 'content-type: application/json' \
  -d '{"prompt":"Status","country":"ua","hours":24}' \
  http://localhost:5454/api/copilot

# Direct event permalink
curl -I http://localhost:5454/events/01HXDNIPRO001     # 200
curl -I http://localhost:5454/uk/events/01HXDNIPRO001  # 200

# Directory detail
curl -I http://localhost:5454/companies/demo-osint-co  # 200
curl -I http://localhost:5454/tools/demo-sat-monitor   # 200
```

## Files added / changed

### Added
- `apps/web/src/app/[locale]/events/[id]/page.tsx`
- `apps/web/src/app/[locale]/companies/[slug]/page.tsx`
- `apps/web/src/app/[locale]/tools/[slug]/page.tsx`
- `apps/web/src/app/api/copilot/route.ts`
- `apps/web/src/components/Map/Copilot.tsx`
- `apps/web/src/components/LiveTicker.tsx`

### Changed
- `apps/web/src/components/Map/AegisMap.tsx` — inspector now links to event detail
- `apps/web/src/app/[locale]/map/page.tsx` — uses `<Copilot />` in right rail
- `apps/web/src/app/[locale]/page.tsx` — `<LiveTicker />` after hero
- `apps/web/src/app/[locale]/equipment/[slug]/page.tsx` — shows related events
- `apps/web/src/app/sitemap.ts` — added events + directory-detail entries
- `apps/web/src/lib/events-seed.ts` — dynamic `nowMs()` reference
- `packages/url-builder/src/index.ts` — `event`, `companyDetail`, `toolDetail`

## Sprint 1.3 candidates
- Cluster markers (supercluster) for zoom-out density
- Postgres + PostGIS + Drizzle (docker-compose)
- Real auth (WorkOS or Clerk)
- Real Anthropic Claude wire-up (swap fake-mode behind env flag)
- Per-event share-image OG render
- /entities knowledge-graph index
