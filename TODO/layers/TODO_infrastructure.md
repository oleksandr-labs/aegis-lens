# TODO — Layer: Damaged Infrastructure

## Goal
Track damage to energy, transport, telecom, water, civilian infrastructure.

## Progress
- 12 / 12 done

## Tasks
- [x] Base layer: OSM infrastructure + curated additions — `integrations/infrastructure/src/osm-base.ts`
- [x] Damage events with severity (minor / major / destroyed) — `InfrastructureDamageEvent` in `integrations/infrastructure/src/types.ts`
- [x] Sentinel change-detection cross-reference — `integrations/infrastructure/src/change-detection-link.ts`
- [x] CV damage classifier on event imagery — `integrations/infrastructure/src/damage-classifier.ts` (typed `DamageImageClassifier` interface + heuristic baseline)
- [x] Per-asset timeline (history of damage + repair) — `InfrastructureAsset.damageEventIds` + repair events
- [x] Repair / restoration events — `InfrastructureRepairEvent` type
- [x] Categories: power, transport, telecom, water, healthcare, education, residential — `InfrastructureCategory`
- [x] Map style: 3D extrusion by severity — `infrastructure_damage` fill-extrusion paint spec in `apps/web/src/lib/map-style.ts`
- [x] Filter facets: category, severity, status, owner — `GET /api/layers/infrastructure`
- [x] Auto-link to power-outage layer — `integrations/infrastructure/src/power-link.ts`
- [x] Auto-link to communications-outage layer — `integrations/infrastructure/src/comms-link.ts`
- [x] Damage aggregation per region for reports — `integrations/infrastructure/src/aggregation.ts`

## i18n
- Asset names + categories localized.

### Примітки
Avoid revealing tactical-uplift detail on functional military assets.
