/**
 * Anchor-text audit per template.
 *
 * Aggregates {@link AnchorRecord}s grouped by the template that emitted them
 * (e.g. "blog-post", "event-related", "region-hub") and reports anchor-profile
 * health per template: violation counts, variety, and the most-reused anchors.
 * This is the monitoring contract — pure compute over a sampled corpus; a real
 * crawler/CMS export plugs in as the `samples` source.
 */

import { lintAnchors, type AnchorRecord, type AnchorViolation } from "./anchor-rules";
import { varietyScore } from "./anchor-lint";

export type TemplateSample = {
  /** Template / route-template identifier. */
  template: string;
  /** A single rendered page's anchors. */
  anchors: AnchorRecord[];
};

export type TemplateAudit = {
  template: string;
  pages: number;
  totalAnchors: number;
  /** Mean per-page variety score across sampled pages. */
  meanVariety: number;
  errorCount: number;
  warnCount: number;
  /** Most-reused anchor texts across the template, descending. */
  topAnchors: { text: string; count: number }[];
  violations: AnchorViolation[];
};

export type AuditThresholds = {
  /** Below this mean variety → template flagged. */
  minMeanVariety: number;
  /** Any errors → flagged. */
  maxErrors: number;
};

export const DEFAULT_THRESHOLDS: AuditThresholds = {
  minMeanVariety: 0.6,
  maxErrors: 0,
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Audit one template from its sampled pages. */
export function auditTemplate(
  template: string,
  pages: AnchorRecord[][],
): TemplateAudit {
  const allAnchors = pages.flat();
  const violations = pages.flatMap((p) => lintAnchors(p));

  const varieties = pages.map((p) => varietyScore(p));
  const meanVariety =
    varieties.length === 0
      ? 1
      : varieties.reduce((a, b) => a + b, 0) / varieties.length;

  const counts = new Map<string, number>();
  for (const a of allAnchors) {
    const key = normalize(a.text);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const topAnchors = [...counts.entries()]
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    template,
    pages: pages.length,
    totalAnchors: allAnchors.length,
    meanVariety,
    errorCount: violations.filter((v) => v.severity === "error").length,
    warnCount: violations.filter((v) => v.severity === "warn").length,
    topAnchors,
    violations,
  };
}

/**
 * Audit a corpus of samples, grouping by template. Returns one audit per
 * template, sorted worst-first (errors, then low variety).
 */
export function auditCorpus(samples: TemplateSample[]): TemplateAudit[] {
  const byTemplate = new Map<string, AnchorRecord[][]>();
  for (const s of samples) {
    let pages = byTemplate.get(s.template);
    if (!pages) {
      pages = [];
      byTemplate.set(s.template, pages);
    }
    pages.push(s.anchors);
  }
  return [...byTemplate.entries()]
    .map(([template, pages]) => auditTemplate(template, pages))
    .sort(
      (a, b) => b.errorCount - a.errorCount || a.meanVariety - b.meanVariety,
    );
}

/** A template is flagged when it breaches thresholds. */
export function isFlagged(
  audit: TemplateAudit,
  thresholds: AuditThresholds = DEFAULT_THRESHOLDS,
): boolean {
  return (
    audit.errorCount > thresholds.maxErrors ||
    audit.meanVariety < thresholds.minMeanVariety
  );
}
