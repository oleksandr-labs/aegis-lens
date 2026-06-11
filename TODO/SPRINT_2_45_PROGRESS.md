# Sprint 2.45 Progress

**Date:** 2026-05-24
**Status:** Complete

---

## Tasks completed

### 1. Equipment pages — full enrichment

**Files changed:**
- `apps/web/src/lib/seed-data.ts` — added 4 new types to `EquipmentSeed`:
  - `EquipmentSpec { label, value, source? }`
  - `EquipmentOperator { name, iso2, note? }`
  - `EquipmentVariant { name, note }`
  - `EquipmentFaq { q, a }`
  - Extended `EquipmentSeed` with optional: `specs?`, `identificationCues?`, `operators?`, `variants?`, `relatedSlugs?`, `faq?`
  - Fully enriched 3 entries: **Shahed-136**, **Bayraktar TB2**, **Iskander-M** (8 specs, 4-5 ID cues, 2-4 operators, 2-3 variants, 2 relatedSlugs, 2-3 FAQ items each)
- `apps/web/src/app/[locale]/equipment/[slug]/page.tsx` — full rewrite:
  - `FLAG` record for country flag emojis
  - `relatedEquipment` computed from `relatedSlugs`
  - JSON-LD updated to `@graph`: `Product` + `BreadcrumbList` + optional `FAQPage`
  - Sections: identity DL, specs table (with source citations), identification cues (numbered), operators (with flags), variants, related equipment chips, recent events, FAQ (`<details>` accordion)

---

### 2. Legal pages — DPA and Subprocessors

**Files changed:**
- `apps/web/src/app/[locale]/legal/dpa/page.tsx` (NEW)
  - GDPR Art. 28 Data Processing Addendum with 10 sections
  - Plain-language summary block
  - PDF download link (`/legal/dpa.pdf`)
  - Version/effective-date/framework metadata
  - Links to `/legal/subprocessors`
- `apps/web/src/app/[locale]/legal/subprocessors/page.tsx` (NEW)
  - `Subprocessor` type + `SUBPROCESSORS[]` — 9 processors (AWS, Vercel, Cloudflare, Stripe, Postmark, PlanetScale, Datadog, Sentry, Algolia)
  - `ChangeLogEntry` type + `CHANGE_LOG[]` — 3 entries
  - Table view with purpose/country/DPA link per processor
  - Change log section
  - Objection notice per GDPR Art. 28(2)
- `apps/web/src/app/sitemap.ts` — added routes:
  - `localePath(lc, "/legal/dpa")` at priority 0.4
  - `localePath(lc, "/legal/subprocessors")` at priority 0.3

---

### 3. Sources — suggest form + health snapshot

**Files changed:**
- `apps/web/src/app/[locale]/sources/page.tsx` — added `#suggest` section:
  - Form fields: source name, homepage/feed URL, type select (8 options), country ISO2, reason textarea, optional email
  - Posts to `/api/sources/suggest`
  - Editorial note: no dark-web, subscription-only, or unverifiable sources
- `apps/web/src/app/[locale]/sources/[slug]/page.tsx` — added:
  - Source health snapshot card: Status (Healthy) / Ingestion cadence (5 min) / Last seen (<1 min ago) / 30d uptime (99.8%) — illustrative until Sprint 3 live metrics
  - Tier explanation block (Tier A ≥ 90% → anchor confidence; methodology link)

---

### 4. Help Center — new categories + Schema.org

**Files changed:**
- `apps/web/src/lib/help-kb.ts` — extended:
  - `HelpCategory` union: added `"Map"`, `"Alerts"`, `"Troubleshooting"` (6 → 9 categories)
  - `HELP_CATEGORIES[]` updated
  - Added 9 new articles (12 → 21 total):
    - **Map:** `using-the-live-map`, `map-layers-and-overlays`, `searching-and-filtering-events`
    - **Alerts:** `setting-up-rss-alerts`, `configuring-email-alerts`, `telegram-bot-commands`
    - **Troubleshooting:** `api-returning-401`, `map-not-loading`, `events-not-appearing-in-api`
- `apps/web/src/app/[locale]/help/page.tsx` — added:
  - `faqItems` computation (up to 10 items from Getting Started / Alerts / Troubleshooting)
  - JSON-LD updated to `@graph`: `WebSite` (with `SearchAction`) + `FAQPage` (10 Q&A pairs, markdown stripped for plain-text answers)

---

## TODO files updated

| File | Before | After |
|------|--------|-------|
| `TODO/pages/TODO_equipment.md` | 4/10 | 9/10 |
| `TODO/pages/TODO_legal.md` | 5/12 | 7/12 |
| `TODO/pages/TODO_sources_index.md` | 3/9 | 5/9 |
| `TODO/pages/TODO_help_center.md` | 0/11 | 5/11 |

---

## Open follow-ups (not in this sprint)

- Equipment: enrich remaining 9+ entries beyond the 3 done
- Equipment: image gallery (rights-cleared only)
- Legal: disputed-area display policy, OSINT methodology page, version history per doc
- Sources: pagination, CSV export, languages/regions covered columns
- Help Center: "Was this helpful?" feedback, inline chatbot (RAG), video tutorials, freshness tracking
- Help Center: individual article pages at `/help/[slug]` (detail view already exists via `help-kb.ts` + page template)
