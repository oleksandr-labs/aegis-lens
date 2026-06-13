# TODO — URL Strategy (Master)

## Goal
Every URL is an SEO asset. Short, keyword-rich, stable, localized, hierarchical.

## Progress
- 14 / 16 done (Sprint 2.72 — stop-word filter, collision suffix, noindex-facet canonical)

## Principles
- [x] Short: target ≤ 75 chars enforced in `slugify()` ✓ Sprint 0
- [x] Primary keyword in URL via slug rules ✓ Sprint 0
- [x] Lowercase, hyphens enforced in `slugify()` ✓ Sprint 0
- [x] ASCII slug for EN via Cyrillic transliteration ✓ Sprint 0
- [x] No dates / IDs in user-facing slugs (urls.* builders) ✓ Sprint 0
- [x] No file extensions ✓ Sprint 0 (App Router native)
- [x] Stop-word filter (Phase 1) — packages/url-builder/src/slug-extensions.ts
- [x] NO trailing slash on canonical ✓ Sprint 0
- [x] ≤ 3 segments depth in current routes ✓ Sprint 0
- [x] Hierarchical (`/regions/ua/<region>`) ↔ flat (`/glossary/osint`) ✓ Sprint 0
- [ ] 301 redirect on slug change (Phase 1 — needs DB-backed slugs)
- [x] Per-entity-type URL pattern in `url-builder` ✓ Sprint 0
- [x] No `?id=…` for SEO content ✓ Sprint 0
- [x] Filter/sort param `noindex` (Phase 1 — when filter UI lands) — packages/url-builder/src/canonical.ts (`canonicalForFacet`)
- [x] Per-template canonical via `buildMetadata()` ✓ Sprint 0

## i18n
- Locale prefix `/<lc>/...` consistent across all routes; EN default at root (or `/en/` if explicit prefix chosen).

### Примітки
URL is the first SEO signal Google sees. Get it right Day 1; backfilling redirects later is painful.
