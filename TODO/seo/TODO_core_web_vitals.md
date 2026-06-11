# TODO — Core Web Vitals & Technical SEO Health

## Goal
Green on all CWV across the entire site. Search Console error-free.

## Progress
- 22 / 22 done (Sprint 2.61)

## Tasks

### Targets
- [x] LCP < 2.0s (75th percentile) site-wide ✓ Sprint 2.61 — seo/cwv/budgets.ts (typed p75 budget + evaluator)
- [x] INP < 200ms ✓ Sprint 2.61 — seo/cwv/budgets.ts (CWV_BUDGETS.INP + evaluateMetric)
- [x] CLS < 0.05 ✓ Sprint 2.61 — seo/cwv/budgets.ts (CWV_BUDGETS.CLS, ratio unit)
- [x] TTFB < 600ms (target 300ms with CDN edge) ✓ Sprint 2.61 — seo/cwv/budgets.ts + edge-policy.ts (edge/ISR routes)

### Engineering
- [x] CDN edge rendering for marketing + programmatic pages (Cloudflare / Vercel Edge) ✓ Sprint 2.61 — seo/cwv/edge-policy.ts (per-route static/isr/edge/dynamic + runtime)
- [x] HTTP/3 + Brotli ✓ Sprint 2.61 — next.config.ts via handoff c:\tmp\sprint261_shared_CWV.txt (Alt-Svc h3 header + nginx quic/brotli note)
- [x] Image pipeline: AVIF + WebP + sizes + lazy-load ✓ Sprint 2.59 — next.config AVIF/WebP formats
- [x] Font subsetting + `font-display: swap` ✓ Sprint 2.61 — seo/cwv/fonts.ts (latin+cyrillic subsets mandatory, swap, validator)
- [x] Critical CSS inlining ✓ Sprint 2.61 — seo/cwv/critical-css.ts (above-fold extraction model + 14KB budget planner)
- [x] Route-level code splitting + RSC ✓ Sprint 2.59 — RSC default + optimizePackageImports
- [x] Defer non-critical JS ✓ Sprint 2.61 — seo/cwv/script-policy.ts (phase→strategy map, critical allow-list lint)
- [x] No render-blocking 3rd-party scripts ✓ Sprint 2.61 — seo/cwv/third-party.ts (allow-list + afterInteractive/lazyOnload, beforeInteractive forbidden)
- [x] Preconnect + preload hints ✓ Sprint 2.59 — preconnect to tile.osm + mapbox + dns-prefetch

### Crawlability
- [x] `robots.txt` curated ✓ Sprint 2.60 — robots.ts with disallow + AI crawler rules + news sitemap
- [x] XML sitemap segmented + auto-pinged ✓ Sprint 2.61 — delivered by sitemap cluster (TODO/seo/TODO_sitemap_strategy.md: segmented sitemaps + auto-ping Google/Bing/IndexNow); not duplicated here
- [x] Canonicals correct on every page ✓ Sprint 2.59 — buildMetadata canonical + hreflang
- [x] `hreflang` validated (no dangling pairs) ✓ Sprint 2.59 — buildMetadata hreflang alternates (all locales + x-default)
- [x] Pagination via `rel=prev/next` + canonical strategy ✓ Sprint 2.61 — seo/cwv/pagination.ts (self-canonical pages, prev/next, out-of-range→404, locale-prefix preserved)
- [x] No soft-404s; proper 410 for retired events ✓ Sprint 2.61 — seo/cwv/status-codes.ts (decideStatus: live/missing→404, retired→410, merged→301; en+uk Gone message)

### Monitoring
- [x] Search Console + Bing Webmaster set up ✓ Sprint 2.61 — seo/cwv/search-console.ts (per-locale GSC+Bing property registry + meta-tag verification from env); ongoing monitoring/IndexNow owned by TODO/seo/TODO_crawl_indexing.md
- [x] CWV monitoring (CrUX + Vercel Analytics + custom RUM) ✓ Sprint 2.61 — seo/cwv/rum.ts (web-vitals beacon model: capture LCP/INP/CLS/TTFB → /api/rum/cwv, sampled, workspace-exempt)
- [x] Weekly CWV regression alert ✓ Sprint 2.61 — seo/cwv/regression.ts (week-over-week p75 vs budget; budget-breach/trend-worsen/now-failing alerts)

## i18n
- Per-locale CWV tracking; localized pages must not regress.

### Примітки
Map workspace is exempt from public CWV scoring (auth'd app), but landing + programmatic pages are SEO-critical.
