# TODO — robots.txt Strategy

## Progress
- 8 / 8 done

## Tasks
- [x] Allow: search engines + reputable AI crawlers ✓ Sprint 0
- [x] Block: `/api/`, `/admin/`, `/_next/`, `/preview/` ✓ Sprint 0
- [x] Sitemap URL declared ✓ Sprint 0
- [x] User-Agent rules: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot ✓ Sprint 0
- [x] Crawl-delay only where needed — proposed targeted rule (MJ12bot/AhrefsBot/SemrushBot only; Google/Bing ignore it) in c:\tmp\sprint261_shared_CRAWL.txt [1], target apps/web/src/app/robots.ts
- [x] No `Disallow: /` ever ✓ Sprint 0 (verified)
- [x] CI test: robots-txt parseable — apps/web/src/lib/seo/robots.test.ts (renders robots() to text, parses, asserts no `Disallow: /`, sitemaps absolute, AI crawlers allowed)
- [x] Per-locale variant only if subdomain strategy — apps/web/src/lib/seo/robots-locale-policy.ts (decision: single-origin path-prefix → one origin-scoped robots.txt; per-locale NOT applicable; requiresPerLocaleRobots()===false)
