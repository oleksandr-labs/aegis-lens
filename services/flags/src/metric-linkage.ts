/**
 * Feature flag → metric linkage.
 *
 * Every flag that influences product behaviour should declare:
 *  - Which north-star and guardrail metrics it is expected to affect
 *  - The direction of expected change
 *  - A minimum detectable effect threshold to avoid underpowered reads
 *
 * This module provides:
 *  - `FlagMetricLink`: the linkage record attached to a flag
 *  - `FlagMetricRegistry`: CRUD for link records + helpers for analysis pipelines
 *  - `recordFlagExposure()`: emit an exposure event so analytics can attribute metric moves
 *  - `FlagMetricSnapshot`: a time-stamped metric observation tied to a flag + variant
 *  - `computeFlagMetricEffect()`: naive treatment-vs-control delta (plug in a real stats engine in production)
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MetricDirection = "increase" | "decrease" | "no_change";

/** A metric that a flag is expected to influence. */
export interface LinkedMetric {
  /** Metric identifier (matches north-star / analytics DB column name). */
  metricId: string;
  /** Human-readable name for reporting. */
  metricName: string;
  /** Expected direction of change when flag is enabled. */
  expectedDirection: MetricDirection;
  /**
   * Minimum relative change considered meaningful, e.g. 0.05 = 5%.
   * Used to assess whether an observed effect is practically significant.
   */
  minimumDetectableEffect: number;
  /** If true, a regression in this metric should trigger an alert / auto-rollback. */
  isGuardrail: boolean;
}

/** Linkage record connecting a feature flag to one or more metrics. */
export interface FlagMetricLink {
  linkId: string;
  flagKey: string;
  metrics: LinkedMetric[];
  /** User who attached this linkage. */
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Free-text hypothesis describing the expected causal mechanism.
   * Stored pre-launch and treated as immutable after the flag goes live.
   */
  hypothesis?: string;
}

/** An exposure event: a user was bucketed into a flag variant. */
export interface FlagExposureEvent {
  exposureId: string;
  flagKey: string;
  /** null = control (flag off) */
  variantKey: string | null;
  userId: string;
  orgId?: string;
  timestamp: string;
}

/**
 * A point-in-time metric observation tied to a flag, variant, and cohort.
 * Produced by the analytics pipeline and stored here for the dashboard.
 */
export interface FlagMetricSnapshot {
  snapshotId: string;
  flagKey: string;
  /** null = control group (flag off) */
  variantKey: string | null;
  metricId: string;
  /** Arithmetic mean of the metric across all users in the cohort. */
  meanValue: number;
  /** Number of observations in this cohort. */
  sampleSize: number;
  /** Sample standard deviation. */
  stdDev: number;
  /** ISO 8601 — window start */
  windowStart: string;
  /** ISO 8601 — window end */
  windowEnd: string;
  recordedAt: string;
}

/**
 * Simple treatment vs control delta.
 * In production use a proper sequential testing library (e.g. statsig, eppo).
 */
export interface FlagMetricEffect {
  flagKey: string;
  variantKey: string;
  metricId: string;
  controlMean: number;
  treatmentMean: number;
  /** Relative lift: (treatment - control) / control */
  relativeLift: number;
  /** Absolute difference */
  absoluteDelta: number;
  /** Pooled standard error of the mean difference */
  standardError: number;
  /** Two-sided z-score */
  zScore: number;
  /** Approximate two-sided p-value (normal approximation — replace with t-dist for small n) */
  pValue: number;
  /** Whether the effect is statistically significant at α = 0.05 */
  isSignificant: boolean;
  /** Whether the effect meets the MDE declared in the metric link */
  meetsMde: boolean;
  /** Whether a guardrail metric has regressed significantly (p < 0.05, direction wrong) */
  guardrailBreached: boolean;
}

// ── In-memory stores (replace with DB-backed in production) ──────────────────

const linkStore = new Map<string, FlagMetricLink>();
const exposureLog: FlagExposureEvent[] = [];
const snapshotStore: FlagMetricSnapshot[] = [];

// ── FlagMetricRegistry ────────────────────────────────────────────────────────

export class FlagMetricRegistry {
  /** Attach a metric linkage to a flag. */
  link(
    flagKey: string,
    metrics: LinkedMetric[],
    createdBy: string,
    hypothesis?: string,
  ): FlagMetricLink {
    if (metrics.length === 0) {
      throw new Error("At least one metric must be linked to a flag");
    }

    const existing = linkStore.get(flagKey);
    const now = new Date().toISOString();

    const record: FlagMetricLink = {
      linkId: existing?.linkId ?? randomUUID(),
      flagKey,
      metrics,
      createdBy,
      hypothesis,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    linkStore.set(flagKey, record);
    return { ...record };
  }

  /** Retrieve the metric linkage for a flag (null if none). */
  getLink(flagKey: string): FlagMetricLink | null {
    const link = linkStore.get(flagKey);
    return link ? { ...link } : null;
  }

  /** All flags that have at least one guardrail metric linked. */
  listFlagsWithGuardrails(): FlagMetricLink[] {
    return Array.from(linkStore.values())
      .filter((l) => l.metrics.some((m) => m.isGuardrail))
      .map((l) => ({ ...l }));
  }

  /** All flags without any metric linkage — these are tech debt candidates. */
  listUnlinkedFlagKeys(allFlagKeys: string[]): string[] {
    return allFlagKeys.filter((k) => !linkStore.has(k));
  }

  /** Remove a metric linkage (only when flag is being retired). */
  unlink(flagKey: string): boolean {
    return linkStore.delete(flagKey);
  }
}

// ── Exposure tracking ─────────────────────────────────────────────────────────

/**
 * Record that a user was exposed to a flag variant.
 *
 * Call this every time `evaluateFlag()` returns a result for a user,
 * so the analytics pipeline can attribute metric changes to the flag.
 *
 * De-duplication (same user + flag + variant within a session) should be
 * handled by the caller or a streaming dedup layer.
 */
export function recordFlagExposure(
  flagKey: string,
  variantKey: string | null,
  userId: string,
  orgId?: string,
): FlagExposureEvent {
  const event: FlagExposureEvent = {
    exposureId: randomUUID(),
    flagKey,
    variantKey,
    userId,
    orgId,
    timestamp: new Date().toISOString(),
  };
  exposureLog.push(event);
  return { ...event };
}

/** Query exposure events for a flag (most-recent first). */
export function getFlagExposures(
  flagKey: string,
  limit = 1000,
): FlagExposureEvent[] {
  return exposureLog
    .filter((e) => e.flagKey === flagKey)
    .slice(-limit)
    .reverse();
}

// ── Metric snapshots ──────────────────────────────────────────────────────────

/** Ingest a metric snapshot produced by the analytics pipeline. */
export function ingestFlagMetricSnapshot(snapshot: Omit<FlagMetricSnapshot, "snapshotId" | "recordedAt">): FlagMetricSnapshot {
  const full: FlagMetricSnapshot = {
    ...snapshot,
    snapshotId: randomUUID(),
    recordedAt: new Date().toISOString(),
  };
  snapshotStore.push(full);
  return { ...full };
}

/** Retrieve the most-recent snapshots for a flag + variant + metric triple. */
export function getFlagMetricSnapshots(
  flagKey: string,
  variantKey: string | null,
  metricId: string,
  limit = 30,
): FlagMetricSnapshot[] {
  return snapshotStore
    .filter(
      (s) =>
        s.flagKey === flagKey &&
        s.variantKey === variantKey &&
        s.metricId === metricId,
    )
    .slice(-limit)
    .reverse();
}

// ── Effect computation ────────────────────────────────────────────────────────

/**
 * Compute the treatment-vs-control effect for a flag + variant + metric.
 *
 * Uses the latest snapshot for control (variantKey = null) and the latest
 * for the treatment variant.
 *
 * This is a simple z-test on means — adequate for large samples (n > 30).
 * For production: integrate Eppo / Statsig / a proper stats library.
 */
export function computeFlagMetricEffect(
  flagKey: string,
  variantKey: string,
  metricId: string,
  link?: FlagMetricLink | null,
): FlagMetricEffect | null {
  const controlSnapshots = getFlagMetricSnapshots(flagKey, null, metricId, 1);
  const treatmentSnapshots = getFlagMetricSnapshots(flagKey, variantKey, metricId, 1);

  if (controlSnapshots.length === 0 || treatmentSnapshots.length === 0) {
    return null; // insufficient data
  }

  const control = controlSnapshots[0];
  const treatment = treatmentSnapshots[0];

  const absoluteDelta = treatment.meanValue - control.meanValue;
  const relativeLift =
    control.meanValue !== 0 ? absoluteDelta / control.meanValue : 0;

  // Pooled standard error: sqrt(σ²_c/n_c + σ²_t/n_t)
  const seControl =
    control.sampleSize > 0
      ? (control.stdDev * control.stdDev) / control.sampleSize
      : 0;
  const seTreatment =
    treatment.sampleSize > 0
      ? (treatment.stdDev * treatment.stdDev) / treatment.sampleSize
      : 0;
  const standardError = Math.sqrt(seControl + seTreatment);

  const zScore = standardError > 0 ? absoluteDelta / standardError : 0;

  // Two-sided p-value via normal approximation (Φ table lookup)
  const pValue = 2 * (1 - standardNormalCdf(Math.abs(zScore)));
  const isSignificant = pValue < 0.05;

  // Check against declared MDE
  const linkedMetric = link?.metrics.find((m) => m.metricId === metricId);
  const mde = linkedMetric?.minimumDetectableEffect ?? 0;
  const meetsMde = Math.abs(relativeLift) >= mde;

  // Guardrail breach: metric is a guardrail AND effect is significant in the wrong direction
  let guardrailBreached = false;
  if (linkedMetric?.isGuardrail && isSignificant) {
    const directionOk =
      linkedMetric.expectedDirection === "increase"
        ? absoluteDelta >= 0
        : linkedMetric.expectedDirection === "decrease"
          ? absoluteDelta <= 0
          : true;
    guardrailBreached = !directionOk;
  }

  return {
    flagKey,
    variantKey,
    metricId,
    controlMean: control.meanValue,
    treatmentMean: treatment.meanValue,
    relativeLift,
    absoluteDelta,
    standardError,
    zScore,
    pValue,
    isSignificant,
    meetsMde,
    guardrailBreached,
  };
}

// ── Math helper ───────────────────────────────────────────────────────────────

/**
 * Standard normal CDF using the Abramowitz & Stegun approximation (error < 7.5e-8).
 * Replace with a proper statistics library (e.g. jstat) for production.
 */
function standardNormalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422820 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.7814779 + t * (-1.8212559 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}
