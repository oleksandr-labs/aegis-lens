# Air Quality (PurpleAir + EEA) — Compliance

## ToS posture

### PurpleAir
- **License**: Public sensor data released under CC BY 4.0
  — https://www2.purpleair.com/pages/terms-of-service
- **API key**: Optional for public sensor reads (outdoor, location_type=0);
  API key (`PURPLEAIR_READ_KEY`) recommended for stable access
- **Scope**: Outdoor public sensors only; no private/indoor sensors requested
- **Rate limit**: 1 request/min recommended; enforced in client

### EEA (European Environment Agency) via WAQI
- **License**: EEA open data — EU Open Data Directive; WAQI feed CC BY 4.0
  — https://waqi.info/
- **API key**: Optional; `EEA_API_KEY` (WAQI token) recommended for higher limits
- **Scope**: Public monitoring stations; no private data
- **Rate limit**: 1 request/min; enforced in client

## Data classification
- Air quality readings: `PUBLIC_ENVIRONMENTAL`
- Sensor names (public): location identifiers for environmental monitoring stations
- No PII; no human subjects

## Filtering
- Only elevated readings (AQI > 100, category unhealthy_sensitive or worse) are surfaced
- Normal air quality readings are dropped at adapter level

## Retention policy
- 7 days rolling for normal readings
- 30 days for hazardous events (AQI > 300)
- Indexed for post-attack air quality impact analysis

## Legal review status
- APPROVED: PurpleAir CC BY 4.0 + EEA open data

## Compliance changelog
- 2026-06-10 — Initial record: PurpleAir CC BY 4.0, EEA open data, outdoor-only scope.
