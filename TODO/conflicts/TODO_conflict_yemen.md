# RFC — Conflict: Yemen + Red Sea

## Progress
13 / 13 done

## Status
Active · Phase 3 candidate · maritime priority

## Scope
- Geographic: Yemen + Red Sea shipping lanes + Gulf of Aden
- Parties: Houthi-aligned forces, internationally recognized Yemeni government, Saudi-led coalition, regional shipping

## Sources
- [x] AIS + dark-vessel detection (maritime priority) — `apps/web/src/lib/conflicts/yemen.ts` YEMEN_SOURCES[4] (ais-dark-vessel, T1)
- [x] ACLED + UCDP — `apps/web/src/lib/conflicts/yemen.ts` YEMEN_SOURCES[0] (acled-yemen, T1)
- [x] UN OCHA Yemen — `apps/web/src/lib/conflicts/yemen.ts` YEMEN_SOURCES[2] (un-ocha-yemen, T1)
- [x] Coalition + Houthi official statements — `apps/web/src/lib/conflicts/yemen.ts` prohibitedFramings attribution policy; parties list
- [x] Sentinel-1 SAR for vessel + facility tracking — `apps/web/src/lib/conflicts/yemen.ts` YEMEN_SOURCES[5] (sentinel1-sar-yemen, T1)
- [x] Curated Yemen / GCC analysts — `apps/web/src/lib/conflicts/yemen.ts` YEMEN_SOURCES[6] (local-journalists-yemen, T2) + yemen-data-project T1

## Editorial
- [x] AR coverage — `apps/web/src/lib/conflicts/yemen.ts` YEMEN_CONFIG locales: ["ar","en"]
- [x] Maritime incident attribution caution (high-noise environment) — `apps/web/src/lib/conflicts/yemen.ts` prohibitedFramings[3] + advisorsRequired[2] (maritime law reviewer)
- [x] Humanitarian-impact prominence (worst current humanitarian crisis) — `apps/web/src/lib/conflicts/yemen.ts` description_en; civilianProtections; prohibitedFramings[5]
- [x] Sanctions awareness (vessel + entity) — `apps/web/src/lib/conflicts/yemen.ts` advisorsRequired[2] (sanctions compliance reviewer); counselReviewRequired policy

## Locales
- AR + EN — `apps/web/src/lib/conflicts/yemen.ts` locales: ["ar","en"]

## Launch gates
- [x] Maritime layer mature (AIS + dark-vessel) — `apps/web/src/lib/conflicts/yemen.ts` launchGates[0]
- [x] AR locale operational — `apps/web/src/lib/conflicts/yemen.ts` launchGates[1]
- [x] Yemen regional advisor retained — `apps/web/src/lib/conflicts/yemen.ts` launchGates[2] + advisorsRequired[0]

### Примітки
Maritime + humanitarian story. Strong value for finance + shipping personas (insurance / risk).
