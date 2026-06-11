# Sprint 2.10 — Progress

**Theme:** Big-multiplier programmatic SEO — X-for-Y cross-pivots, audience-keyed top lists, and the Academy.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### X-for-Y cross-pivots (master prompt: "AI for X", "OSINT for X", "Cybersecurity for X", "Intelligence for X", "Monitoring for X")
- [x] `lib/x-for-y.ts` — 5-lens config: `ai`, `osint`, `cybersecurity`, `intelligence`, `monitoring`. Each lens carries an intro, a parametric `problem(industry)`, 5 `applications(industry)`, and 3 `faqs(industry)` — all callable with the industry label injected.
- [x] `components/XForYPage.tsx` — single shared renderer. Hero + problem framing + numbered applications + featured tools (top 6 from industry) + featured companies (top 4 from industry) + parametric FAQ as `<details>` collapsibles + sibling-industries "X for other industries" footer.
- [x] 5 sibling routes:
  - `/ai-for/[industry]`
  - `/osint-for/[industry]`
  - `/cybersecurity-for/[industry]`
  - `/intelligence-for/[industry]`
  - `/monitoring-for/[industry]`
- [x] JSON-LD per page: `Article` + `FAQPage` (with parsed Q&A) + `BreadcrumbList`.
- [x] Multiplier: **5 lenses × ~18 industries × 2 locales = ~180 new pages**.

### Audience-keyed top lists (master prompt: "Best X for audience")
- [x] `lib/audiences-seed.ts` — 7 audiences with persona, preferred-category order, and per-audience considerations: analysts, journalists, ngos, defense, finance, government, researchers.
- [x] `/best-tools-for/[audience]` — per-audience ranked top 12. Score = preferred-category rank + verified bonus. Year-in-title, methodology block with preferred-category strip + considerations bullets, "last reviewed" date, per-row alternatives + detail links, sibling-audiences pivot footer.
- [x] `ItemList` (Descending) + `BreadcrumbList` JSON-LD.

### Academy
- [x] `lib/academy-seed.ts` — 4 seed learning paths: `osint-101`, `geolocation-fundamentals`, `verification-workflow`, `ai-for-analysts`. Each path: title, audience, level (beginner/intermediate/advanced), hours, summary, tags, optional certificate slug, ordered lessons (with per-lesson outcome + duration).
- [x] `/academy` — index sorted by level (beginner first). Cards show level / audience / hours / lesson-count / certificate badge.
- [x] `/academy/[slug]` — full path page with numbered lessons, tag pills linking to `/tags/<slug>`, related paths (tag overlap), cross-links to `/tools` and `/guides`.
- [x] JSON-LD per path: `Course` (with `educationalLevel`, `courseWorkload`) + per-lesson `LearningResource` (with `teaches`, `timeRequired`) + `BreadcrumbList`.

### Plumbing
- [x] `urls.aiFor`, `urls.osintFor`, `urls.cybersecurityFor`, `urls.intelligenceFor`, `urls.monitoringFor`, `urls.bestToolsForAudience`, `urls.academy`, `urls.academyPath` added to `@aegis/url-builder`.
- [x] Sitemap: 5 lens prefixes × industries (≈90 URL slots) + 7 audience top-lists + Academy index + 4 paths.
- [x] Footer: `Academy` added to Resources column.

---

## Files touched

New:
- `apps/web/src/lib/x-for-y.ts`
- `apps/web/src/lib/audiences-seed.ts`
- `apps/web/src/lib/academy-seed.ts`
- `apps/web/src/components/XForYPage.tsx`
- `apps/web/src/app/[locale]/ai-for/[industry]/page.tsx`
- `apps/web/src/app/[locale]/osint-for/[industry]/page.tsx`
- `apps/web/src/app/[locale]/cybersecurity-for/[industry]/page.tsx`
- `apps/web/src/app/[locale]/intelligence-for/[industry]/page.tsx`
- `apps/web/src/app/[locale]/monitoring-for/[industry]/page.tsx`
- `apps/web/src/app/[locale]/best-tools-for/[audience]/page.tsx`
- `apps/web/src/app/[locale]/academy/page.tsx`
- `apps/web/src/app/[locale]/academy/[slug]/page.tsx`

Edited:
- `packages/url-builder/src/index.ts` (+8 helpers)
- `apps/web/src/app/sitemap.ts` (+2 imports, +3 loops)
- `apps/web/src/components/Footer.tsx` (+1 link)

---

## TODO bookkeeping
- `TODO/programmatic/TODO_template_x_for_y.md` — **7 / 8 done** ✓ Sprint 2.10 (only "case studies" deferred until editorial copy is written)
- `TODO/programmatic/TODO_template_top_lists.md` — audience variant `/best-tools-for/<audience>` ticked ✓ Sprint 2.10 (fixed-N and region variants still deferred)
- `TODO/pages/TODO_academy.md` — **4 / 10 done** ✓ Sprint 2.10 (deferred: video/interactive, progress tracking, certificate verification URL, payment gating, programmatic course→topic landing)

## Open follow-ups
- [ ] Editorial case-study content per X-for-Y page (currently parametric-only)
- [ ] Localize X-for-Y copy beyond EN (lens labels + problem/applications/FAQs all in EN)
- [ ] Academy: quiz/interactive UI per lesson
- [ ] Academy: certificate verification endpoint at `/academy/verify/<token>`
- [ ] Academy: paid-tier gating wired into account flow
- [ ] Audience top lists: regional variant (`/best-osint-tools-for-analysts-in-eu`)
- [ ] Audience top lists: cross-reference featured threats/investigations per audience
