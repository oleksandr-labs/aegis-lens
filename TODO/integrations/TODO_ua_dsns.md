# TODO — Integration: ДСНС (State Emergency Service of Ukraine)

## Goal
Emergencies: fires, mine clearance, rescue operations, evacuations, infrastructure damage response.

## Progress
- 9 / 9 done

## Tasks

### Sources
- [x] DSNS official site + Telegram (national + regional) — integrations/ua-dsns/src/dsns-client.ts (RSS/site + Telegram Bot API reuse, polite rate limit + cache, DEMO_REPORTS fixture)
- [x] Per-oblast DSNS branches — integrations/ua-dsns/src/oblast-branches.ts (OBLASTS + NATIONAL_CHANNELS + buildOblastBranches registry of regional DSNS channels)
- [x] Daily operational summary — integrations/ua-dsns/src/daily-summary.ts (parseDailySummary + summariseEvents)

### Pipeline
- [x] Event extraction (fire / explosion / collapse / rescue / demining) — integrations/ua-dsns/src/event-extractor.ts (heuristic uk+en classifier → typed EmergencyType + severity)
- [x] Geocoding via DSNS location text — integrations/ua-dsns/src/geocode.ts (Geocoder interface + GazetteerGeocoder stub, UA place-name resolver)
- [x] Cross-reference with fire layer (FIRMS / Sentinel) — integrations/ua-dsns/src/fire-xref.ts (spatio-temporal correlation with nasa-firms detections)

### Use in product
- [x] Emergency events on map — new `emergencies` layer proposed in c:\tmp\sprint258_shared_DSNS.txt (registry + paint) + API route apps/web/src/app/api/integrations/ua-dsns/route.ts (GeoJSON)
- [x] Per-oblast DSNS feed widget — integrations/ua-dsns/src/widget.ts (buildOblastFeed view-model)
- [x] Civilian guidance integration (evacuation orders) — integrations/ua-dsns/src/civilian-guidance.ts (detectEvacuationOrder + buildGuidance, plain en/uk)

## i18n
- UK + EN.

### Примітки
Underused feed. Crawler discipline matters (don't hammer).
