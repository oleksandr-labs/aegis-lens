# Hub — Press Freedom & Journalist Safety Tracker

## Goal
Track journalists killed/detained/harassed while covering tracked conflicts (cf. CPJ/RSF/IFJ trackers) — distinct from `pages/TODO_press.md`/`audiences/TODO_journalists.md`, which treat journalists purely as a customer persona (press kit, verified-press tier), not as a tracked-incident subject.

## Progress
- 0 / 5 done

## URLs
- `/press-freedom` (pillar, cross-conflict tally) · `/press-freedom/<conflict-slug>` (per-conflict incident list)

## Tasks
- [ ] Pillar page: cumulative tally (killed/detained/injured) by conflict, methodology note citing CPJ/RSF/IFJ as primary sources
- [ ] Per-conflict incident list: date, journalist name (with outlet, where publicly confirmed), incident type, verification status, source citation
- [ ] Data model: `PressFreedomIncidentSeed` (conflictSlug, date, journalistName?, outlet?, incidentType: killed/detained/injured/harassed, sourceUrls[]) in `apps/web/src/lib/hubs/press-freedom.ts`
- [ ] Cross-link to `topical_hubs/TODO_hub_war_crimes.md` where an incident overlaps with a documented case, and to `audiences/TODO_journalists.md` (safety-resources CTA)
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Only publish names/details already confirmed public by CPJ/RSF/IFJ or the outlet itself — never independently identify unconfirmed cases (same sourcing discipline as `topical_hubs/TODO_hub_pow_exchange.md`).
- Strong backlink/citation surface for journalism-safety orgs and press-freedom researchers.

## i18n
- EN + UK.
