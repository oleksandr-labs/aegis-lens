# TODO — Layer: Satellite Imagery

## Goal
Vector + raster satellite layer with cloud-free mosaics, SAR, and on-demand fresh acquisitions.

## Progress
- 10 / 10 done

## Tasks
- [x] Sentinel-2 cloud-free latest mosaic per region — integrations/sentinel-hub/src/s2-mosaic.ts (S2MosaicRequest/Result, cloud-cover threshold, leastCC evalscript)
- [x] Sentinel-1 SAR overlay — integrations/sentinel-hub/src/s1-sar.ts (S1SarRequest/Result, polarization-aware evalscript)
- [x] Change-detection differencing layer — integrations/sentinel-hub/src/change-detection.ts (ChangeDetectionRequest + ChangedPixelResult/ChangedFeature contract, alongside existing live diff)
- [x] AOI-based scheduled refresh — integrations/sentinel-hub/src/aoi-scheduler.ts (RegisteredAOI + RefreshCadence model, isDue/planRefreshes)
- [x] Commercial providers integration (Planet Phase 2, BlackSky / Capella Phase 3) — integrations/sentinel-hub/src/commercial-providers.ts (ImageryPhase enum gating + SceneUsageRecord per-scene metering hook)
- [x] Per-image metadata (acquisition time, sensor, license) — integrations/sentinel-hub/src/scene-metadata.ts (SceneMetadata + license field, localized describeScene)
- [x] Map style: switchable base layer + overlay opacity — integrations/sentinel-hub/src/overlay-config.ts (OverlayConfig opacity model, toRasterPaint) + paint note in c:/tmp/sprint257_shared_C8.txt (base switch via existing MAP_STYLES.satellite)
- [x] Per-tile attribution footer — integrations/sentinel-hub/src/attribution.ts (per-source en/uk builder, buildAttribution/buildAttributionI18n)
- [x] Compare slider (before / after dates) — integrations/sentinel-hub/src/compare.ts (ComparePair before/after model, chronology guards)
- [x] Annotation tool (analyst drawing on imagery) — integrations/sentinel-hub/src/annotations.ts (Annotation geometry/label model + per-user scope visibleTo)

## i18n
- Metadata labels localized — METADATA_LABELS / SENSOR_LABELS / LICENSE_LABELS (en+uk) in integrations/sentinel-hub/src/types.ts; describeScene() renders localized rows.

### Примітки
Commercial licensing tight. Track usage per scene.
- Done: commercial providers gated behind ImageryPhase enum (Planet=Phase2, BlackSky/Capella=Phase3); assertProviderEnabled() refuses calls before a phase is enabled. Per-scene usage metered via UsageMeterHook -> SceneUsageRecord on every search/download/tasking (commercial-providers.ts). Copernicus Sentinel-1/2 is free/open and intentionally NOT gated.
