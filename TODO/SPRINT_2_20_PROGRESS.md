# Sprint 2.20 — Progress

**Theme:** Near-me programmatic, sitemap-index split into shards, OG images for two cross-cut surfaces.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Near-me programmatic (`/companies-near/<city>`)
- [x] `/companies-near/[city]` — one page per distinct HQ city in COMPANIES. Verified-first "Top near {city}" block, industry-grouped main list (each group with an `industry × city →` cross-link), "Other cities" footer ranked by count, "see also `/companies/city/<slug>`" pointer.
- [x] Pre-renders statically. Min-entries threshold guards thin pages (MIN_ENTRIES = 1 today; tunable as catalogue grows).
- [x] CollectionPage + ItemList + BreadcrumbList JSON-LD.

### Sitemap-index split (4 shards + master index)
- [x] `lib/sitemap-shard.ts` — shared `renderSitemapXml()` + `sitemapResponse()` that emits hreflang `<xhtml:link rel="alternate">` per locale (plus x-default) for every URL in a shard.
- [x] `/sitemap-index.xml` — `<sitemapindex>` referencing the main `/sitemap.xml` plus the new shards.
- [x] `/sitemap-events.xml` — every event + its four sub-pages (timeline / sources / media / related). Largest single bucket; sharding it lets crawlers refresh independently from marketing.
- [x] `/sitemap-cross-cuts.xml` — topic×country, topic×year, threat×country, equipment×operator, source×country, 3D use-case×country. Mirrors the main sitemap's cross-cut logic so the shard stays in sync.
- [x] `/sitemap-media.xml` — case studies + podcast + videos. Different refresh cadence from operational data.
- [x] All shards rebuild on each request (`force-dynamic`) and carry the same `cache-control: public, max-age=3600, stale-while-revalidate=86400` as the main sitemap.

### OG images for cross-cut pages
- [x] `/threats/[slug]/in/[country]/opengraph-image.tsx` — Satori card with threat-category eyebrow, "{Name} in {Country}" headline, summary clipped to 180 chars.
- [x] `/topics/[slug]/in/[country]/opengraph-image.tsx` — Class-coloured dot, eyebrow "{Class} · {Country}", "{Class} events in {Country}" headline, event count + ISO build date.

### Plumbing
- [x] `urls.companiesNear` added to `@aegis/url-builder`.
- [x] Sitemap (main): now emits both `/companies/city/<slug>` and `/companies-near/<slug>` for each city.

---

## Files touched

New:
- `apps/web/src/app/[locale]/companies-near/[city]/page.tsx`
- `apps/web/src/lib/sitemap-shard.ts`
- `apps/web/src/app/sitemap-index.xml/route.ts`
- `apps/web/src/app/sitemap-events.xml/route.ts`
- `apps/web/src/app/sitemap-cross-cuts.xml/route.ts`
- `apps/web/src/app/sitemap-media.xml/route.ts`
- `apps/web/src/app/[locale]/threats/[slug]/in/[country]/opengraph-image.tsx`
- `apps/web/src/app/[locale]/topics/[slug]/in/[country]/opengraph-image.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+1 helper)
- `apps/web/src/app/sitemap.ts` (+1 near-me loop entry)
- `TODO/SPRINT_2_16_PROGRESS.md` — cross-cut OG follow-up ticked ✓ Sprint 2.20
- `TODO/programmatic/TODO_template_near_me.md` — 4/8 done ✓ Sprint 2.20

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_near_me.md` — **4 / 8 done** ✓ Sprint 2.20 (map/radius/distance deferred until per-company coords; FAQ + LocalBusiness deferred)
- `TODO/SPRINT_2_16_PROGRESS.md` — cross-cut OG ticked ✓ Sprint 2.20

## Open follow-ups
- [ ] Submit `/sitemap-index.xml` to Google Search Console + Bing Webmaster Tools when production is live
- [x] OG images for the remaining cross-cuts (equipment × operator, source × country, 3D use-case × country) ✓ Sprint 2.21
- [x] FAQ blocks on cross-cut pages ✓ Sprint 2.22 (threat × country) + Sprint 2.23 (topic × country + 3D use-case × country); all three surfaces ship parametric 4-Q FAQs + FAQPage JSON-LD
- [ ] Per-company coordinates so `/companies-near/<city>` can render a real radius search
- [ ] `/<thing>-near-me` geo-aware variant (requires client-side geolocation consent UX)
- [ ] Split `/sitemap.xml` itself into per-category shards once URL count exceeds ~25k
