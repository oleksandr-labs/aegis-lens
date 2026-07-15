# Hub — War Economy & Illicit Trade Tracker

## Goal
Broader than the shadow-fleet oil-tanker tracking already built (`apps/web/src/lib/hubs/maritime.ts` `/maritime/shadow-fleet`, fully covered) — this hub covers dual-use goods smuggling, resource plunder (stolen grain/metals from occupied territory), and illicit financing networks. The taxonomy already anticipates this exact scope: `apps/web/src/lib/taxonomy/subcategories.ts` has an `economy-logistics-chains` category (`isProgrammaticHub: true`, `exampleSlugs: ["dual-use-goods-smuggling", "sanctions-evasion-logistics-routes"]`) that was never wired to real content anywhere in the repo — same "predicted-but-never-built taxonomy stub" pattern already confirmed as a real gap type in rounds 4–5.

## Progress
- 0 / 5 done

## URLs
- `/war-economy` (pillar) · `/war-economy/<topic-slug>` (e.g. `/war-economy/dual-use-goods-smuggling`, `/war-economy/occupied-territory-resource-plunder`)

## Tasks
- [ ] Pillar page: scope (dual-use goods evasion routes, resource plunder documentation, illicit financing) and methodology, explicitly distinguished from `topical_hubs/TODO_hub_arms_trade.md` (legal state-to-state transfers, deferred) and shadow-fleet (oil-specific, already built)
- [ ] Per-topic page: documented smuggling routes/methods, resource-plunder case documentation (stolen grain/metals from occupied territory, cross-link `conflicts/TODO_conflict_ua_ru.md`), illicit financing network structures where publicly documented
- [ ] Data model: `WarEconomyIncidentSeed` (topicSlug, incidentType: dual-use-smuggling/resource-plunder/illicit-financing, conflictSlug, summaryEN/UK, sourceUrls[]) in `apps/web/src/lib/hubs/war-economy.ts` — this is the hub that should back the existing unwired `economy-logistics-chains` taxonomy `exampleSlugs`
- [ ] Cross-link to `topical_hubs/TODO_hub_sanctions.md` and `topical_hubs/TODO_hub_arms_trade.md`
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Reuse the shadow-fleet hub's sourcing/scoring pattern (tiered confidence assessment) as a model — it's the closest existing analog in shape.

## i18n
- EN + UK.
