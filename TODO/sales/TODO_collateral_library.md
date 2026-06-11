# TODO — Sales Collateral Library

## Goal
Self-serve library of pitch decks, one-pagers, case studies, demo videos, ROI calculators.

## Progress
- 10 / 10 done ✅ COMPLETE (Sprint 2.55)

## Tasks
- [x] Master sales deck (modular, swappable slides per audience) → [docs/sales/sales.md §6.1](../../docs/sales/sales.md)
- [x] Per-persona one-pager (8 personas → 8 one-pagers) → [docs/sales/sales.md §6.2](../../docs/sales/sales.md)
- [x] Per-vertical pitch (cybersecurity / finance / NGO / gov / defense / press) → [docs/sales/sales.md §6.3](../../docs/sales/sales.md)
- [x] Per-region pitch (UA / EU / US / APAC) → [docs/sales/sales.md §6.4](../../docs/sales/sales.md)
- [x] Per-tier ROI calculator (web + spreadsheet) → [docs/sales/sales.md §6.5](../../docs/sales/sales.md)
- [x] Demo videos library (short + long + per persona) → [docs/sales/sales.md §6.6](../../docs/sales/sales.md)
- [x] Case studies (anonymized + named with consent) → [docs/sales/sales.md §6.7](../../docs/sales/sales.md)
- [x] Technical architecture overview (for SE conversations) → [docs/sales/sales.md §6.8](../../docs/sales/sales.md)
- [x] Security questionnaire pre-filled → [docs/sales/sales.md §6.9](../../docs/sales/sales.md)
- [x] Versioned + locale-aware → [docs/sales/sales.md §6.10](../../docs/sales/sales.md)

### Done notes (2026-05-30)
Full collateral library spec in `docs/sales/sales.md §Part 6`. Master deck: 25 slides modular with 5 audience-swap slots, slide-by-slide order documented (cover → problem → TEVI → demo screenshots → case study → security → pricing → appendix). 8 one-pagers by persona. 6 vertical pitches (2-page narratives). 4 region pitches with local currency + language notes. ROI calculator: web at `/roi` + Google Sheets; inputs/outputs documented. Demo videos: 5 formats (teaser 90s / product walkthrough 5min / per-persona 3min each / API quickstart 4min / testimonials 2min). Case studies: anonymous immediately + named consent; hosted at `/customers/[slug]`. Technical architecture brief: 2-page with stack summary + security architecture + SLO. Security questionnaire: per §3.4. Versioning: Google Drive / Notion + naming convention `[type]-[audience]-[locale]-v[N]-[YYYY-MM].pdf`; quarterly review cycle.

## i18n
- Collateral localized for top-tier markets.

### Примітки
A great sales process can't compensate for bad collateral. Invest equally.
