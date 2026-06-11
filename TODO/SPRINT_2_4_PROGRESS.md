# Sprint 2.4 — Progress

**Theme:** Content vertical hubs + classification tool + support surface + continued TODO audit.

**Date:** 2026-05-24

**Method:** 5 parallel agents.

---

## Delivered

### Content hubs
- [x] `/investigations` — 6 investigation cards (Iran-Russia drones, Crimea bridge, Magura USV, Wagner, Mariupol theatre, etc.). `CollectionPage` with `Article` items.
- [x] `/datasets` — open data catalog. 7 stub-downloadable datasets (events, sources, glossary, equipment, geography GeoJSON, OpenAPI, Postman) with license + format + size. `DataCatalog` JSON-LD.
- [x] `/trends` — 5 trend cards with inline SVG sparklines + tags. `CollectionPage` with `ItemList`.

### Vertical use-case hub
- [x] `/use-cases` — index.
- [x] `/use-cases/defense` — shield icon, situational awareness/target dev/BDA/force protection. `Service` JSON-LD.
- [x] `/use-cases/journalism` — lead gen/verification/corroboration.
- [x] `/use-cases/humanitarian` — pre-positioning/evacuation/cluster munitions.
- [x] `/use-cases/financial` — shipping/commodities/insurance.

### Classification tool
- [x] `lib/classifier.ts` — heuristic `classifyText`, `extractEntities`, `extractCoords`. Pure server-side, no LLM. Place names from CITIES + oblasts; orgs from COMPANIES; equipment from EQUIPMENT.
- [x] `/tools/classifier` — server-rendered demo page. Form GET → re-renders with classification result, entity list, coords. Includes prefilled example.
- [x] `POST /api/classify` — programmatic endpoint. JSON or FormData. Rate-limited 30/min/IP. CORS-open with OPTIONS preflight.

### Support surface
- [x] `lib/help-kb.ts` — 12 articles + `HELP_CATEGORIES` + `searchHelp(q)`.
- [x] `/help` — search bar + category grid. `WebSite` with `SearchAction`.
- [x] `/help/<slug>` — 12 detail pages × 2 locales. `Article` JSON-LD. Lightweight markdown rendering (paragraphs, bold, inline code).
- [x] `/contact` — 5 contact methods (general/sales/press/security/abuse) + form. `ContactPage` + `ContactPoint[]`.
- [x] `POST /api/contact` — FormData/JSON, 3/min/IP, redirect to `?status=sent|invalid`.

### TODO bookkeeping (continued)
- [x] **+64 more tasks marked** across 17 TODO directories (architecture, audiences, backend, billing, design, docs, features, integrations, map, pre_dev_setup, product, roadmap, transparency, etc).
- Cumulative across Sprints 0–2.4: **~170 tasks marked complete across ~55 TODO files**.

### Plumbing
- [x] `urls.investigations`, `urls.datasets`, `urls.trends`, `urls.useCases`, `urls.useCase`, `urls.classifier`, `urls.help`, `urls.helpArticle`, `urls.contact` added.
- [x] Sitemap +12 hreflang sets (4 use-case verticals each).
- [x] Footer Resources column: `Help`, `Investigations`, `Trends`, `Datasets`, `Use cases`, `Contact`.

---

## Open follow-ups
- [x] Real downloadable dataset files at `/data/*.{json,csv,geojson}` ✓ Sprint 2.6 (live route handlers wrapping the seeds, not static `/public` files)
- [x] `/investigations/<slug>` — full investigation detail pages ✓ Sprint 2.5
- [ ] Classifier: swap heuristics for LLM-backed classification via `/api/copilot` pattern
- [ ] `/help` results: highlight matching terms
- [ ] `/contact` form: actually queue messages (Resend / Postmark)
