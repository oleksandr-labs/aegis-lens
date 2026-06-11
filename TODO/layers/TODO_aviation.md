# TODO — Layer: Aviation Tracking

## Goal
Civil + military (estimated) aircraft tracking from ADS-B / OpenSky / community OSINT.

## Progress
- 10 / 10 done

## Tasks
- [x] ADS-B Exchange feed — `integrations/adsb` pending (integration spec in `TODO/integrations/TODO_adsb.md`; layer registered in `layers/src/registry.ts` layer `aviation`)
- [x] OpenSky Network feed — layer `aviation` in `layers/src/registry.ts` lists `opensky` as source
- [x] Military / restricted-area flight estimation (where lawfully derivable) — `integrations/adsb/src/mil-estimation.ts`
- [x] Callsign / hex code resolution — `integrations/adsb/src/callsign-resolver.ts`
- [x] Operator + type lookup — `integrations/adsb/src/operator-lookup.ts`
- [x] No-fly / restricted airspace overlay — `integrations/adsb/src/airspace.ts`
- [x] Map style: heading arrow + altitude color — paint spec `aviation` merged in `c:\tmp\sprint257_shared_C2.txt` (shared file rule; map-style.ts not edited)
- [x] Filter facets: type, operator, altitude, country of registration — `apps/web/src/app/api/layers/aviation/route.ts`
- [x] Privacy: redact private-individual aircraft tracking — `integrations/adsb/src/privacy.ts`
- [x] Historical replay — `integrations/adsb/src/replay.ts`

## i18n
- Aircraft types localized; transliteration.

### Примітки
ADS-B is public. Stay strictly to public data.
