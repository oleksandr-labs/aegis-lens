# TODO — Live Blog (Crisis Ticker Page)

## Goal
A standalone real-time live-blog page per active crisis (Liveuamap/BBC-live-page style: reverse-chronological micro-updates, auto-refresh) — distinct from the static `pages/TODO_blog.md` (long-form articles) and the embeddable ticker widget (`features/TODO_embeds_widgets.md`, in-app only).

## Progress
- 0 / 5 done

## URLs
- `/live` (index of active live blogs) · `/live/<crisis-slug>` (e.g. `/live/ua-ru`)

## Tasks
- [ ] `/live/<crisis-slug>` page: reverse-chronological micro-update feed, SSE/polling live updates (reuse SSE plumbing from Sprint 2.58 map updates)
- [ ] Each entry: timestamp, short text, optional media/map-pin embed, verification badge, permalink anchor
- [ ] `/live` index: active vs archived live blogs, per-crisis subscribe/notify CTA
- [ ] `LiveBlogPosting` schema.org markup (Google's live-blog structured data) — required for News/Top Stories eligibility, ties into `seo/TODO_news_seo.md`
- [ ] Archive behavior when a live blog closes (convert to static timeline, keep URL, add closing summary)

## Notes
- Reuses `conflicts/TODO_conflict_framework.md` per-conflict data and the SSE infrastructure already built for the live map — this is a content-surface gap, not an infra gap.

## i18n
- EN + UK simultaneous publishing required (live-blog delay between locales undermines the "real-time" value prop).
