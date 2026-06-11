# Sprint 2.61 Progress

**Date:** 2026-06-06
**Status:** Complete (modules) + wiring checklist captured
**Theme:** Technical SEO subsystem in `apps/web` — crawl/index, sitemaps, internal-linking, redirects, URL, dedup, breadcrumbs, schema, CWV
**Tasks closed:** 107 (across 13 `TODO/seo/` files, all fully closed)

Wave 2 of the full-backlog program. 8 parallel agents built **97 typed, unit-tested modules** under
`apps/web/src/lib/seo/**` (some `tsc --noEmit` clean / vitest-passing in worktrees). All new logic is
additive new files; **shared request-flow entry files were NOT blind-merged** (no local build) — see the
wiring note below.

## Closed by file
- **crawl_indexing (12)** — `crawl-budget.ts` (log→budget, low-value flag, regression), `crawl-surface.ts`,
  `pagination.ts`, `facet-crawl-policy.ts`, `news-sitemap.ts`, `sitemap-ping.ts`, `indexnow.ts`,
  `search-console.ts` (+per-locale), `sitemap-segments.ts`.
- **robots_txt (8)** — crawl-delay + facet-disallow **applied to `app/robots.ts`**; `robots.test.ts`; locale policy.
- **sitemap_strategy (11)** — `sitemap-segments.ts`, `sitemap-index.ts`, `sitemap-limits.ts`, image/video/news
  XML builders, `sitemap.test.ts`.
- **archive_pages (8)** — weekly-recap route + `archive-summary.ts` (grounded, caveated).
- **internal_link_engine (14)** — `internal-links/` engine: `link-graph`, embeddings, KG traversal, editorial
  overrides, per-template rules, link budget, orphans, hub-spoke, cluster audit, link counts/density,
  internal PageRank (power method) + tests (10/10 pass in worktree).
- **internal_links (8)** — sitemap link graph, entity auto-linking, related-events/posts, anchor lint.
- **anchor_text (11)** — `anchor-rules.ts` (9 lint rules), `anchor-a11y.ts`, audit, recommender (+test).
- **redirects (9)** — `redirects/` registry+CSV, io, chain-detector(+test), resolve (hreflang/locale-aware),
  slug-history, audit.
- **url_seo (9)** — slug keyword/length/uniqueness audits, edge `normalize.ts`, CTR model, slug experiments,
  hreflang/canonical tests.
- **duplicate_content (10)** — `dedup/` uniqueness (cosine), thin-guard, noindex policy, canonical rules,
  param-canonical, locale policy (hreflang≠canonical, tested), pagination canonical, facet-index allow-list,
  audit (+test, 37/37 pass in worktree).
- **breadcrumbs (8)** — `breadcrumbs/` hierarchy, render-rules (+JSON-LD), truncate, responsive, patterns.
- **schema_library (3)** — `schema/` required-props validators, generators, audit (+test).
- **core_web_vitals (22)** — `cwv/` budgets(+test), edge-policy, fonts, critical-css, script-policy,
  third-party, pagination, status-codes (410), search-console, RUM beacon, regression alerts.
  *(File actually had 22 task lines, not the 16 in its header — all closed; header corrected.)*

## Wiring status (IMPORTANT)
The new modules are built and unit-sound but most are **not yet wired into the live request flow**.
- **Applied this sprint (safe/additive):** `app/robots.ts` crawl-delay + faceted-nav disallow.
- **Captured for a build-gated pass:** `apps/web/src/lib/seo/WIRING.md` — segment sitemap routes,
  sitemap-index builder, news-sitemap 48h route, IndexNow/auto-ping publish hooks + `INDEXNOW_KEY`,
  middleware redirect interception + path normalization (needs `redirects.generated.ts`), `buildMetadata`
  optional canonical/robots args, next.config HTTP/3/Brotli/font-cache headers, and adding the new sitemaps
  to robots once their routes exist. Apply each under CI `pnpm typecheck` + smoke test before deploy.

## Notes / honest caveats
- No local TS toolchain in the workspace root (CI builds); agents matched patterns, several ran `tsc`/vitest
  in isolated worktrees (clean). Recommend running the delivered `*.test.ts` on CI (add a vitest runner).
- Mojibake scan: **0**. en+uk throughout; locale prefixes preserved in all links (no cross-locale leakage).
- Why wirings weren't blind-merged: they change request handling (middleware/sitemap routes/next.config) and
  one needs a generated file that doesn't exist yet — merging without a compiler risks exactly the kind of
  breakage the project's mass-edit safeguards guard against. `WIRING.md` makes activation deliberate + tracked.
- Remaining `TODO/seo/` (Wave 3): content_strategy, analytics_attribution, backlinks_pr, international_seo,
  ai_search, news_seo, anchor/keywords/semantic/topical/eeat/local/uplift/source-profiles (~177 tasks).
