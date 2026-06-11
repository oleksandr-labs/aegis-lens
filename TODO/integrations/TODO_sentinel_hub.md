# TODO — Integration: Sentinel Hub / Copernicus

## Goal
Sentinel-1 SAR + Sentinel-2 optical for monitoring, change detection, fire / burn-scar.

## Progress
- 8 / 8 done

## Tasks
- [x] Copernicus Data Space Ecosystem account — `integrations/sentinel-hub/COMPLIANCE.md` (§2 account reqs) + `src/account-config.ts` (`cdse` deployment, `cdse_free` tier, `DEFAULT_ACCOUNT_CONFIG`, env-name creds)
- [x] Sentinel Hub commercial subscription (Phase 1+) — `integrations/sentinel-hub/COMPLIANCE.md` (§3 tier matrix) + `src/account-config.ts` (`TIER_CONFIGS` PU/min + PU/month per tier, `tierAllowsCommercial`)
- [x] AOI-based processing API integration — `integrations/sentinel-hub/src/client.ts` (OAuth2 token refresh, Process API + Statistics API)
- [x] Process API for custom evalscripts (NDVI, NBR, change detection) — `integrations/sentinel-hub/src/evalscripts.ts` (S2 true-color, NDVI, NBR, fire hotspot, S1 VV, change detection)
- [x] Statistical API for time-series — `integrations/sentinel-hub/src/client.ts` `getStatistics()` method
- [x] Per-AOI caching strategy — `integrations/sentinel-hub/src/aoi-cache.ts` (`buildCacheKey` by AOI+time+evalscript+collection+size, `computeTtl` immutable-historical vs cadence-bound, `readThrough` cache)
- [x] Cost monitoring + processing-unit budget — `integrations/sentinel-hub/src/cost-monitor.ts` (`estimatePu`, `PuBudgetMonitor.forTier`, warn/critical/exceeded budget alerts)
- [x] Attribution per published scene — change-detection results include scene metadata + S3 storage key

## i18n
- N/A.

### Примітки
Free tier severely limited. Plan a Sentinel Hub Enterprise budget early.
