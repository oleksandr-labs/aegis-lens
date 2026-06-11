# TODO — Next.js App Router Architecture

## Goal
A solid, conventions-driven Next.js 15+ codebase that scales to dozens of routes and a real-time workspace.

## Progress
- 10 / 14 done (Sprint 2.59)

## Tasks
- [x] App Router with route group `(auth)` ✓ Sprint 0 (more groups Phase 1)
- [x] RSC by default; `"use client"` only on MapPlaceholder + error.tsx ✓ Sprint 0
- [ ] Server Actions for mutations where suitable
- [ ] Streaming SSR with Suspense boundaries per panel
- [ ] Parallel routes for workspace panels (modal interception)
- [x] Locale segment `[locale]` with middleware negotiation ✓ Sprint 0
- [x] Metadata API per route ✓ Sprint 0
- [x] Sitemap + robots generated programmatically ✓ Sprint 0
- [x] Edge runtime for OG / icon routes ✓ Sprint 0
- [x] Per-route caching policy (force-dynamic / revalidate / static) ✓ Sprint 2.59 — revalidate/force-static added to about/press/scoring/docs + ISR on glossary/equipment/topics
- [x] Loading + error UI per segment ✓ Sprint 0
- [x] Not-found UI ✓ Sprint 0
- [x] PWA manifest ✓ Sprint 0 (service worker Phase 2)
- [x] Strict TypeScript ✓ Sprint 0 (Biome/oxlint Phase 1)

## i18n
- Pairs with `next-intl`; locale embedded in every route segment.

### Примітки
Avoid `"use client"` at the root of marketing pages — kills SEO + performance.
