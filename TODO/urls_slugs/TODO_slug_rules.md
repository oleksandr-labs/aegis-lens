# TODO — Per-Entity Slug Rules

## Goal
Deterministic, collision-free, SEO-friendly slug generation per entity type.

## Progress
- 16 / 25 done (Sprint 2.2 — slug patterns shipped via @aegis/url-builder)

## Per-entity slug patterns

### Geographic
- [x] Region: `/regions/<country-iso>/<region-slug>` (e.g. `/regions/ua/kharkiv-oblast`) ✓ Sprint 1.5
- [x] City: `/regions/<country-iso>/<region>/<city-slug>` or `/city/<city-slug>` ✓ Sprint 1.7
- [x] Country: `/country/<iso-or-name-slug>` ✓ Sprint 1.5 (via /regions/<iso>)

### Conflict / threat / topic
- [x] Conflict: `/conflicts/<conflict-slug>` (e.g. `russia-ukraine`, `yemen-red-sea`) ✓ Sprint 0
- [ ] Threat: `/threats/<threat-slug>` (e.g. `shahed-strikes`, `grid-attacks`)
- [x] Topic: `/topics/<topic-slug>` ✓ Sprint 1.8
- [ ] Trend: `/trends/<trend-slug>` (no year in slug; year via canonical)

### Entity (KG)
- [x] Equipment: `/equipment/<model-slug>` (e.g. `shahed-136`, `bayraktar-tb2`) ✓ Sprint 0
- [ ] Unit: `/units/<unit-slug>` (public OOB only)
- [ ] Person: `/experts/<person-slug>` (no private individuals)

### Directory
- [x] Companies: `/companies/<slug>` + `/companies/<industry>/<city>` programmatic ✓ Sprint 1.1 (detail; programmatic Phase 1)
- [x] Tools: `/tools/<slug>` + `/tools/<category>/<use-case>` ✓ Sprint 1.1 (detail; programmatic Phase 1)
- [ ] Services: `/services/<slug>`

### Content
- [x] Blog post: `/blog/<slug>` (year omitted from URL) ✓ Sprint 0
- [ ] Guide: `/guides/<slug>`
- [x] Glossary: `/glossary/<term-slug>` ✓ Sprint 0
- [ ] Investigation: `/investigations/<slug>`
- [x] Report: `/reports/<slug>` ✓ Sprint 1.8

## Slug normalization
- [x] Transliterate Cyrillic → Latin for EN locale ✓ Sprint 0
- [x] Keep Cyrillic for UK locale (Unicode-safe, URL-encoded) ✓ Sprint 0
- [x] Replace non-alphanum with hyphen, collapse multiple hyphens ✓ Sprint 0
- [x] Strip leading/trailing hyphens ✓ Sprint 0
- [x] Lowercase ✓ Sprint 0
- [ ] Collision suffix: `-2`, `-3` rather than random hash

## i18n
- Translated slugs per locale; never mix locales in one path.

### Примітки
Slug generation is centralized in one module. No service generates slugs ad-hoc.
