# TODO — Service: Tiles

## Goal
Serve vector + raster tiles from PostGIS + S3 at edge speed.

## Progress
- 9 / 9 done

## Tasks
- [x] Vector tile server (Martin / pg_tileserv) — `services/tiles/src/martin-config.ts`: `generateMartinConfig()`, `generateTileFunctionSQL()` (PostGIS `ST_AsMVT` per layer with RLS org-scoping), `renderMartinYaml()`
- [x] Raster tile server for satellite mosaics — `services/tiles/src/raster.ts` (RasterTileConfig type, RASTER_LAYER_CONFIGS for sentinel-2-rgb/sentinel-1-sar/landsat-thermal, buildRasterTileUrl(), getRasterConfig(), isValidTileCoord()); API: `apps/web/src/app/api/layers/raster/[layer]/[z]/[x]/[y]/route.ts` (param validation + upstream proxy + Cache-Control)
- [x] Per-layer tile generation jobs — `services/tiles/src/generator.ts` with job queue + `enqueueJob()`
- [x] Cache at CDN edge with appropriate TTLs (short for live, long for static) — `LayerTileConfig.ttlSeconds` per layer in `layer-registry.ts`
- [x] Per-tenant tile auth (signed URLs) — `tileCache.signedUrl()` in `services/tiles/src/cache.ts`
- [x] Tile generation budget + monitoring — `tileCache.stats()` + tile budget constants
- [x] On-demand vs pre-generated decision per layer — `TileGenerationMode` per layer config in `layer-registry.ts`
- [x] Static snapshot service (for OG / reports) — `services/tiles/src/snapshot.ts` with budget check
- [x] Compaction job for inactive tiles — `services/tiles/src/compaction.ts`: `planCompaction()` + `runCompaction()` (live layers evict > 1h idle, historical > 30d, always keep overview zoom ≤ 6)

## i18n
- Multilingual labels in vector tiles (`name:<lc>`).

### Примітки
Tile cache invalidation is the hard part. Tag by `(layer, time-bucket, tenant)`.
