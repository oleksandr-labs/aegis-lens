# Sprint 2.47 Progress

**Date:** 2026-05-24
**Status:** Complete

---

## Tasks completed

### 1. Conflict detail pages — full enrichment

**Files changed:**
- `apps/web/src/lib/seed-data.ts` (EDITED)
  - Added 4 new types: `ConflictParty`, `ConflictTimelineEvent`, `ConflictStat`, `ConflictCitation`
  - Extended `ConflictSeed` with optional fields: `statusDate?`, `parties?`, `timelineEvents?`, `keyStats?`, `reportSlugs?`, `methodology?`, `citations?`, `disputedAreaNotice?`
  - Enriched `russia-ukraine` conflict entry:
    - 4 parties (Russia/aggressor, Ukraine/defender, UN/mediator, NATO+allies/observer) with localized descriptions
    - 8 timeline events from 2014 Crimea annexation through 2024 Kursk incursion, each with date/class/localized content
    - 6 key stats (IDPs, refugees, civilian casualties, territory under occupation, aid committed, start date)
    - Localized methodology paragraph explaining source chain and scoring
    - 6 citations (UN OHCHR, UNHCR, Kiel Institute, ISW, Bellingcat, ACLED)
    - Localized disputed-area notice citing UN GA resolution ES-11/1 (2022)
- `apps/web/src/app/[locale]/conflicts/[slug]/page.tsx` (REWRITTEN)
  - `generateStaticParams()` now covers all locales (removed `locale === "en" continue` guard)
  - JSON-LD: `@graph` with `Article` (`datePublished`, `dateModified`) + nested `Event` (`about`, `startDate`, `eventStatus`) + `BreadcrumbList`
  - Sections:
    1. Status badge with "since YYYY-MM" date
    2. Disputed-area notice (amber aside, conditional)
    3. Key stats grid (2–3 cols, stat cards with label/value/source)
    4. Parties grid (2-col cards, role badge with color coding: red=aggressor, green=defender, blue=mediator, zinc=observer)
    5. Timeline (vertical border-l list with class-coded dot badges: kinetic/diplomatic/humanitarian/information/political)
    6. Affected regions (linked chips)
    7. Methodology paragraph + "Spot an error? Let us know" link
    8. Citations list with type badges (official/academic/report/news)
    9. ← All conflicts back link

---

### 2. Changelog — area tags + author bylines

**Files changed:**
- `apps/web/src/app/[locale]/changelog/page.tsx` (EDITED)
  - Added `Area` type: `"map" | "AI" | "sources" | "API" | "billing" | "platform" | "docs" | "legal"`
  - Added `AREA_STYLES` record (color-coded border/bg/text per area)
  - Added `areas: Area[]` and `author: string` fields to `Entry` type
  - Populated `areas` and `author` for all 13 ENTRIES (Sprint 0 through Sprint 2.40)
  - Updated JSX: area chips render after the headline, author appears as monospace text aligned right
  - Changelog already in sitemap at priority 0.4 via `urls.changelog(lc)`

---

### 3. Competitors — BlackSky and Planet added

**Files changed:**
- `apps/web/src/lib/competitors-seed.ts` (EDITED)
  - Added `blacksky`: SAR + optical imagery positioning; 10-row comparison table; "when to choose them" (tasked sub-meter imagery, FedRAMP, SAR); 2 FAQs; complementary-not-competitive framing
  - Added `planet`: daily 3–5 m PlanetScope positioning; 10-row comparison table; "when to choose them" (daily change detection, education programme); 2 FAQs
  - `generateStaticParams()` in `/vs/[slug]/page.tsx` iterates `COMPETITORS` so picks up both automatically
  - `sitemap.ts` iterates `COMPETITORS` so both slugs get sitemap entries automatically

---

### 4. Docs TODO audit — marked existing pages as done

Pages that existed but were not checked off in TODO_docs.md:
- `/docs/getting-started` — full quickstart (5 steps), `TechArticle` JSON-LD ✓
- `/docs/webhooks` — request headers, sample payload, HMAC verification, delivery semantics ✓
- `/docs/sdks` — JS/TS/Python/cURL/Go/Ruby/PHP samples + OpenAPI + Postman downloads ✓
- `/docs/rate-limits` — per-endpoint table, response headers, 429 handling, backoff TypeScript impl ✓

---

## TODO files updated

| File | Before | After |
|------|--------|-------|
| `TODO/pages/TODO_conflicts.md` | 1/10 | 9/10 |
| `TODO/pages/TODO_changelog.md` | 5/9 | 7/9 |
| `TODO/pages/TODO_comparisons.md` | 7/10 | 9/10 |
| `TODO/pages/TODO_docs.md` | 2/11 | 7/11 |

---

## Open follow-ups

- Conflict pages: `reportSlugs[]` field added to type but no reports seeded yet — add when reports hub has conflict-tagged reports
- Changelog: In-app "what's new" panel; monthly email digest — future sprint
- Docs: Event schema & taxonomy reference; confidence/danger methodology; OSINT methodology guide
- Comparisons: `/alternatives/palantir`, `/alternatives/dataminr` etc. — alternatives route exists, needs data
