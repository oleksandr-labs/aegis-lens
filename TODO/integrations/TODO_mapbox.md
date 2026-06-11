# TODO — Integration: Mapbox

## Goal
Primary base map + style + tile delivery. With MapLibre as portability fallback.

## Progress
- 9 / 9 done

## Tasks
- [x] Account + billing plan — `integrations/mapbox/COMPLIANCE.md` (account/plan/token/AUDIT-MONTHLY) + typed plan config `integrations/mapbox/src/plan.ts`
- [x] Custom style JSON (dark/tactical/print) — `apps/web/src/lib/map-style.ts` with dark/satellite/print variants + layer paint specs
- [x] Style asset CDN — `integrations/mapbox/src/style-cdn.ts` (style/sprite/glyph CDN templates + per-class Cache-Control headers)
- [x] Tile usage budget + alerts — `tilesBudget` per style config + `SNAPSHOT_TILE_BUDGET` guard in tiles service
- [x] Per-feature usage tracking — `integrations/mapbox/src/usage-tracking.ts` (per-feature map-load/tile/static-API counters vs plan allotments + monthly audit report)
- [x] MapLibre fallback parity test — `resolveStyleUrl()` checks token presence and falls back to OpenFreeMap/MapLibre URLs
- [x] Static API for OG / report snapshots — `services/tiles/src/snapshot.ts` with budget check
- [x] Vector tiles from Mapbox vs our PostGIS — decide per layer — `integrations/mapbox/src/tile-source-policy.ts` (per-layer source decision matrix + rationale)
- [x] Cache strategy + offline fallback — `integrations/mapbox/src/cache-policy.ts` (per-class tile cache TTLs + MapLibre/OpenFreeMap offline fallback policy)

## i18n
- `name:<lc>` label stack used for multilingual labels.

### Примітки
Mapbox bills steeply at scale. Audit monthly.
