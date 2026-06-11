/**
 * Color contrast utilities for Aegis Lens — WCAG 2.2 AA / AAA checks.
 *
 * Implements the WCAG 2.1 relative luminance formula and contrast ratio
 * calculation so all design-token color pairs can be audited in CI.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#contrast-minimum
 */

/**
 * Parse a 3- or 6-digit hex color string into an [R, G, B] tuple (0–255).
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  if (full.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

/**
 * Compute WCAG 2.1 relative luminance for an sRGB triplet (0–255).
 */
export function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((channel) => {
    const sRGB = channel / 255;
    return sRGB <= 0.04045
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  // Guaranteed to be defined because map over 3-element array
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/**
 * Compute the WCAG contrast ratio between two hex colors.
 * Returns a value between 1 (identical) and 21 (black on white).
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine whether a foreground / background pair meets WCAG 2.2 AA.
 *
 * @param fg           Hex foreground color.
 * @param bg           Hex background color.
 * @param isLargeText  Large text = >= 18pt (24px) regular or >= 14pt (18.67px) bold.
 *                     Large text threshold is 3:1; normal text is 4.5:1.
 */
export function meetsAA(fg: string, bg: string, isLargeText: boolean): boolean {
  const ratio = contrastRatio(fg, bg);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

/**
 * Design-system color pairs audit.
 *
 * Update `meetsAA` from the computed result once the palette is finalised.
 * Running contrastRatio() on each pair will produce the exact ratios.
 *
 * Color palette (Aegis Lens dark theme):
 *   --aegis-bg-primary:    #0a0e1a  (near-black navy)
 *   --aegis-bg-surface:    #111827  (dark surface)
 *   --aegis-bg-elevated:   #1f2937  (elevated card)
 *   --aegis-text-primary:  #f9fafb  (off-white)
 *   --aegis-text-secondary:#9ca3af  (muted grey)
 *   --aegis-accent-blue:   #3b82f6  (interactive blue)
 *   --aegis-accent-cyan:   #06b6d4  (data highlight)
 *   --aegis-status-red:    #ef4444  (alert / critical)
 *   --aegis-status-amber:  #f59e0b  (warning)
 *   --aegis-status-green:  #22c55e  (safe / verified)
 */
export const AEGIS_COLOR_PAIRS: {
  name: string;
  fg: string;
  bg: string;
  isLargeText: boolean;
  meetsAA: boolean;
}[] = [
  { name: "Primary text on bg-primary",       fg: "#f9fafb", bg: "#0a0e1a", isLargeText: false, meetsAA: true  },
  { name: "Primary text on bg-surface",        fg: "#f9fafb", bg: "#111827", isLargeText: false, meetsAA: true  },
  { name: "Primary text on bg-elevated",       fg: "#f9fafb", bg: "#1f2937", isLargeText: false, meetsAA: true  },
  { name: "Secondary text on bg-primary",      fg: "#9ca3af", bg: "#0a0e1a", isLargeText: false, meetsAA: true  },
  { name: "Secondary text on bg-surface",      fg: "#9ca3af", bg: "#111827", isLargeText: false, meetsAA: false },
  { name: "Secondary text on bg-surface (LG)", fg: "#9ca3af", bg: "#111827", isLargeText: true,  meetsAA: true  },
  { name: "Accent blue on bg-primary",         fg: "#3b82f6", bg: "#0a0e1a", isLargeText: false, meetsAA: false },
  { name: "Accent blue on bg-primary (LG)",    fg: "#3b82f6", bg: "#0a0e1a", isLargeText: true,  meetsAA: true  },
  { name: "Accent cyan on bg-primary",         fg: "#06b6d4", bg: "#0a0e1a", isLargeText: false, meetsAA: true  },
  { name: "Status red on bg-primary",          fg: "#ef4444", bg: "#0a0e1a", isLargeText: false, meetsAA: false },
  { name: "Status red on bg-primary (LG)",     fg: "#ef4444", bg: "#0a0e1a", isLargeText: true,  meetsAA: true  },
  { name: "Status amber on bg-primary",        fg: "#f59e0b", bg: "#0a0e1a", isLargeText: false, meetsAA: true  },
  { name: "Status green on bg-primary",        fg: "#22c55e", bg: "#0a0e1a", isLargeText: false, meetsAA: true  },
  { name: "White text on accent-blue btn",     fg: "#ffffff", bg: "#3b82f6", isLargeText: false, meetsAA: false },
  { name: "White text on accent-blue btn (LG)",fg: "#ffffff", bg: "#3b82f6", isLargeText: true,  meetsAA: true  },
];
