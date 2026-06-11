/**
 * LCP (Largest Contentful Paint) performance configuration for Aegis Lens.
 *
 * Target: LCP < 2000 ms despite cinematic hero content.
 *
 * Strategy:
 *   1. Preload hero font subsets and the above-fold hero image.
 *   2. Critical paint completes within 1500 ms.
 *   3. WebGL globe lazy-inits only after critical paint has settled (1500 ms).
 *   4. On prefers-reduced-motion, skip all animation entirely → static hero.
 */

export interface LcpBudget {
  /** Overall LCP target in ms. */
  targetMs: number;
  /** First meaningful paint must finish within this window. */
  criticalPaintBudgetMs: number;
  /** Delay before initialising WebGL (Three.js / globe). */
  webGLInitDelayMs: number;
  /** Responsive hero image sizes for <img sizes="…"> attribute. */
  heroImageSizes: string;
  /** HTML strings for <link rel="preload"> tags. */
  preloadHints: string[];
}

export const LCP_BUDGET: LcpBudget = {
  targetMs: 2000,
  criticalPaintBudgetMs: 1500,
  webGLInitDelayMs: 1500,
  heroImageSizes:
    "(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1920px",
  preloadHints: [
    // Inter Display variable font — woff2 subset for Latin + Cyrillic
    '<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href="/fonts/inter-display-variable.woff2">',
    // JetBrains Mono — used for event IDs / coordinates in hero ticker
    '<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous" href="/fonts/jetbrains-mono-variable.woff2">',
    // Hero image (above-fold; WebP)
    '<link rel="preload" as="image" imageSizes="(max-width: 640px) 100vw, 1920px" href="/images/hero-bg.webp" fetchpriority="high">',
  ],
};

/**
 * Build HTML preload tag strings from an LcpBudget config.
 * Returns the `preloadHints` array (already formatted as HTML strings).
 */
export function buildPreloadTags(config: LcpBudget): string[] {
  return config.preloadHints;
}

/**
 * CSS to inject when the user prefers-reduced-motion.
 *
 * Skips all hero transitions and renders the static fallback immediately.
 * Paste inside a @media (prefers-reduced-motion: reduce) { } block or inject
 * via a <style> tag.
 */
export const REDUCED_MOTION_CSS = `
@media (prefers-reduced-motion: reduce) {
  /* Disable all animation on marketing surfaces */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Hide animated hero canvas / WebGL layer; show static fallback */
  [data-hero-canvas],
  [data-hero-particles],
  [data-hero-globe] {
    display: none !important;
  }

  [data-hero-static] {
    display: block !important;
  }

  /* Stop scroll-triggered entrance animations from running */
  [data-scroll-animate] {
    opacity: 1 !important;
    transform: none !important;
  }
}
`.trim();
