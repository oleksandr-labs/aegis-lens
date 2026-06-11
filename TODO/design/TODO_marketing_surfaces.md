# TODO — Marketing Surfaces (Landing, Use-Case, Comparison)

## Goal
Cinematic, premium feel on marketing pages — distinct from the dense workspace UI. This is where first impressions are made.

## Progress
- 13 / 13 done

## Tasks

### Visual direction
- [x] Hero animations: WebGL globe, particle event streams, animated SAR scans — apps/web/src/lib/marketing/hero-config.ts
- [x] Scroll-driven storytelling sections (GSAP / Framer Motion) — apps/web/src/lib/marketing/scroll-animations.ts
- [x] Cinematic transitions between sections (View Transitions API) — apps/web/src/lib/marketing/scroll-animations.ts
- [x] 3D illustrations of satellite + drone iconography — apps/web/src/lib/marketing/hero-config.ts
- [x] Section dividers with subtle radar / scan motifs — apps/web/src/lib/marketing/scroll-animations.ts
- [x] Premium typography pairing (display + body + mono) — apps/web/src/lib/marketing/typography.ts

### Per-surface variants
- [x] Landing hero (globe + ticker) — apps/web/src/lib/marketing/hero-config.ts
- [x] Use-case hero (illustration matching persona task) — apps/web/src/lib/marketing/hero-config.ts
- [x] Comparison hero (split-screen visual) — apps/web/src/lib/marketing/hero-config.ts
- [x] Region hero (live map snapshot) — apps/web/src/lib/marketing/hero-config.ts

### Performance
- [x] LCP < 2.0s despite cinematic content — apps/web/src/lib/marketing/lcp-optimization.ts
- [x] Lazy-init heavy WebGL after critical paint — apps/web/src/lib/marketing/lcp-optimization.ts
- [x] Reduced-motion gracefully degrades to static — apps/web/src/lib/marketing/lcp-optimization.ts

### CRO patterns
- [x] Sticky CTA bar on long pages — apps/web/src/lib/marketing/cta-config.ts
- [x] Social-proof rails between sections — apps/web/src/lib/marketing/social-proof.ts
- [x] "Try without signup" demo embed where possible — apps/web/src/lib/marketing/cta-config.ts
- [x] Exit-intent capture (with respect — single use) — apps/web/src/lib/marketing/cta-config.ts
- [x] Persona-aware CTA copy (UTM-driven) — apps/web/src/lib/marketing/cta-config.ts

## i18n
- Marketing copy professionally translated; do not MT.

### Примітки
This is the only place where "wow" matters more than density. Treat it like a film, not an app.
