# Mapbox Integration — Compliance, Billing & ToS

Scope: Mapbox GL basemap styles, glyphs/sprites CDN, vector/raster tiles, and the
Static Images API used by `@ua-map/integration-mapbox`. MapLibre + OpenFreeMap is
the portability fallback (see `apps/web/src/lib/map-style.ts`).

## Placement rationale (where this code lives)

`services/tiles/` is a **provider-neutral** PostGIS → Martin MVT tile service: it
generates our *own* vector tiles and signs CDN URLs, and intentionally knows
nothing about Mapbox accounts or billing. Mapbox-specific account, billing,
per-feature usage, source-policy and cache/offline concerns are therefore kept in
this dedicated `integrations/mapbox/` package (scope `@ua-map/integration-mapbox`),
mirroring how every other external vendor (ais, adsb, cert-ua…) gets its own
integration package + `COMPLIANCE.md`. The tile *style* config that the web app
loads at runtime stays in `apps/web/src/lib/map-style.ts` (no `@ua-map` alias in
apps/web); this package is the policy/accounting layer that documents and types it.

## 1. Account & billing plan

- **Provider:** Mapbox, Inc. — https://www.mapbox.com/pricing/
- **Plan (typed in `src/plan.ts`):** Pay-As-You-Go (default). Billing is by
  *Monthly Active Users* (web map loads), tiles requests, and Static Images API
  requests, each with a free monthly allotment then per-1000 overage pricing.
- **Account/token:** access token via `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`
  (public, URL-restricted) or `MAPBOX_TOKEN` (server). **Never hardcoded.**
  Restrict the public token to the production origin(s) in the Mapbox dashboard.
- **AUDIT MONTHLY:** Mapbox bills steeply at scale (per the TODO note). The
  `plan.ts` config carries free-tier thresholds + a `auditCadence: "monthly"`
  marker; reconcile dashboard usage against `usage-tracking.ts` counters monthly
  and confirm the budget guards in `map-style.ts` (`tilesBudget`) still hold.

## 2. Terms of Service constraints

- **Caching:** Mapbox ToS restricts caching/redistribution of Mapbox tiles and
  styles outside the Mapbox SDK runtime. We do **not** persist Mapbox vector/raster
  tiles to our own CDN. Our CDN (`tiles.aegislens.com`) only serves **our own**
  PostGIS-derived MVT (see `services/tiles`). `cache-policy.ts` keeps Mapbox tiles
  to in-SDK/browser cache TTLs only; anything we self-host must be a non-Mapbox or
  OpenFreeMap/MapLibre source. This is the line that keeps us ToS-compliant.
- **Attribution:** the Mapbox wordmark + © OpenStreetMap attribution MUST remain
  visible on every Mapbox-rendered map (handled by the GL SDK; do not hide it).
- **Offline:** offline tile bundling for Mapbox tiles requires the appropriate
  Mapbox plan/SDK; our documented offline fallback (`cache-policy.ts`) switches to
  MapLibre + OpenFreeMap, which is openly licensed, rather than caching Mapbox.

## 3. Source policy (Mapbox tiles vs our PostGIS)

- Basemap (roads/labels/terrain/satellite) → **Mapbox** styles/tiles (or MapLibre
  fallback). Operational OSINT data layers (events, drones, missiles, thermal…) →
  **our PostGIS/Martin MVT**, never Mapbox-hosted. Per-layer matrix in
  `src/tile-source-policy.ts`.

## 4. General posture

- Secrets only via `process.env`; document the env var here, not in code.
- All user-facing strings localized **en + uk**.
- Fallback to MapLibre/OpenFreeMap when no Mapbox token is present
  (`resolveStyleUrl()` in `apps/web/src/lib/map-style.ts`).
