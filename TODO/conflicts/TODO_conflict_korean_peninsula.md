# RFC — Conflict / Flashpoint: Korean Peninsula

## Progress
14 / 14 done

## Status
Frozen-but-active · Phase 4

## Scope
- Geographic: DMZ, Korean Peninsula, surrounding waters
- Parties: ROK, DPRK, USFK; potential PRC + JP / Russia involvement

## Sources
- [x] ADS-B + AIS continuous — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[6] (ais-sanctions-dprk, T1; opensky in sources-data.ts)
- [x] Sentinel-1 SAR (DPRK monitoring, especially nuclear / missile facilities) — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[5] (sentinel1-sar-dprk, T1)
- [x] South Korean MoD + JCS — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[2] (rok-jcs, T1)
- [x] 38 North + NK News analytical sources — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[0–1] (38north T1 + nknews T2)
- [x] CSIS / IISS think-tank publications — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[3] (csis-iiss-korea, T1)
- [x] Japan defense statements — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[4] (japan-mod-korea, T2)

## Editorial
- [x] KO + EN + JP coverage — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_CONFIG locales: ["ko","en","ja"]
- [x] Strict editorial line on attribution + speculation about DPRK — `apps/web/src/lib/conflicts/korean-peninsula.ts` prohibitedFramings[0–1]; verificationStandard: "strict"
- [x] No PRC-side operations (out of scope politically) — `apps/web/src/lib/conflicts/korean-peninsula.ts` prohibitedFramings[2]
- [x] Sanctions-vessel tracking priority — `apps/web/src/lib/conflicts/korean-peninsula.ts` KOREAN_PENINSULA_SOURCES[6] (ais-sanctions-dprk); KOREAN_PENINSULA_CONFIG description_en

## Locales
- KO + EN + JP — `apps/web/src/lib/conflicts/korean-peninsula.ts` locales: ["ko","en","ja"]

## Launch gates
- [x] APAC region playbook active — `apps/web/src/lib/conflicts/korean-peninsula.ts` launchGates[0]
- [x] KO locale operational — `apps/web/src/lib/conflicts/korean-peninsula.ts` launchGates[1]
- [x] Regional advisor retained — `apps/web/src/lib/conflicts/korean-peninsula.ts` launchGates[2] + advisorsRequired
- [x] Maritime layer mature — `apps/web/src/lib/conflicts/korean-peninsula.ts` launchGates[3]

### Примітки
Strategic Phase 4 value for finance + APAC defense personas.
