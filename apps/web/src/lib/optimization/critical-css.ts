/**
 * Critical CSS and font subsetting configuration.
 *
 * Critical selectors must be inlined in <head> so the map container,
 * navigation, and alert banners render without a flash of unstyled content.
 *
 * Font subsetting reduces WOFF2 payload for non-latin scripts (Cyrillic
 * for Ukrainian content, Arabic for Arabic-language reports).
 */

/** CSS selectors that must be present in the critical (inlined) stylesheet. */
export const CRITICAL_CSS_SELECTORS: string[] = [
  // Map container
  "#map-container",
  ".map-canvas",
  ".map-overlay",
  ".maplibregl-map",
  // Layout skeleton
  "html",
  "body",
  ".layout-root",
  ".app-shell",
  // Header and navigation
  "header",
  "nav",
  ".site-header",
  ".primary-nav",
  ".nav-item",
  // Auth modal (shown on first load for unauthenticated users)
  ".auth-modal",
  ".auth-modal-backdrop",
  ".auth-modal-panel",
  // Alert banner (critical for OSINT platform — must display immediately)
  ".alert-banner",
  ".alert-banner--critical",
  ".alert-banner--warning",
  ".alert-badge",
  // Loading states
  ".skeleton",
  ".skeleton-map",
  "[data-loading]",
  // Typography base
  "h1",
  "h2",
  "p",
  "a",
];

/**
 * Character ranges for font subsetting per language/script.
 * Used by the font pipeline (e.g., pyftsubset / glyphhanger) to
 * generate lean WOFF2 files.
 *
 * Values are Unicode ranges in CSS unicode-range format.
 */
export const FONT_SUBSET_CHARS: Record<string, string> = {
  latin: "U+0020-007F, U+00A0-00FF, U+0100-017F, U+0180-024F",
  cyrillic: "U+0400-04FF, U+0500-052F, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
  arabic: "U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF",
  latin_extended:
    "U+0250-02AF, U+1E00-1EFF, U+2C60-2C7F, U+A720-A7FF",
  greek: "U+0370-03FF, U+1F00-1FFF",
  numerals_symbols: "U+0030-0039, U+0025, U+002B, U+002D, U+00B0, U+2013-2014",
};

/** Fonts to preload with <link rel="preload"> in the document head. */
export const FONT_PRELOAD_CONFIG: {
  family: string;
  variants: string[];
  display: string;
}[] = [
  {
    family: "Inter",
    variants: ["400", "500", "600"],
    display: "swap",
  },
  {
    family: "Inter",
    variants: ["400", "600"],
    display: "swap",
  },
  {
    family: "JetBrains Mono",
    variants: ["400"],
    display: "optional",
  },
];

export interface CriticalCssPolicy {
  /** Maximum size (bytes) for CSS to be inlined into the HTML document. */
  inlineThreshold: number;
  /** CSS `font-display` value for web fonts. */
  fontDisplay: string;
  /** Font family names that should be preloaded (in insertion order). */
  preloadFonts: string[];
}

/**
 * Build the critical CSS policy object consumed by the Next.js app
 * (e.g., passed to `<Document>` or the PostCSS critical plugin config).
 */
export function buildCriticalCssPolicy(): CriticalCssPolicy {
  const preloadFonts = FONT_PRELOAD_CONFIG.map((f) => f.family);

  return {
    inlineThreshold: 14_336, // 14 KB — fits in one TCP window alongside HTML
    fontDisplay: "swap",
    preloadFonts,
  };
}
