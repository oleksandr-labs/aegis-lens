# Sprint 1 — Vertical slice: map shows verified events (in progress)

> Continues from `SPRINT_0_PROGRESS.md`. Live on http://localhost:5454.

## Goal
Replace the placeholder canvas with a real interactive map that displays events from a
real API, with a clickable inspector. End-to-end vertical slice.

## Done
- [x] **MapLibre GL** + OpenStreetMap raster tiles (no token required, desaturated for tactical palette)
- [x] **`/api/events`** route with filters: `country`, `class[]`, `hours`, `limit`
- [x] **`/api/regions/<iso2>`** route with per-class aggregates + severity index
- [x] **8 synthetic seed events** across UA (Kharkiv, Kyiv, Odesa, Mykolaiv, Black Sea, Lviv, Dnipro, Zaporizhzhia) covering 6 event classes
- [x] **`AegisMap` client component** — interactive pan/zoom, colored class-coded markers, NavigationControl + ScaleControl
- [x] **Event inspector** — click marker → side panel with class, subclass, severity/danger/confidence, verification state, timestamp
- [x] **Map legend** — class color key + live event count
- [x] **Map workspace** uses real map (replaces placeholder)
- [x] **Region pages** show real KPIs (event count, severity index, top class) + last 10 events + per-class breakdown
- [x] **Vitest** scaffold for `@aegis/url-builder` — 14 tests passing
- [x] Cyrillic transliteration verified (Харків → kharkiv)
- [x] Hreflang round-trip verified
- [x] `[x] Sprint 1` markers added to relevant TODO files

## Not yet (Sprint 1.x or later)
- Layer toggles actually filter the map (currently all classes render)
- Time scrubber wired to API `hours` param
- Filter URL state (nuqs) — shareable filtered views
- Postgres + PostGIS + Drizzle migrations
- Real ingestion (alerts.in.ua first)
- Real auth (WorkOS / Clerk)
- AI copilot v0
- Real region admin-1 data (oblasts)
- Per-locale slug translation (currently slug stays in EN)

## How to run
```bash
cd "c:\Users\aleks\Downloads\Ukrainian MAP"
pnpm install                                # if not already
pnpm --filter @aegis/web dev                # http://localhost:5454
pnpm --filter @aegis/url-builder test       # 14 tests
```

## Files added / changed in Sprint 1

### Added
- `apps/web/src/lib/events-seed.ts`
- `apps/web/src/app/api/events/route.ts`
- `apps/web/src/app/api/regions/[country]/route.ts`
- `apps/web/src/components/Map/AegisMap.tsx`
- `packages/url-builder/src/index.test.ts`
- `packages/url-builder/vitest.config.ts`

### Changed
- `apps/web/src/app/[locale]/map/page.tsx` — uses `AegisMap` now
- `apps/web/src/app/[locale]/regions/[country]/page.tsx` — real event display + KPIs
- `apps/web/package.json` — added `maplibre-gl`
- `packages/url-builder/package.json` — added `vitest`
