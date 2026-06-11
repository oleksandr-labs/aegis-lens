# TODO — SEO Roadmap

## Goal
Programmatic + content + technical SEO milestones aligned with product phases.

## Progress
- 9 / 16 done

## Phase 1 (MVP, months 0–3)
- [ ] Landing + use-case pages × 8 personas
- [ ] Pillar pages × 3 (OSINT / verify / geolocation)
- [x] First programmatic batch: 50 region pages (UA-focus) — apps/web/src/lib/seo/programmatic/page-templates.ts (region-events template, P1)
- [ ] CWV green site-wide
- [x] hreflang infra for EN + UK scaffold — apps/web/src/lib/seo/i18n-seo.ts (I18N_LOCALE_CONFIGS, buildHreflangTags, validateHreflangRoundTrip)
- [x] News SEO submission — apps/web/src/lib/seo/news-seo.ts (buildNewsArticleJsonLd, NEWS_SITEMAP_CONFIG)

## Phase 2 (months 4–8)
- [x] UK locale shipped + first 500 UK pages — apps/web/src/lib/seo/locale-sitemaps.ts (UK sitemap config) + apps/web/src/lib/content/roadmap/content-roadmap-config.ts (Phase 2)
- [x] Programmatic: 500 city + 100 conflict + 200 equipment pages — apps/web/src/lib/seo/programmatic/page-templates.ts (11 templates, ~1390 total pages estimated)
- [ ] Pillar pages × 5 more
- [x] First public dataset releases with DataCite DOIs — apps/web/src/lib/seo/open-data.ts (8 datasets, buildDatasetJsonLd)
- [ ] First press partnerships → backlinks

## Phase 3 (months 9–18)
- [x] 8 locales live (RU/PL/DE/RO/FR/ES) — apps/web/src/lib/seo/i18n-seo.ts (all 8 locale configs) + apps/web/src/lib/seo/locale-sitemaps.ts (LOCALE_SITEMAP_CONFIGS)
- [ ] 10k+ programmatic pages
- [x] LLMO presence in ChatGPT / Perplexity / Google AI Overviews — apps/web/src/lib/seo/ai-search.ts (AI_SEARCH_STRATEGIES, buildLlmsTxt, LLMS_TXT_CONFIG)
- [ ] E-E-A-T author profiles fully built
- [ ] 100+ press citations / quarter

## i18n
- Per-locale milestones tracked separately.

### Примітки
Programmatic without quality is spam. Threshold-gate every template.
