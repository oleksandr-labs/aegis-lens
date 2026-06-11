# TODO — Integration: UALosses / Killed in Ukraine

## Goal
Verified casualty tracking — narrowly scoped, dignified, never gratuitous.

## Progress
- 12 / 12 done

## Tasks

### Sources
- [x] UALosses (verified fallen UA soldiers, public memorial sites) — integrations/ualosses/src/ualosses-client.ts (aggregate-only demo fixture; aggregate endpoint, polite UA, gateAggregate defence-in-depth)
- [x] Killed in Ukraine (community-verified) — integrations/ualosses/src/kiu-client.ts (community-verified caveat in verification + credit)
- [x] Mediazona casualty database (RU side, where applicable) — integrations/ualosses/src/mediazona-client.ts (RU-side confirmed deaths, aggregate-only, attributed)

### Pipeline
- [x] Aggregate statistics only by default (no per-person publication without consent) — integrations/ualosses/src/aggregate.ts + ethics-gate.ts (CORE INVARIANT: fail-closed gate drops any per-person record; toPublicAggregates re-projects onto a strict allow-list shape that cannot hold per-person fields)
- [x] Per-region / per-period aggregates — integrations/ualosses/src/rollups.ts (rollupByRegion / rollupByPeriod / totalsBySide over PublicAggregate only)
- [x] Source attribution always — integrations/ualosses/src/attribution.ts (requireAttribution THROWS on unknown source — no unattributed data can be shown)

### Use in product
- [x] Casualty-statistics widget (aggregate only) — integrations/ualosses/src/widget.ts + apps/web/src/app/api/integrations/ualosses/route.ts (aggregate-only responses; route mirrors the fail-closed gate)
- [x] Memorial cross-references on relevant investigation pages — integrations/ualosses/src/memorial-link.ts (links to source PUBLIC memorial region/period view; no scraped personal data; respects take-down suppression)
- [x] Ethical content policy gate — integrations/ualosses/src/ethics-gate.ts (gateAggregate / assertAggregateSafe, fail-closed, mirrors un-ocha pii-redaction rigor)

### Compliance
- [x] Strict ethics review per release — integrations/ualosses/COMPLIANCE.md §4 (per-release ethics-review checklist + sign-off)
- [x] No imagery or per-person data without consent — enforced in integrations/ualosses/src/ethics-gate.ts (imagery/per-person hard-block; consent off by default, requires allowConsented + recorded review) + COMPLIANCE.md §2
- [x] Take-down on family request — integrations/ualosses/src/takedown.ts (processTakedown honors requests by default; suppression propagates to aggregate/widget/memorial-link)

## i18n
- Respectful framing per locale. — integrations/ualosses/src/ethics-gate.ts RESPECTFUL_FRAMING (uk + en: dignity / aggregate-only / verification caveat)

### Примітки
Most-ethically-sensitive feed. Aggregate-only public. Honor dignity over engagement.
No map layer (aggregate widget only) — see c:\tmp\sprint259_shared_UALOSSES.txt (<none>).
