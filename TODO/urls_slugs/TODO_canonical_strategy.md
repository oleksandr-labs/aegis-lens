# TODO — Canonical URL Strategy

## Goal
One canonical per piece of content. Search sees one signal, not many.

## Progress
- 2 / 12 done (Sprint 0 — canonical + hreflang)

## Rules
- [x] Self-referential canonical on every indexable page ✓ Sprint 0 (buildMetadata)
- [x] Locale variants: use `hreflang`, NOT cross-locale canonical ✓ Sprint 0
- [ ] Pagination: canonical to first page (or full canonical to current if independent value)
- [ ] Sort / filter / facet variants: canonical to base URL; `noindex` on facet combos
- [ ] Tracking parameters (`utm_*`, `gclid`, `fbclid`): canonical strips them
- [ ] AMP / m. variants: not used (no separate mobile URL)
- [ ] WWW vs non-WWW: pick one (recommended: non-WWW) + 301 the other
- [ ] HTTPS only; HTTP → HTTPS 301
- [ ] Trailing-slash: match decision in URL-strategy
- [ ] Duplicate-content guard for programmatic pages: cross-page similarity threshold → `noindex` if low-uniqueness

## Tasks
- [ ] CI test: every indexable route emits valid canonical
- [ ] Logs analysis: pages that have canonical mismatch flagged

## i18n
- hreflang ↔ canonical interaction documented per route.

### Примітки
Canonical bugs are silent. Test them in CI.
