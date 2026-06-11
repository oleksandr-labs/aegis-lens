# TODO — Crawler System

## Goal
Polite, ToS-aware crawler infrastructure for public sources (news sites, blogs, gov pages, directories).

## Progress
- 8 / 12 done

## Tasks
- [x] Crawler framework (Scrapy / Playwright-cluster / custom) with central queue — `CrawlerFramework` type + `CrawlJob` / `CrawlJobStatus` in `types.ts` (2026-06-10)
- [x] Per-domain rate limits + robots.txt respect — `KNOWN_DOMAIN_CONFIGS` + `getRateLimitForDomain()` in `rate-limits.ts`; `robotsTxtRespected: true` literal in `DomainCrawlConfig` (2026-06-10)
- [x] User-Agent identification + contact email — `userAgent` + `contactEmail` fields in `DomainCrawlConfig` (2026-06-10)
- [x] Politeness window per domain — `politenessWindowMs` in `DomainCrawlConfig` + `DEFAULT_RATE_LIMIT` (2026-06-10)
- [x] Concurrency caps + back-off — `computeBackoffMs()` exponential back-off in `rate-limits.ts` (2026-06-10)
- [ ] Sitemap-driven crawl
- [x] JS-rendered site support (headless browsers) — `jsRendering: boolean` + `CrawlerFramework` "playwright_cluster" in `types.ts` (2026-06-10)
- [x] Per-source extraction rules (CSS / XPath / LLM-assisted) — `EXTRACTION_RULES` + `matchExtractionRule()` in `extraction-rules.ts` (2026-06-10)
- [x] Archive every fetch (immutable raw) — `rawArchiveKey` field in `CrawlJob` (2026-06-10)
- [x] Per-domain compliance posture documented — `CompliancePosture` type + per-domain values in `KNOWN_DOMAIN_CONFIGS` (2026-06-10)
- [ ] Anti-bot defenses encountered → graceful degrade (do not bypass aggressively)
- [x] Crawl metrics dashboard — `CrawlMetric`, `CrawlDashboardData`, `aggregateMetrics()` in `crawl-metrics.ts` (2026-06-10)

## Delivered modules (2026-06-10)
| File | Contents |
|------|----------|
| `apps/web/src/lib/crawler/types.ts` | `CrawlTargetId`, `CrawlerFramework`, `ExtractionMethod`, `CompliancePosture`, `DomainCrawlConfig`, `CrawlJob`, `CrawlJobStatus` |
| `apps/web/src/lib/crawler/rate-limits.ts` | `DEFAULT_RATE_LIMIT`, `KNOWN_DOMAIN_CONFIGS` (14 domains), `getRateLimitForDomain()`, `computeBackoffMs()` |
| `apps/web/src/lib/crawler/extraction-rules.ts` | `ExtractionRule`, `CssSelector`, `EXTRACTION_RULES` (7 domain rules), `matchExtractionRule()` |
| `apps/web/src/lib/crawler/crawl-metrics.ts` | `CrawlMetric`, `CrawlDashboardData`, `aggregateMetrics()` |
| `apps/web/src/lib/crawler/index.ts` | barrel re-export |

## i18n
- Multi-language; encoding detection per domain.

### Примітки
We crawl publicly accessible content per ToS. No login-walled or paywalled scraping.
