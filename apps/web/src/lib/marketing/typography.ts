/**
 * Premium typography configuration for Aegis Lens marketing surfaces.
 *
 * Cinematic pairing:
 *   Display / Headlines  — Inter Display (variable, tight tracking)
 *   Body                 — Inter (variable, relaxed)
 *   Mono / Code          — JetBrains Mono (data feeds, event IDs, coords)
 */

export interface TypographyScale {
  display: TypographyToken;
  headline: TypographyToken;
  subheadline: TypographyToken;
  body: TypographyToken;
  caption: TypographyToken;
  mono: TypographyToken;
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: number;
}

export const AEGIS_TYPOGRAPHY: TypographyScale = {
  display: {
    fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
    fontSize: "clamp(2.5rem, 6vw, 5rem)",
    lineHeight: "1.05",
    letterSpacing: "-0.04em",
    fontWeight: 800,
  },
  headline: {
    fontFamily: '"Inter Display", "Inter", system-ui, sans-serif',
    fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
    lineHeight: "1.1",
    letterSpacing: "-0.025em",
    fontWeight: 700,
  },
  subheadline: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
    lineHeight: "1.3",
    letterSpacing: "-0.01em",
    fontWeight: 500,
  },
  body: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: "clamp(0.9375rem, 1.1vw, 1.0625rem)",
    lineHeight: "1.65",
    letterSpacing: "0em",
    fontWeight: 400,
  },
  caption: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: "0.8125rem",
    lineHeight: "1.5",
    letterSpacing: "0.01em",
    fontWeight: 400,
  },
  mono: {
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace',
    fontSize: "0.875rem",
    lineHeight: "1.6",
    letterSpacing: "0.02em",
    fontWeight: 400,
  },
};

/**
 * CSS custom properties for all typography tokens.
 * Inject this string inside a :root { } block or a <style> tag.
 */
export const CSS_VARIABLES = `
  --aegis-font-display: ${AEGIS_TYPOGRAPHY.display.fontFamily};
  --aegis-font-body: ${AEGIS_TYPOGRAPHY.body.fontFamily};
  --aegis-font-mono: ${AEGIS_TYPOGRAPHY.mono.fontFamily};

  --aegis-text-display-size: ${AEGIS_TYPOGRAPHY.display.fontSize};
  --aegis-text-display-lh: ${AEGIS_TYPOGRAPHY.display.lineHeight};
  --aegis-text-display-ls: ${AEGIS_TYPOGRAPHY.display.letterSpacing};
  --aegis-text-display-fw: ${AEGIS_TYPOGRAPHY.display.fontWeight};

  --aegis-text-headline-size: ${AEGIS_TYPOGRAPHY.headline.fontSize};
  --aegis-text-headline-lh: ${AEGIS_TYPOGRAPHY.headline.lineHeight};
  --aegis-text-headline-ls: ${AEGIS_TYPOGRAPHY.headline.letterSpacing};
  --aegis-text-headline-fw: ${AEGIS_TYPOGRAPHY.headline.fontWeight};

  --aegis-text-subheadline-size: ${AEGIS_TYPOGRAPHY.subheadline.fontSize};
  --aegis-text-subheadline-lh: ${AEGIS_TYPOGRAPHY.subheadline.lineHeight};
  --aegis-text-subheadline-ls: ${AEGIS_TYPOGRAPHY.subheadline.letterSpacing};
  --aegis-text-subheadline-fw: ${AEGIS_TYPOGRAPHY.subheadline.fontWeight};

  --aegis-text-body-size: ${AEGIS_TYPOGRAPHY.body.fontSize};
  --aegis-text-body-lh: ${AEGIS_TYPOGRAPHY.body.lineHeight};
  --aegis-text-body-ls: ${AEGIS_TYPOGRAPHY.body.letterSpacing};
  --aegis-text-body-fw: ${AEGIS_TYPOGRAPHY.body.fontWeight};

  --aegis-text-caption-size: ${AEGIS_TYPOGRAPHY.caption.fontSize};
  --aegis-text-caption-lh: ${AEGIS_TYPOGRAPHY.caption.lineHeight};
  --aegis-text-caption-ls: ${AEGIS_TYPOGRAPHY.caption.letterSpacing};
  --aegis-text-caption-fw: ${AEGIS_TYPOGRAPHY.caption.fontWeight};

  --aegis-text-mono-size: ${AEGIS_TYPOGRAPHY.mono.fontSize};
  --aegis-text-mono-lh: ${AEGIS_TYPOGRAPHY.mono.lineHeight};
  --aegis-text-mono-ls: ${AEGIS_TYPOGRAPHY.mono.letterSpacing};
  --aegis-text-mono-fw: ${AEGIS_TYPOGRAPHY.mono.fontWeight};
`.trim();

/**
 * CSS overrides to apply when the user prefers reduced motion.
 * Paste inside a @media (prefers-reduced-motion: reduce) block.
 */
export const REDUCED_MOTION_OVERRIDES = `
  /* Disable kinetic headline effects */
  [data-aegis-headline],
  .aegis-display,
  .aegis-headline {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }

  /* Keep letter-spacing and font-weight but drop any animated tracking */
  [data-aegis-text-animate] {
    animation: none !important;
    opacity: 1 !important;
  }
`.trim();
