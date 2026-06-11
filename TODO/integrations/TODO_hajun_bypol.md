# TODO — Integration: Hajun Project (BYPOL) — Belarus Tracking

## Goal
Track Russian military presence + movement through Belarus (key flank for UA conflict).

## Progress
- 9 / 9 done

## Tasks

### Source
- [x] Hajun Project (BYPOL) Telegram + website — integrations/hajun-bypol/src/client.ts (Telegram Bot API reuse + site fetch, crawler discipline, DEMO_REPORTS fixture, demo fallback)
- [x] Belarusian opposition OSINT community (vetted contributors) — integrations/hajun-bypol/src/contributors.ts (pseudonymous vetted-contributor registry + Wilson-shrunk trust score + assertNoPii fail-closed guard; no deanonymization)

### Pipeline
- [x] Daily ingest of sightings + analysis — integrations/hajun-bypol/src/ingest.ts (runDailyIngest/ingestReports: fetchAll → dedupe → adapt → canonical AegisEventV1[], demo-safe) + integrations/hajun-bypol/src/adapter.ts
- [x] Geocoding (often near rail nodes / airbases) — integrations/hajun-bypol/src/geocode.ts (BY rail-node/airbase/garrison/crossing gazetteer + alias place-name resolver, low-precision POI centroids)
- [x] Cross-reference with Sentinel-1 SAR for verification — integrations/hajun-bypol/src/sar-xref.ts (Sentinel1Detection correlation in the dark-vessel.ts style: proximity + time + signature consistency → verified flag + applySarXref)
- [x] Equipment-model identification via vision pipeline — integrations/hajun-bypol/src/equipment-id.ts (typed VisionClassifier interface + BaselineVisionClassifier + classifyEquipmentText heuristic baseline, missiles-classifier style; identifyEquipment fuses text+vision)

### Use in product
- [x] Belarus-flank layer on map — new layer `belarus_flank` proposed in c:\tmp\sprint259_shared_HAJUN.txt (registry entry category "military", access_tier "registered" + low-precision paint spec) + API route apps/web/src/app/api/integrations/hajun-bypol/route.ts
- [x] Equipment-movement timeline through BY — integrations/hajun-bypol/src/movement-timeline.ts (buildMovementTracks: chains sightings into per-equipment corridor tracks with heading + toward-UA-border note)
- [x] Cross-reference with RU equipment-pool inventories — integrations/hajun-bypol/src/equipment-pool-xref.ts (EquipmentPoolEntry inventory model + matchPools: class/model compatibility + draw-down scoring → ranked candidates + applyPoolXref)

## i18n
- UK + EN + BE.

### Примітки
Belarus context is essential for north-flank threat understanding. Underused outside BY-specialists.
