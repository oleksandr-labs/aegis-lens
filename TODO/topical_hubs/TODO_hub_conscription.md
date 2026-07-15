# Hub — Forced Conscription & Mobilization Tracker

## Goal
Track mobilization/conscription policy changes, call-up waves, and exemption-rule updates across tracked conflicts — sustained high public search volume (draft-age civilians, families abroad) with zero existing scaffolding in the repo.

## Progress
- 0 / 5 done

## URLs
- `/conscription` (pillar, cross-conflict) · `/conscription/<conflict-slug>` (per-conflict rules/status, e.g. `/conscription/ua-ru`)

## Tasks
- [ ] Pillar page: what conscription/mobilization means, why it's tracked here (factual/legal-status reference, not draft-evasion facilitation — explicit editorial framing)
- [ ] Per-conflict page: current mobilization wave status, official exemption categories (age/health/occupation/dependents), documented policy changes with dates, official sources only (Ministry of Defense/government gazette — never rumor/social-media claims)
- [ ] Data model: `MobilizationEventSeed` (conflictSlug, date, changeType: wave/exemption-update/policy-change, summaryEN/UK, sourceUrl) in `apps/web/src/lib/hubs/conscription.ts`
- [ ] Editorial framing note (mirrors `war_crimes` hub pattern): factual/legal-reference tone only, explicit disclaimer that this is not legal advice, link to official government resources for individual cases
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Requires careful framing to avoid being read as facilitating draft evasion — route through the same editorial-policy review as `content/TODO_pillar_ihl.md` before publish. Strictly official-source-only, no crowdsourced "have you been called up" content.

## i18n
- EN + UK; UK translation is the primary audience need here (families of draft-age men, both in-country and abroad).
