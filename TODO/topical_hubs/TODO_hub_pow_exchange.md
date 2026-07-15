# Hub — POW Exchange Tracker

## Goal
Track prisoner-of-war exchanges (dates, counts, mediators) — high public-interest, high-search-volume, near-real-time-update surface.

## Progress
- 0 / 5 done

## URLs
- `/pow-exchanges` (pillar + running total) · `/pow-exchanges/<exchange-date-slug>` (per-exchange detail)

## Tasks
- [ ] Pillar page: running counter (total exchanged since 2022, per side), timeline of exchanges
- [ ] Per-exchange detail page: date, numbers per side, mediator (e.g. UAE, Vatican, Saudi Arabia), sourcing (official statements only — no unverified numbers)
- [ ] Data model: `PowExchangeSeed` (date, countUA, countRU, mediator, sourceUrls[], notes) in `apps/web/src/lib/hubs/`
- [ ] Cross-link to `conflicts/TODO_conflict_ua_ru.md` timeline and relevant `/entities/` (mediating orgs)
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Strict sourcing rule: only official Coordination Headquarters (UA) / MoD (RU) / mediator statements — never unconfirmed family/social reports (reuse `TODO/data/TODO_retraction.md` correction workflow if a figure is revised).

## i18n
- EN + UK from day one — this is a page Ukrainian families will search directly.
