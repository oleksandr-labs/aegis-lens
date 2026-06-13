# TODO — Per-Entity Slug Rules

## Goal
Deterministic, collision-free, SEO-friendly slug generation per entity type.

## Progress
- 25 / 25 done (Sprint 2.72 — all slug builders + collision suffix)

## Per-entity slug patterns

### Geographic
- [x] Region: `/regions/<country-iso>/<region-slug>` (e.g. `/regions/ua/kharkiv-oblast`) ✓ Sprint 1.5
- [x] City: `/regions/<country-iso>/<region>/<city-slug>` or `/city/<city-slug>` ✓ Sprint 1.7
- [x] Country: `/country/<iso-or-name-slug>` ✓ Sprint 1.5 (via /regions/<iso>)

### Conflict / threat / topic
- [x] Conflict: `/conflicts/<conflict-slug>` (e.g. `russia-ukraine`, `yemen-red-sea`) ✓ Sprint 0
- [x] Threat: `/threats/<threat-slug>` (e.g. `shahed-strikes`, `grid-attacks`) — packages/url-builder/src/slug-extensions.ts
- [x] Topic: `/topics/<topic-slug>` ✓ Sprint 1.8
- [x] Trend: `/trends/<trend-slug>` (no year in slug; year via canonical) — packages/url-builder/src/slug-extensions.ts

### Entity (KG)
- [x] Equipment: `/equipment/<model-slug>` (e.g. `shahed-136`, `bayraktar-tb2`) ✓ Sprint 0
- [x] Unit: `/units/<unit-slug>` (public OOB only) — packages/url-builder/src/slug-extensions.ts
- [x] Person: `/experts/<person-slug>` (no private individuals) — packages/url-builder/src/slug-extensions.ts

### Directory
- [x] Companies: `/companies/<slug>` + `/companies/<industry>/<city>` programmatic ✓ Sprint 1.1 (detail; programmatic Phase 1)
- [x] Tools: `/tools/<slug>` + `/tools/<category>/<use-case>` ✓ Sprint 1.1 (detail; programmatic Phase 1)
- [x] Services: `/services/<slug>` — packages/url-builder/src/slug-extensions.ts

### Content
- [x] Blog post: `/blog/<slug>` (year omitted from URL) ✓ Sprint 0
- [x] Guide: `/guides/<slug>` — packages/url-builder/src/slug-extensions.ts
- [x] Glossary: `/glossary/<term-slug>` ✓ Sprint 0
- [x] Investigation: `/investigations/<slug>` — packages/url-builder/src/slug-extensions.ts
- [x] Report: `/reports/<slug>` ✓ Sprint 1.8

## Slug normalization
- [x] Transliterate Cyrillic → Latin for EN locale ✓ Sprint 0
- [x] Keep Cyrillic for UK locale (Unicode-safe, URL-encoded) ✓ Sprint 0
- [x] Replace non-alphanum with hyphen, collapse multiple hyphens ✓ Sprint 0
- [x] Strip leading/trailing hyphens ✓ Sprint 0
- [x] Lowercase ✓ Sprint 0
- [x] Collision suffix: `-2`, `-3` rather than random hash — packages/url-builder/src/slug-extensions.ts

## i18n
- Translated slugs per locale; never mix locales in one path.

### Примітки
Slug generation is centralized in one module. No service generates slugs ad-hoc.
