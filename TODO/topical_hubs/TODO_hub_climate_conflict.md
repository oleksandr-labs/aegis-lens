# Hub — Climate & Resource Security (Climate as Conflict Driver)

## Goal
Content on climate change / drought / water scarcity **as a conflict driver** — distinct from the existing "Environment & Climate" taxonomy branch, which only tracks environmental-hazard *incidents* (fires, flooding, radiation, chemical hazards). This gap was first flagged in round 2 of the 2026-07-12 content-gap analysis but not given a TODO file at the time — confirmed still open on re-check in round 4.

## Progress
- 0 / 5 done

## URLs
- `/climate-security` (pillar) · `/climate-security/<region-slug>` (per-region resource-conflict analysis, e.g. `/climate-security/sahel`, `/climate-security/ukraine-agriculture`)

## Tasks
- [ ] Pillar page: how climate/water/land stress functions as a conflict multiplier, methodology (cite IPCC, SIPRI Environment of Peace, Water, Peace and Security partnership)
- [ ] Per-region page: water-scarcity/drought indicators overlaid with conflict activity, cross-link `verticals/TODO_vertical_agriculture.md` (grain-corridor tracker) and `conflicts/TODO_conflict_sahel.md` (Sahel is the clearest climate-conflict-nexus case among tracked conflicts)
- [ ] Data model: `ClimateConflictIndicatorSeed` (regionSlug, indicatorType: drought/water-access/land-degradation, severityTrend, conflictLinkNarrative, sourceUrls[]) in `apps/web/src/lib/hubs/climate-conflict.ts`
- [ ] Taxonomy fix: add `resource-conflict` / `water-security` as a new leaf under **Environment & Climate** in `data/taxonomy/category-tree.yaml` (currently only fires/flooding/radiation/chemical-hazard) — the `exampleSlugs` already sketched in `apps/web/src/lib/taxonomy/subcategories.ts` (`sahel-drought-conflict-nexus`, `ukraine-agricultural-drought-impact`) are illustrative only and not wired to any real content — this hub is what should back them
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Do not conflate with the existing environmental-hazard tracking (fires/floods/radiation) — that's incident response, this is structural conflict-driver analysis. Cross-link, don't merge.

## i18n
- EN + UK; also relevant to `region_playbooks/TODO_middle_east.md` and Sahel/Sudan conflict coverage given water-stress prominence there.
