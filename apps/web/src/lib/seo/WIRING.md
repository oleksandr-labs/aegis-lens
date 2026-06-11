# SEO module wiring — build-gated activation checklist

Sprint 2.61 delivered 97 typed, unit-tested modules under `apps/web/src/lib/seo/**`. The modules are the
deliverables (several were `tsc --noEmit` clean / vitest-passing in agent worktrees). The wirings below
touch **shared request-flow entry files** and were intentionally **NOT applied blind** — there is no local
build/typecheck in this workspace, and request-flow changes must land under CI `pnpm typecheck` + a smoke
test (per the project's mass-edit safeguards). Apply each item, then run CI before deploy.

## ✅ Already applied (Sprint 2.61, safe + additive)
- `app/robots.ts` — crawl-delay for MJ12bot/AhrefsBot/SemrushBot; faceted-nav `Disallow` patterns
  (`?sort=`/`?view=`/`?page=`/… from `lib/seo/facet-crawl-policy.ts`). Googlebot/Bingbot unaffected.

## ⬜ Pending wiring (apply under CI typecheck)

### Sitemaps (depends on new route files existing first)
1. Create segment route files mirroring `app/sitemap-events.xml/route.ts` → feed `lib/sitemap-shard.ts`:
   `app/sitemap-posts.xml/route.ts` (blog), `app/sitemap-reports.xml/route.ts` (reports+datasets),
   `app/sitemap-listings.xml/route.ts` (directory). Segment defs in `lib/seo/sitemap-segments.ts`.
2. `app/sitemap-index.xml/route.ts` → replace hardcoded children with `buildSitemapIndexXml()` from
   `lib/seo/sitemap-index.ts` (auto-syncs to the segment registry).
3. `app/robots.ts` `sitemap:[]` → add `/sitemap-posts.xml`, `/sitemap-reports.xml`, `/sitemap-listings.xml`
   **only after** step 1 (else they 404).
4. `app/news/sitemap.xml/route.ts` → replace hand-rolled XML with `renderNewsSitemap()` from
   `lib/seo/news-sitemap.ts` (enforces the 48h window + centralised escaping). See CRAWL handoff [6] for snippet.
5. `app/sitemap.ts` → add weekly-recap archive URLs (ISO weeks, `MIN_ARCHIVE_EVENTS=3` thin-guard) using
   `lib/news-archive-week` — **only after** the `archive/[year]/week/[week]` route + that lib exist. See SITEMAP handoff CHANGE 1.

### Publish hooks (no shared-file edit; wire into the publish/ISR-revalidate path)
6. On publish: `onPublish()` (`lib/seo/sitemap-ping.ts`) + `submitIndexNow()` (`lib/seo/indexnow.ts`).
   **ENV:** `INDEXNOW_KEY` (8–128 `[A-Za-z0-9-]`); serve `https://<host>/<INDEXNOW_KEY>.txt` containing the key.

### Redirects + URL normalization (middleware — request-flow; highest care)
7. Build `apps/web/src/data/redirects.generated.ts` exporting the `redirects.csv` contents as a string
   (edge runtime has no fs). Source: `apps/web/src/data/redirects.csv`.
8. `src/middleware.ts` (after the `_next`/api/static bypass, before locale handling): 308 `normalizePath`
   (lowercase/trailing-slash, `lib/seo/url/normalize.ts`), then `resolveRedirect()`
   (`lib/seo/redirects/resolve.ts`) → 301/302/410. See REDIRECTS handoff TARGET FILE 1 for the exact snippet.
   `next.config.ts` redirects(): **leave unchanged** (middleware is the single, hreflang-aware enforcement point).
9. CI step: run `detectChains()` (`lib/seo/redirects/chain-detector.ts`) over the parsed registry; fail build on any chain/cycle.

### Canonical / duplicate-content (metadata builder signature — backward-compatible)
10. `lib/seo.ts` `buildMetadata()` → add optional `canonicalTemplate` + `requestPath` (route canonical via
    `lib/seo/dedup/canonical-rules.ts` + `param-canonical.ts`) and optional `robotsDecision` (via
    `lib/seo/dedup/noindex-policy.ts`). Both default to current behavior when omitted. See DUPLICATE handoff CHANGE 1/2.

### Core Web Vitals (next.config + infra)
11. `next.config.ts` headers: `Alt-Svc: h3=":443"; ma=86400` (advertise HTTP/3); immutable cache + CORS for
    `*.woff2`. See CWV handoff.
12. Infra (nginx/CDN, per the Hetzner deploy pattern): true Brotli (`brotli on; brotli_static on;`) and
    HTTP/3 (`listen 443 quic; http3 on;`). These terminate at the edge, not in Next.

### CI test files delivered (wire a runner)
- `lib/seo/**/*.test.ts` (robots, sitemap, internal-pagerank, anchor-rules, dedup uniqueness, redirects
  chain-detector, url hreflang/canonical, schema, cwv budgets, …) — vitest-style, pure. No runner is
  configured in `apps/web` yet; add `vitest` + a `test` script, then these gate regressions.

> Source handoffs (full snippets): `c:\tmp\sprint261_shared_{CRAWL,SITEMAP,REDIRECTS,DUPLICATE,CWV}.txt`
> (session-local). The authoritative copies are the per-cluster notes summarized above.
