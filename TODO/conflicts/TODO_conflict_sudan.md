# RFC — Conflict: Sudan

## Progress
14 / 14 done

## Status
Active · Phase 3 candidate · humanitarian-priority

## Scope
- Geographic: Sudan + South Sudan border + Chad border + Red Sea coast
- Parties: SAF (Sudanese Armed Forces), RSF (Rapid Support Forces), allied militias, foreign actors (UAE / Russia / Egypt influences)

## Sources
- [x] ACLED — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_SOURCES[0] (acled-sudan, T1)
- [x] UN OCHA + IOM DTM (displacement priority) — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_SOURCES[1–2] (un-ocha-sudan + iom-dtm-sudan, T1)
- [x] Sentinel imagery (urban warfare damage) — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_SOURCES[3] (sentinel-sudan, T1)
- [x] Curated Sudan analysts — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_SOURCES[4] (curated-sudan-analysts, T2, requiresVerification)
- [x] HOT OSM (humanitarian mapping community) — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_SOURCES[5] (hot-osm-sudan, T2)

## Editorial
- [x] AR coverage — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_CONFIG locales: ["ar","en","fr"]
- [x] Disinformation alert (high state-actor manipulation) — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_EDITORIAL_POLICY prohibitedFramings[0] + verificationStandard: "strict"
- [x] Casualty figures: caveat heavily (massive divergence between sources) — `apps/web/src/lib/conflicts/sudan.ts` civilianProtections[0] + prohibitedFramings[0]
- [x] Humanitarian-impact prominence — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_CONFIG description_en; ICRC source included
- [x] Foreign-actor attribution: cautious + evidence-based — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_CONFIG parties (uae-actor, russia-actor, egypt-actor) with "alleged" + evidence-based note; prohibitedFramings[1]

## Locales
- AR + EN + FR (relief coordination) — `apps/web/src/lib/conflicts/sudan.ts` locales: ["ar","en","fr"]

## Launch gates
- [x] Humanitarian layer mature — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_LAUNCH_GATES[0]
- [x] AR locale operational — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_LAUNCH_GATES[1]
- [x] Regional advisor retained — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_LAUNCH_GATES[2] + advisorsRequired
- [x] UN OCHA partnership — `apps/web/src/lib/conflicts/sudan.ts` SUDAN_LAUNCH_GATES[3]

### Примітки
Most underreported major conflict. High humanitarian impact + sales for NGO persona.
