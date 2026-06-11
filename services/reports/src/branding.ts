/**
 * Per-org branding overlay for white-label report rendering.
 *
 * Applies CSS custom properties, logo, and text tokens to an HTML report
 * template. Aegis Lens defaults are used for orgs without custom branding.
 *
 * Token contract in HTML templates:
 *   {{BRANDING_CSS}}         — replaced with <style> block
 *   {{LOGO_URL}}             — replaced with logo src URL
 *   {{REPORT_HEADER_TEXT}}   — replaced with header text
 *   {{REPORT_FOOTER_TEXT}}   — replaced with footer text
 *   {{WATERMARK}}            — replaced with watermark text
 *   {{CLASSIFICATION_LABEL}} — replaced with classification banner text
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrgBranding {
  orgId: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  reportHeaderText?: string;
  reportFooterText?: string;
  watermark?: string;
  classificationLabel?: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_BRANDING: OrgBranding = {
  orgId: "__default__",
  logoUrl: "https://aegislens.com/logo.svg",
  primaryColor: "#1a2744",   // Aegis dark navy
  secondaryColor: "#e8c84a", // Aegis amber
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  reportHeaderText: "Aegis Lens Intelligence Report",
  reportFooterText:
    "Produced by Aegis Lens OSINT Platform — aegislens.com — Confidential",
  watermark: "AEGIS LENS",
  classificationLabel: "CONFIDENTIAL — RESTRICTED DISTRIBUTION",
};

// ── CSS template ──────────────────────────────────────────────────────────────

/**
 * CSS custom properties that branding values are injected into.
 * HTML templates reference these via `var(--brand-*)`.
 */
export const BRANDING_CSS_TEMPLATE = `
:root {
  --brand-primary:     {{PRIMARY_COLOR}};
  --brand-secondary:   {{SECONDARY_COLOR}};
  --brand-font:        {{FONT_FAMILY}};
}

body {
  font-family: var(--brand-font);
}

.report-header {
  background-color: var(--brand-primary);
  color: #ffffff;
}

.report-accent {
  color: var(--brand-secondary);
}

.report-footer {
  border-top: 2px solid var(--brand-primary);
  color: #555;
}

.classification-banner {
  background-color: var(--brand-primary);
  color: var(--brand-secondary);
  font-weight: 700;
  text-align: center;
  padding: 4px 0;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
}

.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-35deg);
  font-size: 6rem;
  font-weight: 900;
  color: var(--brand-primary);
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
  white-space: nowrap;
}
`.trim();

// ── BrandingStore ─────────────────────────────────────────────────────────────

export class BrandingStore {
  private readonly store = new Map<string, OrgBranding>();

  /**
   * Get branding for an org.
   * Falls back to DEFAULT_BRANDING if the org has no custom branding.
   */
  get(orgId: string): OrgBranding {
    return this.store.get(orgId) ?? { ...DEFAULT_BRANDING, orgId };
  }

  /**
   * Set or update branding for an org.
   * Merges with DEFAULT_BRANDING so partial overrides work.
   */
  set(orgId: string, branding: Partial<OrgBranding>): void {
    const existing = this.store.get(orgId) ?? { ...DEFAULT_BRANDING };
    this.store.set(orgId, { ...existing, ...branding, orgId });
  }

  /**
   * Remove custom branding for an org (reverts to defaults).
   */
  reset(orgId: string): void {
    this.store.delete(orgId);
  }

  /** Whether an org has custom branding configured. */
  hasBranding(orgId: string): boolean {
    return this.store.has(orgId);
  }
}

// ── applyBranding ─────────────────────────────────────────────────────────────

/**
 * Apply org branding to an HTML report template string.
 *
 * Replaces:
 *   {{BRANDING_CSS}}         — full <style> block with org CSS vars
 *   {{LOGO_URL}}             — logo img src
 *   {{REPORT_HEADER_TEXT}}   — header title text
 *   {{REPORT_FOOTER_TEXT}}   — footer text
 *   {{WATERMARK}}            — watermark overlay text
 *   {{CLASSIFICATION_LABEL}} — classification banner text
 */
export function applyBranding(
  htmlTemplate: string,
  branding: OrgBranding,
): string {
  // Build the CSS block from the template
  const css = BRANDING_CSS_TEMPLATE
    .replace(/\{\{PRIMARY_COLOR\}\}/g, branding.primaryColor)
    .replace(/\{\{SECONDARY_COLOR\}\}/g, branding.secondaryColor)
    .replace(/\{\{FONT_FAMILY\}\}/g, branding.fontFamily);

  const styleBlock = `<style id="aegis-branding">\n${css}\n</style>`;

  return htmlTemplate
    .replace(/\{\{BRANDING_CSS\}\}/g, styleBlock)
    .replace(
      /\{\{LOGO_URL\}\}/g,
      branding.logoUrl ?? DEFAULT_BRANDING.logoUrl ?? "",
    )
    .replace(
      /\{\{REPORT_HEADER_TEXT\}\}/g,
      escapeHtml(branding.reportHeaderText ?? DEFAULT_BRANDING.reportHeaderText ?? ""),
    )
    .replace(
      /\{\{REPORT_FOOTER_TEXT\}\}/g,
      escapeHtml(branding.reportFooterText ?? DEFAULT_BRANDING.reportFooterText ?? ""),
    )
    .replace(
      /\{\{WATERMARK\}\}/g,
      escapeHtml(branding.watermark ?? DEFAULT_BRANDING.watermark ?? ""),
    )
    .replace(
      /\{\{CLASSIFICATION_LABEL\}\}/g,
      escapeHtml(
        branding.classificationLabel ??
          DEFAULT_BRANDING.classificationLabel ??
          "",
      ),
    );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const brandingStore = new BrandingStore();
