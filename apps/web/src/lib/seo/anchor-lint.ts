/**
 * CMS anchor-text variety lint — shared between TODO_internal_links #5 and
 * TODO_anchor_text "Per-page anchor-text variety lint".
 *
 * Thin orchestration layer over {@link lintAnchors} (the rule set) producing a
 * single CMS-facing report: pass/fail + grouped violations + a variety score.
 * Designed to run on save in the CMS and in CI; pure, no I/O.
 */

import {
  lintAnchors,
  hasErrors,
  type AnchorRecord,
  type AnchorViolation,
} from "./anchor-rules";

export type AnchorLintReport = {
  ok: boolean;
  /** 0..1 — share of links with a distinct, descriptive anchor. */
  varietyScore: number;
  errorCount: number;
  warnCount: number;
  violations: AnchorViolation[];
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Variety score: distinct non-empty anchor texts / total texted links.
 * 1.0 means every link has a unique anchor; lower means repetition.
 */
export function varietyScore(anchors: AnchorRecord[]): number {
  const texts = anchors.map((a) => normalize(a.text)).filter(Boolean);
  if (texts.length === 0) return 1;
  return new Set(texts).size / texts.length;
}

/**
 * Lint a page/template's anchors for the CMS. `minVariety` lets editors enforce
 * a floor (default 0.6) in addition to hard rule errors.
 */
export function lintCmsAnchors(
  anchors: AnchorRecord[],
  opts: { minVariety?: number } = {},
): AnchorLintReport {
  const minVariety = opts.minVariety ?? 0.6;
  const violations = lintAnchors(anchors);
  const score = varietyScore(anchors);

  if (score < minVariety) {
    violations.push({
      rule: "min-variety",
      severity: "warn",
      index: -1,
      message: `Anchor variety ${score.toFixed(2)} below floor ${minVariety.toFixed(2)}.`,
    });
  }

  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warnCount = violations.filter((v) => v.severity === "warn").length;

  return {
    ok: !hasErrors(violations),
    varietyScore: score,
    errorCount,
    warnCount,
    violations,
  };
}
