# TODO — Layer: Thermal Imagery

## Goal
Surface thermal anomalies — fires, hot vehicles, industrial activity — from satellite IR bands.

## Progress
- 8 / 8 done

## Tasks
- [x] Sentinel-3 SLSTR ingestion — `integrations/nasa-firms/src/slstr-adapter.ts` (typed S7/S8/S9/F1/F2 thermal-band ingestion + brightness-temp normalisation; 1 km, coarse)
- [x] Landsat 8/9 thermal bands — `integrations/nasa-firms/src/landsat-thermal.ts` (Band 10/11 DN→radiance→at-sensor brightness-temperature model; at-sensor only, no LST correction)
- [x] FIRMS hot-spots (also fires layer) — `GET /api/layers/thermal` with `source=firms` filter
- [x] Anomaly classifier (vs baseline temperature) — `isAnomaly` + `vsBaseline` in `ThermalAnomaly`
- [x] Cloud-mask handling — `integrations/nasa-firms/src/cloud-mask.ts`
- [x] Day/night differential — `integrations/nasa-firms/src/day-night.ts`
- [x] Map style: heat-gradient overlay with opacity — `apps/web/src/lib/map-style.ts` `LAYER_PAINT_SPECS.thermal` (heatmap colour gradient keyed on `frpNorm`, opacity bound to `thermalOpacity` slider)
- [x] Use cases: fires, industrial activity, freezing events — `ThermalAnomalyType` covers fire/industrial/vehicle

## i18n
- Units localized.

### Примітки
Coarse resolution. Don't overclaim precision.
