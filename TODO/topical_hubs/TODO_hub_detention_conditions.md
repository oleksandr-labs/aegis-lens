# Hub — Prisoner Treatment & Detention Conditions Monitoring

## Goal
Track ongoing detention-conditions / treaty-compliance monitoring (ICRC access, treatment reports, Geneva Convention compliance) — distinct from `topical_hubs/TODO_hub_pow_exchange.md`, which is explicitly scoped to exchange logistics only (dates/counts/mediators), not ongoing conditions.

## Progress
- 0 / 5 done

## URLs
- `/detention-conditions` (pillar, cross-conflict) · `/detention-conditions/<conflict-slug>` (per-conflict monitoring status)

## Tasks
- [ ] Pillar page: what detention-conditions monitoring covers, legal framework (Third Geneva Convention), why this is separate from the exchange tracker
- [ ] Per-conflict page: ICRC/UN mandate-holder access status, documented treatment-compliance reports (aggregate/summary level only), notable compliance concerns raised by named international bodies
- [ ] Data model: `DetentionMonitoringSeed` (conflictSlug, reportDate, monitoringBody, accessStatus, summaryEN/UK, sourceUrls[]) in `apps/web/src/lib/hubs/detention-conditions.ts`
- [ ] **Sourcing caution (same rigor tier as the CRSV gate, though not fully blocked):** ICRC/UN mandate-holder statements and official government responses only — never individual unconfirmed detainee accounts, never graphic content, aggregate/summary framing only. Route through the same editorial-safeguards review as `topical_hubs/TODO_hub_war_crimes.md` before publish; flag to Ethics Board for a lighter-touch review (not a full gate like CRSV, but not ungated either).
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Cross-link to `topical_hubs/TODO_hub_pow_exchange.md` (exchange logistics) and `topical_hubs/TODO_hub_war_crimes.md` (where conditions violations rise to prosecutable cases).

## i18n
- EN + UK; high relevance to Ukrainian families of detained persons.
