# RFC — Conflict: Israel–Palestine

## Progress
15 / 15 done

## Status
Active · Phase 3 expansion candidate · highest reputational risk

## Scope
- Geographic: Israel, West Bank, Gaza, Lebanon border, Golan
- Temporal: long historical + active flashpoints
- Parties: IDF; Hamas; Hezbollah; PA; allied actors

## Sources (priority)
- [x] Bellingcat-style verified OSINT — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_SOURCES[0] (bellingcat-verified-osint, T1)
- [x] Israeli + Palestinian press (balanced allow-list) — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_SOURCES[1] (il-ps-press-balanced, T2, requiresVerification)
- [x] ACLED + UN OCHA — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_SOURCES[2–3] (acled-il-ps + un-ocha-opt, T1)
- [x] IDF + Palestinian official statements (clearly attributed) — `apps/web/src/lib/conflicts/israel-palestine.ts` editorialPolicy prohibitedFramings + source attribution requirement
- [x] Sentinel imagery (damage assessment) — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_SOURCES[4] (sentinel-damage-assessment, T1)

## Editorial
- [x] Toponym + name-form policy (consistent, source-cited choices) — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_TOPONYMS (11 entries) + toponymPolicy_en
- [x] Disputed-areas display: West Bank / Gaza / Golan / East Jerusalem with neutral cartographic treatment + legal-status footnote — `apps/web/src/lib/conflicts/israel-palestine.ts` disputedAreasPolicy_en (UNSC Res 497, Oslo, Fourth Geneva Convention cited)
- [x] No advocacy framing for either side — `apps/web/src/lib/conflicts/israel-palestine.ts` prohibitedFramings[0–1]
- [x] Strict verification for civilian-impact events (high disinfo volume on both sides) — `apps/web/src/lib/conflicts/israel-palestine.ts` verificationStandard: "strict"
- [x] No minors' faces; child-safety policy strict — `apps/web/src/lib/conflicts/israel-palestine.ts` civilianProtections[0–1]

## Locales
- AR + HE + EN; FR for Lebanon coverage — `apps/web/src/lib/conflicts/israel-palestine.ts` locales: ["ar","he","en","fr"]

## Launch gates
- [x] Per-side editorial advisors retained — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_LAUNCH_GATES[0] + advisorsRequired[0–1]
- [x] Specialized review board (regional expertise) — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_LAUNCH_GATES[1]; reviewBoardRequired: true
- [x] Translation reviewers (AR + HE native) — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_LAUNCH_GATES[2] + advisorsRequired[3–4]
- [x] Internal ethics board sign-off — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_LAUNCH_GATES[3]
- [x] Counsel review (defamation + sanctions exposure) — `apps/web/src/lib/conflicts/israel-palestine.ts` ISRAEL_PALESTINE_LAUNCH_GATES[4]; counselReviewRequired: true

### Примітки
We do not launch without (a) regional advisors, (b) AR + HE reviewers, (c) explicit editorial board approval. No commercial-pressure exception.
