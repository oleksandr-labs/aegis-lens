# TODO — Integration: ADS-B Exchange / OpenSky

## Goal
Aviation tracking feed.

## Progress
- 7 / 7 done

## Tasks
- [x] ADS-B Exchange commercial subscription — `integrations/adsb/COMPLIANCE.md` (§2, commercial billing required) + `integrations/adsb/src/providers.ts` (`ADSBEXCHANGE_PROVIDER`: rapidapi_basic/enterprise tiers, `productionAllowed`/`requiresAgreement`, `assertProductionTier`)
- [x] OpenSky Network access (research / commercial) — `integrations/adsb/COMPLIANCE.md` (§1) + `integrations/adsb/src/providers.ts` (`OPENSKY_PROVIDER`: anonymous/research/commercial tiers)
- [x] Realtime ingest + historical replay endpoints — `integrations/adsb/src/opensky-client.ts` (OpenSky REST, bbox filter, rate-limited polling)
- [x] Aircraft database (hex / callsign / type / operator) — `integrations/adsb/src/aircraft-db.ts` (CSV loader, ICAO hex military ranges for US/FR/DE/GB/RU/UA)
- [x] Filter: military / civilian / private — `integrations/adsb/src/adapter.ts` (inferMilitary from hex prefix)
- [x] Per-feed health monitoring — `integrations/adsb/src/health.ts` (`FeedHealthMonitor`: per-feed freshness/error-rate/staleness, `FeedHealthStatus` model healthy|degraded|stale|down|unknown, en+uk reasons, `overall()` rollup)
- [x] Attribution + license compliance — OpenSky free-research tier documented in client

## i18n
- Aircraft type / operator localized.

### Примітки
OpenSky free for research; ADS-B Exchange commercial billing required for production.
