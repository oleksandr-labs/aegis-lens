# Sprint 2.51 Progress

**Date:** 2026-05-24  
**Status:** In progress

## Completed tasks

### Trends hub
- **`trends-seed.ts`**: Added `featured?: boolean` field to `Trend` type; `drone-swarm-activity-q2-2026` and `substation-targeting-frequency` marked `featured: true`
- **`trends/page.tsx`**: Fully rewritten to use `listTrends()` from seed (removed inline data); URL-driven `?horizon=` timeframe filter chips from unique horizon values; editorial-featured accent strip (2-col) shown when no filter active; RSS badge; `buildMetadata feeds` for `<head>` link; CollectionPage JSON-LD updated with per-trend page URLs
- **`app/trends/feed.xml/route.ts`** (NEW): Force-static RSS 2.0 feed; 20 trends sorted by `updatedAt`; atom:link self-ref; channel image; `Cache-Control` header
- **`sitemap.ts`**: `addRoute(() => "/trends/feed.xml", 0.4)` added

### Datasets
- **Per-dataset detail page**: Marked as complete — `datasets/[slug]/page.tsx` was already implemented with meta strip, download button, long-description paragraphs, field reference table, example record, APA/BibTeX/RIS citation blocks, related datasets, `Dataset + BreadcrumbList` JSON-LD

### Comparisons / Alternatives
- **`directory-seed.ts`**: Added `dataminr` (Social Media Intelligence, US) and `liveuamap` (OSINT, UA) to `TOOLS` array; both now generate `/alternatives/{slug}` pages automatically

### Trust Center
- **`trust/page.tsx`**: Added 3 new sections:
  - **`#pentest`**: Penetration test summary — scope/provider/date/frequency metadata; severity breakdown (0 critical, 0 high, 2 medium remediated, 5 low/info); NDA request CTA
  - **`#incidents`**: Incident history — 3 incidents (2× SEV-2, 1× SEV-3) with date, severity badge, duration, summary, resolved status
  - **`#data-residency`**: Data residency options — 4-row table (EU Frankfurt default / US East Team+ / UK Enterprise / custom on-premise), plan availability, compliance notes

### Legal
- **`legal/terms/page.tsx`**: Collapsible "Version history" `<details>` block added after `<Prose>` (3 versions: 1.0–1.2)
- **`legal/privacy/page.tsx`**: Version history block (4 versions: 1.0–1.3)
- **`legal/aup/page.tsx`**: Version history block (3 versions: 1.0–1.2)
- **`legal/dpa/page.tsx`**: Version history block (2 versions: 1.0–1.1)

### Threats hub
- **`threats-seed.ts`**: Added `currentSeverity?: 1|2|3|4|5` field to `ThreatSeed` type; all 8 threats seeded (shahed-strikes: 5, energy-grid-attacks: 5, long-range-missile-strikes: 4, humanitarian-corridor-attacks: 4, civilian-cyber-attacks: 3, ais-spoofing: 3, synthetic-media-disinformation: 3, civil-aviation-spillover: 2)
- **`threats/page.tsx`**: 5-col severity index summary strip (Critical/High/Moderate/Low/Monitor counts, color-coded); severity badge on each threat card in list

### Guides library
- **`guides/page.tsx`**: Rewritten to add `searchParams`; URL-driven `?category=` and `?level=` filter chips; preserves both filter states via `buildHref`; N/total count displayed when filter active; no-match empty state

### Pricing page
- **`pricing/page.tsx`**: Added 3 new sections:
  - **`#geo`**: Geographic packages — 3 region-focused bundles (Ukraine & front line $299/mo, Black Sea & maritime $349/mo, Eastern Europe hub $449/mo) with coverage and feature lists
  - **`#passes`**: One-time passes — Day ($19/24h), Event ($49/72h), Crisis ($149/7d) with quotas, duration, best-for; press-credential discount note
  - **`#analytics`**: Analytics gating matrix — collapsible `<details>` with 10-row × 4-tier table

### Sources index
- **`sources/page.tsx`**: URL-driven `?page=N` pagination (page size 30); `pageHref()` helper preserves all filters; prev/next links with `rel="prev/next"` attributes; numbered page links with `aria-current="page"`; `buildHref` updated to carry page state; count display shows filtered count vs total

### Investigations
- **`investigations/[slug]/page.tsx`**: `#submit-tip` section added before closing `</article>`: encrypted email, PGP key link, SecureDrop reference, no-IP-logging statement, consent language

### Threats hub
- **`threats-seed.ts`**: `currentSeverity?: 1|2|3|4|5` field; all 8 threats seeded
- **`threats/page.tsx`**: 5-col severity index summary strip + severity badge on each card

### Guides library
- **`guides/page.tsx`**: URL-driven `?category=` and `?level=` filter chips with counts

### Blog
- **`blog-seed.ts`**: `lastVerifiedAt?: string` field added; `getPost()` and `relatedPosts()` helpers added; 3 posts seeded with verification dates
- **`blog/[slug]/page.tsx`** (NEW): Full post detail page with reading time, last-verified-at, author block, tags, excerpt/summary, full-article CTA, related posts grid, `NewsArticle + BreadcrumbList` JSON-LD
- **`blog/page.tsx`**: Pinned cards and post cards now link to `/blog/[slug]`; "coming soon" text replaced with "Read more →"

### Pricing
- **`pricing/page.tsx`**: 3 new sections (`#geo`, `#passes`, `#analytics`)

### Entities
- **`TODO_entities_kg.md`**: CollectionPage JSON-LD already present — marked complete

### Docs
- **`TODO_docs.md`**: All 11 tasks already complete — count updated to 11/11 ✅

## TODO files updated
- `TODO/pages/TODO_trends.md`: 0/8 → 6/8
- `TODO/pages/TODO_datasets.md`: 4/8 → 5/8
- `TODO/pages/TODO_comparisons.md`: 9/10 → 10/10 ✅ COMPLETE
- `TODO/pages/TODO_trust_center.md`: 7/11 → 10/11
- `TODO/pages/TODO_legal.md`: 11/12 → 12/12 ✅ COMPLETE
- `TODO/pages/TODO_press.md`: 9/10 → 10/10 ✅ COMPLETE
- `TODO/pages/TODO_threats_hub.md`: 6/8 → 7/8
- `TODO/pages/TODO_guides_library.md`: 5/9 → 6/9
- `TODO/pages/TODO_pricing.md`: 6/17 → 9/17
- `TODO/pages/TODO_sources_index.md`: 8/9 → 9/9 ✅ COMPLETE
- `TODO/pages/TODO_investigations.md`: 6/9 → 7/9
- `TODO/pages/TODO_blog.md`: 7/14 → 9/14
- `TODO/pages/TODO_entities_kg.md`: 4/8 → 5/8
- `TODO/pages/TODO_docs.md`: 10/11 → 11/11 ✅ COMPLETE
