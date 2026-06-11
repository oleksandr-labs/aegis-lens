# TODO — Frontend Performance Budgets

## Goal
Hard, CI-enforced budgets per route.

## Progress
- 3 / 10 done (Sprint 2.59)

## Tasks
- [x] JS budget per route: marketing < 150KB, workspace < 600KB (gzip) — `apps/web/.size-limit.js` with marketing (150KB) + workspace (600KB) + CSS (80KB) limits
- [x] CSS budget < 80KB per route — `apps/web/.size-limit.js` global CSS limit 80KB
- [ ] LCP < 2.0s (P75) marketing; < 1.5s for landing
- [ ] INP < 200ms across the app
- [ ] CLS < 0.05
- [x] Image budget: < 200KB hero, AVIF/WebP, responsive `srcset` ✓ Sprint 2.59 — next.config images AVIF/WebP + minimumCacheTTL
- [ ] Font budget: subset, `font-display: swap`, single weight per face
- [ ] Third-party script audit (no blocking, no heavy trackers)
- [ ] CI gate: Lighthouse + bundle-analyzer + size-limit
- [ ] RUM dashboard tracking budget compliance

## i18n
- Per-locale font subsets sized separately.

### Примітки
Budgets are ceilings, not goals. Aim for 70% utilization.
