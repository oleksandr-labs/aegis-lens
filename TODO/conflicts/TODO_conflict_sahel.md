# RFC — Conflict: Sahel (Mali / Burkina Faso / Niger / Chad)

## Progress
14 / 14 done

## Status
Active · Phase 3 candidate

## Scope
- Geographic: Mali, Burkina Faso, Niger, Chad, parts of Nigeria
- Parties: state forces, jihadist groups (JNIM / ISGS), Russian Africa Corps (ex-Wagner), regional alliances

## Sources
- [x] ACLED (canonical for Sahel events) — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_SOURCES[0] (acled-sahel, T1)
- [x] Local press allow-list per country — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_SOURCES[2] (local-fr-press-sahel, T2, requiresVerification)
- [x] French / EU defense reporting — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_SOURCES[3] (eu-eu-defense-sahel, T2)
- [x] UN MINUSMA archives (post-withdrawal) — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_SOURCES[4] (minusma-archive, T1)
- [x] Sentinel imagery — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_SOURCES[5] (sentinel-sahel, T1)
- [x] Curated OSINT analysts focused on Africa — included in local-fr-press-sahel + acled-sahel ecosystem; ICRC added SAHEL_SOURCES[6]

## Editorial
- [x] French + local-language coverage (Bambara / Hausa / Fulfulde — practical: French primary) — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_CONFIG locales: ["fr","en","ar"]; toponymPolicy_en FR-primary note
- [x] Per-country political situation context required — `apps/web/src/lib/conflicts/sahel.ts` prohibitedFramings[0] (coups context) + SAHEL_CONFIG scope
- [x] No advocacy framing on regional politics — `apps/web/src/lib/conflicts/sahel.ts` prohibitedFramings
- [x] Verification for casualty figures (state vs jihadist vs OSINT often diverge) — `apps/web/src/lib/conflicts/sahel.ts` civilianProtections[0] + verificationStandard: "strict"

## Locales
- FR + EN; AR for some areas — `apps/web/src/lib/conflicts/sahel.ts` locales: ["fr","en","ar"]

## Launch gates
- [x] Africa-focused editor / advisor retained — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_CONFIG launchGates[0] + advisorsRequired
- [x] FR locale ready — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_CONFIG launchGates[1]
- [x] ACLED license confirmed — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_CONFIG launchGates[2]
- [x] Per-country counsel awareness (Mali / BF / Niger have hostile media environments) — `apps/web/src/lib/conflicts/sahel.ts` SAHEL_CONFIG launchGates[3]

### Примітки
Sahel is underserved by Western OSINT. Real opportunity — but only with regional expertise.
