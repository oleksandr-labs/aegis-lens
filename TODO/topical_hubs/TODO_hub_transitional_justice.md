# Hub — Transitional Justice & Reparations Tracker

## Goal
Track post-conflict transitional-justice mechanisms — reparations/compensation funds, truth commissions, damage-registration processes — distinct from `topical_hubs/TODO_hub_war_crimes.md` (criminal prosecution/tribunals) and `topical_hubs/TODO_hub_reconstruction.md` (physical infrastructure rebuild, not compensation mechanisms). Zero existing scaffolding found repo-wide.

## Progress
- 0 / 5 done

## URLs
- `/transitional-justice` (pillar, cross-conflict) · `/transitional-justice/<conflict-slug>` (per-conflict mechanism status)

## Tasks
- [ ] Pillar page: what transitional justice covers (reparations, truth commissions, damage registers, institutional reform), distinguished explicitly from criminal accountability (war-crimes hub) and physical rebuild (reconstruction hub)
- [ ] Per-conflict page: active mechanisms (e.g. Register of Damage for Ukraine / Council of Europe Enlarged Partial Agreement, any truth-commission processes), claims-process status, funding sources
- [ ] Data model: `TransitionalJusticeMechanismSeed` (conflictSlug, mechanismType: reparations-fund/truth-commission/damage-register/institutional-reform, status, fundingSourceUrls[], sourceUrls[]) in `apps/web/src/lib/hubs/transitional-justice.ts`
- [ ] Cross-link to `topical_hubs/TODO_hub_war_crimes.md`, `topical_hubs/TODO_hub_reconstruction.md`, and `topical_hubs/TODO_hub_international_aid.md`
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Clean data-sourcing path: Register of Damage for Ukraine, Council of Europe mechanisms, World Bank RDNA-adjacent reporting — no novel sourcing problem, unlike some other gated/cautious hubs in this analysis.

## i18n
- EN + UK; strong NGO/government persona relevance (`audiences/TODO_ngos_humanitarian.md`, `audiences/TODO_governments_defense.md`).
