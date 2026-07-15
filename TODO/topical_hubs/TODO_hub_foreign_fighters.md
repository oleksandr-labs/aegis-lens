# Hub — Foreign Fighters & PMC Presence Tracker

## Goal
Aggregating cross-conflict hub for foreign-fighter contingents and private military company (PMC/mercenary) deployments — entity data already exists scattered across per-conflict files (Wagner Group / Africa Corps appear in `apps/web/src/lib/conflicts/{ua-ru,sahel,sudan}.ts`, `entities-seed.ts`, and one investigation), but there is no single hub aggregating locations, estimated headcounts, and sanctions status across conflicts.

## Progress
- 0 / 4 done

## URLs
- `/foreign-fighters` (pillar, cross-conflict) · `/foreign-fighters/<entity-slug>` (per-group/PMC profile, e.g. `/foreign-fighters/wagner-group`)

## Tasks
- [ ] Pillar page: cross-conflict overview table (group, conflicts active in, estimated presence, sanctions status) — pulls from existing per-conflict entity data, no new data pipeline
- [ ] Per-group profile page: origin, conflicts/locations, leadership (link to `/entities/<slug>` KG persons), sanctions cross-reference (`topical_hubs/TODO_hub_sanctions.md`), documented incidents (link to `topical_hubs/TODO_hub_war_crimes.md` where applicable)
- [ ] Aggregation layer: `apps/web/src/lib/hubs/foreign-fighters.ts` reading from existing `entities-seed.ts` + per-conflict data files rather than duplicating entity records
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Lower effort than it looks — most underlying entity data already exists; this is primarily an aggregation/presentation hub, same pattern as round-2's conflict-comparison hub.

## i18n
- EN + UK.
