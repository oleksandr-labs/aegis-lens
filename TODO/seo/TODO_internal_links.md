# TODO — Internal Linking

## Goal
Strong topical clustering: region pages ↔ events ↔ reports ↔ blog ↔ docs.

## Progress
- 8 / 8 done

## Tasks
- [x] Sitemap-driven link graph — apps/web/src/lib/seo/link-graph-from-sitemap.ts (buildLinkGraph/findOrphans/bfsDepth/topHubs; loose-coupled GraphRoute, no sitemap.ts import)
- [x] Auto-link entities (regions, conflicts, equipment) in post bodies — apps/web/src/lib/seo/auto-link-entities.ts (gazetteer-driven linkifyParagraph/linkifyBody, locale-correct hrefs, max links/para, one target/para)
- [x] Related-events block on every event page (vector-similarity based) — apps/web/src/lib/seo/related-events.ts (eventVector + cosine + time/geo decay, rankRelatedEvents)
- [x] Related-posts block on blog posts — apps/web/src/lib/seo/related-posts.ts (postVector cosine over tags/title/category, rankRelatedPosts with same-category backfill)
- [x] Breadcrumbs everywhere ✓ Sprint 0
- [x] Regional hub pages (e.g. `/regions/donetsk`) aggregating events + reports + posts ✓ Sprint 1.5
- [x] Topic hub pages ("Drones", "Maritime", "Cyber") ✓ Sprint 1.8
- [x] Anchor-text variety lint in CMS — apps/web/src/lib/seo/anchor-lint.ts (lintCmsAnchors + varietyScore; wraps shared anchor-rules.ts)

## i18n
- Internal links must preserve locale prefix.

### Примітки
Avoid orphan pages — every post must be reachable in ≤ 3 clicks from `/`.
