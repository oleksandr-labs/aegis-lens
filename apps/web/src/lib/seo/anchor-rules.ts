/**
 * Anchor-text lint rule set. Each rule inspects a set of {@link AnchorRecord}s
 * (one per <a> on a page/template) and returns {@link AnchorViolation}s.
 *
 * Shared by the CMS variety lint (`anchor-lint.ts`) and the per-template audit
 * (`anchor-audit.ts`). Pure & locale-aware: anchors are translated, not
 * transliterated, so keyword-alignment checks compare against locale strings.
 *
 * Covers the TODO_anchor_text "Rules" group:
 *  - descriptive (no "click here")
 *  - variety (no same anchor repeated for different targets)
 *  - natural keyword inclusion (not stuffing)
 *  - internal anchor ↔ target keyword alignment
 *  - external anchor contextualization
 *  - per-page variety
 *  - no raw URLs as anchor text
 *  - image-alt-as-anchor (presence)
 *  - aria-label for icon-only links
 */

import type { Locale } from "@aegis/i18n-config";

export type AnchorRecord = {
  /** Visible anchor text (empty for image/icon-only links). */
  text: string;
  /** Resolved href. */
  href: string;
  locale: Locale;
  /** True if href points within this site. */
  internal: boolean;
  /** Target page's primary keyword(s), per locale, when known (internal links). */
  targetKeywords?: string[];
  /** Surrounding sentence/context text (for external contextualization check). */
  context?: string;
  /** True when the link's only child is an <img>. */
  isImageLink?: boolean;
  /** The <img alt> when `isImageLink`. */
  imageAlt?: string;
  /** True when the link has no text and no image (icon font / svg). */
  isIconOnly?: boolean;
  /** aria-label, if present. */
  ariaLabel?: string;
};

export type Severity = "error" | "warn";

export type AnchorViolation = {
  rule: string;
  severity: Severity;
  /** Index of the offending anchor in the input array, or -1 for page-level. */
  index: number;
  message: string;
};

/** Generic, non-descriptive phrases that should never be anchor text. */
const GENERIC_ANCHORS: Record<Locale, string[]> = {
  en: ["click here", "here", "read more", "more", "this", "link", "this page", "learn more"],
  uk: ["натисніть тут", "тут", "читати далі", "більше", "це", "посилання", "ця сторінка", "докладніше"],
  ru: [],
  pl: [],
  de: [],
  ro: [],
  fr: [],
  es: [],
};

const RAW_URL_RE = /^(https?:\/\/|www\.)/i;

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function words(s: string): string[] {
  return normalize(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

// ── Individual rules ─────────────────────────────────────────────────────────

/** Descriptive: anchor must not be a generic "click here"-style phrase. */
export function ruleDescriptive(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (a.isImageLink || a.isIconOnly) return;
    const generic = GENERIC_ANCHORS[a.locale] ?? GENERIC_ANCHORS.en;
    if (generic.includes(normalize(a.text))) {
      out.push({
        rule: "descriptive",
        severity: "error",
        index: i,
        message: `Non-descriptive anchor "${a.text.trim()}" — describe the target instead.`,
      });
    }
  });
  return out;
}

/** No raw URLs as anchor text. */
export function ruleNoRawUrl(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (RAW_URL_RE.test(a.text.trim())) {
      out.push({
        rule: "no-raw-url",
        severity: "warn",
        index: i,
        message: `Raw URL used as anchor text "${a.text.trim()}".`,
      });
    }
  });
  return out;
}

/**
 * Variety: the same anchor text pointing at *different* targets is an
 * over-optimization / ambiguity signal. Same text → same href is fine.
 */
export function ruleVariety(anchors: AnchorRecord[]): AnchorViolation[] {
  const byText = new Map<string, Set<string>>();
  anchors.forEach((a) => {
    if (!a.text.trim()) return;
    const key = normalize(a.text);
    let hrefs = byText.get(key);
    if (!hrefs) {
      hrefs = new Set<string>();
      byText.set(key, hrefs);
    }
    hrefs.add(a.href);
  });
  const out: AnchorViolation[] = [];
  for (const [text, hrefs] of byText) {
    if (hrefs.size > 1) {
      out.push({
        rule: "variety",
        severity: "warn",
        index: -1,
        message: `Anchor "${text}" links to ${hrefs.size} different targets — vary the wording.`,
      });
    }
  }
  return out;
}

/**
 * Per-page variety: too many links sharing one anchor (even to the same target)
 * looks templated. Threshold = repeats of the identical text.
 */
export function rulePerPageVariety(
  anchors: AnchorRecord[],
  maxRepeats = 4,
): AnchorViolation[] {
  const counts = new Map<string, number>();
  anchors.forEach((a) => {
    if (!a.text.trim()) return;
    const key = normalize(a.text);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const out: AnchorViolation[] = [];
  for (const [text, n] of counts) {
    if (n > maxRepeats) {
      out.push({
        rule: "per-page-variety",
        severity: "warn",
        index: -1,
        message: `Anchor "${text}" repeated ${n}× on one page (max ${maxRepeats}).`,
      });
    }
  }
  return out;
}

/**
 * Natural keyword inclusion / no stuffing: flag absurdly long anchors or those
 * that repeat a single token (keyword stuffing tell).
 */
export function ruleNaturalKeyword(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (a.isImageLink || a.isIconOnly) return;
    const ws = words(a.text);
    if (ws.length > 12) {
      out.push({
        rule: "natural-keyword",
        severity: "warn",
        index: i,
        message: `Anchor too long (${ws.length} words) — keep it natural and concise.`,
      });
    }
    const counts = new Map<string, number>();
    for (const w of ws) counts.set(w, (counts.get(w) ?? 0) + 1);
    for (const [w, n] of counts) {
      if (n >= 3) {
        out.push({
          rule: "natural-keyword",
          severity: "warn",
          index: i,
          message: `Keyword "${w}" repeated ${n}× in anchor — looks like stuffing.`,
        });
      }
    }
  });
  return out;
}

/**
 * Internal anchor ↔ target keyword alignment: an internal link's anchor should
 * share at least one meaningful token with the target's primary keyword(s)
 * where keywords are known. Only fires when `targetKeywords` is present.
 */
export function ruleKeywordAlignment(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (!a.internal || a.isImageLink || a.isIconOnly) return;
    if (!a.targetKeywords || a.targetKeywords.length === 0) return;
    const anchorWords = new Set(words(a.text));
    const kwWords = new Set(a.targetKeywords.flatMap((k) => words(k)));
    let overlap = false;
    for (const w of anchorWords) {
      if (kwWords.has(w)) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      out.push({
        rule: "keyword-alignment",
        severity: "warn",
        index: i,
        message: `Internal anchor "${a.text.trim()}" shares no keyword with target (${a.targetKeywords.join(", ")}).`,
      });
    }
  });
  return out;
}

/**
 * External anchor contextualization: external links should sit in explanatory
 * context (a non-empty surrounding sentence), not float bare.
 */
export function ruleExternalContext(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (a.internal) return;
    const ctx = (a.context ?? "").trim();
    // Context should contain more than just the anchor itself.
    if (ctx.length <= a.text.trim().length + 2) {
      out.push({
        rule: "external-context",
        severity: "warn",
        index: i,
        message: `External link "${a.text.trim() || a.href}" lacks surrounding context.`,
      });
    }
  });
  return out;
}

/** Image-link must carry alt text (alt serves as the anchor). */
export function ruleImageAltAnchor(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (!a.isImageLink) return;
    if (!a.imageAlt || !a.imageAlt.trim()) {
      out.push({
        rule: "image-alt-anchor",
        severity: "error",
        index: i,
        message: `Image link to ${a.href} has empty alt — alt text is the anchor.`,
      });
    }
  });
  return out;
}

/** Icon-only link must carry an aria-label. */
export function ruleIconAriaLabel(anchors: AnchorRecord[]): AnchorViolation[] {
  const out: AnchorViolation[] = [];
  anchors.forEach((a, i) => {
    if (!a.isIconOnly) return;
    if (!a.ariaLabel || !a.ariaLabel.trim()) {
      out.push({
        rule: "icon-aria-label",
        severity: "error",
        index: i,
        message: `Icon-only link to ${a.href} needs an aria-label.`,
      });
    }
  });
  return out;
}

/** The full rule set in run order. */
export const ANCHOR_RULES = [
  ruleDescriptive,
  ruleNoRawUrl,
  ruleVariety,
  rulePerPageVariety,
  ruleNaturalKeyword,
  ruleKeywordAlignment,
  ruleExternalContext,
  ruleImageAltAnchor,
  ruleIconAriaLabel,
] as const;

/** Run every rule and return all violations. */
export function lintAnchors(anchors: AnchorRecord[]): AnchorViolation[] {
  return ANCHOR_RULES.flatMap((rule) => rule(anchors));
}

export function hasErrors(violations: AnchorViolation[]): boolean {
  return violations.some((v) => v.severity === "error");
}
