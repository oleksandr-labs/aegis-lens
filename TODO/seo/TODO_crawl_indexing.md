# TODO — Crawl Optimization & Indexing Strategy

## Goal
Spend Google's crawl budget on pages that earn it. Get good pages indexed fast.

## Progress
- 12 / 12 done

## Tasks
- [x] Log analysis pipeline (CDN logs → Crawl-budget dashboard) — apps/web/src/lib/seo/crawl-budget.ts (RawCrawlLogLine/CrawlHit model + aggregateCrawlBudget + buildCrawlDashboard)
- [x] Top-crawled / low-value pages identified → `noindex` or block — apps/web/src/lib/seo/crawl-budget.ts `flagLowValue()` (noindex vs block recommendation)
- [x] Internal-link surface from high-PageRank pages to deep programmatic — apps/web/src/lib/seo/crawl-surface.ts `recommendLinkSurface()`
- [x] Pagination via `rel=next/prev` + canonical (or load-more + canonical to first) — apps/web/src/lib/seo/pagination.ts (buildPaginationLinks, self/first canonical strategies)
- [x] Faceted nav blocked from crawling beyond canonical facets — apps/web/src/lib/seo/facet-crawl-policy.ts (decideFacet + facetDisallowPatterns); robots Disallow proposed in c:\tmp\sprint261_shared_CRAWL.txt [2]
- [x] Sitemaps segmented per template (pages, posts, reports, events, listings, programmatic) — apps/web/src/lib/seo/sitemap-segments.ts (PROPOSED_SEGMENTS posts/reports/listings + ALL_SEGMENTS); sitemap-index + robots wiring proposed in c:\tmp\sprint261_shared_CRAWL.txt [3][4][5]
- [x] News sitemap (last 48h) — apps/web/src/lib/seo/news-sitemap.ts (renderNewsSitemap + newsWindow 48h filter); route rewire proposed in c:\tmp\sprint261_shared_CRAWL.txt [6]
- [x] Auto-ping sitemaps on publish — apps/web/src/lib/seo/sitemap-ping.ts (onPublish + pingSitemaps, fail-soft); wiring in c:\tmp\sprint261_shared_CRAWL.txt [7]
- [x] IndexNow submissions (Bing + Yandex) — apps/web/src/lib/seo/indexnow.ts (submitIndexNow + key file helpers, INDEXNOW_KEY env)
- [x] Search Console + Bing Webmaster monitoring — apps/web/src/lib/seo/search-console.ts (WebmasterClient contract + evaluateAlerts)
- [x] Per-locale Search Console properties — apps/web/src/lib/seo/search-console.ts `buildPropertyRegistry()` (per-locale path-prefix properties, google+bing)
- [x] Crawl-stat regression alerts — apps/web/src/lib/seo/crawl-budget.ts `detectRegression()`

## i18n
- hreflang validated in CI; no dangling pairs.

### Примітки
Without crawl optimization, programmatic SEO buries itself. Treat as a P0 product feature.
