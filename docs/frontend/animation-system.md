# Animation System

> Consistent, performant animation primitives across marketing and workspace.
> **Workspace = restraint. Marketing = cinema. Two different cultures inside one repo.**

## 1. Motion library split

| Surface | Library | Why |
| --- | --- | --- |
| **Workspace UI** (components, transitions, micro-interactions) | **Framer Motion** | Declarative, React-native, layout animations, `AnimatePresence` |
| **Marketing / storytelling** (hero sequences, scroll-driven narratives, map flyovers) | **GSAP** + ScrollTrigger | Precise timeline control, sub-millisecond accuracy, complex multi-element choreography |
| **Map overlays** (event pulse rings, layer fades, trajectory arcs) | **deck.gl extensions** + custom WebGL shaders | GPU-accelerated; must live in the rendering pipeline, not the DOM |

These live in separate modules (`/lib/motion/workspace.ts`, `/lib/motion/marketing.ts`,
`/lib/motion/map-gl.ts`) so the marketing bundle doesn't pull GSAP into the workspace
and vice versa.

## 2. Motion tokens

Tokens live in `packages/types/src/motion-tokens.ts` and are imported by both
the Tailwind config and Framer Motion `transition` defaults. Single source of truth.

```ts
export const motion = {
  duration: {
    instant:  0.08,   // micro-feedback (click, toggle)
    fast:     0.15,   // tooltip show/hide, dropdown
    normal:   0.25,   // panel slide, card expand
    slow:     0.4,    // page enter, modal
    dramatic: 0.8,    // hero reveal, marketing
  },
  ease: {
    out:      [0.16, 1, 0.3, 1],        // spring-like exit
    in:       [0.4, 0, 1, 1],           // accelerate in
    inOut:    [0.45, 0, 0.55, 1],       // symmetric
    spring:   { type: 'spring', stiffness: 300, damping: 30 },
    bounce:   { type: 'spring', stiffness: 400, damping: 10 },
  },
} as const;
```

**Workspace rule:** use `instant`/`fast`/`normal` only. `slow` and `dramatic`
are reserved for marketing surfaces. An ESLint rule enforces this (§8).

## 3. View Transitions API (route changes)

- Use the **View Transitions API** (`document.startViewTransition`) for
  cross-route navigations in Next.js App Router.
- Progressive: if the API is unavailable (Firefox < 126), the transition fires
  without animation (no polyfill, no JS shimming).
- Default transition: cross-fade 250 ms for standard routes; shared-element
  transition for detail → list (event card → event detail).
- Implemented as a `<ViewTransitionLayout>` wrapper around `{children}` in the
  root layout.

## 4. WebGL animations (deck.gl / custom shaders)

Map animations are GPU-bound and operate outside the React render cycle:

- **Event pulse rings** (new events appearing): custom GLSL layer with a
  time-uniform that drives a `smoothstep` radius expansion. Runs at the display
  refresh rate (60–120 fps) regardless of React reconciler.
- **Layer fade-in / fade-out**: opacity uniform lerp in the layer's `updateState`
  hook, not CSS.
- **Trajectory arcs** (missile/drone paths): `PathLayer` with animated
  `currentTime` prop from a `requestAnimationFrame` loop.
- **Frame budget**: map animations must leave at least 4 ms of per-frame headroom
  for JS work (enforced via Chrome DevTools `Performance` profiling in CI — see §5).

## 5. FPS budget enforcement

Every animation surface has an explicit **FPS budget**:

| Surface | Budget | Enforcement |
| --- | --- | --- |
| Workspace UI (component animations) | ≥ 55 fps on mid-range device | Lighthouse CI performance score ≥ 90 |
| Map workspace (WebGL) | ≥ 55 fps at 500 visible events | Playwright `page.metrics()` assertion in perf test |
| Marketing pages (GSAP scroll) | ≥ 55 fps during scroll | Lighthouse CI; manual review on M1 + Windows mid-range |

**Dev tooling:** a `useFrameRate()` hook in development mode logs a warning to
the console when sustained FPS drops below 50. Never ships to production; gated
by `process.env.NODE_ENV === 'development'`.

## 6. Reduced-motion strict compliance

- **All animations** respect `prefers-reduced-motion: reduce`. No exceptions.
- Framer Motion: `useReducedMotion()` hook disables all `motion.*` transitions.
- GSAP: a global `gsap.defaults({ duration: 0 })` is applied when the media
  query matches.
- WebGL: pulse rings and trajectory arcs are replaced with static indicators
  (a filled dot, a dashed polyline) when reduced motion is active.
- **Tested in CI**: Playwright sets `--force-prefers-reduced-motion` in a
  separate test suite and asserts no animation-related class or style changes
  occur during navigation.
- This is also an **accessibility requirement** — see `axe-core` rules for
  `prefers-reduced-motion`.

## 7. Per-route animation budget

Each route declares its maximum animation weight in `route-animation.config.ts`:

```ts
export const routeAnimationBudget: Record<string, 'none' | 'minimal' | 'normal' | 'rich'> = {
  '/': 'rich',           // marketing home — full cinema
  '/map': 'minimal',     // workspace — restraint; WebGL handles motion
  '/reports': 'normal',  // moderate
  '/onboarding': 'normal',
};
```

The `<AnimationProvider>` reads this and constrains which motion tokens
child components may use. A workspace route requesting a `dramatic` duration
throws a development-mode warning.

## 8. Motion lint (no infinite loops on workspace surfaces)

ESLint custom rules:

| Rule | What it catches |
| --- | --- |
| `no-infinite-motion-workspace` | `animate={{ ... }}` with `repeat: Infinity` inside a workspace route |
| `no-dramatic-duration-workspace` | Use of `motion.duration.dramatic` or `motion.duration.slow` outside marketing routes |
| `no-gsap-in-workspace` | GSAP imports in `/app/(workspace)/` routes |
| `require-reduced-motion-check` | Animated components that don't call `useReducedMotion()` or apply the GSAP global |

These rules run in CI and fail the build on new violations. Existing violations
are tracked in the tech-debt register and ratcheted down.
