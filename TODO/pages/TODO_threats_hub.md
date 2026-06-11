# TODO — Threats Hub

## Goal
`/threats` index linking out to threat pages (programmatic). Civilian + analyst surface.

## Progress
- 7 / 8 done

## Tasks
- [x] `/threats` index ✓ Sprint 2.x (existed, marked) — full index page with `listThreats()`, category grouping, SEO metadata
- [x] Categorized threats (kinetic, cyber, infrastructure, environmental, info-ops) ✓ Sprint 2.x — 6 categories: kinetic/infrastructure/cyber/maritime/aviation/humanitarian; grouped by `CATEGORY_LABEL`
- [x] Per-threat short description card → full page ✓ Sprint 2.x — each card links to `/threats/<slug>`; detail page has profile, civilian guidance, operator guidance, events, related equipment, related threats
- [x] Region filter ✓ Sprint 2.49 — URL-driven `?region=` chip filter from unique `affectedRegions` values; `?category=` filter chips; both preserve each other's state; shows "N / total threats" when active; no-match empty state
- [x] Severity index ✓ Sprint 2.51 — `currentSeverity?: 1|2|3|4|5` field added to `ThreatSeed` type; all 8 threats seeded (2× Critical/5, 2× High/4, 3× Moderate/3, 1× Low/2); 5-col severity summary strip at top of threats index (count per level, color-coded); severity badge on each threat card
- [x] Schema.org `CollectionPage` ✓ Sprint 2.x — `CollectionPage` + `ItemList` JSON-LD on index
- [x] Cross-link to civilian-alerts layer ✓ Sprint 2.49 — cross-link block at bottom: Conflicts, Regions, Glossary, Scoring methodology
- [ ] Civilian-mode UI variant (plain language)

## i18n
- Threat names + descriptions localized.

### Примітки
Threats hub is the entry point for "is X dangerous?" intent. Plain language wins here.
