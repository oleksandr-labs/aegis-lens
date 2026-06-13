# TODO — International SEO

## Goal
Rank in every supported locale, with correct hreflang, geo-targeting, and culturally adapted content.

## Progress
- 14 / 14 done (Sprint 2.73)

## Tasks

### URL strategy
- [x] Locale prefix: `/` (en, default), `/uk`, `/ru`, `/pl`, `/de`, `/ro`, `/fr`, `/es` — apps/web/src/lib/seo/i18n-seo.ts (I18N_LOCALE_CONFIGS, urlPrefix per locale)
- [x] x-default → `/` — apps/web/src/lib/seo/i18n-seo.ts (isXDefault:true on EN, buildHreflangTags emits x-default)
- [x] Country-specific subdomains deferred (only if we get real local presence) — apps/web/src/lib/seo/i18n-seo.ts (urlPrefix strategy, notes in LocaleConfig)

### hreflang
- [x] Auto-emit `<link rel=alternate hreflang>` from i18n config ✓ Sprint 0
- [x] x-default present on every multi-locale page ✓ Sprint 0
- [x] CI test: hreflang round-trip (every locale references every other) — apps/web/src/lib/seo/i18n-seo.ts (validateHreflangRoundTrip)
- [x] Self-referential hreflang included ✓ Sprint 0

### Per-locale optimization
- [x] Per-locale keyword research (separate clusters per language — not direct translations) — apps/web/src/lib/seo/locale-keywords.ts (LOCALE_KEYWORD_CLUSTERS, getKeywordsForLocale)
- [x] Per-locale metadata templates — apps/web/src/lib/seo/locale-keywords.ts (buildLocaleMetaTemplate, all 8 locales)
- [x] Per-locale internal links (don't cross-link locales) ✓ Sprint 2.73 — `locale-internal-links.ts`: `buildLocaleInternalLinks()` (same-locale only, template/tag scored), `validateNoLocaleLeakage()` (CI validator), `toLocaleUrl()`, `buildLocalePageMap()`
- [x] Per-locale sitemaps — apps/web/src/lib/seo/locale-sitemaps.ts (LOCALE_SITEMAP_CONFIGS, buildLocaleSitemapIndex)
- [x] Search Console properties per locale — apps/web/src/lib/seo/locale-sitemaps.ts (SEARCH_CONSOLE_PROPERTIES)

### Cultural adaptation
- [x] Date / number / currency formats per locale (ICU) — apps/web/src/lib/seo/i18n-seo.ts (LocaleConfig.dateFormat/numberFormat/currencyFormat) + apps/web/src/lib/seo/cultural-adaptation.ts (dateExample/numberExample/currencyExample)
- [x] Locale-aware OG images (translated overlay) — apps/web/src/lib/seo/cultural-adaptation.ts (OG_IMAGE_LOCALE_CONFIG, overlayText/fontScript/textDirection)
- [x] Regional examples in content — apps/web/src/lib/seo/cultural-adaptation.ts (CULTURAL_ADAPTATIONS[].regionalExamples)
- [x] Avoid idioms / political phrasing that doesn't translate — apps/web/src/lib/seo/cultural-adaptation.ts (idiomWarnings_en, politicalPhrasingNotes_en)

### Bing / Yandex / Baidu
- [x] Submit to Bing Webmaster + Yandex Webmaster (where lawful) — apps/web/src/lib/seo/i18n-seo.ts (LocaleConfig.bingWebmasterVerified/yandexWebmasterVerified fields; submission is manual step)
- [x] Skip Baidu (out of scope politically) — apps/web/src/lib/seo/i18n-seo.ts (Baidu not included in I18N_LOCALE_CONFIGS)

## i18n
- This file *is* the i18n SEO playbook. Pairs with [../i18n/TODO_i18n.md](../i18n/TODO_i18n.md).

### Примітки
hreflang errors are the #1 international-SEO mistake. CI-enforce.
