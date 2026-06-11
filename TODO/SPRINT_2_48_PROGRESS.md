# Sprint 2.48 Progress

**Date:** 2026-05-24
**Status:** Complete

---

## Tasks completed

### 1. `/legal/disputed-area` — Territorial display policy

**Files changed:**
- `apps/web/src/app/[locale]/legal/disputed-area/page.tsx` (NEW)
  - 8 sections: purpose, internationally recognised borders (UN GA ES-11/1 + ES-11/4), operational occupation lines (DeepStateMAP, ISW), labelling table (Crimea + 4 oblasts + Kosovo + Taiwan), accuracy vs. operational reality distinction, no-political-endorsement clause, error/correction process, references
  - `WebPage` JSON-LD with `dateModified` and publisher
  - `generateStaticParams()` for all `ACTIVE_LOCALES`
  - Cross-links to `/legal/methodology`, `/legal/aup`, `/legal/privacy`
- `apps/web/src/app/sitemap.ts` — added `/legal/disputed-area` (0.5)

---

### 2. `/legal/methodology` — OSINT methodology & data-use policy

**Files changed:**
- `apps/web/src/app/[locale]/legal/methodology/page.tsx` (NEW)
  - 9 sections: overview, source collection (Tier 1–4 breakdown + "what we don't use"), 7-step verification pipeline, confidence score formula, danger score inputs, correction/retraction policy, editorial independence statement, data-use terms (CC-BY-4.0 + prohibited uses + bulk licensing), AI-training policy
  - `@graph` JSON-LD: `WebPage` + `FAQPage` (3 Q&A: data sources, confidence score meaning, republishing)
  - `generateStaticParams()` for all `ACTIVE_LOCALES`
  - Cross-links to `/legal/disputed-area`, `/legal/aup`, `/legal/privacy`, `/docs/rate-limits`
- `apps/web/src/app/sitemap.ts` — added `/legal/methodology` (0.6)

---

### 3. Press RSS feed + press contact section

**Files changed:**
- `apps/web/src/lib/press-seed.ts` (NEW)
  - Extracted `PressRelease` type + `PressReleaseCategory` type + `PRESS_RELEASES` array from press page into shared module
  - 4 press releases (Product/Data/Partnership/Community)
- `apps/web/src/app/press/feed.xml/route.ts` (NEW)
  - `force-static` RSS 2.0 feed with `atom:link` self-reference, `managingEditor`, channel image, `<source>` per item
  - Sorted by date descending; 1h/24h cache headers
- `apps/web/src/app/[locale]/press/page.tsx` (EDITED)
  - Removed inline `PressRelease` type and `PRESS_RELEASES` array; replaced with imports from `press-seed.ts`
  - Added RSS badge (orange chip) next to "Press releases" section heading
  - Added `#press-contact` section: two mailto cards (press@aegislens.io / data@aegislens.io) with role label, email, description, and SLA note

---

### 4. Industries hub — featured industries + descriptions + use-case cross-links

**Files changed:**
- `apps/web/src/lib/industries.ts` (EDITED)
  - Extended `IndustryView` type with `description?`, `featured?`, `useCaseVertical?`
  - Added `INDUSTRY_META` record with editorial descriptions and `featured: true` for 5 industries (OSINT, Cybersecurity, Geospatial, Satellite Imagery, Threat Intelligence)
  - `listIndustries()` now sorts featured industries first, then by total count
  - Added `listFeaturedIndustries()` helper
- `apps/web/src/app/[locale]/industries/page.tsx` (REWRITTEN)
  - Featured industries rendered as larger cards (3-col grid) with description, "Featured" badge, "Use cases →" link
  - Remaining industries in compact 2-col list as before
  - Cross-link block at bottom: use-cases, all tools, compare

---

### 5. Region pages — FAQ block with FAQPage schema

**Files changed:**
- `apps/web/src/app/[locale]/regions/[country]/page.tsx` (EDITED)
  - Generated 4 dynamic FAQs per region using live event data (security situation, verification methodology, alert subscription, data licensing)
  - FAQ section rendered as `<details>` accordion above related regions
  - `FAQPage` added to `@graph` JSON-LD alongside existing `Place` + `BreadcrumbList`

---

### 6. Sources index — language + country URL-driven filters

**Files changed:**
- `apps/web/src/app/[locale]/sources/page.tsx` (EDITED)
  - Added `?lang=` and `?country=` URL-driven filter params (alongside existing `?sort=`)
  - Language filter chips from unique `language` values in `PUBLIC_SOURCES`
  - Country filter chips with flag emoji + ISO2 from unique `country` values
  - Filter state preserved when changing sort (URL merging via `buildHref`)
  - Count shows "N / total sources" when filter active
  - Removed duplicate `FLAGS` constant (was defined twice; now defined once before filter helpers)

---

## TODO files updated

| File | Before | After |
|------|--------|-------|
| `TODO/pages/TODO_legal.md` | 7/12 | 9/12 |
| `TODO/pages/TODO_press.md` | 5/10 | 8/10 |
| `TODO/pages/TODO_industries_hub.md` | 0/8 | 7/8 |
| `TODO/pages/TODO_regions.md` | 12/14 | 13/14 |
| `TODO/pages/TODO_sources_index.md` | 5/9 | 7/9 |

---

## Open follow-ups

- Legal: Version history per doc; plain-language summaries (DPA has one, others deferred)
- Press: Embed showcase ("seen in") strip
- Industries: Region/audience filter (no region field on industry data)
- Regions: Mini-map embed, time-series chart, top sources per region, civilian safety summary
- Sources: CSV export, pagination
