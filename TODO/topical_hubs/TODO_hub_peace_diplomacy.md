# Hub — Peace Talks & Diplomacy Tracker

## Goal
Track negotiation rounds, mediator proposals, ceasefire attempts, and diplomatic statements across active conflicts — currently missing from the "Politics & Diplomacy" taxonomy branch (which only covers treaties/sanctions/visits/statements/recognition/elections/coups, not negotiation processes).

## Progress
- 0 / 5 done

## URLs
- `/diplomacy` (pillar, cross-conflict) · `/diplomacy/<conflict-slug>` (per-conflict negotiation timeline) · `/diplomacy/proposals/<proposal-slug>`

## Tasks
- [ ] Pillar page: active negotiation tracks across all 8 tracked conflicts (cross-link `conflicts/TODO_conflict_framework.md`)
- [ ] Per-conflict timeline: rounds, participants, mediators, outcome/status (ongoing/collapsed/agreement signed)
- [ ] Per-proposal detail page: proposing party, key terms summary (neutral framing), reactions
- [ ] Data model: `DiplomacyEventSeed` (conflictSlug, date, type: round/proposal/statement/ceasefire, participants[], mediator?, status, sourceUrls[]) in `apps/web/src/lib/hubs/diplomacy.ts`
- [ ] FAQPage JSON-LD (10 Q&A); strict neutral-framing editorial review (high misinterpretation risk — route through `TODO/content/` editorial policy)

## Notes
- Add `negotiations` / `ceasefire_talks` as a new subcategory under the existing "Politics & Diplomacy" branch in `data/taxonomy/category-tree.yaml` (see `categories_taxonomy/TODO_category_tree.md`).

## i18n
- EN + UK; also relevant to `region_playbooks/TODO_middle_east.md` given Israel-Palestine/Yemen coverage.
