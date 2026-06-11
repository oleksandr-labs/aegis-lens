# TODO — Layer: Maritime Tracking

## Goal
Ship tracking from AIS + radar derivatives + OSINT, focused on conflict-relevant maritime zones.

## Progress
- 12 / 12 done

## Tasks
- [x] AIS feed (AISStream / Spire / community) — `layers/src/registry.ts` layer `maritime` (sources: ais); integration adapter pending in `integrations/ais/`
- [x] Dark-vessel detection (AIS-off correlation with SAR satellites) — `integrations/ais/src/dark-vessel.ts` (typed SAR↔AIS correlation + dark_confidence heuristic)
- [x] MarineTraffic / VesselFinder cross-reference — `integrations/ais/src/cross-reference.ts` (provider-weighted merge with per-field provenance)
- [x] Vessel type + flag + operator — `integrations/ais/src/vessel-registry.ts` + extended `types.ts` (VesselRegistryEntry, MID→flag, FoC tagging, EN/UK names + transliteration)
- [x] Cargo / class inference (where lawful) — `integrations/ais/src/cargo-inference.ts` (keyword + draught heuristic, missiles-classifier style, confidence schema)
- [x] Port-call timeline per vessel — `integrations/ais/src/port-calls.ts` (port polygons + STS zones, arrival/departure derivation)
- [x] Sanctions-screened vessel highlighting (OFAC / EU) — `integrations/ais/src/sanctions.ts` (screenVesselDetailed: OFAC/EU/UK programmes + highlight flag + staleness check)
- [x] Shadow-fleet tracking module — `integrations/ais/src/shadow-fleet.ts` (behavioural scoring → tier + EN/UK factors)
- [x] Black Sea + Sea of Azov focus polygons — `integrations/ais/src/focus-zones.ts` (GeoJSON zone constants + point-in-polygon)
- [x] Map style: vessel heading arrows + class color — `apps/web/src/lib/map-style.ts` (paint spec id `maritime`; snippet in c:\tmp\sprint257_shared_C1.txt for orchestrator merge)
- [x] Filter facets: type, flag, sanctions status, AIS-status — `apps/web/src/app/api/layers/maritime/route.ts` (DEMO vessels + type/flag/sanctions/ais/cargo/shadow filters + facet meta)
- [x] Per-vessel page (SEO surface) — `apps/web/src/app/vessels/[mmsi]/page.tsx` (server-rendered detail: identity, sanctions, shadow-fleet, port-call timeline; EN+UK)

## i18n
- Vessel + port names localized + transliteration.

### Примітки
Sanctions screening must be auto-updated. Stale lists = legal risk.
