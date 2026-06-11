# TODO — Animation System

## Goal
Consistent, performant animation primitives across marketing and workspace.

## Progress
- 8 / 8 done

## Tasks
- [x] Motion library: Framer Motion (UI) + GSAP (marketing storytelling) → [animation-system.md §1](../../docs/frontend/animation-system.md) (separate modules; no GSAP in workspace bundle)
- [x] Motion tokens (durations, easings) shared with design tokens → §2 (packages/types/motion-tokens.ts; instant/fast/normal for workspace; slow/dramatic for marketing only)
- [x] View Transitions API for route changes (progressive) → §3 (progressive enhancement; <ViewTransitionLayout>; shared-element for card→detail)
- [x] WebGL animations (deck.gl / custom shaders) for map → §4 (event pulse rings GLSL; trajectory PathLayer; opacity uniforms; GPU-bound, outside React cycle)
- [x] FPS budget enforcement in dev tools → §5 (55 fps targets; Lighthouse CI; Playwright page.metrics(); useFrameRate() dev hook)
- [x] Reduced-motion strict respect → §6 (useReducedMotion() Framer; gsap.defaults({duration:0}); WebGL static fallbacks; tested in CI with --force-prefers-reduced-motion)
- [x] Per-route animation budget → §7 (routeAnimationBudget config; AnimationProvider constrains tokens per route)
- [x] Motion lint: no infinite loops on workspace surfaces → §8 (4 ESLint rules: no-infinite-motion-workspace, no-dramatic-duration-workspace, no-gsap-in-workspace, require-reduced-motion-check)

## i18n
- N/A.

### Примітки
Workspace = restraint. Marketing = cinema. Two different cultures inside one repo.

### Done notes (2026-05-30)
[docs/frontend/animation-system.md](../../docs/frontend/animation-system.md). ESLint rules enforce the
workspace/marketing split and reduced-motion compliance at CI, not runtime.
