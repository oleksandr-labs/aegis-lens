# Sprint 2.49 Progress

**Date:** 2026-05-24
**Status:** Complete

---

## Tasks completed

### 1. Docs — Event schema & taxonomy reference (`/docs/schema`)

**Files changed:**
- `apps/web/src/app/[locale]/docs/schema/page.tsx` (NEW)
  - Full Event object shape (all fields with types, nullability, description)
  - Enums: VerifyState (5 values), Severity (5 values), GeoPrecision (4 values) — each as a 2-col table
  - Event-class taxonomy: 6 groups (kinetic/infrastructure/cyber/maritime+aviation/humanitarian+civilian/diplomatic+political), 19 classes total
  - SourceRef object schema
  - LocalizedString object schema
  - Cross-links to `/docs/api` and `/docs/confidence`
  - `TechArticle` JSON-LD with author + publisher
  - `generateStaticParams()` for all `ACTIVE_LOCALES`
- `apps/web/src/app/[locale]/docs/page.tsx` (EDITED) — added 3 new entries to `TOPICS`: schema, confidence, osint-guide
- `apps/web/src/app/sitemap.ts` (EDITED) — added `/docs/schema`, `/docs/confidence`, `/docs/osint-guide` (0.6)

---

### 2. Docs — Confidence & danger scoring (`/docs/confidence`)

**Files changed:**
- `apps/web/src/app/[locale]/docs/confidence/page.tsx` (NEW)
  - Confidence (0–100): inputs table with 8 rows (tier weights, geo, imagery, official, decay); simplified formula as code block; practical thresholds table (≥80/60–79/40–59/<40/<30)
  - Danger score (0–100): inputs table with 7 rows (class baseline, munition, target, population, CI proximity, casualties, area); severity label mapping (5 rows with ranges)
  - API usage section: example query with `min_confidence` + `min_danger` parameters
  - `TechArticle` JSON-LD

---

### 3. Docs — OSINT methodology guide (`/docs/osint-guide`)

**Files changed:**
- `apps/web/src/app/[locale]/docs/osint-guide/page.tsx` (NEW)
  - Source-tier cards: Tier 1–4 with examples and corroboration criteria
  - 7-step verification pipeline: collect → dedup/cluster → triage → geolocate → corroborate → verify → publish+monitor
  - "What we do not use" section: 5 items (dark-web, subscription, AI primary, anonymous, atrocity imagery)
  - Geolocation standards section (Bellingcat standard, SunCalc)
  - Editorial independence statement
  - `TechArticle` JSON-LD

---

### 4. Glossary — Transliteration field

**Files changed:**
- `apps/web/src/lib/seed-data.ts` (EDITED)
  - Added `transliteration?: string` to `GlossarySeed` type
  - 30 terms enriched with Latin-script transliterations of Ukrainian term names (e.g., `Heolokatsiia`, `Otsinka dostovirnosti`, `Radioelektronna borotba (REB)`, `Vnutrishno peremishchena osoba (VPO)`)
- `apps/web/src/app/[locale]/glossary/page.tsx` (EDITED)
  - Index shows `transliteration` inline next to the term name for non-EN locales (monospace, muted)
- `apps/web/src/app/[locale]/glossary/[slug]/page.tsx` (EDITED)
  - Detail page shows `transliteration` above definition paragraph for non-EN locales

---

### 5. Threats hub — Region + category URL-driven filters

**Files changed:**
- `apps/web/src/app/[locale]/threats/page.tsx` (REWRITTEN)
  - Added `searchParams: Promise<{ region?: string; category?: string }>`
  - Category filter chips from `uniqueCategories` (6 categories)
  - Region filter chips from `uniqueRegions` (unique ISO2 from `affectedRegions[]` across all threats)
  - `buildHref(overrides)` helper for URL state preservation (both filters coexist)
  - "N / total threats" count shown when filter active
  - Empty state when no threats match
  - "Read full threat page →" CTA added to cards
  - Cross-link block at bottom: Conflicts, Regions, Glossary, Scoring methodology
  - `CollectionPage` JSON-LD still uses full `allThreats` list (unfiltered)

---

### 6. Investigations — Question, caveats, contributors

**Files changed:**
- `apps/web/src/lib/investigations-seed.ts` (EDITED)
  - Added `question?: string`, `caveats?: string[]`, `contributors?: string[]` to `Investigation` type
  - `iran-russia-drone-supply-chain`: question + 3 caveats + 2 contributors
  - `crimea-bridge-infrastructure`: question + 2 caveats + 1 contributor
  - `black-sea-magura-usv-operations`: question + 2 caveats + 2 contributors
- `apps/web/src/app/[locale]/investigations/[slug]/page.tsx` (EDITED)
  - Byline now shows `contributors` list if present
  - Research question rendered as an accent-bordered box above key findings
  - Caveats rendered as amber-flag list after body sections

---

## TODO files updated

| File | Before | After |
|------|--------|-------|
| `TODO/pages/TODO_docs.md` | 7/11 | 10/11 |
| `TODO/pages/TODO_glossary.md` | 5/10 | 6/10 |
| `TODO/pages/TODO_threats_hub.md` | 0/8 | 6/8 |
| `TODO/pages/TODO_investigations.md` | 0/9 | 5/9 |

---

## Open follow-ups

- Docs: UK translation of all three new pages (deferred Phase 3)
- Glossary: AI-assisted seeding, public contribution, citation rules
- Threats: Severity index display, civilian-mode UI variant
- Investigations: Embedded maps/timelines, DOI, reader tip submission
- Pricing: Feature comparison matrix, add-ons section, vertical packages
- Sources: CSV export, pagination
- Regions: Mini-map embed, time-series chart, top sources per region
