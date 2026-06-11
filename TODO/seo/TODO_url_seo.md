# TODO — URL SEO (Cross-Reference Hub)

## Goal
SEO-specific lens on URL strategy. Cross-references implementation files in [../urls_slugs/](../urls_slugs/).

## Progress
- 9 / 9 done

## Tasks
- [x] Primary-keyword-in-slug audit per page-template — apps/web/src/lib/seo/url/slug-keyword-audit.ts (auditSlugKeywords + per-template coverage)
- [x] Slug length distribution monitoring (target ≤ 75 chars) — apps/web/src/lib/seo/url/slug-length.ts (analyzeSlugLengths, SLUG_MAX_LENGTH=75)
- [x] Hreflang correctness CI test — apps/web/src/lib/seo/url/hreflang.test.ts
- [x] Canonical correctness CI test — apps/web/src/lib/seo/url/canonical.test.ts
- [x] Redirect-chain detection (no chains > 1 hop) — reuses apps/web/src/lib/seo/redirects/chain-detector.ts (detectChains)
- [x] Lowercase / trailing-slash policy enforced at edge — apps/web/src/lib/seo/url/normalize.ts; edge wiring proposed in c:\tmp\sprint261_shared_REDIRECTS.txt (middleware.ts)
- [x] Per-locale URL CTR analysis (which slugs convert better?) — apps/web/src/lib/seo/url/ctr-analysis.ts (analyzeCtr, data model + per-template/locale median + under-performers)
- [x] Slug experiments (A/B test new slug variants on programmatic pages, with redirect) — apps/web/src/lib/seo/url/slug-experiments.ts (assignArm, variantRedirectRules, promoteVariantRules)
- [x] Per-template slug uniqueness audit — apps/web/src/lib/seo/url/slug-uniqueness.ts (auditSlugUniqueness)

## Implementation refs
- [URL strategy master](../urls_slugs/TODO_url_strategy.md)
- [Slug rules per entity](../urls_slugs/TODO_slug_rules.md)
- [Localization](../urls_slugs/TODO_url_localization.md)
- [Permalink stability](../urls_slugs/TODO_permalink_stability.md)
- [Canonical strategy](../urls_slugs/TODO_canonical_strategy.md)
- [Anti-patterns](../urls_slugs/TODO_url_anti_patterns.md)
- [404 / 410](../urls_slugs/TODO_404_410_strategy.md)

## i18n
- All URL-SEO rules apply per locale.

### Примітки
URLs are the lowest-effort, highest-leverage SEO signal. Get them right Day 1.
