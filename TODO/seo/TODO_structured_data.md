# TODO — Structured Data & Sitemaps

## Goal
Rich results, knowledge-graph eligibility, and crawler efficiency.

## Progress
- 9 / 9 done (Sprint 2.60)

## Tasks
- [x] JSON-LD `Organization` site-wide ✓ Sprint 0
- [x] `NewsArticle` / `Article` on blog & reports ✓ Sprint 0
- [x] `Event` schema on conflict events (where lawful) ✓ Sprint 1.2
- [x] `BreadcrumbList` ✓ Sprint 0
- [x] `FAQPage` on pricing / docs ✓ Sprint 2.2
- [x] `Dataset` for public open-data endpoints ✓ Sprint 1.9
- [x] XML sitemap (segmented: pages, posts, reports, events) ✓ Sprint 0
- [x] News sitemap (Google News) ✓ Sprint 2.60 — /news/sitemap.xml (Google News format) + NewsArticle JSON-LD
- [x] `robots.txt` with disallow for `/api`, `/internal` ✓ Sprint 0
- ⬜ Global FAQ standard: every content/public page ships a 10-question FAQ (first 3 open + 7 collapsed) with `FAQPage` JSON-LD covering all 10 Q&As — see [TODO_MAIN.md](../TODO_MAIN.md) "Global standard: FAQ block on every page"

## i18n
- Each sitemap segmented by locale; `hreflang` annotations included.

### Примітки
Event schema only for non-sensitive, publicly verified events.
