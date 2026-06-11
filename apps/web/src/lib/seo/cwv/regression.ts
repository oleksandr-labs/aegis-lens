/**
 * Weekly CWV regression alert.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Weekly CWV regression alert").
 * Compares this week's p75 per metric/route/surface against the previous week
 * (and the budget from `budgets.ts`) and emits alerts when a metric regresses
 * meaningfully or crosses a budget boundary. Designed to run on a weekly cron
 * over aggregated RUM/CrUX data (`rum.ts` supplies the field samples).
 *
 * Pure compute + thresholds — no scheduler, no transport. The cron job and the
 * notification channel (email/Slack) plug into `detectRegressions`.
 */

import { CWV_BUDGETS, type CwvMetric, type CwvSurface, type CwvVerdict, evaluateMetric } from "./budgets";

/** One metric's p75 for a (route, surface) over a week. */
export interface WeeklyMetricPoint {
  metric: CwvMetric;
  route: string;
  surface: CwvSurface;
  /** 75th percentile over the week. */
  p75: number;
  /** Number of samples (used to suppress low-confidence alerts). */
  samples: number;
}

export interface RegressionThresholds {
  /**
   * Relative worsening that triggers an alert even within budget, e.g. 0.10 =
   * a 10% week-over-week increase in a ms metric (or CLS).
   */
  relWorsen: number;
  /** Minimum samples for a point to be trusted. */
  minSamples: number;
}

export const DEFAULT_THRESHOLDS: RegressionThresholds = {
  relWorsen: 0.1,
  minSamples: 100,
};

export type AlertReason =
  /** Crossed from pass into needs-improvement/fail. */
  | "budget-breach"
  /** Worsened week-over-week beyond relWorsen (still maybe within budget). */
  | "trend-worsen"
  /** Newly fails the budget this week. */
  | "now-failing";

export type AlertSeverity = "warning" | "critical";

export interface RegressionAlert {
  metric: CwvMetric;
  route: string;
  surface: CwvSurface;
  reason: AlertReason;
  severity: AlertSeverity;
  previousP75: number | null;
  currentP75: number;
  /** Relative change vs previous week (positive = worse), null if no baseline. */
  deltaPct: number | null;
  currentVerdict: CwvVerdict;
}

function key(p: { metric: CwvMetric; route: string; surface: CwvSurface }): string {
  return `${p.surface}|${p.route}|${p.metric}`;
}

/**
 * Compare current vs previous weekly points and produce alerts. Workspace
 * surface points are ignored (exempt from public CWV scoring). Low-sample
 * current points are skipped to avoid noisy alerts.
 */
export function detectRegressions(
  current: readonly WeeklyMetricPoint[],
  previous: readonly WeeklyMetricPoint[],
  thresholds: RegressionThresholds = DEFAULT_THRESHOLDS,
): RegressionAlert[] {
  const prevByKey = new Map(previous.map((p) => [key(p), p]));
  const alerts: RegressionAlert[] = [];

  for (const cur of current) {
    if (cur.surface === "workspace") continue;
    if (cur.samples < thresholds.minSamples) continue;

    const budget = CWV_BUDGETS[cur.metric];
    const curVerdict = evaluateMetric({ metric: cur.metric, p75: cur.p75 }).verdict;
    const prev = prevByKey.get(key(cur));
    const deltaPct = prev && prev.p75 > 0 ? (cur.p75 - prev.p75) / prev.p75 : null;

    const prevPassing = prev ? evaluateMetric({ metric: cur.metric, p75: prev.p75 }).verdict === "pass" : true;
    const nowNotPassing = curVerdict !== "pass";

    let reason: AlertReason | null = null;
    let severity: AlertSeverity = "warning";

    if (prevPassing && nowNotPassing) {
      reason = "budget-breach";
      severity = curVerdict === "fail" ? "critical" : "warning";
    } else if (nowNotPassing && cur.p75 > budget.poor) {
      reason = "now-failing";
      severity = "critical";
    } else if (deltaPct != null && deltaPct >= thresholds.relWorsen) {
      reason = "trend-worsen";
      severity = nowNotPassing ? "critical" : "warning";
    }

    if (reason) {
      alerts.push({
        metric: cur.metric,
        route: cur.route,
        surface: cur.surface,
        reason,
        severity,
        previousP75: prev ? prev.p75 : null,
        currentP75: cur.p75,
        deltaPct: deltaPct == null ? null : Math.round(deltaPct * 1000) / 1000,
        currentVerdict: curVerdict,
      });
    }
  }

  // critical first, then biggest regression.
  return alerts.sort(
    (a, b) =>
      (b.severity === "critical" ? 1 : 0) - (a.severity === "critical" ? 1 : 0) ||
      (b.deltaPct ?? 0) - (a.deltaPct ?? 0),
  );
}
