# Sprint 1.1 — DONE (filters live, directory stubs, multi-country)

> Continues from `SPRINT_1_PROGRESS.md`. Live on http://localhost:5454.

## Headline
The map workspace now has **real working filters**: country, time window, event-class toggles —
all URL-synced (shareable views) via `nuqs`. **3 countries**, **17 seed events**, **directory stubs**.

## Done

### Filters (`@/lib/use-filters.ts` + nuqs)
- [x] URL-synced state: `?country=ua&hours=24&class=cyber&class=maritime`
- [x] Defaults omitted from URL (clean shareable links)
- [x] `FilterBar` — top chips (country, time, class chips, reset)
- [x] `LayerToggles` — left rail per-class on/off (line-through when off)
- [x] `AegisMap` re-fetches `/api/events` when filters change
- [x] Map flies to country center on country change

### Events & coverage
- [x] **17 seed events** across UA (13), PL (2: Medyka humanitarian + Warsaw phishing), DE (1: Berlin summit)
- [x] **All 10 event classes** represented
- [x] Country bbox + view-center registry (`COUNTRY_BBOX` + `COUNTRY_VIEW`)
- [x] `/api/events?country=pl` and `/api/events?country=de` return real events
- [x] `/api/regions/pl` and `/api/regions/de` return real aggregates

### Region pages
- [x] **MiniMap** component (interactive, no FilterBar) embedded on region pages
- [x] Locale-aware "time ago" on event list (`Intl.RelativeTimeFormat`)
- [x] Region pages now show maps for UA, PL, DE

### Directory
- [x] `/companies` — directory index stub (3 placeholders)
- [x] `/tools` — directory index stub (3 placeholders)
- [x] Header navigation includes Companies + Tools

### SEO
- [x] Sitemap expanded: home + map + pricing + about + docs + blog + glossary + companies + tools + per-region + per-equipment + per-conflict + per-glossary-term
- [x] All routes still 200; canonical + hreflang preserved

### Locale
- [x] EN + UK translations for new nav items (Companies, Tools)
- [x] `timeAgo()` switches between EN and UK formatting

## Not yet (Sprint 1.2 / 2)
- TimeScrubber at bottom of map (the FilterBar covers time-window for now)
- Per-class filter from layer toggles also reflected in legend
- Cluster markers when zoomed out
- Postgres + PostGIS migration (still in-memory)
- Real ingestion
- Real auth
- AI copilot

## Verification

```bash
curl http://localhost:5454/api/events?country=ua | jq '.meta'
# { "count": 13, "synthetic": true, ... }
curl http://localhost:5454/api/events?country=pl | jq '.data | length'
# 2
curl http://localhost:5454/api/regions/pl
# { "data": { "country": "pl", "eventCount": 2, ... } }
```

## Files added / changed

### Added
- `apps/web/src/lib/filter-config.ts`
- `apps/web/src/lib/use-filters.ts`
- `apps/web/src/lib/format.ts`
- `apps/web/src/lib/directory-seed.ts`
- `apps/web/src/components/Map/FilterBar.tsx`
- `apps/web/src/components/Map/LayerToggles.tsx`
- `apps/web/src/components/Map/MiniMap.tsx`
- `apps/web/src/app/[locale]/companies/page.tsx`
- `apps/web/src/app/[locale]/tools/page.tsx`

### Changed
- `apps/web/src/lib/events-seed.ts` — 17 events + per-country bbox/view
- `apps/web/src/components/Map/AegisMap.tsx` — consumes useFilters, FilterBar embedded
- `apps/web/src/app/[locale]/map/page.tsx` — uses LayerToggles
- `apps/web/src/app/[locale]/regions/[country]/page.tsx` — MiniMap + timeAgo
- `apps/web/src/app/layout.tsx` — wraps in NuqsAdapter
- `apps/web/src/app/sitemap.ts` — equipment, conflicts, glossary, directory
- `apps/web/src/components/Header.tsx` — Companies / Tools links
- `apps/web/src/messages/{en,uk}/common.json` — new nav keys
- `apps/web/package.json` — added `nuqs`
