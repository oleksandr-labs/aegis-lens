# TODO — 404 / 410 / Soft-404 Strategy

## Goal
Right HTTP code, every time. Save crawl budget; preserve link equity.

## Progress
- 10 / 10 done — apps/web/src/lib/seo/urls/http-status-strategy.ts + apps/web/src/lib/seo/urls/locale-404.ts

## Tasks
- [x] 404 for "doesn't exist" (random URL) — apps/web/src/lib/seo/urls/http-status-strategy.ts (HTTP_STATUS_RULES["random-url"])
- [x] 410 for "intentionally retired" (deprecated entity) — apps/web/src/lib/seo/urls/http-status-strategy.ts (HTTP_STATUS_RULES["intentionally-retired"])
- [x] 301 for "moved" (slug change) — apps/web/src/lib/seo/urls/http-status-strategy.ts (HTTP_STATUS_RULES["moved"])
- [x] 302 only for temporary redirects (rare; document why) — apps/web/src/lib/seo/urls/http-status-strategy.ts (HTTP_STATUS_RULES["moved"] rationale)
- [x] No soft-404s (page returns 200 but is empty / "not found") — apps/web/src/lib/seo/urls/http-status-strategy.ts (SOFT_404_WARNING_EN, HTTP_STATUS_RULES["soft-404-risk"])
- [x] 404 page is useful: search bar, top links, locale switch — apps/web/src/lib/seo/urls/http-status-strategy.ts (NOT_FOUND_PAGE_REQUIREMENTS)
- [x] 404 page itself is `noindex` — apps/web/src/lib/seo/urls/http-status-strategy.ts (NOT_FOUND_PAGE_REQUIREMENTS.isNoindex)
- [x] Per-locale 404 page — apps/web/src/lib/seo/urls/locale-404.ts (LOCALE_404_CONFIGS)
- [x] 410 reasons documented per retired entity — apps/web/src/lib/seo/urls/http-status-strategy.ts (RETIRED_ENTITY_POLICY_EN)
- [x] Search Console "Coverage" review monthly — apps/web/src/lib/seo/urls/http-status-strategy.ts (SEARCH_CONSOLE_REVIEW_SCHEDULE)

## i18n
- 404 / 410 messages localized.

### Примітки
Soft-404s are the worst — Google guesses, sometimes wrong. Be explicit.
