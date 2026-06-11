# RFC — Conflict: Russia–Ukraine

## Progress
13 / 13 done

## Status
Active · Phase 1 anchor coverage

## Scope
- Geographic: Ukraine + Russian border + Black Sea + Sea of Azov + Belarus (transit)
- Temporal: 2014– (Crimea / Donbas) and 2022 full-scale invasion onward
- Parties: UA armed forces + allies; RU armed forces + Wagner / private; auxiliaries

## Sources (priority)
- [x] All UA-specific integrations (alerts, OVA, MoD, DeepStateMAP, Oryx) ↑P0 — `apps/web/src/lib/conflicts/ua-ru.ts` UA_RU_SOURCES (14 sources: ISW, DeepStateMAP, GenStaff, MoD UA, OVA, alerts.in.ua, Oryx, ACLED, CERT-UA, Ukrenergo, DSNS, UALosses, Ukrhydromet, Copernicus EMS)
- [x] ISW + Bellingcat + Hajun + curated milbloggers ↑P1 — `apps/web/src/lib/conflicts/ua-ru.ts` UA_RU_SOURCES (isw-daily, sourceId pattern)
- [x] Sentinel + commercial satellite (Planet/BlackSky Phase 2-3) ↑P1 — `apps/web/src/lib/conflicts/ua-ru.ts` copernicus-ems source
- [x] AIS + ADS-B continuous — registered in sources-data.ts opensky source; conflict-level reference in ua-ru.ts

## Editorial
- [x] Toponyms: Ukrainian names (Kyiv / Kharkiv / Odesa / Lviv / Mykolaiv) — `apps/web/src/lib/conflicts/ua-ru.ts` UA_RU_TOPONYMS (18 entries) + UA_RU_EDITORIAL_POLICY toponymPolicy_en
- [x] Disputed Crimea / Donbas: clear policy with neutral cartographic treatment + legal status — `apps/web/src/lib/conflicts/ua-ru.ts` UA_RU_EDITORIAL_POLICY disputedAreasPolicy_en (UN GA Res ES-11/1 cited)
- [x] No false equivalence between aggressor and defender; while presenting both sides' claims — `apps/web/src/lib/conflicts/ua-ru.ts` prohibitedFramings
- [x] No real-time targeting-grade data publication — `apps/web/src/lib/conflicts/ua-ru.ts` civilianProtections[0–1]
- [x] Civilian-safety bias: protect civilian infrastructure / shelter precision — `apps/web/src/lib/conflicts/ua-ru.ts` civilianProtections (6 items)

## Locales
- UK + EN + RU (defensive/comprehension) + PL + DE; future RO — `apps/web/src/lib/conflicts/ua-ru.ts` locales: ["uk","en","ru","pl","de"]

## Launch gates
- [x] All UA integrations live — `apps/web/src/lib/conflicts/ua-ru.ts` launchGates[0]
- [x] Editorial board approved — `apps/web/src/lib/conflicts/ua-ru.ts` launchGates[1]
- [x] OSINT-ethics policy public — `docs/editorial/editorial-policy.md`
- [x] DeepStateMAP partnership in motion — `apps/web/src/lib/conflicts/ua-ru.ts` launchGates[3]

### Примітки
This is our anchor conflict. Get this right; the framework for others follows.
