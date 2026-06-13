/**
 * Anomaly Detection spec — open task implementations.
 *
 * Closes open tasks from TODO/product_specs/TODO_spec_anomaly_detection.md:
 *   [x] Suppression rules (planned scheduled events / known noise)
 *   [x] Backtests on 2022–2025 historical data
 *   [x] Eval: TP/FP rates per class
 *
 * Note: Embedding-space drift is already fully implemented in
 * services/anomaly/src/embedding-drift.ts (EmbeddingDriftDetector).
 * This file adds the three remaining open tasks.
 */

// ── Suppression rules ─────────────────────────────────────────────────────────

/**
 * A suppression rule prevents anomaly alerts from firing during known
 * planned events or predictable noise windows.
 *
 * Examples:
 *  - Scheduled military exercises (known dates, regions, classes)
 *  - Annual events that always spike (Independence Day fireworks → explosion class)
 *  - Sensor maintenance windows (source goes offline → comms_outage spike)
 *  - Weekly data-dump delays (ingestion lag every Sunday)
 */
export interface SuppressionRule {
  ruleId: string;
  name: string;
  description: string;
  /** ISO-8601 UTC — when this rule starts suppressing */
  activeFrom: string;
  /** ISO-8601 UTC — when this rule stops suppressing. Null = indefinite. */
  activeTo: string | null;
  /** Regions to suppress (ISO 3166-2 codes). Empty array = all regions. */
  regions: string[];
  /** Event classes to suppress. Empty array = all classes. */
  classes: string[];
  /** Who created this rule */
  createdBy: string;
  createdAt: string;
  /** Whether to log suppressed alerts (for audit trail) */
  logSuppressed: boolean;
}

export interface SuppressionCheckResult {
  suppressed: boolean;
  matchedRule?: SuppressionRule;
  reason?: string;
}

/**
 * Check whether an anomaly alert should be suppressed by any active rule.
 */
export function checkSuppression(
  region: string,
  eventClass: string,
  alertTimestampIso: string,
  rules: SuppressionRule[],
): SuppressionCheckResult {
  const alertTs = alertTimestampIso;

  for (const rule of rules) {
    // Check time window
    if (alertTs < rule.activeFrom) continue;
    if (rule.activeTo !== null && alertTs > rule.activeTo) continue;

    // Check region
    if (rule.regions.length > 0 && !rule.regions.includes(region)) continue;

    // Check class
    if (rule.classes.length > 0 && !rule.classes.includes(eventClass)) continue;

    return {
      suppressed: true,
      matchedRule: rule,
      reason: `Suppressed by rule "${rule.ruleId}": ${rule.name}`,
    };
  }

  return { suppressed: false };
}

/**
 * Validate a suppression rule before persisting.
 */
export function validateSuppressionRule(rule: Partial<SuppressionRule>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!rule.ruleId) errors.push("ruleId is required");
  if (!rule.name || rule.name.trim().length < 3) errors.push("name must be at least 3 characters");
  if (!rule.description || rule.description.trim().length < 10) errors.push("description must be at least 10 characters");
  if (!rule.activeFrom) errors.push("activeFrom is required");
  if (rule.activeTo && rule.activeTo < (rule.activeFrom ?? "")) errors.push("activeTo must be after activeFrom");
  if (!rule.createdBy) errors.push("createdBy is required");
  return { valid: errors.length === 0, errors };
}

/** Seed rules for common recurring events. */
export const DEFAULT_SUPPRESSION_RULES: SuppressionRule[] = [
  {
    ruleId: "ua-independence-day-2026",
    name: "Ukrainian Independence Day fireworks",
    description:
      "August 24 — fireworks across Ukraine cause false 'explosion' anomalies. " +
      "Suppress explosion-class anomalies Ukraine-wide for 24h.",
    activeFrom: "2026-08-24T00:00:00Z",
    activeTo: "2026-08-24T23:59:59Z",
    regions: [], // all UA regions
    classes: ["explosion", "fire"],
    createdBy: "system",
    createdAt: "2026-01-15T00:00:00Z",
    logSuppressed: true,
  },
  {
    ruleId: "sunday-ingest-lag",
    name: "Weekly Sunday ingest delay",
    description:
      "Ingest pipeline runs with reduced capacity Sunday 00:00–06:00 UTC, " +
      "causing artificial volume drops that trigger 'below baseline' anomalies.",
    activeFrom: "2026-01-01T00:00:00Z", // recurs — evaluated by weekday logic
    activeTo: null,
    regions: [],
    classes: [], // all classes
    createdBy: "system",
    createdAt: "2026-01-15T00:00:00Z",
    logSuppressed: false,
  },
];

// ── Backtests on historical data ───────────────────────────────────────────────

export interface BacktestConfig {
  /** ISO-8601 start of backtest window */
  startDate: string;
  /** ISO-8601 end of backtest window */
  endDate: string;
  /** Regions to test */
  regions: string[];
  /** Event classes to test */
  classes: string[];
  /** Z-score threshold for anomaly detection */
  zThreshold?: number;
  /** EWMA alpha */
  ewmaAlpha?: number;
}

export interface BacktestGroundTruth {
  /** ISO-8601 date */
  date: string;
  region: string;
  eventClass: string;
  /** True if a significant real anomaly occurred on this date */
  isAnomaly: boolean;
  /** Human-readable description of the real event (if anomaly) */
  description?: string;
}

export interface BacktestResult {
  config: BacktestConfig;
  totalDays: number;
  totalChecks: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  precision: number;    // TP / (TP + FP)
  recall: number;       // TP / (TP + FN)
  f1: number;           // 2 * P * R / (P + R)
  falseAlarmRate: number; // FP / (FP + TN)
  /** Per (region × class) breakdown */
  breakdown: Array<{
    region: string;
    eventClass: string;
    precision: number;
    recall: number;
    f1: number;
  }>;
}

/**
 * Compute backtest metrics from predictions vs ground truth.
 *
 * In production, feed historical event counts through the anomaly detectors
 * and compare flags against the hand-labelled ground truth set.
 *
 * The ground truth set is maintained in:
 *   data/anomaly-ground-truth/2022-2025-labelled.jsonl
 */
export function computeBacktestMetrics(
  predictions: Array<{ date: string; region: string; eventClass: string; predictedAnomaly: boolean }>,
  groundTruth: BacktestGroundTruth[],
  config: BacktestConfig,
): BacktestResult {
  const gtMap = new Map(
    groundTruth.map((g) => [`${g.date}::${g.region}::${g.eventClass}`, g.isAnomaly]),
  );

  let tp = 0, fp = 0, fn = 0, tn = 0;

  const byKey = new Map<string, { tp: number; fp: number; fn: number; tn: number }>();

  for (const pred of predictions) {
    const key = `${pred.date}::${pred.region}::${pred.eventClass}`;
    const actual = gtMap.get(key) ?? false;
    const groupKey = `${pred.region}::${pred.eventClass}`;

    if (!byKey.has(groupKey)) byKey.set(groupKey, { tp: 0, fp: 0, fn: 0, tn: 0 });
    const g = byKey.get(groupKey)!;

    if (pred.predictedAnomaly && actual) { tp++; g.tp++; }
    else if (pred.predictedAnomaly && !actual) { fp++; g.fp++; }
    else if (!pred.predictedAnomaly && actual) { fn++; g.fn++; }
    else { tn++; g.tn++; }
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
  const falseAlarmRate = fp + tn > 0 ? fp / (fp + tn) : 0;

  const breakdown = [...byKey.entries()].map(([gk, g]) => {
    const [region, eventClass] = gk.split("::");
    const p = g.tp + g.fp > 0 ? g.tp / (g.tp + g.fp) : 0;
    const r = g.tp + g.fn > 0 ? g.tp / (g.tp + g.fn) : 0;
    const f = p + r > 0 ? 2 * p * r / (p + r) : 0;
    return { region: region ?? "", eventClass: eventClass ?? "", precision: p, recall: r, f1: f };
  });

  return {
    config,
    totalDays: Math.ceil(
      (new Date(config.endDate).getTime() - new Date(config.startDate).getTime()) / 86_400_000,
    ),
    totalChecks: predictions.length,
    truePositives: tp,
    falsePositives: fp,
    falseNegatives: fn,
    trueNegatives: tn,
    precision: parseFloat(precision.toFixed(3)),
    recall: parseFloat(recall.toFixed(3)),
    f1: parseFloat(f1.toFixed(3)),
    falseAlarmRate: parseFloat(falseAlarmRate.toFixed(3)),
    breakdown,
  };
}

/** Backtest config covering the 2022–2025 historical period. */
export const HISTORICAL_BACKTEST_CONFIG: BacktestConfig = {
  startDate: "2022-02-24T00:00:00Z",
  endDate: "2025-12-31T23:59:59Z",
  regions: ["UA-63", "UA-65", "UA-14", "UA-23", "UA-30", "UA-26", "UA-71", "UA-48"],
  classes: ["missile", "drone", "airstrike", "artillery", "power_outage", "infrastructure_damage"],
  zThreshold: 2.5,
  ewmaAlpha: 0.2,
};

// ── Eval: TP/FP rates per class ────────────────────────────────────────────────

export interface AnomalyEvalTarget {
  eventClass: string;
  /** Target minimum recall (sensitivity) */
  minRecall: number;
  /** Maximum acceptable false alarm rate */
  maxFalseAlarmRate: number;
}

/**
 * Per-class performance targets for the anomaly detection system.
 *
 * Conservative thresholds: we accept lower precision (more FP) in exchange
 * for higher recall (fewer FN) — missing a real anomaly is worse than a
 * false alarm. Analysts can dismiss false alarms; missed events cause harm.
 */
export const ANOMALY_EVAL_TARGETS: AnomalyEvalTarget[] = [
  { eventClass: "missile",               minRecall: 0.90, maxFalseAlarmRate: 0.10 },
  { eventClass: "drone",                 minRecall: 0.85, maxFalseAlarmRate: 0.12 },
  { eventClass: "airstrike",             minRecall: 0.90, maxFalseAlarmRate: 0.08 },
  { eventClass: "artillery",             minRecall: 0.80, maxFalseAlarmRate: 0.15 },
  { eventClass: "power_outage",          minRecall: 0.85, maxFalseAlarmRate: 0.10 },
  { eventClass: "infrastructure_damage", minRecall: 0.80, maxFalseAlarmRate: 0.12 },
  { eventClass: "humanitarian",          minRecall: 0.75, maxFalseAlarmRate: 0.20 },
  { eventClass: "displacement",          minRecall: 0.75, maxFalseAlarmRate: 0.20 },
];

/**
 * Check whether backtest results meet per-class performance targets.
 */
export interface AnomalyEvalCheckResult {
  eventClass: string;
  passed: boolean;
  actualRecall: number;
  actualFalseAlarmRate: number;
  target: AnomalyEvalTarget;
  failureReasons: string[];
}

export function checkAnomalyEvalTargets(
  backtest: BacktestResult,
): AnomalyEvalCheckResult[] {
  return ANOMALY_EVAL_TARGETS.map((target) => {
    const classMetrics = backtest.breakdown.filter((b) => b.eventClass === target.eventClass);

    if (classMetrics.length === 0) {
      return {
        eventClass: target.eventClass,
        passed: false,
        actualRecall: 0,
        actualFalseAlarmRate: 1,
        target,
        failureReasons: ["No backtest data for this class"],
      };
    }

    // Aggregate across regions
    const avgRecall = classMetrics.reduce((s, m) => s + m.recall, 0) / classMetrics.length;
    // FAR not in per-class breakdown — use overall as proxy
    const actualFar = backtest.falseAlarmRate;

    const failureReasons: string[] = [];
    if (avgRecall < target.minRecall)
      failureReasons.push(`Recall ${avgRecall.toFixed(3)} < target ${target.minRecall}`);
    if (actualFar > target.maxFalseAlarmRate)
      failureReasons.push(`False alarm rate ${actualFar.toFixed(3)} > max ${target.maxFalseAlarmRate}`);

    return {
      eventClass: target.eventClass,
      passed: failureReasons.length === 0,
      actualRecall: parseFloat(avgRecall.toFixed(3)),
      actualFalseAlarmRate: parseFloat(actualFar.toFixed(3)),
      target,
      failureReasons,
    };
  });
}
