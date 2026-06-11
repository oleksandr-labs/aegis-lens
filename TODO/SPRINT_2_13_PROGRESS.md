# Sprint 2.13 — Progress

**Theme:** Score explainers, API cookbook, and the integrations directory — three more programmatic templates closed.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Score explainer pages (`/scoring/<metric>`)
- [x] `lib/scores-seed.ts` — 4 metrics: `confidence` (0.0–1.0), `danger` (0–100), `anomaly` (0.0–1.0), `reliability` (0.0–1.0). Each carries: one-liner, plain-language paragraphs, inputs, 3 calibrated worked examples, FAQ pairs.
- [x] `/scoring/[metric]` — TechArticle + FAQPage + BreadcrumbList JSON-LD. Each page cross-links to its siblings and back to `/methodology`.

### API cookbook (`/cookbook`, `/cookbook/<slug>`)
- [x] `lib/cookbook-seed.ts` — 6 recipes: fetch-recent-events, paginate-events, filter-by-class, subscribe-to-rss, build-region-dashboard, score-and-threshold.
- [x] Each recipe: goal, numbered steps, multi-language snippets (cURL / TypeScript / Python). Code blocks rendered in dark-tactical `<pre>`.
- [x] `/cookbook` index + `/cookbook/[slug]` detail with HowTo + HowToStep + BreadcrumbList JSON-LD. CTA strip on index linking to /docs/api, /docs/api/explorer, /api/openapi.json, /api/postman.json.

### Integrations directory (`/integrations`, `/integrations/<vendor>`)
- [x] `lib/integrations-seed.ts` — 12 integrations across 6 categories:
  - comms: Slack, Microsoft Teams, Telegram
  - automation: generic webhook, Zapier, Make
  - bi: Power BI (`ready`), Tableau (`ready`)
  - siem: Splunk, Elastic
  - crm: Salesforce
  - dev: GitHub Actions
- [x] `/integrations` — category-grouped index with `ready` / `beta` / `planned` status badges.
- [x] `/integrations/[slug]` — per-vendor detail: use-cases, numbered setup steps, requires block, tag pills, "Other {category} integrations" footer. SoftwareApplication + HowTo + BreadcrumbList JSON-LD.

### Plumbing
- [x] `urls.scoring`, `urls.cookbook`, `urls.cookbookRecipe`, `urls.integrations`, `urls.integration` added to `@aegis/url-builder`.
- [x] Sitemap: +4 score-explainer URLs, +1 cookbook index + 6 recipe URLs, +1 integrations index + 12 vendor URLs.
- [x] Footer Resources column: `Cookbook`, `Integrations`.

---

## Files touched

New:
- `apps/web/src/lib/scores-seed.ts`
- `apps/web/src/lib/cookbook-seed.ts`
- `apps/web/src/lib/integrations-seed.ts`
- `apps/web/src/app/[locale]/scoring/[metric]/page.tsx`
- `apps/web/src/app/[locale]/cookbook/page.tsx`
- `apps/web/src/app/[locale]/cookbook/[slug]/page.tsx`
- `apps/web/src/app/[locale]/integrations/page.tsx`
- `apps/web/src/app/[locale]/integrations/[slug]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+5 helpers)
- `apps/web/src/app/sitemap.ts` (+3 imports, +3 loops)
- `apps/web/src/components/Footer.tsx` (+2 links)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_score_explainers.md` — **4 / 5 done** ✓ Sprint 2.13 (only localization deferred)
- `TODO/programmatic/TODO_template_api_recipes.md` — **3 / 4 done** ✓ Sprint 2.13 (per-recipe Postman variants deferred)
- `TODO/programmatic/TODO_template_integrations.md` — **3 / 4 done** ✓ Sprint 2.13 (per-category index deferred — categories already group on main index)

## Open follow-ups
- [ ] Localize scoring + cookbook + integrations copy to UK
- [ ] Real screenshots on each integration page
- [x] Per-recipe Postman / Bruno run-files ✓ Sprint 2.24 (`/api/cookbook/<slug>/postman.json` parses the recipe's first curl snippet into a single-request Postman v2.1 collection; "Run this recipe" download block on each detail page)
- [x] `/scoring` index page ✓ Sprint 2.17 (CollectionPage + ItemList listing the 4 metrics with range + one-liner)
- [ ] Move at least one integration from `planned` → `ready` once the alert backend is real
- [ ] Cross-link recipes from `/docs/api` per-endpoint sections
