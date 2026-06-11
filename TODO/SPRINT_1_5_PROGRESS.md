# Sprint 1.5 — DONE (26 UA oblasts · map clustering · /admin)

> Live on http://localhost:5454. Continues from `SPRINT_1_4_PROGRESS.md`.

## Headline
Programmatic SEO got a **26× multiplier** for Ukraine: every oblast (+ Kyiv city + Crimea)
has its own page with KPIs, sparkline, mini-map, breadcrumbs, and schema.org `Place`.
Map clustering via supercluster handles dense areas at zoom-out. Admin route group
ships with placeholder env-token gate.

## Done

### UA admin-1 (26 oblasts + Kyiv city + Crimea)
- [x] `apps/web/src/lib/oblasts-seed.ts` — 26 entries with name (EN+UK), capital, center, bbox
- [x] `/regions/ua/<oblast-slug>` route
- [x] schema.org `Place` + `BreadcrumbList` JSON-LD per oblast
- [x] KPI strip (events, severity, top class, slug)
- [x] EventsPerHourSparkline scoped to oblast bbox
- [x] MiniMap centered on oblast center, zoom 7, events inside bbox
- [x] Recent events list (link to event detail)
- [x] Sibling oblasts cross-links
- [x] `dynamicParams = false` → 404 on unknown slug (verified)
- [x] hreflang per locale (en + uk)
- [x] Breadcrumb nav: Country → Oblast
- [x] `/regions/ua` now shows full oblast grid (26 items)

### Map clustering
- [x] Installed `supercluster` + types
- [x] Index built per events update (radius 60, maxZoom 14)
- [x] Cluster markers (size scales by `log2(count)`, blue with badge count)
- [x] Click cluster → `flyTo()` with `getClusterExpansionZoom()`
- [x] Single-event markers preserved (class color + click → inspector)
- [x] Re-renders on `moveend` + `zoomend`

### `/admin` route group
- [x] Root-level (NOT under `[locale]`), single-locale EN
- [x] `noindex` site-wide
- [x] Layout with header + "Back to site"
- [x] `lib/admin-gate.ts` — env-`ADMIN_TOKEN` + httpOnly cookie auth
- [x] `/admin` placeholder gate page with login form
- [x] `/api/admin/login` POST sets `aegis_admin` cookie (httpOnly, lax, 8h)
- [x] `/api/admin/logout` POST clears cookie
- [x] Authenticated dashboard: event count by verification state + 4 admin-link cards
- [x] Middleware updated: skips `/admin` from locale rewrite
- [x] Real auth (WorkOS / Clerk / Auth.js) wires up in Sprint 2

### URL builder + sitemap
- [x] `urls.search` already shipped Sprint 1.4
- [x] Sitemap grew 55 → 81 URLs (added 26 UA oblasts)

## Verification

```bash
curl -I http://localhost:5454/regions/ua/kharkiv-oblast       # 200
curl -I http://localhost:5454/uk/regions/ua/lviv-oblast       # 200
curl -I http://localhost:5454/regions/ua/zzz-bad-slug         # 404
curl -I http://localhost:5454/admin                           # 200
curl -I http://localhost:5454/admin/sources                   # 404 (planned, not built)

# To enable admin login:
echo 'ADMIN_TOKEN=dev-admin-token' >> apps/web/.env.local
# restart, then visit /admin and sign in
```

## Files added

- `apps/web/src/lib/oblasts-seed.ts` — 26 UA oblasts
- `apps/web/src/lib/admin-gate.ts` — placeholder auth
- `apps/web/src/app/[locale]/regions/[country]/[oblast]/page.tsx`
- `apps/web/src/app/admin/layout.tsx`
- `apps/web/src/app/admin/page.tsx`
- `apps/web/src/app/api/admin/login/route.ts`
- `apps/web/src/app/api/admin/logout/route.ts`

## Files changed

- `apps/web/src/lib/events-seed.ts` — `eventsInBbox()` helper
- `apps/web/src/app/[locale]/regions/[country]/page.tsx` — full oblast grid
- `apps/web/src/components/Map/AegisMap.tsx` — supercluster integration
- `apps/web/src/middleware.ts` — skip `/admin` from locale rewrite
- `apps/web/src/app/sitemap.ts` — added 26 UA oblasts
- `apps/web/package.json` — `supercluster` + `@types/supercluster`

## Sprint 1.6 candidates
- Real auth provider (Auth.js with magic link)
- Per-locale slug aliases (translated, 301 from EN)
- DB-backed reads (replace seed, requires docker compose up)
- Per-region admin-1 for PL voivodeships + DE Bundesländer
- City-level (admin-2) for top 10 UA cities
- alerts.in.ua real ingestion adapter
- Per-oblast OG image template
- `/api/events/[id]` GET endpoint
- Citation tracking + LLMO analytics
