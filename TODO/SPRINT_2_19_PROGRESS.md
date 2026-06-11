# Sprint 2.19 — Progress

**Theme:** Sub-page multipliers — per-event facets, per-partner profiles, per-lesson Academy deep links, podcast RSS feed.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Event detail sub-pages (`/events/<id>/<facet>`)
Four facet pages per event, all with Article + BreadcrumbList JSON-LD and cross-links between facets:
- [x] `/events/[id]/timeline` — Occurred / Reported / Ingested timeline cards + verification-state explainer with link into `/scoring/confidence`.
- [x] `/events/[id]/sources` — provenance gallery. Per-source URL (nofollow noopener), fetched-at timestamp, language, archive availability link, content hash. Links to `/methodology/source-tiering`.
- [x] `/events/[id]/media` — gallery grid with placeholder tiles + raw media-record JSON (until real assets land); explicit "no published media" empty state pointing at `/methodology/ethics`.
- [x] `/events/[id]/related` — same-class, same-oblast (via `findOblast`), and same-48h-window event groupings.

### Partners programmatic (`/partners/<slug>`)
- [x] `lib/partners-seed.ts` — 5 seed partners across tiers: Strategic (Northstar Defense Consulting, Panoptic Geospatial), Implementation (Civitas Humanitarian Systems, Harbor Bridge Financial Intelligence), OSINT-research (Open Newsroom Collective). Each: tier, expertise, engagement model, outcomes list, co-marketing assets with ready/planned status, industries, regions, tags.
- [x] `/partners/[slug]` — full profile with tier badge, eyebrow showing industries + regions, tags → `/tags`, expertise/engagement/outcomes sections, assets table (ready vs planned), same-tier siblings footer, contact CTA. Organization JSON-LD with `ProgramMembership` for tier; BreadcrumbList.

### Academy lesson deep links (`/academy/<path>/<lesson>`)
- [x] `/academy/[slug]/[lesson]` — per-lesson page with learning-outcome card, lesson-plan template, prev/next navigation (jumps to next path on the last lesson), parent-path crumb. LearningResource (`timeRequired`, `teaches`, `isPartOf` Course) + BreadcrumbList JSON-LD.

### Podcast RSS (`/podcast/feed.xml`)
- [x] Root-level RSS 2.0 handler (middleware skips dot paths). iTunes namespace fields: `<itunes:duration>` (ISO-8601), `<itunes:episode>`, `<itunes:episodeType>`, `<itunes:author>`, `<itunes:owner>`, `<itunes:explicit>`. `atom:link self`, proper RFC-822 `pubDate`, HTML-escaped titles/descriptions.

### Plumbing
- [x] `urls.eventTimeline`, `urls.eventSources`, `urls.eventMedia`, `urls.eventRelated`, `urls.partner`, `urls.academyLesson` added to `@aegis/url-builder`.
- [x] Sitemap: +1 import (PARTNERS), +4 event-sub-page loops (timeline / sources / media / related), +1 partners loop, +1 academy-lesson nested loop.

---

## Files touched

New:
- `apps/web/src/app/[locale]/events/[id]/timeline/page.tsx`
- `apps/web/src/app/[locale]/events/[id]/sources/page.tsx`
- `apps/web/src/app/[locale]/events/[id]/media/page.tsx`
- `apps/web/src/app/[locale]/events/[id]/related/page.tsx`
- `apps/web/src/lib/partners-seed.ts`
- `apps/web/src/app/[locale]/partners/[slug]/page.tsx`
- `apps/web/src/app/[locale]/academy/[slug]/[lesson]/page.tsx`
- `apps/web/src/app/podcast/feed.xml/route.ts`

Edited:
- `packages/url-builder/src/index.ts` (+6 helpers)
- `apps/web/src/app/sitemap.ts` (+1 import, +3 loops covering N × 4 event sub-pages + N partners + N×M academy lessons)
- `TODO/SPRINT_2_18_PROGRESS.md` — podcast RSS follow-up ticked ✓ Sprint 2.19

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_event_detail.md` — sub-pages ticked ✓ Sprint 2.19 (4/5 items; finer noindex policy deferred)
- `TODO/programmatic/TODO_template_partners.md` — **4 / 4 done** ✓ Sprint 2.19
- `TODO/programmatic/TODO_template_courses.md` — **4 / 5 done** ✓ Sprint 2.19 (free/paid tier flags deferred; module-level URL deferred until path size warrants it)
- `TODO/SPRINT_2_18_PROGRESS.md` — podcast RSS ticked ✓ Sprint 2.19

## Open follow-ups
- [ ] Module-grouped academy paths (`/academy/<path>/<module>/<lesson>`) — when path sizes grow past ~10 lessons
- [ ] Free/paid tier flags on Academy lessons, gated on `aegis_session` plan
- [ ] Quiz UI per lesson
- [ ] Real media assets so `/events/<id>/media` renders something
- [ ] Verified-status indexing rules on event sub-pages
- [ ] Partner logos under `/public/brand/partners/`
- [ ] Apple Podcasts directory submission once hosting is real
