# TODO — Next.js Routing Implementation

## Goal
Concrete Next.js App Router setup that implements URL strategy.

## Progress
- 5 / 11 done (Sprint 0–2.2 — routing scaffold + generateMetadata + middleware)

## Tasks
- [x] Locale segment at root: `app/[locale]/...` ✓ Sprint 0 (middleware rewrite: EN at root, UK /uk/)
- [ ] Per-route group: `(marketing)`, `(workspace)`, `(auth)`, `(admin)`
- [ ] Dynamic routes for programmatic templates:
  - [ ] `app/[locale]/regions/[country]/[region]/page.tsx`
  - [ ] `app/[locale]/companies/[industry]/[city]/page.tsx`
  - [ ] `app/[locale]/tools/[category]/page.tsx`
  - [ ] `app/[locale]/conflicts/[slug]/page.tsx`
  - [ ] `app/[locale]/entities/[slug]/page.tsx`
- [x] `generateStaticParams` for top programmatic pages ✓ Sprint 1.5–2.2 (ACTIVE_LOCALES per route)
- [ ] ISR with revalidation per route (revalidate cadence per template)
- [x] `generateMetadata` per route (title / description / OG / canonical / hreflang) ✓ Sprint 0 (buildMetadata helper)
- [x] `not-found.tsx` per route + per-locale ✓ Sprint 0
- [x] Middleware: locale negotiation + redirect rules ✓ Sprint 0
- [ ] Edge runtime where viable (marketing + programmatic)

## i18n
- Locale segment everywhere; never hardcode EN paths.

### Примітки
This file is the bridge between [../urls_slugs/](../urls_slugs/) and actual code.
