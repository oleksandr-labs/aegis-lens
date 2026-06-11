# Sprint 2.43 — Progress

**Theme:** Team author profiles (E-E-A-T), Home press mentions, Alerts delivery channels, Sitemap expansion.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Team — `/team` index + `/team/<slug>` author profile pages
- [x] New `lib/team-seed.ts`: `TeamMember` type with `slug`, `initials`, `name`, `role`, `bio`, `longBio`, `credentials[]`, `publications[]`, `talks[]`, `sameAs[]`, `location`, `languages[]`. 3 seeded members: `a-lytvyn`, `m-kovalenko`, `o-didenko`.
- [x] New `apps/web/src/app/[locale]/team/page.tsx`: index listing all team members with credential bullets, location, languages, and "Full profile" link. Schema.org `@graph` with `WebPage` + `Organization` + one `Person` per member.
- [x] New `apps/web/src/app/[locale]/team/[slug]/page.tsx`: per-member profile page with identity card, long bio, credentials list, publications table, talks table, authored blog posts section, external links. Schema.org `ProfilePage` with inline `Person` including `worksFor`, `sameAs`, `knowsLanguage`, `hasCredential`, `author` (ScholarlyArticle per publication).
- [x] `urls.team(locale)` and `urls.teamMember(locale, slug)` added to `@aegis/url-builder`.
- [x] Closes E-E-A-T TODO tasks: `/team/<slug>` pages, bio/credentials/publications/talks, sameAs links, authored posts list, Schema.org Person.

### Home — "As seen in" press mentions block
- [x] `PRESS_MENTIONS: PressMention[]` array — 6 outlets: Bellingcat, GIJN, Rest of World, Kyiv Independent, Deutsche Welle, TechCrunch.
- [x] New section between partner strip and newsletter: outlet name chips as `<a>` links (open in new tab), `press@aegislens.io` CTA, `/press` link.
- [x] Closes home TODO: "As seen in / press mentions block".

### Alerts — Webhook + Telegram + delivery channels documentation
- [x] **Telegram section** (`#telegram`): 3-step setup guide (find bot, /start, /topics), join link.
- [x] **Webhooks section** (`#webhooks`): setup steps (account settings → integrations → add endpoint), JSON payload format (code block), retries (5× with exponential backoff), HMAC-SHA256 signature verification, 10s timeout note. Link to docs/webhooks.
- [x] **Delivery channels table** (`#channels`): 6 channels × 4 columns (channel, latency, filter support, plans): RSS/Atom, Email digest, Telegram bot, Webhook, Slack integration, API streaming (SSE).

### Sitemap — new routes added
- [x] `/community` (priority 0.5)
- [x] `/legal/aup` (priority 0.4)
- [x] `/team` index (priority 0.6)
- [x] `/team/<slug>` per team member (priority 0.5) — 3 routes
- [x] `/blog/<slug>` per blog post (priority 0.6) — 8 routes from `BLOG_POSTS`
- [x] `localePath` added to sitemap.ts imports from `@aegis/url-builder`.

---

## Files touched

New:
- `apps/web/src/lib/team-seed.ts`
- `apps/web/src/app/[locale]/team/page.tsx`
- `apps/web/src/app/[locale]/team/[slug]/page.tsx`
- `TODO/SPRINT_2_43_PROGRESS.md`

Edited:
- `packages/url-builder/src/index.ts` — `urls.team` + `urls.teamMember` added
- `apps/web/src/app/[locale]/page.tsx` — `PRESS_MENTIONS` array + "As seen in" section
- `apps/web/src/app/[locale]/alerts/page.tsx` — Telegram + Webhooks + delivery channels table
- `apps/web/src/app/sitemap.ts` — `/community`, `/legal/aup`, `/team`, `/team/<slug>`, `/blog/<slug>` added
- `TODO/seo/TODO_eeat_authors.md` — Progress 0→5/12; 5 tasks closed
- `TODO/pages/TODO_home.md` — Progress 11→12/18; press mentions closed

---

## TODO bookkeeping
- `TODO/seo/TODO_eeat_authors.md` — Progress: 0→5/12
- `TODO/pages/TODO_home.md` — Progress: 11→12/18

## Open follow-ups
- [ ] Team: `/team` page linked from nav/footer
- [ ] Team: bylines on blog post cards (link to `/team/<slug>`)
- [ ] Team: guest expert profiles
- [ ] Home: animated map-layer carousel
- [ ] Home: AI copilot demo section
- [ ] Alerts: Slack integration setup docs
- [ ] Alerts: API streaming (SSE) docs
- [ ] Blog: individual post pages (MDX or headless CMS)
- [ ] Blog: RSS/Atom feed
- [ ] Blog: OG image auto-generation per post
- [ ] Sitemap: news sitemap (last 48h) for Google News
- [ ] Sitemap: segmented sitemap-index.xml (Phase 2)
