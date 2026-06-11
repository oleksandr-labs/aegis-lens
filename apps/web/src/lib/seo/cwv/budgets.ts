/**
 * Core Web Vitals budgets — typed thresholds + p75 pass/fail evaluator.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Targets"). These are the contractual
 * performance budgets for the PUBLIC surface (landing + programmatic SEO pages).
 * The authenticated map workspace is exempt from public CWV scoring (see the
 * TODO "Примітки") — callers should pass `surface: "workspace"` to skip the
 * budget gate there.
 *
 * Google scores CWV at the 75th percentile of real-user samples, so the
 * evaluator operates on p75 values. The thresholds below intentionally match
 * the sprint targets, which are STRICTER than Google's own "good" thresholds
 * (e.g. LCP 2.0s here vs 2.5s "good") to leave headroom.
 */

/** The four Core Web Vitals + TTFB we budget against. */
export type CwvMetric = "LCP" | "INP" | "CLS" | "TTFB";

/** Which public surface a measurement belongs to. */
export type CwvSurface = "landing" | "programmatic" | "workspace";

/** Verdict for a single metric at p75. */
export type CwvVerdict = "pass" | "needs-improvement" | "fail";

/**
 * A single metric budget. `good` is our sprint target (the pass ceiling).
 * `poor` is the Google "poor" floor — above it the metric is a hard fail;
 * between `good` and `poor` it "needs improvement". Units: ms for LCP/INP/TTFB,
 * unitless ratio for CLS.
 */
export interface MetricBudget {
  metric: CwvMetric;
  /** Pass ceiling at p75 (our sprint target). */
  good: number;
  /** Failure floor at p75 (Google "poor" boundary). */
  poor: number;
  /** Unit, for display/serialization. */
  unit: "ms" | "ratio";
}

/**
 * Sprint 2.61 budgets. LCP < 2.0s, INP < 200ms, CLS < 0.05, TTFB < 600ms.
 * `poor` floors follow Google's published CWV "poor" boundaries.
 */
export const CWV_BUDGETS: Readonly<Record<CwvMetric, MetricBudget>> = {
  LCP: { metric: "LCP", good: 2000, poor: 4000, unit: "ms" },
  INP: { metric: "INP", good: 200, poor: 500, unit: "ms" },
  CLS: { metric: "CLS", good: 0.05, poor: 0.25, unit: "ratio" },
  TTFB: { metric: "TTFB", good: 600, poor: 1800, unit: "ms" },
} as const;

/** A p75 sample for one metric. */
export interface MetricSample {
  metric: CwvMetric;
  /** The 75th-percentile value over the reporting window. */
  p75: number;
}

/** Result of evaluating one metric against its budget. */
export interface MetricResult {
  metric: CwvMetric;
  p75: number;
  budget: MetricBudget;
  verdict: CwvVerdict;
  /** Amount over the `good` ceiling (0 if within budget). Same unit as metric. */
  overBy: number;
}

/** Evaluate a single p75 value against its budget. */
export function evaluateMetric(sample: MetricSample): MetricResult {
  const budget = CWV_BUDGETS[sample.metric];
  let verdict: CwvVerdict;
  if (sample.p75 <= budget.good) verdict = "pass";
  else if (sample.p75 <= budget.poor) verdict = "needs-improvement";
  else verdict = "fail";
  const overBy = sample.p75 > budget.good ? round(sample.p75 - budget.good) : 0;
  return { metric: sample.metric, p75: sample.p75, budget, verdict, overBy };
}

/** Aggregate verdict for a set of metrics. */
export interface CwvReport {
  surface: CwvSurface;
  results: MetricResult[];
  /** True when every measured metric is `pass`. */
  pass: boolean;
  /** Metrics that did not pass, worst-first. */
  failures: MetricResult[];
}

/**
 * Evaluate a full set of p75 samples for a surface. The authenticated
 * workspace surface always passes (exempt from public CWV scoring) but its
 * results are still computed for internal visibility.
 */
export function evaluateReport(surface: CwvSurface, samples: MetricSample[]): CwvReport {
  const results = samples.map(evaluateMetric);
  const failures = results
    .filter((r) => r.verdict !== "pass")
    .sort((a, b) => severity(b.verdict) - severity(a.verdict) || b.overBy - a.overBy);
  const pass = surface === "workspace" ? true : failures.length === 0;
  return { surface, results, pass, failures };
}

function severity(v: CwvVerdict): number {
  return v === "fail" ? 2 : v === "needs-improvement" ? 1 : 0;
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
