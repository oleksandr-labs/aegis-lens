# TODO — Sitemap Strategy

## Progress
- 11 / 11 done

## Tasks
- [x] Segmented sitemaps per template type (Phase 2 — when volume justifies) ✓ Sprint 2.61 — `apps/web/src/lib/seo/sitemap-segments.ts` (typed per-template SITEMAP_SEGMENTS + PROPOSED_SEGMENTS registry, changefreq/priority/localized per family)
- [x] `sitemap-index.xml` orchestrator (Phase 2) ✓ Sprint 2.61 — `apps/web/src/lib/seo/sitemap-index.ts` (buildSitemapIndexXml from segment registry, auto-pages oversized segments); wire-up proposed in `c:\tmp\sprint261_shared_SITEMAP.txt`
- [x] Per-segment max 50k URLs, max 50MB (Google limit) ✓ Sprint 2.61 — `apps/web/src/lib/seo/sitemap-limits.ts` (MAX_URLS_PER_SITEMAP/MAX_BYTES_PER_SITEMAP, checkSitemapLimits, paginateRoutes, utf8ByteLength)
- [x] News sitemap (`<news:news>`, last 48h) ✓ Sprint 2.61 — `apps/web/src/lib/seo/news-sitemap-xml.ts` (buildNewsSitemapXml + filterRecent 48h window, 1000-URL cap; named -xml to avoid crawl-cluster collision)
- [x] Image sitemap ✓ Sprint 2.61 — `apps/web/src/lib/seo/image-sitemap.ts` (buildImageSitemapXml from event media, non-retracted images only)
- [x] Video sitemap ✓ Sprint 2.61 — `apps/web/src/lib/seo/video-sitemap.ts` (renderVideoSitemapXml + videoSeedToEntries, required+optional video: fields)
- [x] Per-locale alternate-language entries in sitemap ✓ Sprint 0
- [x] Auto-ping Google + Bing + IndexNow on publish ✓ Sprint 2.61 — `apps/web/src/lib/seo/sitemap-ping-hook.ts` (pingSearchEngines, injectable fetch, fail-soft per-target results; named -hook to avoid crawl-cluster collision)
- [x] `lastmod` accurate ✓ Sprint 0
- [x] Single `app/sitemap.ts` with all routes ✓ Sprint 0
- [x] CI test: sitemap parsability ✓ Sprint 2.61 — `apps/web/src/lib/seo/sitemap.test.ts` (vitest; well-formedness + limits + escaping + ping(injected fetch) + archive-summary; pure, no network)
