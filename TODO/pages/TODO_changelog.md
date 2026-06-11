# TODO — Changelog

## Goal
Public, regularly updated changelog. Trust signal + SEO + retention nudge.

## Progress
- 8 / 9 done (Sprint 2.58)

## Tasks
- [x] `/changelog` page (also RSS + Atom) ✓ Sprint 1.9
- [x] Per-release entry: title, date, categories (Added / Changed / Fixed / Deprecated / Security) ✓ Sprint 2.41
- [x] Tag entries by area (map, AI, sources, API, billing) ✓ Sprint 2.47 — `areas: Area[]` field on Entry; 8 area tags (map/AI/sources/API/billing/platform/docs/legal); rendered as colored chips per entry; all ENTRIES populated
- [x] Author byline per entry ✓ Sprint 2.47 — `author: string` field on Entry; rendered alongside area tags
- [x] Linkable section anchors ✓ Sprint 2.41 — `#sprint-2-41` anchors with jump-to nav
- [x] In-app "what's new" panel pulling from changelog ✓ Sprint 2.58 — WhatsNewPanel + WhatsNewTrigger (✦ in header)
- [ ] Email digest (monthly) to engaged users
- [x] Schema.org `Article` per entry ✓ Sprint 2.41 — `hasPart` array on Article JSON-LD
- [x] Search Console submission (sitemap entry) ✓ Sprint 2.47 — `/changelog` already in sitemap.ts via `urls.changelog(lc)` at priority 0.4

## i18n
- EN + UK; future locales as needed.

### Примітки
A weekly cadence beats sporadic mega-posts. Even small ships count.
