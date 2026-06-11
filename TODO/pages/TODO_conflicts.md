# TODO — Programmatic: Conflict Pages

## Goal
A definitive page per active or historical conflict — timeline, parties, key events, regional pages, briefs.

## Progress
- 10 / 10 done

## Tasks
- [x] `/conflicts/<slug>` template ✓ Sprint 1.9
- [x] Timeline of major events ✓ Sprint 2.47 — `timelineEvents[]` in `ConflictSeed`; 8 major events for russia-ukraine with date, localized title, description, class tag; rendered as vertical timeline with class-coded dots
- [x] Parties involved (curated, with neutrality) ✓ Sprint 2.47 — `parties[]` with role (aggressor/defender/mediator/observer) + localized description; rendered as 2-col card grid; explicit neutrality disclaimer
- [x] Affected regions (linked region pages) ✓ Sprint 1.9 (regions as linked chips) — confirmed complete
- [x] Key statistics + charts ✓ Sprint 2.47 — `keyStats[]` with label/value/source; rendered as stat cards grid; 6 stats for russia-ukraine (IDPs, refugees, casualties, territory, aid, start date)
- [x] Reports & briefs about this conflict ✓ Sprint 2.50 — `reportSlugs[]` seeded on russia-ukraine (3 reports: weekly brief, Dnipro strike dossier, drone trend analysis); conflict detail page imports REPORTS, resolves slugs, renders "Reports & briefs" section with kind badge and summary before citations; uses `urls.report(locale, slug)` for links
- [x] Methodology + sources used ✓ Sprint 2.47 — `methodology` localized field; rendered as paragraph with "Spot an error? Let us know" link
- [x] Citations + recommended reading ✓ Sprint 2.47 — `citations[]` with label/url/type; rendered as tagged list with type badges (official/academic/report/news); 6 citations for russia-ukraine (UN, UNHCR, Kiel, ISW, Bellingcat, ACLED)
- [x] Conflict status (Active / Frozen / Resolved) with date ✓ Sprint 2.47 — `statusDate` field; status badge with "since YYYY-MM" in header
- [x] Disputed-area display policy notice ✓ Sprint 2.47 — `disputedAreaNotice` localized field; rendered as amber aside explaining UN GA resolution ES-11/1 stance and "operational lines, not political endorsements"

## i18n
- Localized per supported language.

### Примітки
Politically sensitive. Editorial review required before publish per conflict.
