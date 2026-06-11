/**
 * Critical CSS inlining strategy + above-the-fold extraction model.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Critical CSS inlining"). Inlining the
 * minimal CSS needed to paint the above-the-fold region removes the
 * render-blocking stylesheet from the critical path and improves LCP/FCP. The
 * remainder of the stylesheet loads non-blocking and is applied once parsed.
 *
 * This module is the typed CONTRACT for that pipeline — what counts as
 * "above the fold" per surface, the size budget for inlined CSS, and a pure
 * function that selects which CSS rules to inline given a set of selectors
 * that appear in the above-the-fold markup. It does not parse real CSS; the
 * build step (e.g. a critters/beasties pass) supplies the selector/rule data.
 */

import type { CwvSurface } from "./budgets";

/** Viewport used to define the "fold" when extracting critical CSS. */
export interface FoldViewport {
  width: number;
  height: number;
}

/** Mobile-first fold — Google scores mobile; this is the extraction target. */
export const DEFAULT_FOLD: FoldViewport = { width: 360, height: 640 };

/**
 * Max bytes of CSS we will inline into <head>. Beyond this, inlining stops
 * paying off (HTML grows, can't be cached separately). 14KB ~ first TCP
 * congestion window; keep critical CSS within it.
 */
export const MAX_INLINE_BYTES = 14 * 1024;

/** How the non-critical stylesheet is loaded after the inline block. */
export type DeferredCssLoad =
  /** <link rel=preload as=style onload=...> then swap to stylesheet. */
  | "preload-swap"
  /** media=print trick flipped to all onload. */
  | "media-toggle";

export interface CriticalCssPolicy {
  surface: CwvSurface;
  /** Inline above-the-fold CSS for this surface? */
  inline: boolean;
  fold: FoldViewport;
  maxInlineBytes: number;
  deferredLoad: DeferredCssLoad;
}

/**
 * Per-surface policy. Public surfaces inline critical CSS; the auth'd
 * workspace does not (exempt from public CWV, ships an app shell anyway).
 */
export const CRITICAL_CSS_POLICY: Readonly<Record<CwvSurface, CriticalCssPolicy>> = {
  landing: { surface: "landing", inline: true, fold: DEFAULT_FOLD, maxInlineBytes: MAX_INLINE_BYTES, deferredLoad: "preload-swap" },
  programmatic: { surface: "programmatic", inline: true, fold: DEFAULT_FOLD, maxInlineBytes: MAX_INLINE_BYTES, deferredLoad: "preload-swap" },
  workspace: { surface: "workspace", inline: false, fold: DEFAULT_FOLD, maxInlineBytes: MAX_INLINE_BYTES, deferredLoad: "media-toggle" },
} as const;

/** One CSS rule keyed by its selector, with its serialized byte cost. */
export interface CssRule {
  selector: string;
  /** Serialized rule text size in bytes (selector + declarations). */
  bytes: number;
}

export interface CriticalCssPlan {
  /** Rules selected for inlining, in input order, within the byte budget. */
  inline: CssRule[];
  /** Rules deferred to the non-blocking stylesheet. */
  deferred: CssRule[];
  /** Total inlined bytes. */
  inlinedBytes: number;
  /** True if some above-fold rules were dropped due to the budget. */
  overBudget: boolean;
}

/**
 * Select which rules to inline. `aboveFoldSelectors` is the set of selectors
 * the extractor found in the above-the-fold DOM. Rules whose selector is in
 * that set are candidates; we inline greedily in order until the byte budget
 * is hit, deferring the rest.
 */
export function planCriticalCss(
  rules: readonly CssRule[],
  aboveFoldSelectors: ReadonlySet<string>,
  policy: CriticalCssPolicy,
): CriticalCssPlan {
  const inline: CssRule[] = [];
  const deferred: CssRule[] = [];
  let inlinedBytes = 0;
  let overBudget = false;

  for (const rule of rules) {
    const isCritical = policy.inline && aboveFoldSelectors.has(rule.selector);
    if (isCritical && inlinedBytes + rule.bytes <= policy.maxInlineBytes) {
      inline.push(rule);
      inlinedBytes += rule.bytes;
    } else {
      if (isCritical) overBudget = true; // wanted to inline but no room
      deferred.push(rule);
    }
  }
  return { inline, deferred, inlinedBytes, overBudget };
}
