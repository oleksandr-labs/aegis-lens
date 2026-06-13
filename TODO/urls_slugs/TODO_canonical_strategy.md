# TODO — Canonical URL Strategy

## Goal
One canonical per piece of content. Search sees one signal, not many.

## Progress
- 11 / 12 done (Sprint 2.72 — pagination, facet, tracking params, trailing slash, https, non-www, similarity threshold, CI fixture)

## Rules
- [x] Self-referential canonical on every indexable page ✓ Sprint 0 (buildMetadata)
- [x] Locale variants: use `hreflang`, NOT cross-locale canonical ✓ Sprint 0
- [x] Pagination: canonical to first page (or full canonical to current if independent value) — packages/url-builder/src/canonical.ts (`canonicalForPagination`)
- [x] Sort / filter / facet variants: canonical to base URL; `noindex` on facet combos — packages/url-builder/src/canonical.ts (`canonicalForFacet`)
- [x] Tracking parameters (`utm_*`, `gclid`, `fbclid`): canonical strips them — packages/url-builder/src/canonical.ts (`stripTrackingParams`)
- [x] AMP / m. variants: not used (no separate mobile URL) — no action needed
- [x] WWW vs non-WWW: pick one (recommended: non-WWW) + 301 the other — packages/url-builder/src/canonical.ts (`enforceNonWww`)
- [x] HTTPS only; HTTP → HTTPS 301 — packages/url-builder/src/canonical.ts (`enforceHttps`)
- [x] Trailing-slash: match decision in URL-strategy — packages/url-builder/src/canonical.ts (`enforceNoTrailingSlash`)
- [x] Duplicate-content guard for programmatic pages: cross-page similarity threshold → `noindex` if low-uniqueness — packages/url-builder/src/canonical.ts (`similarityThreshold`)

## Tasks
- [x] CI test: every indexable route emits valid canonical — packages/url-builder/src/canonical.ts (`BuildCanonicalCI`)
- [ ] Logs analysis: pages that have canonical mismatch flagged

## i18n
- hreflang ↔ canonical interaction documented per route.

### Примітки
Canonical bugs are silent. Test them in CI.
