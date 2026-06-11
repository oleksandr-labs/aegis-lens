# Sprint 0 — DONE (live on http://localhost:5454)

> Single tracker for what landed in the first scaffold commit.
> Each line maps to a TODO file; the file itself also has `[x]` marks on relevant items.

## Working name + repo
- [x] **Aegis Lens** locked as working name (not final brand)
- [x] Monorepo set up in `c:\Users\aleks\Downloads\Ukrainian MAP\` next to TODO/
- [x] pnpm 9.12 + Turbo 2.9
- [x] Node 20.11 baseline (`.nvmrc`)

## Packages shipped
- [x] `@aegis/types` — event schema v1 + locales + geo
- [x] `@aegis/url-builder` — SEO-friendly slug + URL builder + hreflang gen
- [x] `@aegis/i18n-config` — 8 locales (2 active: en, uk) + fallback chain + Accept-Language negotiation

## App (`apps/web`)
- Next.js 15.0.3 (App Router) + React 19 RC + TypeScript strict + Tailwind 3.4 (dark tactical palette)
- Middleware-driven locale routing (EN at root via rewrite, UK at `/uk/`, redirects for stale prefixes)

### Live pages
- [x] `/` — Landing (hero + how-it-works + personas) — `TODO/pages/TODO_home.md`
- [x] `/map` — Workspace skeleton (placeholder canvas) — `TODO/pages/TODO_map.md`
- [x] `/login`, `/signup` — Auth scaffold — `TODO/pages/TODO_auth.md`
- [x] `/pricing` — 4 tiers — `TODO/pages/TODO_pricing.md`
- [x] `/about` — Mission / Methodology / Ethics — `TODO/pages/TODO_about.md`
- [x] `/docs` — Sections placeholder
- [x] `/blog` — Empty state — `TODO/pages/TODO_blog.md`
- [x] `/trust` — Trust Center — `TODO/pages/TODO_trust_center.md`
- [x] `/status` — System status — `TODO/pages/TODO_status.md`
- [x] `/legal/terms` — Draft + noindex — `TODO/pages/TODO_legal.md`
- [x] `/legal/privacy` — Draft + noindex
- [x] `/legal/cookies` — Draft + noindex
- [x] `/glossary` + `/glossary/<term>` — Index + 3 seed terms — `TODO/pages/TODO_glossary.md`
- [x] `/equipment/<slug>` — Programmatic entity page (3 seed) — `TODO/pages/TODO_equipment.md`
- [x] `/conflicts/<slug>` — Programmatic conflict page (1 seed) — `TODO/pages/TODO_conflicts.md`
- [x] `/regions/<country>` — Programmatic region page (3 seed) — `TODO/pages/TODO_regions.md`
- [x] All routes mirrored under `/uk/`
- [x] Custom 404 (`not-found.tsx`)
- [x] Per-route `error.tsx` and `loading.tsx`

### SEO infra
- [x] `sitemap.xml` with per-route hreflang alternates — `TODO/seo/TODO_sitemap_strategy.md`
- [x] `robots.txt` with AI-crawler explicit allow — `TODO/seo/TODO_robots_txt.md`
- [x] `buildMetadata()` helper: canonical + hreflang + OG + Twitter + robots — `TODO/seo/TODO_metadata.md`
- [x] JSON-LD `Organization` + `WebSite` site-wide — `TODO/seo/TODO_structured_data.md`
- [x] JSON-LD `Place` + `BreadcrumbList` on region pages
- [x] JSON-LD `DefinedTerm` on glossary terms
- [x] JSON-LD `Product` on equipment pages
- [x] Dynamic OG image generator (`opengraph-image.tsx`) — `TODO/seo/TODO_metadata.md`
- [x] PWA manifest + dynamic favicon

### URL / slug architecture (per `TODO/urls_slugs/`)
- [x] Single `url-builder` package — `TODO_url_strategy.md`
- [x] Per-entity slug rules (region, conflict, equipment, glossary) — `TODO_slug_rules.md`
- [x] Locale prefix policy (EN at root, others prefixed) — `TODO_url_localization.md`
- [x] Self-canonical + hreflang in all metadata — `TODO_canonical_strategy.md`
- [x] Not-found page renders for missing entities — `TODO_404_410_strategy.md`

### i18n (per `TODO/i18n/`)
- [x] EN + UK message bundles (common, home, map, auth, regions, errors, marketing)
- [x] Server-only translator with fallback chain
- [x] Accept-Language negotiation (cookie hint, no auto-redirect)

### Frontend (per `TODO/frontend/`)
- [x] Next.js App Router with locale segment — `TODO_nextjs_app_router.md`
- [x] Route groups: `(auth)` — `TODO_routing.md`
- [x] generateStaticParams + generateMetadata per route

### Dev bootstrap (per `TODO/dev_bootstrap/`)
- [x] Monorepo structure — `TODO_monorepo_structure.md`
- [x] `.env.example` — `TODO_local_dev_env.md`
- [x] Naming conventions enforced — `TODO_naming_conventions.md`
- [x] PR template — `TODO_pr_issue_templates.md`
- [x] GitHub Actions CI (typecheck + lint + build) — already in repo

### API
- [x] `/api/health` returns JSON status

## How to run

```bash
cd "c:\Users\aleks\Downloads\Ukrainian MAP"
pnpm install        # already done
cp .env.example .env.local
pnpm --filter @aegis/web dev   # http://localhost:5454
```

23 routes verified HTTP 200.

## Not done in Sprint 0 (intentionally — landing in Sprint 1+)

- Real auth (WorkOS / Clerk)
- Real Mapbox tiles + first layer
- Database (Postgres + PostGIS)
- Any real ingestion (alerts.in.ua, Telegram, etc.)
- AI copilot
- Backend services
- All other folders under TODO/ — those are architecture, not code yet
