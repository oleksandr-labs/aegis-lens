# Sprint 2.18 — Progress

**Theme:** Media library — case studies (sales/conversion), podcast (long-form audio), video library.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Case studies (`/case-studies`, `/case-studies/<slug>`)
- [x] `lib/case-studies-seed.ts` — 5 anonymized seed studies across Defense (EU ministry), Journalism (investigative newsroom), Humanitarian (NGO), Finance (bank compliance), Energy (regional utility). Each carries: challenge → solution → outcome, three calibrated metrics, optional attributed quote, tag slugs, Aegis Lens surfaces in use.
- [x] `/case-studies` — chronological card list with industry · region · YYYY-MM eyebrow; explicit "anonymized by design" disclaimer.
- [x] `/case-studies/[slug]` — full detail with challenge/solution/outcome sections, KPI cards, blockquote, "surfaces in use" chips, related case studies (same industry or region). Article + BreadcrumbList JSON-LD with `about` thing.

### Podcast (`/podcast`, `/podcast/<slug>`)
- [x] `lib/podcast-seed.ts` — 3 seed episodes for "Aegis Lens — Field Notes": "What OSINT actually is", "Inside the Shahed launch site network reconstruction", "Verification under deadline". Each: episode number, duration, summary, guest list (name + role), show-notes paragraphs, chapter markers (`startSeconds` + title), publishable transcript paragraphs, tags.
- [x] `/podcast` — series index with PodcastSeries JSON-LD; transcript-required policy disclosed.
- [x] `/podcast/[slug]` — episode detail with guests block, show notes, chapters table (mm:ss + title), full transcript. PodcastEpisode `partOfSeries` → PodcastSeries + BreadcrumbList JSON-LD with proper `duration` ISO-8601.

### Videos (`/videos`, `/videos/<slug>`)
- [x] `lib/videos-seed.ts` — 4 seed videos across categories explainer / walkthrough / investigation / briefing. Each: title, duration, summary, chapters, transcript paragraphs, linked surfaces (event / report / investigation), tags.
- [x] `/videos` — category-grouped index.
- [x] `/videos/[slug]` — detail with aspect-video player placeholder (real player wired when hosting is set up), chapter table, referenced surfaces resolved to URLs, full transcript, related-in-category footer. VideoObject (with `hasPart` Clips for chapters) + BreadcrumbList JSON-LD.

### Plumbing
- [x] `urls.caseStudies`, `urls.caseStudy`, `urls.podcast`, `urls.podcastEpisode`, `urls.videos`, `urls.video` added to `@aegis/url-builder`.
- [x] Sitemap: +3 indexes + 12 detail URLs (5 case studies, 3 episodes, 4 videos).
- [x] Footer Resources column: `Case studies`, `Podcast`, `Videos`.

---

## Files touched

New:
- `apps/web/src/lib/case-studies-seed.ts`
- `apps/web/src/lib/podcast-seed.ts`
- `apps/web/src/lib/videos-seed.ts`
- `apps/web/src/app/[locale]/case-studies/page.tsx`
- `apps/web/src/app/[locale]/case-studies/[slug]/page.tsx`
- `apps/web/src/app/[locale]/podcast/page.tsx`
- `apps/web/src/app/[locale]/podcast/[slug]/page.tsx`
- `apps/web/src/app/[locale]/videos/page.tsx`
- `apps/web/src/app/[locale]/videos/[slug]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+6 helpers)
- `apps/web/src/app/sitemap.ts` (+3 imports, +3 loops + 3 indexes)
- `apps/web/src/components/Footer.tsx` (+3 links)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_case_studies.md` — **4 / 5 done** ✓ Sprint 2.18 (per-tier featured placement on pricing deferred)
- `TODO/programmatic/TODO_template_podcasts.md` — **3 / 4 done** ✓ Sprint 2.18 (RSS / Atom feed deferred until hosting is real)
- `TODO/programmatic/TODO_template_videos.md` — **4 / 4 done** ✓ Sprint 2.18

## Open follow-ups
- [ ] Real audio / video hosting (Spotify / Apple Podcasts; Cloudflare Stream or self-hosted HLS for video)
- [x] Podcast RSS / Atom feed at `/podcast/feed.xml` ✓ Sprint 2.19 (RSS 2.0 + iTunes namespace fields: duration, episode number, episodeType, author/owner)
- [x] Per-tier featured case-study placement on `/pricing` ✓ Sprint 2.21 (Pro / Team / Enterprise tiers each surface a "Used by — {client} → Read case study" card; bottom block lists 6 more stories)
- [x] `/videos/<category>` per-category index pages ✓ Sprint 2.22 (mounted under `/videos/category/<slug>` to avoid colliding with the per-video `[slug]` route)
- [x] OG images for case-study / podcast / video detail ✓ Sprint 2.24 (Satori cards with industry · region eyebrow + client / Ep. number · duration · date + guests / category · duration · date)
- [ ] Localize transcripts + show notes to UK
