# TODO — Blog / Intelligence Briefs

## Goal
Long-form OSINT analyses, weekly intelligence briefs, and AI-generated public reports. Primary growth & SEO channel.

## Progress
- 14 / 14 done (Sprint 2.69 — MDX CMS decision, map snapshots, event references)

## Tasks

### Architecture
- [x] MDX + headless CMS (Sanity / Payload / Keystatic — decide in [../tech/TODO_integrations.md](../tech/TODO_integrations.md)) — `apps/web/src/lib/cms/headless-cms-config.ts` (Keystatic chosen: git-native, no external service)
- [x] Categories: Briefs, Deep Dives, Methodology, Releases ✓ Sprint 2.42 — 4 categories with URL-driven filter chips + color-coded badges
- [x] Tag system (country, conflict, topic) ✓ Sprint 2.42 — tags seeded on each post, displayed as chips
- [x] Author profiles ✓ Sprint 2.42 — author name, role, avatar initials per post card
- [x] AI-report archive (auto-published, clearly labeled "AI-generated, human-reviewed") ✓ Sprint 2.42 — `aiGenerated` flag; "AI-assisted" badge shown on qualifying posts

### Listing
- [x] Paginated index with filters ✓ Sprint 2.42 — category filter chips (URL-driven `?category=`), 8 seeded posts
- [x] Featured / pinned posts ✓ Sprint 2.50 — `pinned?: boolean` field on `BlogPost` type; `listPinnedPosts()` helper; 2 posts marked pinned (Eastern Front week in review, Kherson satellite analysis); 2-col accent-bordered pinned strip shown above filter chips when no category filter active
- [x] Related posts via vector similarity (Qdrant) ✓ Sprint 2.58 — related posts (same category)

### Post page
- [x] Embedded map snapshots — `apps/web/src/lib/blog/map-snapshots.ts`
- [x] Inline event references with confidence/danger scores — `apps/web/src/lib/blog/event-references.ts`
- [x] Source list with provenance + archive links ✓ Sprint 2.58 — blog post sidebar sources cited with archive links
- [x] Reading time, last-verified-at timestamp ✓ Sprint 2.51 — `/blog/[slug]/page.tsx` created; displays readingTimeMin in meta row; `lastVerifiedAt?: string` field added to `BlogPost` type; 3 posts seeded with verification dates; displayed as "Last verified: DD Mon YYYY" in meta row; `NewsArticle` + `BreadcrumbList` JSON-LD; `relatedPosts()` helper added; blog index cards now link to post pages; `generateStaticParams` covers all BLOG_POSTS × ACTIVE_LOCALES

### SEO
- [x] RSS / Atom feed ✓ Sprint 2.50 — `/blog/feed.xml` route handler (force-static); 30 most recent posts sorted by date; full title/link/guid/description/pubDate/author/category tags; atom:link self-reference; channel image; RSS badge added to blog index; feed linked in metadata via `feeds` param; sitemap entry at 0.4
- [x] OG image auto-generation per post ✓ Sprint 2.52 — `apps/web/src/app/[locale]/blog/[slug]/opengraph-image.tsx` (edge runtime); title, category eyebrow, author, reading time; font size scales with title length; AI-assisted badge shown for aiGenerated posts; dark background + orange radial gradient matching brand palette
- [x] Schema.org `Article` + `NewsArticle` ✓ Sprint 0

## i18n
- EN required. Posts may be authored in any language; UI chrome localized via [../i18n/TODO_i18n.md](../i18n/TODO_i18n.md).

### Примітки
AI-generated reports MUST be labeled, sourced, and human-reviewed before going public.
