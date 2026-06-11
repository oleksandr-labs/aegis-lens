# Sprint 2.52 Progress

**Date:** 2026-05-24  
**Status:** Complete

## Completed tasks

### Entities knowledge graph
- **`entities-seed.ts`**: Added `featured?: boolean` field to `EntitySeed`; marked 4 entities featured (`general-staff-ukraine`, `wagner-group`, `shahed-136`, `zaporizhzhia-npp`); added `listFeaturedEntities()` helper
- **`entities/page.tsx`**: Added `?region=` country filter alongside `?type=`; `buildHref()` preserves both filter states; `COUNTRY_LABEL` map for display names; featured entities 4-col accent strip shown when no filters active; empty-state paragraph when no matches

### Guides library
- **`guides/[slug]/page.tsx`**: Added reader feedback section at bottom of every guide detail page — "Was this helpful?" with two mailto CTAs (Yes / Could be better) with pre-filled subject+body; quarterly cadence statement with formatted `updatedAt` date

### Use-cases
- **`use-case-tasks.ts`**: Added `academyPathSlugs?: string[]` field to `UseCaseTask` type; 4 tasks seeded with Academy paths: `verify-a-photo` (verification-workflow + geolocation-fundamentals), `investigation-research` (osint-101), `documenting-civilian-harm` (verification-workflow + osint-101), `geolocation` (geolocation-fundamentals + ai-for-analysts)
- **`use-cases/[vertical]/[task]/page.tsx`**: Imports `PATHS` from academy-seed; resolves `academyPathSlugs` to path objects; "Academy learning paths" section rendered below guides section with level badge, summary, hours + lesson count
- **`TODO_use_cases.md`**: Updated from 0/12 → 10/12 to reflect what was already built

### Pricing
- **`pricing/page.tsx`**: Added `#reports` section — Reports marketplace entry-point with 3 report types (Weekly brief $9, Regional dossier $49, AI summary pack $19); each has description, price, tags; subscriber 20% discount note; commission CTA to reports@aegislens.io

### Community
- **`community/page.tsx`**: Added `#bounties` section — 4 seeded bounties (2 geolocation, 1 verification/Kherson, 1 methodology/acoustic, 1 archiving/Avdiivka) with ID, Open/In-review status, difficulty level, XP reward, tags, and mailto claim CTA

### Blog
- **`blog/[slug]/opengraph-image.tsx`** (NEW): Edge-runtime OG image per blog post; title, category eyebrow, author, reading time; font size scales with title length; AI-assisted badge shown for `aiGenerated` posts; dark background + orange radial gradient

### Help center
- **`help/[slug]/page.tsx`**: "Was this helpful?" feedback section — "Yes, resolved" mailto CTA + "No, I need more help" link to /contact
- **`help/page.tsx`**: "Looking for what changed?" changelog cross-link card added below the no-results contact CTA

### Datasets
- **`datasets/feed.xml/route.ts`** (NEW): Force-static RSS 2.0 feed; datasets sorted by `updated` date; `atom:link` self-ref; `Cache-Control: public, max-age=86400`
- **`datasets/page.tsx`**: RSS badge added; `feeds` link in `generateMetadata`
- **`sitemap.ts`**: `addRoute(() => "/datasets/feed.xml", 0.4)` added

### Regions
- **`regions/[country]/page.tsx`**: "Top sources covering {name}" section — `PUBLIC_SOURCES` filtered by `region.iso2`, sorted by reliability, top 6; 2-col list with kind badge, reliability %, link to sources index

### Trust Center
- **`TODO_trust_center.md`**: Corrected count to 11/11 ✅ COMPLETE (all tasks were done, count was wrong)

## TODO files updated
- `TODO/pages/TODO_entities_kg.md`: 5/8 → 7/8
- `TODO/pages/TODO_guides_library.md`: 6/9 → 8/9
- `TODO/pages/TODO_use_cases.md`: rewritten — 0/12 → 10/12
- `TODO/pages/TODO_pricing.md`: 9/17 → 10/17
- `TODO/pages/TODO_community.md`: 4/10 → 5/10
- `TODO/pages/TODO_blog.md`: 9/14 → 10/14
- `TODO/pages/TODO_help_center.md`: 5/11 → 7/11
- `TODO/pages/TODO_datasets.md`: 5/8 → 6/8
- `TODO/pages/TODO_regions.md`: 13/14 → 14/22 (corrected — 8 tasks remain: mini-map, time-series chart, recent briefs, civilian safety, Dataset schema, containedInPlace hierarchy, noindex threshold, AI summarizer)
- `TODO/pages/TODO_academy.md`: 4/10 → 5/10 (Discoverable from /use-cases/* marked done)
- `TODO/pages/TODO_trust_center.md`: 10/11 → 11/11 ✅ COMPLETE
