/**
 * Typography System — Aegis Lens
 *
 * Three-typeface stack:
 *   Geist    → display headings, product UI (clean, tech, neutral)
 *   Inter    → body copy, data labels, prose (legible at small sizes)
 *   JetBrains Mono → raw data, coordinates, hashes, code (mono-width clarity)
 *
 * All fonts loaded via next/font (zero layout shift, automatic subsetting,
 * self-hosted, no Google Fonts CDN dependency in production).
 *
 * Sprint 2.73 — Design foundations
 */

// ── Font definitions ──────────────────────────────────────────────────────────

export interface FontDef {
  family: string;
  /** npm package for next/font/local or next/font/google */
  source: "next/font/google" | "next/font/local";
  /** Weights to load (subset for performance) */
  weights: number[];
  /** CSS variable name injected by next/font */
  cssVariable: string;
  /** Fallback stack */
  fallback: string[];
  /** Role in the design system */
  role: "display" | "body" | "mono";
}

export const FONTS: FontDef[] = [
  {
    family: "Geist",
    source: "next/font/google",
    weights: [400, 500, 600, 700, 800],
    cssVariable: "--font-geist",
    fallback: ["system-ui", "-apple-system", "sans-serif"],
    role: "display",
  },
  {
    family: "Inter",
    source: "next/font/google",
    weights: [400, 500, 600],
    cssVariable: "--font-inter",
    fallback: ["system-ui", "-apple-system", "sans-serif"],
    role: "body",
  },
  {
    family: "JetBrains Mono",
    source: "next/font/google",
    weights: [400, 500],
    cssVariable: "--font-mono",
    fallback: ["ui-monospace", "Menlo", "Monaco", "Courier New", "monospace"],
    role: "mono",
  },
];

// ── Typography scale ──────────────────────────────────────────────────────────

export interface TypeLevel {
  name: string;
  /** px value at base scale (16px root) */
  size: number;
  /** rem equivalent */
  rem: string;
  /** Tailwind text-* class */
  tailwindSize: string;
  /** Unitless line-height */
  lineHeight: number;
  /** CSS letter-spacing */
  letterSpacing: string;
  /** Font weight */
  weight: number;
  font: "Geist" | "Inter" | "JetBrains Mono";
}

export const TypographyScale: {
  display: { font: "Geist"; sizes: [48, 36, 30]; levels: TypeLevel[] };
  body: { font: "Inter"; sizes: [16, 14, 12]; levels: TypeLevel[] };
  mono: { font: "JetBrains Mono"; sizes: [14, 12]; levels: TypeLevel[] };
} = {
  display: {
    font: "Geist",
    sizes: [48, 36, 30],
    levels: [
      {
        name: "display-xl",
        size: 48,
        rem: "3rem",
        tailwindSize: "text-5xl",
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        weight: 800,
        font: "Geist",
      },
      {
        name: "display-lg",
        size: 36,
        rem: "2.25rem",
        tailwindSize: "text-4xl",
        lineHeight: 1.15,
        letterSpacing: "-0.025em",
        weight: 700,
        font: "Geist",
      },
      {
        name: "display-md",
        size: 30,
        rem: "1.875rem",
        tailwindSize: "text-3xl",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        weight: 700,
        font: "Geist",
      },
      {
        name: "heading-lg",
        size: 24,
        rem: "1.5rem",
        tailwindSize: "text-2xl",
        lineHeight: 1.3,
        letterSpacing: "-0.015em",
        weight: 600,
        font: "Geist",
      },
      {
        name: "heading-md",
        size: 20,
        rem: "1.25rem",
        tailwindSize: "text-xl",
        lineHeight: 1.35,
        letterSpacing: "-0.01em",
        weight: 600,
        font: "Geist",
      },
      {
        name: "heading-sm",
        size: 16,
        rem: "1rem",
        tailwindSize: "text-base",
        lineHeight: 1.4,
        letterSpacing: "-0.005em",
        weight: 600,
        font: "Geist",
      },
      // Overline / label
      {
        name: "overline",
        size: 11,
        rem: "0.6875rem",
        tailwindSize: "text-[11px]",
        lineHeight: 1.4,
        letterSpacing: "0.08em",
        weight: 600,
        font: "Geist",
      },
    ],
  },
  body: {
    font: "Inter",
    sizes: [16, 14, 12],
    levels: [
      {
        name: "body-lg",
        size: 16,
        rem: "1rem",
        tailwindSize: "text-base",
        lineHeight: 1.6,
        letterSpacing: "0em",
        weight: 400,
        font: "Inter",
      },
      {
        name: "body-md",
        size: 14,
        rem: "0.875rem",
        tailwindSize: "text-sm",
        lineHeight: 1.55,
        letterSpacing: "0em",
        weight: 400,
        font: "Inter",
      },
      {
        name: "body-sm",
        size: 12,
        rem: "0.75rem",
        tailwindSize: "text-xs",
        lineHeight: 1.5,
        letterSpacing: "0.01em",
        weight: 400,
        font: "Inter",
      },
      // UI labels (semi-bold body)
      {
        name: "label-md",
        size: 14,
        rem: "0.875rem",
        tailwindSize: "text-sm",
        lineHeight: 1.4,
        letterSpacing: "0em",
        weight: 500,
        font: "Inter",
      },
      {
        name: "label-sm",
        size: 12,
        rem: "0.75rem",
        tailwindSize: "text-xs",
        lineHeight: 1.4,
        letterSpacing: "0.01em",
        weight: 500,
        font: "Inter",
      },
    ],
  },
  mono: {
    font: "JetBrains Mono",
    sizes: [14, 12],
    levels: [
      {
        name: "mono-md",
        size: 14,
        rem: "0.875rem",
        tailwindSize: "text-sm",
        lineHeight: 1.6,
        letterSpacing: "0em",
        weight: 400,
        font: "JetBrains Mono",
      },
      {
        name: "mono-sm",
        size: 12,
        rem: "0.75rem",
        tailwindSize: "text-xs",
        lineHeight: 1.55,
        letterSpacing: "0em",
        weight: 400,
        font: "JetBrains Mono",
      },
      // Bold mono for coordinates / emphasis
      {
        name: "mono-bold",
        size: 13,
        rem: "0.8125rem",
        tailwindSize: "text-[13px]",
        lineHeight: 1.5,
        letterSpacing: "0em",
        weight: 500,
        font: "JetBrains Mono",
      },
    ],
  },
};

// ── Loading strategy ──────────────────────────────────────────────────────────

/**
 * All fonts loaded via `next/font` with:
 *   - `preload: true`          — critical font files in <link rel="preload">
 *   - `display: 'swap'`        — FOUT acceptable; no invisible text
 *   - `subsets: ['latin', 'cyrillic']` — Ukrainian (cyrillic) essential
 *   - `variable: '--font-*'`   — injects CSS var, consumed by Tailwind
 *
 * Usage in apps/web/src/app/layout.tsx:
 * ```tsx
 * import { Geist } from 'next/font/google';
 * import { Inter } from 'next/font/google';
 * import { JetBrains_Mono } from 'next/font/google';
 *
 * const geist = Geist({
 *   variable: '--font-geist',
 *   subsets: ['latin', 'cyrillic'],
 *   weight: ['400','500','600','700','800'],
 *   preload: true,
 *   display: 'swap',
 * });
 *
 * const inter = Inter({
 *   variable: '--font-inter',
 *   subsets: ['latin', 'cyrillic'],
 *   weight: ['400','500','600'],
 *   preload: true,
 *   display: 'swap',
 * });
 *
 * const mono = JetBrains_Mono({
 *   variable: '--font-mono',
 *   subsets: ['latin', 'cyrillic'],
 *   weight: ['400','500'],
 *   preload: false,   // deferred; mono only used inside data panels
 *   display: 'swap',
 * });
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html className={`${geist.variable} ${inter.variable} ${mono.variable}`}>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export const FONT_LOADING_STRATEGY = "next/font with preload" as const;

// ── Tailwind class map ────────────────────────────────────────────────────────

/**
 * Canonical Tailwind class strings per type level.
 * Use these instead of ad-hoc classes so changes ripple everywhere.
 *
 * Example:
 *   <h1 className={TYPOGRAPHY_CLASSES['display-xl']}>Heading</h1>
 */
export const TYPOGRAPHY_CLASSES: Record<string, string> = {
  // Display
  "display-xl":  "font-geist text-5xl font-extrabold leading-[1.1] tracking-[-0.03em]",
  "display-lg":  "font-geist text-4xl font-bold leading-[1.15] tracking-[-0.025em]",
  "display-md":  "font-geist text-3xl font-bold leading-[1.2] tracking-[-0.02em]",
  "heading-lg":  "font-geist text-2xl font-semibold leading-[1.3] tracking-[-0.015em]",
  "heading-md":  "font-geist text-xl font-semibold leading-[1.35] tracking-[-0.01em]",
  "heading-sm":  "font-geist text-base font-semibold leading-[1.4] tracking-[-0.005em]",
  "overline":    "font-geist text-[11px] font-semibold leading-[1.4] tracking-[0.08em] uppercase",

  // Body
  "body-lg":     "font-inter text-base font-normal leading-[1.6]",
  "body-md":     "font-inter text-sm font-normal leading-[1.55]",
  "body-sm":     "font-inter text-xs font-normal leading-[1.5] tracking-[0.01em]",
  "label-md":    "font-inter text-sm font-medium leading-[1.4]",
  "label-sm":    "font-inter text-xs font-medium leading-[1.4] tracking-[0.01em]",

  // Mono
  "mono-md":     "font-mono text-sm font-normal leading-[1.6]",
  "mono-sm":     "font-mono text-xs font-normal leading-[1.55]",
  "mono-bold":   "font-mono text-[13px] font-medium leading-[1.5]",

  // Compound use-case classes
  "coordinate":  "font-mono text-xs font-medium leading-none tabular-nums",
  "confidence":  "font-mono text-[11px] font-medium leading-none tabular-nums",
  "timestamp":   "font-mono text-[11px] font-normal leading-none tabular-nums text-slate-400",
  "hash":        "font-mono text-[10px] font-normal leading-none tracking-tight text-slate-500 select-all",
  "table-cell":  "font-inter text-sm font-normal leading-[1.4] tabular-nums",
  "caption":     "font-inter text-[11px] font-normal leading-[1.4] tracking-[0.01em] text-slate-400",
};

// ── RTL / i18n notes ──────────────────────────────────────────────────────────

/**
 * Ukrainian (UK) and English (EN) share Latin + Cyrillic scripts.
 * Both are LTR. RTL readiness (Arabic future expansion):
 *
 * - Use `text-start` / `text-end` instead of `text-left` / `text-right`
 * - Use logical properties: `ms-*` / `me-*` / `ps-*` / `pe-*`
 * - Geist + Inter both have RTL metrics; JetBrains Mono is effectively RTL-safe
 *   (code/data does not reverse)
 * - Heading tracking (negative letter-spacing) should be set to 0 for Arabic
 *   to avoid collisions with diacritics
 */
export const RTL_READY = true;
