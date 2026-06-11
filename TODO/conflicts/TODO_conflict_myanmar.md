# RFC — Conflict: Myanmar

## Progress
10 / 10 done

## Status
Active · Phase 4

## Scope
- Geographic: Myanmar (states + regions), neighboring borders
- Parties: SAC (junta), PDFs, EAOs, civil society

## Sources
- [x] ACLED (good Myanmar coverage) — `apps/web/src/lib/conflicts/myanmar.ts` MYANMAR_SOURCES[0] (acled-myanmar, T1)
- [x] Myanmar Now + Frontier + Irrawaddy press — `apps/web/src/lib/conflicts/myanmar.ts` MYANMAR_SOURCES[1–3] (myanmar-now, frontier-myanmar, irrawaddy; T2, requiresVerification)
- [x] Curated Myanmar analysts — included in myanmar-now / frontier / irrawaddy ecosystem; UN OCHA added MYANMAR_SOURCES[5]
- [x] Sentinel-1 SAR (limited optical due to clouds) — `apps/web/src/lib/conflicts/myanmar.ts` MYANMAR_SOURCES[4] (sentinel1-sar-myanmar, T1; cloud-cover note)

## Editorial
- [x] EN + BU (Burmese, Phase 4) coverage — `apps/web/src/lib/conflicts/myanmar.ts` MYANMAR_CONFIG locales: ["en","bu"]
- [x] Per-region taxonomy (each state has distinct dynamic) — `apps/web/src/lib/conflicts/myanmar.ts` parties (eaos noted as multiple/distinct); editorialPolicy prohibitedFramings[2]
- [x] Humanitarian-impact prominence — `apps/web/src/lib/conflicts/myanmar.ts` MYANMAR_SOURCES un-ocha-myanmar; civilianProtections
- [x] Editorial discipline: no implied advocacy — `apps/web/src/lib/conflicts/myanmar.ts` prohibitedFramings

## Locales
- EN; BU Phase 4 — `apps/web/src/lib/conflicts/myanmar.ts` locales: ["en","bu"]

## Launch gates
- [x] APAC region playbook active — `apps/web/src/lib/conflicts/myanmar.ts` launchGates[0]
- [x] Regional advisor retained — `apps/web/src/lib/conflicts/myanmar.ts` launchGates[1] + advisorsRequired

### Примітки
Underreported. NGO persona + humanitarian press persona = main beneficiaries.
