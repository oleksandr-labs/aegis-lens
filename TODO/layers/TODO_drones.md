# TODO — Layer: Drones

## Goal
Real-time + historical tracking of drone activity (UAV launches, sightings, intercepts, debris finds).

## Progress
- 14 / 14 done

## Tasks
- [x] Event subtypes: launch, sighting, intercept, debris, swarm, recon — `integrations/drones/src/types.ts`
- [x] Classification model fine-tuned on UAV silhouettes (Shahed, Lancet, Orlan, Bayraktar, FPV) — `classifyModelFromSilhouette()` + `VisualDroneClassifier` contract in `integrations/drones/src/classifier.ts`
- [x] Audio signature classifier (where audio sources available) — `integrations/drones/src/audio-classifier.ts`
- [x] Trajectory reconstruction from multi-source sightings — `integrations/drones/src/trajectory.ts`
- [x] Linked-events grouping (single mission = multiple sightings) — `groupIntoMissions()` in trajectory.ts
- [x] Per-model identification confidence — `FieldConfidence` type + `classifier.ts`
- [x] Operator attribution (when publicly verifiable) — `classifyOperator()` in classifier.ts
- [x] Map styling: animated arc + decay — `dronesArc` ADDITIONS note in `c:\tmp\sprint257_shared_C6.txt` (existing `drones` circle key untouched)
- [x] Filter facets: type, model, operator, intercept status — `GET /api/layers/drones`
- [x] Per-event "verify cues" panel (visual + audio + sensor) — `integrations/drones/src/verify-cues.ts`
- [x] Historical playback supports trajectory animation — `integrations/drones/src/playback.ts` (reuses `trajectory.ts` mission waypoints)
- [x] Privacy: no near-real-time civilian-area launch points published unless aggregated — `integrations/drones/src/privacy.ts`
- [x] Data feeds: Telegram channels, ADS-B anomalies, civilian sighting reports (verified) — `integrations/drones/src/feeds.ts`
- [x] SEO: link to [../pages/TODO_equipment.md](../pages/TODO_equipment.md) per drone model — `integrations/drones/src/equipment-link.ts` (`urls.equipment` convention)

## i18n
- Model names + transliteration; civilian alert copy localized.

### Примітки
Highest-volume layer. Performance budget must accommodate.
