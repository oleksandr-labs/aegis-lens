# Hub — International Aid Tracker

## Goal
Track military + financial + humanitarian aid commitments to Ukraine by donor country/institution — a well-known high-traffic content category (cf. Kiel Institute Ukraine Support Tracker) that is currently absent from the platform.

## Progress
- 0 / 6 done

## URLs
- `/aid-tracker` (pillar, global totals) · `/aid-tracker/<country-slug>` (per-donor breakdown) · `/aid-tracker/<category>` (military / financial / humanitarian)

## Tasks
- [ ] Pillar page: cumulative totals by category, top-10 donor chart, methodology note (data lag disclosure)
- [ ] Per-donor-country page: committed vs delivered, aid type breakdown, timeline
- [ ] Per-category breakdown page (military hardware / budget support / humanitarian)
- [ ] Data model: `AidCommitmentSeed` (donor, category, amountUSD, committedDate, deliveredDate?, sourceUrl) in `apps/web/src/lib/hubs/aid-tracker.ts`
- [ ] Cross-link to `region_playbooks/` (per-country pages already track posture — link aid figures there) and `verticals/TODO_vertical_finance.md`
- [ ] FAQPage JSON-LD (10 Q&A) + `Dataset` schema (this is a citable open dataset — see `seo/TODO_open_data_seo.md`)

## Notes
- Source candidates: Kiel Institute, Ukraine Support Tracker, US DoD fact sheets, EU Council press releases — cite explicitly, do not aggregate unsourced totals.
- Natural cross-sell into `monetization/TODO_data_licensing.md` (researchers/journalists cite this dataset).

## i18n
- EN + UK; secondary DE/PL relevance given largest donor bases (see `region_playbooks/TODO_de.md`, `TODO_pl.md`).
