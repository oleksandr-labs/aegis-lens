# Sprint 2.42 — Progress

**Theme:** Blog posts with categories/tags/author, Community hub, Pricing FAQ + grants, Dataset filter chips.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Blog — seeded posts, category filter, author display, AI label
- [x] New `lib/blog-seed.ts`: 8 seeded posts across 4 categories (Briefs, Deep Dives, Methodology, Releases), with tags, author, authorRole, readingTimeMin, aiGenerated flag.
- [x] Updated `/blog` index: category filter chips (URL-driven `?category=`), per-post card with category badge, AI-assisted badge, date, reading time, excerpt, author avatar + role, tag chips.
- [x] `Blog` Schema.org JSON-LD with `blogPost` array (Article or NewsArticle per post, based on aiGenerated flag).
- [x] Subscribe CTA at bottom linking to home page newsletter section.
- [x] Closes blog TODOs: categories, tag system, author profiles, AI-report labeling, paginated index with filters.

### Community — `/community` hub page (new)
- [x] New page at `/community` with 4 sections:
  - **Channels**: Discord, Telegram, GitHub, Newsletter — each with platform, description, join link.
  - **Contribute**: 5 contribution types (tip submission, geolocation, translation, methodology review, data quality) with badge labels.
  - **Verified contributor program**: description of program, 5 perks listed, application info.
  - **Code of conduct**: 6-point numbered conduct list with abuse@aegislens.io reporting.
  - **Events**: placeholder for AMAs/workshops.
- [x] Schema.org `WebPage` JSON-LD.
- [x] Closes community TODOs: `/community` hub, Discord/Telegram channel cards, verified contributor program, code of conduct.

### Pricing — FAQ block + grants section + Talk to sales
- [x] **Grants & free programs** section (`#grants`): 4 programs — press/journalism, NGO/humanitarian, academic research, Ukraine residents. Apply via grants@aegislens.io.
- [x] **Enterprise & government** section (`#contact`): description of custom scoping, 1-day response commitment, sales@aegislens.io CTA button.
- [x] **Pricing FAQ** (`#faq`): 7 collapsible Q&A items:
  - Plan switching (proration, timing)
  - API quota overages (429, no auto-charge, 80% notification)
  - Annual billing (up-front, save 20%)
  - Refund policy (14 days full, prorated after)
  - Free trial (14-day Pro, no credit card)
  - Multi-year contract discounts (25–35%)
  - Team seat definition
- [x] Closes pricing TODOs: grants/free programs, talk to sales, FAQ block.

### Datasets — format + license filter chips
- [x] Added `searchParams: Promise<{ format?: string; license?: string }>` to `DatasetsPage`.
- [x] Computed `ALL_FORMATS` and `ALL_LICENSES` from DATASETS array.
- [x] Filter chips bar: Format row (All + each unique format) + License row (All + each unique license).
- [x] Active chip highlighted with `border-accent bg-accent/10 text-accent`.
- [x] Counter badge: `N / M datasets` showing filtered vs total count.
- [x] Closes datasets TODO: filter by format/license.

---

## Files touched

New:
- `apps/web/src/lib/blog-seed.ts`
- `apps/web/src/app/[locale]/community/page.tsx`
- `TODO/SPRINT_2_42_PROGRESS.md`

Edited:
- `apps/web/src/app/[locale]/blog/page.tsx` — full rewrite with seeded posts
- `apps/web/src/app/[locale]/pricing/page.tsx` — grants + sales + FAQ sections appended
- `apps/web/src/app/[locale]/datasets/page.tsx` — searchParams + filter chips
- `TODO/pages/TODO_blog.md` — 5 tasks closed
- `TODO/pages/TODO_community.md` — 4 tasks closed
- `TODO/pages/TODO_pricing.md` — 3 tasks closed
- `TODO/pages/TODO_datasets.md` — 2 tasks closed (listing page + filter)

---

## TODO bookkeeping
- `TODO/pages/TODO_blog.md` — Progress: 1→5/14
- `TODO/pages/TODO_community.md` — Progress: 0→4/10
- `TODO/pages/TODO_pricing.md` — 3 tasks closed (grants, sales CTA, FAQ)
- `TODO/pages/TODO_datasets.md` — Progress: 1→3/8

## Open follow-ups
- [ ] Blog: individual post pages (MDX or headless CMS)
- [ ] Blog: featured/pinned posts
- [ ] Blog: RSS/Atom feed
- [ ] Blog: OG image auto-generation per post
- [ ] Community: contributor leaderboard
- [ ] Community: bounty board
- [ ] Community: Discord server launch (unblocks verified contributor applications)
- [ ] Pricing: Stripe Checkout integration
- [ ] Pricing: currency selector
- [ ] Datasets: per-dataset detail pages (description, schema, sample, DOI)
- [ ] Datasets: notify-on-update RSS/email
