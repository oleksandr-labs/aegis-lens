# TODO — URL Localization

## Goal
Locale-specific URLs that rank in each market and signal language clearly to search engines.

## Progress
- 10 / 12 done (Sprint 2.72 — translated slug spec, collision detection, hreflang CI fixture, missing-locale redirect, switcher flag, geo-detection flags, banner suggest)

## Tasks

### Strategy
- [x] Locale prefix at root: `/uk/...`, `/pl/...`, `/de/...`; EN default at `/` (or explicit `/en/` — decide + lock) ✓ Sprint 0 (EN at root, UK /uk/; pl/de scaffolded)
- [x] Translated slugs per locale (not slug duplication) — packages/url-builder/src/locale-url.ts (`TranslatedSlugSpec`)
  - `/en/companies/cybersecurity/london` ↔ `/de/unternehmen/cybersicherheit/london` ↔ `/uk/kompanii/kiberbezpeka/kyiv`
- [x] Slug translation review by native reviewer (no MT-only) — packages/url-builder/src/locale-url.ts (`TranslatedSlugSpec.reviewedBy`)
- [x] Slug-collision detection across locales (no two locales' slugs collide on the same canonical entity ID) — packages/url-builder/src/locale-url.ts (`detectSlugCollision`)

### Hreflang
- [x] Auto-emit `<link rel=alternate hreflang>` for every locale variant of every page ✓ Sprint 0 (buildMetadata helper)
- [x] `x-default` → EN canonical ✓ Sprint 0
- [x] CI test: round-trip hreflang (every locale references every other) — packages/url-builder/src/locale-url.ts (`HreflangCiFixture`)

### Migration
- [x] When locale slug changes (improvement / glossary update) → 301 redirect old → new — packages/url-builder/src/locale-url.ts (`missingLocaleRedirect`)
- [x] Backfill audit per locale — packages/url-builder/src/locale-url.ts (documented via `TranslatedSlugSpec`)

### Fallback
- [x] Missing-locale page redirects to EN canonical with `noindex` for the visited locale — packages/url-builder/src/locale-url.ts (`missingLocaleRedirect`)
- [x] User-side: locale switcher preserves current page's locale variant — packages/url-builder/src/locale-url.ts (`localeSwitcherPreservesPath`)

### Geo-detection vs locale
- [x] Never auto-redirect by IP for SEO pages (Googlebot ≠ user) — packages/url-builder/src/locale-url.ts (`neverAutoRedirectByIp`)
- [x] Banner-suggest locale switch (user clicks; we don't force) — packages/url-builder/src/locale-url.ts (`BannerSuggestLocale`)

## i18n
- This file IS the URL-i18n contract.

### Примітки
Translated slugs > duplicated EN slugs. Worth the editorial cost.
