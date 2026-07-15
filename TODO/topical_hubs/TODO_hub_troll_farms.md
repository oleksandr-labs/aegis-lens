# Hub — Troll Farms & Coordinated Inauthentic Behavior (Actor-Tracking)

## Goal
Track named influence-operation organizations (IRA-successor networks, Social Design Agency, Rybar-style networks) as persistent tracked actors with their own dossier — distinct from `topical_hubs/TODO_hub_disinformation.md` and `services/misinfo/src/coordinated-behavior.ts`, both of which are claim/behavior-centric (detecting coordination *signals* on a given claim), never organization-centric. Cheapest of round 6's gaps — reuses the existing `entities-seed.ts` `kind: "organization"` template rather than building new entity infrastructure.

## Progress
- 0 / 5 done

## URLs
- `/troll-farms` (pillar, index of tracked organizations) · `/troll-farms/<org-slug>` (per-organization dossier, e.g. `/troll-farms/social-design-agency`)

## Tasks
- [ ] Pillar page: what CIB actor-tracking covers, methodology (attribution confidence tiers — reuse `ATTRIBUTION_METHODOLOGY` pattern from `topical_hubs/TODO_hub_cyber_warfare.md`), distinction from per-claim fact-checking
- [ ] Per-organization dossier page: known aliases/fronts, documented campaigns, platforms used, sanctions status (cross-link `topical_hubs/TODO_hub_sanctions.md`), attribution sourcing (Meta/X/Google threat-intel takedown reports, DFRLab, EU DisinfoLab)
- [ ] Data model: extend `entities-seed.ts` `organization` kind with CIB-specific fields (`frontNames[]`, `platformsActive[]`, `attributionConfidence`) in `apps/web/src/lib/hubs/troll-farms.ts` — do not duplicate the entity template
- [ ] Cross-link every documented campaign to relevant `/fact-check/<slug>` entries (round 3) where a specific false claim is traceable to the tracked org
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Reuses existing entity infrastructure — lowest-effort net-new hub of round 6's findings.

## i18n
- EN + UK.
