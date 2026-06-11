# MODIS NRT / VIIRS I-Band 375m — Compliance

## ToS posture
- **Data source**: NASA FIRMS (Fire Information for Resource Management System)
  — https://firms.modaps.eosdis.nasa.gov/
- **License**: NASA Open Data — free, no ToS restrictions on use
- **API key**: Required (FIRMS MAP Key) — free registration at https://firms.modaps.eosdis.nasa.gov/api/
- **Extends**: `@ua-map/integration-nasa-firms` pattern; complements existing FIRMS integration

## Sensors covered
| Sensor | Satellite | Pixel size | Latency |
|---|---|---|---|
| MODIS NRT | Terra + Aqua | ~1 km | ~3 hr |
| VIIRS I-Band | Suomi-NPP | 375 m | ~3 hr |
| VIIRS I-Band | NOAA-20 | 375 m | ~3 hr |
| VIIRS I-Band | NOAA-21 | 375 m | ~3 hr |

## Data classification
- Satellite-derived thermal anomalies: `PUBLIC_EARTH_OBSERVATION`
- No PII; no human subjects

## Rate limits
- Recommended 1 request/minute per source; enforced in client
- Multiple sources polled sequentially with throttling

## Retention policy
- 30 days rolling thermal record
- High-FRP events (>100MW) retained 90 days

## Legal review status
- APPROVED: NASA open data, no restrictions

## Compliance changelog
- 2026-06-10 — Initial record: NASA FIRMS open data, MODIS+VIIRS NRT coverage, 1 req/min throttle.
