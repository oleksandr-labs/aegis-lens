# TODO — Map Rendering

## Goal
60fps interaction with 100k+ visible features; deck.gl overlays composable with Mapbox base.

## Progress
- 10 / 10 done

## Tasks
- [x] Mapbox GL JS (or MapLibre fallback) base ✓ Sprint 1
- [x] Custom dark/tactical map style (JSON) ✓ Sprint 1 — desaturated OSM tactical raster
- [x] deck.gl integration via `@deck.gl/mapbox` — `apps/web/src/lib/map/deckgl-config.ts`
- [x] WebGL clustering (Supercluster + custom) ✓ Sprint 1.2
- [x] Vector tiles from PostGIS via Martin / pg_tileserv — `apps/web/src/lib/map/vector-tiles.ts`
- [x] Heatmap layer (kernel density) ✓ Sprint 2.59 — HeatmapLayer (canvas radial gradients) + toggle
- [x] 3D extrusion for damage / outage intensity — `apps/web/src/lib/map/3d-extrusion.ts`
- [x] Arc / line layer for trajectories — `apps/web/src/lib/map/arc-layer.ts`
- [x] Animated event-arrival pulses ✓ Sprint 2.59 — pulse-ring animation on new SSE events
- [x] Snapshot export (server-side render for OG / reports) ✓ Sprint 2.59 — OG image API route /api/og

## i18n
- Map labels: use Mapbox's `name_int` or stack `name:en` + `name:uk`.

### Примітки
Benchmark on a 5-year-old laptop, not a dev machine.
