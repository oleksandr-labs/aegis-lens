# TODO — Geolocation Engine

## Goal
Convert any textual / visual clue into a coordinate with calibrated uncertainty.

## Progress
- 7 / 10 done

## Tasks
- [x] Text geocoding (Nominatim self-hosted + Mapbox fallback) — `services/geo/src/geocoder.ts` (Geocoder, primary Nominatim + Mapbox fallback, UA countrycode bias)
- [ ] Place-name disambiguation by region context — pending
- [x] Toponym gazetteer (UA admin levels 0–4, plus disputed-area handling policy) — `services/geo/src/gazetteer.ts` (UAGazetteer: 27 oblasts, 14 major cities, strategic sites; prefix/exact/bbox-reverse search; geocode→GeoResult)
- [x] Coordinate parsing (MGRS, UTM, DMS, decimal) — `services/geo/src/coord-parser.ts` (parseCoordinate, all 4 formats with UTM→WGS84 math)
- [ ] Visual geolocation pipeline (clue extraction → candidate generation → cross-ref) — pending (vision service)
- [x] Uncertainty quantification (radius in meters per coordinate) — `services/geo/src/types.ts` (GeoResult.precision_m; geocoding_method-based estimates in Geocoder)
- [x] Reverse-geocode to admin region for filtering — `services/geo/src/reverse.ts` (ReverseGeocoder, levels 0-4)
- [ ] Human override + retraining loop — pending (review queue)
- [x] Geofence library (AOIs per customer) — `services/aoi/src/geo-utils.ts` (pointInAOI, pointInPolygon ray-casting, aoiBoundingBox; all 3 geometry types)
- [x] Privacy filter: never geocode private individuals' locations — `services/ingest/src/pii.ts` (GPS coord redaction rule)

## i18n
- Toponyms stored multilingually; user views in chosen locale.

### Примітки
Disputed-area display policy must be documented and consistent.
