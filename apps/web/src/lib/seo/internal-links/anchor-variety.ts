/**
 * Anchor-text variety hook.
 *
 * Over-optimization signal: every link to a page using the identical anchor.
 * This module references the "anchor_text cluster" (see
 * `TODO/seo/TODO_anchor_text.md`) and keeps the coupling LOOSE — it does not
 * own anchor generation, it just (a) offers a small pool of natural anchor
 * variants per target so callers can rotate, and (b) lints an existing set of
 * anchors pointing at one target for excessive repetition.
 *
 * i18n: anchors are translated text, never transliterated; variants are built
 * from already-localized title/keyword strings the caller supplies.
 */

import type { LinkEdge } from "./link-graph";

/** Inputs for generating anchor variants for ONE target page (one locale). */
export interface AnchorSeed {
  /** Localized page title, e.g. "Kharkiv Oblast". */
  title: string;
  /** Optional localized primary keyword/topic, e.g. "drone strikes". */
  keyword?: string;
  /** Optional localized contextual phrase, e.g. "events in this region". */
  context?: string;
}

/**
 * Produce a small ordered pool of natural anchor variants. Loose by design:
 * callers pick/rotate; we never force a specific choice. Raw URLs are never
 * emitted as anchors (TODO_anchor_text rule). Deduped, order-stable.
 */
export function anchorVariants(seed: AnchorSeed): string[] {
  const out: string[] = [];
  const push = (s?: string) => {
    const t = (s ?? "").trim();
    if (t && !out.includes(t)) out.push(t);
  };
  push(seed.title);
  if (seed.keyword) {
    push(seed.keyword);
    push(`${seed.title}: ${seed.keyword}`);
  }
  push(seed.context);
  if (seed.keyword && seed.context) push(`${seed.keyword} — ${seed.context}`);
  return out;
}

/**
 * Deterministically choose a variant for the Nth link to a target so repeated
 * links to the same page rotate anchors instead of repeating one. `index` is
 * the count of prior links to that target from the same source cluster.
 */
export function pickAnchor(seed: AnchorSeed, index: number): string {
  const pool = anchorVariants(seed);
  if (pool.length === 0) return seed.title;
  return pool[index % pool.length];
}

export interface AnchorVarietyReport {
  /** Target url -> distinct-anchor-ratio (1 = all unique, →0 = all same). */
  diversity: Map<string, number>;
  /** Targets flagged for low anchor diversity. */
  flagged: { to: string; anchors: string[]; ratio: number }[];
}

/**
 * Lint a set of edges for anchor sameness. For each target receiving ≥
 * `minLinks` internal links, compute distinct-anchor ratio; flag when it falls
 * below `minRatio` (the over-optimization smell). Loose threshold by default.
 */
export function lintAnchorVariety(
  edges: LinkEdge[],
  opts: { minLinks?: number; minRatio?: number } = {},
): AnchorVarietyReport {
  const { minLinks = 4, minRatio = 0.4 } = opts;
  const byTarget = new Map<string, string[]>();
  for (const e of edges) {
    (byTarget.get(e.to) ?? byTarget.set(e.to, []).get(e.to)!).push(e.anchor);
  }

  const diversity = new Map<string, number>();
  const flagged: AnchorVarietyReport["flagged"] = [];
  for (const [to, anchors] of byTarget) {
    const ratio = anchors.length === 0 ? 1 : new Set(anchors).size / anchors.length;
    diversity.set(to, ratio);
    if (anchors.length >= minLinks && ratio < minRatio) {
      flagged.push({ to, anchors, ratio });
    }
  }
  flagged.sort((a, b) => a.ratio - b.ratio || a.to.localeCompare(b.to));
  return { diversity, flagged };
}
