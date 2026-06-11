# TODO — Layer: Fires

## Goal
Wildfires + conflict-caused fires + industrial fires, fused from satellite + ground sources.

## Progress
- 10 / 10 done

## Tasks
- [x] NASA FIRMS ingestion (MODIS + VIIRS) — `integrations/nasa-firms/src/client.ts` + `integrations/nasa-firms/src/adapter.ts` (FIRMSClient, full adapter)
- [x] Sentinel-2 SWIR-band hot-spot derivation — `integrations/nasa-firms/src/swir-hotspots.ts` (SWIR radiance threshold heuristic; depends on Sentinel Hub for B8/B11/B12 fetch — not wired)
- [x] False-positive filter (flares, industrial, agricultural) — `integrations/nasa-firms/src/client.ts` (filterFalsePositives, bbox-list based)
- [x] Conflict-related vs wildfire classifier — `integrations/nasa-firms/src/fire-classifier.ts` (heuristic: military-event proximity + land-use + seasonality → conflict|wildfire|industrial|agricultural + confidence; conflict held to a high bar, confidence capped at 0.7)
- [x] Burn-scar mapping (multi-day persistence) — `integrations/nasa-firms/src/burn-scar.ts` (grid-snapped multi-day persistence aggregation → burn-scar cells with area estimate)
- [x] Per-fire timeline view — `integrations/nasa-firms/src/fire-timeline.ts` (spatial-temporal clustering of detections into fire entities with start/peak/duration + FRP series)
- [x] Air-quality cross-reference — `integrations/nasa-firms/src/air-quality.ts` (typed AQ observation interface + nearest-station match + conservative correlation flag; AQ fetch not wired)
- [x] Map style: pulsing radiance + smoke direction (wind data) — `apps/web/src/lib/map-style.ts` `LAYER_PAINT_SPECS.active_fires` (intensity colour ramp + pulsing radiance halo via `pulse` feature-state + smoke arrow rotated by `windBearing`)
- [x] Filter facets: source, confidence, size class, type — `layers/src/registry.ts` layer `active_fires` defines sources, confidence tiers in legend
- [x] Civilian-alert tie-in for evac zones — `integrations/nasa-firms/src/evac-tie-in.ts` (large/near-populated fire → bilingual evac-advisory payload, severity watch|advisory|urgent; advisory only)

## i18n
- Region + type names localized.

### Примітки
Easy to overstate causality — be conservative on "conflict-caused" labeling.
