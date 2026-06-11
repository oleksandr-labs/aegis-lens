/**
 * Font subsetting + `font-display: swap` policy.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Font subsetting + font-display: swap").
 * Eliminates FOIT (invisible text) and trims byte weight to protect LCP/CLS.
 *
 * The site serves en (Latin) + uk (Cyrillic), so every UI font must ship BOTH
 * the `latin` and `cyrillic` unicode-range subsets — dropping Cyrillic would
 * break Ukrainian rendering. `font-display: swap` keeps text visible during
 * font load; `preload` is reserved for the above-the-fold display face only
 * (preloading body text wastes bandwidth and can hurt LCP).
 *
 * This is a typed config consumed by the font loader (e.g. `next/font`) and a
 * CI lint that asserts no UI font omits `cyrillic` or uses `font-display`
 * other than `swap`/`optional`.
 */

/** Unicode-range subsets we ship. `cyrillic` is mandatory for uk. */
export type FontSubset = "latin" | "latin-ext" | "cyrillic" | "cyrillic-ext";

/** CSS font-display strategy. `swap` is the project default. */
export type FontDisplay = "swap" | "optional";

export interface FontFaceConfig {
  /** Logical family name used in CSS / `next/font` variable. */
  family: string;
  /** Role of the face. Display = above-fold headings; body = paragraph text. */
  role: "display" | "body" | "mono";
  /** Subsets to ship. MUST include "cyrillic" for any face that renders uk. */
  subsets: FontSubset[];
  /** font-display value. */
  display: FontDisplay;
  /** Whether to emit a `<link rel=preload>` — display face only. */
  preload: boolean;
  /** Weights to include (subset by weight too — don't ship unused weights). */
  weights: number[];
}

/** Mandatory subsets every uk-rendering face must include. */
export const REQUIRED_SUBSETS: readonly FontSubset[] = ["latin", "cyrillic"];

export const FONT_FACES: readonly FontFaceConfig[] = [
  {
    family: "Inter",
    role: "body",
    subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
    display: "swap",
    preload: false,
    weights: [400, 500, 600],
  },
  {
    family: "Inter",
    role: "display",
    subsets: ["latin", "cyrillic"],
    display: "swap",
    preload: true,
    weights: [700],
  },
  {
    family: "JetBrains Mono",
    role: "mono",
    subsets: ["latin"],
    display: "swap",
    preload: false,
    weights: [400],
  },
];

export interface FontPolicyViolation {
  family: string;
  role: FontFaceConfig["role"];
  problem: string;
}

/**
 * Validate the font config against policy:
 *  - any non-mono face must ship every REQUIRED_SUBSET (uk needs cyrillic)
 *  - display must be swap/optional (never block / auto / fallback)
 *  - at most one preloaded face (the above-fold display face)
 */
export function validateFontPolicy(faces: readonly FontFaceConfig[] = FONT_FACES): FontPolicyViolation[] {
  const violations: FontPolicyViolation[] = [];
  let preloadCount = 0;

  for (const f of faces) {
    if (f.preload) preloadCount++;
    if (f.role !== "mono") {
      for (const req of REQUIRED_SUBSETS) {
        if (!f.subsets.includes(req)) {
          violations.push({ family: f.family, role: f.role, problem: `missing required subset "${req}" (breaks uk)` });
        }
      }
    }
    if (f.display !== "swap" && f.display !== "optional") {
      violations.push({ family: f.family, role: f.role, problem: `font-display must be swap/optional` });
    }
    if (f.weights.length === 0) {
      violations.push({ family: f.family, role: f.role, problem: `no weights declared` });
    }
  }
  if (preloadCount > 1) {
    violations.push({ family: "*", role: "display", problem: `only the above-fold display face should preload (found ${preloadCount})` });
  }
  return violations;
}
