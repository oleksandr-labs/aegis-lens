# TODO — Service: Geolocation

## Goal
Resolve any geographic reference (text, image, coords) to a coordinate + admin region + uncertainty.

## Progress
- 10 / 10 done

## Tasks
- [x] Text geocoder (Nominatim self-hosted + Mapbox fallback) — `services/geo/src/geocoder.ts` (Geocoder class, Nominatim primary + Mapbox fallback)
- [x] Reverse geocoder (admin-level resolution) — `services/geo/src/reverse.ts` (ReverseGeocoder, levels 0-4)
- [x] Toponym gazetteer (UA admin levels 0–4) — `services/geo/src/gazetteer.ts` (UAGazetteer: 27 oblasts, 14 major cities, strategic sites; prefix search, bbox-based reverse)
- [x] Disambiguation by region context — `services/geo/src/disambiguation.ts`: `scoreCandidate()` (region-mention +50, proximity, event-class frontline bias, admin-level), `disambiguate()` returns confidence + reason
- [x] Multi-format coord parser (MGRS, UTM, DMS, decimal) — `services/geo/src/coord-parser.ts` (parseCoordinate, all 4 formats)
- [x] Visual geolocation pipeline (clue extraction → candidate generation → cross-ref) — `services/geo/src/visual-geolocation.ts`: clue types, `plateToRegion()` (UA plate prefixes → oblast), `generateCandidates()`, `fuseCandidates()` (corroboration boost), `geolocateFromImage()` with per-stage timing + review gate
- [x] Uncertainty quantification (radius m) — `services/geo/src/types.ts` (GeoResult.precision_m)
- [x] AOI lookup (point-in-polygon) — `services/aoi/src/geo-utils.ts` (pointInAOI, ray-casting pointInPolygon; gazetteer provides bbox for pre-filtering)
- [x] Caching layer — `services/geo/src/geocoder.ts` (GeoCache interface, TTL-based)
- [x] Human-override channel (review queue → retrain) — `services/geo/src/override.ts` (GeoOverride type, AdminLevel, InMemoryOverrideStore: submitOverride/getPendingOverrides/approveOverride/getTrainingQueue, createOverrideStore() factory)

## i18n
- Multilingual toponyms; transliteration.

### Примітки
This is the most-called service. Latency budget < 50ms p95.
