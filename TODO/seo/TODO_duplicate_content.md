# TODO — Duplicate Content Prevention

## Goal
At programmatic scale, near-duplicate pages are the biggest risk. Engineer them out.

## Progress
- 10 / 10 done

## Tasks
- [x] Per-template uniqueness threshold (cosine similarity vs siblings) — apps/web/src/lib/seo/dedup/uniqueness.ts (hashing-trick embedder + cosine; TEMPLATE_SIMILARITY_CEILING per template; findNearDuplicates). Tested in uniqueness.test.ts.
- [x] Per-page unique data requirement (no "thin variants") — apps/web/src/lib/seo/dedup/thin-guard.ts (min unique-fields + min-words rule per template; evaluateThinContent/isThin).
- [x] Auto-`noindex` for pages below threshold — apps/web/src/lib/seo/dedup/noindex-policy.ts (resolveRobots composes thin + uniqueness → noindex,follow). Metadata-builder wiring proposed in c:\tmp\sprint261_shared_DUPLICATE.txt (CHANGE 2).
- [x] Canonical tags per template — apps/web/src/lib/seo/dedup/canonical-rules.ts (resolveCanonicalPath per CanonicalTemplate). Builder wiring proposed in c:\tmp\sprint261_shared_DUPLICATE.txt (CHANGE 1, edits apps/web/src/lib/seo.ts).
- [x] Filter / sort URL variants point to base canonical — apps/web/src/lib/seo/dedup/param-canonical.ts (strips TRACKING_PARAMS + FILTER_SORT_PARAMS, keeps identity params; toCanonicalPath).
- [x] Locale variants use `hreflang`, not `canonical` — apps/web/src/lib/seo/dedup/locale-policy.ts (checkLocaleCanonical / assertHreflangNotCanonical: canonical always self-referential per locale, never cross-locale). Test: uniqueness.test.ts "locale-policy" suite incl. cross-locale-canonical throw.
- [x] Pagination canonical strategy — apps/web/src/lib/seo/dedup/pagination-canonical.ts (page>=2 self-canonical, page<=1 collapses to base; no canonical-to-page-1).
- [x] Search-results pages `noindex` — apps/web/src/lib/seo/dedup/noindex-policy.ts (NOINDEX_ROUTE_PREFIXES incl. /search, /help search; /help/<slug> articles excepted). Builder wiring in handoff CHANGE 2.
- [x] Faceted-search guardrails (don't index every combination) — apps/web/src/lib/seo/dedup/facet-index-policy.ts (INDEXABLE_FACET_SHAPES allow-list; single + curated 2-way only, 3+ way rejected).
- [x] Periodic duplicate-content audit (Screaming Frog / Sitebulb) — apps/web/src/lib/seo/dedup/audit.ts (crawl-the-sitemap dupe report model: computeAuditReport + runDuplicateContentAudit, pluggable Crawler boundary).

## i18n
- Hreflang prevents EN ↔ UK from looking like duplicates.

### Примітки
Google's spam updates target programmatic dupe sites. We won't be one.
