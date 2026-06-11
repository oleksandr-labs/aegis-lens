/**
 * Backtesting harness for anomaly detection.
 *
 * Replays a historical event stream (intended for 2022–2025 Ukraine data) through
 * the baseline + Z-score detector in strict chronological order — each detection
 * uses only data available BEFORE the point being scored (no look-ahead leakage).
 * Detections are matched against labeled "known anomaly" windows to produce
 * precision / recall / F1 and lead-time statistics, so thresholds can be tuned
 * against ground truth instead of guesswork.
 *
 * The harness is data-agnostic: callers supply a list of dated count buckets per
 * region×class plus the labeled anomaly windows. A small synthetic fixture is
 * included so the harness is runnable without the (large, private) historical set.
 */

import { RollingBaseline, type BaselineKey } from "./baseline";

/** One bucket of observed counts at a point in time. */
export interface HistoricalBucket {
  /** Bucket start, epoch ms (hour-aligned recommended). */
  timestampMs: number;
  region: string;
  eventClass: string;
  count: number;
}

/** A labeled true anomaly window (ground truth). */
export interface LabeledAnomaly {
  region: string;
  eventClass: string;
  startMs: number;
  endMs: number;
  /** Optional note, e.g. "Oct 2022 mass missile barrage". */
  label?: string;
}

export interface BacktestConfig {
  /** Z-score threshold for flagging (matches alert-generator default 2.0). */
  zThreshold?: number;
  /** Warm-up: skip scoring until this many buckets seen for a key. */
  warmupBuckets?: number;
  /** Baseline window in hours. */
  windowHours?: number;
}

const B_DEFAULTS: Required<BacktestConfig> = {
  zThreshold: 2.0,
  warmupBuckets: 24,
  windowHours: 168,
};

export interface Detection {
  timestampMs: number;
  region: string;
  eventClass: string;
  zScore: number;
  count: number;
  /** Matched a labeled anomaly window → true positive. */
  matched: boolean;
}

export interface BacktestReport {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  /** Mean lead time (ms) from detection to anomaly window start, when positive. */
  meanLeadTimeMs: number;
  detections: Detection[];
  config: Required<BacktestConfig>;
}

function keyOf(b: { region: string; eventClass: string }): string {
  return `${b.region}::${b.eventClass}`;
}

/**
 * Run the backtest. Buckets are sorted chronologically internally; the baseline
 * is updated AFTER each bucket is scored, so no future data leaks into a score.
 */
export function runBacktest(
  buckets: HistoricalBucket[],
  labels: LabeledAnomaly[],
  config: BacktestConfig = {},
): BacktestReport {
  const opts = { ...B_DEFAULTS, ...config };
  const baseline = new RollingBaseline(opts.windowHours);
  const seen = new Map<string, number>();
  const detections: Detection[] = [];

  const sorted = [...buckets].sort((a, b) => a.timestampMs - b.timestampMs);

  const inAnomaly = (b: HistoricalBucket): LabeledAnomaly | null =>
    labels.find(
      (l) =>
        l.region === b.region &&
        l.eventClass === b.eventClass &&
        b.timestampMs >= l.startMs &&
        b.timestampMs <= l.endMs,
    ) ?? null;

  for (const b of sorted) {
    const key: BaselineKey = { region: b.region, eventClass: b.eventClass };
    const k = keyOf(b);
    const count = seen.get(k) ?? 0;

    if (count >= opts.warmupBuckets) {
      const z = baseline.zScore(key, b.count);
      if (z >= opts.zThreshold) {
        detections.push({
          timestampMs: b.timestampMs,
          region: b.region,
          eventClass: b.eventClass,
          zScore: parseFloat(z.toFixed(2)),
          count: b.count,
          matched: inAnomaly(b) !== null,
        });
      }
    }

    // Update baseline AFTER scoring (no look-ahead).
    baseline.record(key, b.timestampMs, b.count);
    seen.set(k, count + 1);
  }

  // ── Score against ground truth ───────────────────────────────────────────────
  const truePositives = detections.filter((d) => d.matched).length;
  const falsePositives = detections.length - truePositives;

  // Recall over labeled windows: a window is "caught" if any detection falls in it.
  let caught = 0;
  let leadSum = 0;
  let leadCount = 0;
  for (const l of labels) {
    const hits = detections.filter(
      (d) =>
        d.region === l.region &&
        d.eventClass === l.eventClass &&
        d.timestampMs >= l.startMs &&
        d.timestampMs <= l.endMs,
    );
    if (hits.length > 0) {
      caught++;
      const earliest = Math.min(...hits.map((h) => h.timestampMs));
      leadSum += earliest - l.startMs;
      leadCount++;
    }
  }
  const falseNegatives = labels.length - caught;

  const precision = detections.length > 0 ? truePositives / detections.length : 0;
  const recall = labels.length > 0 ? caught / labels.length : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    truePositives,
    falsePositives,
    falseNegatives,
    precision: parseFloat(precision.toFixed(3)),
    recall: parseFloat(recall.toFixed(3)),
    f1: parseFloat(f1.toFixed(3)),
    meanLeadTimeMs: leadCount > 0 ? Math.round(leadSum / leadCount) : 0,
    detections,
    config: opts,
  };
}

// ── Synthetic fixture (runnable without the private historical dataset) ───────

/**
 * Generate a synthetic series: flat baseline noise with one injected spike,
 * plus the matching label. Lets the harness self-test and demo without the real
 * 2022–2025 archive (which is loaded by a separate ingest job in production).
 */
export function syntheticFixture(): {
  buckets: HistoricalBucket[];
  labels: LabeledAnomaly[];
} {
  const HOUR = 3_600_000;
  const start = Date.UTC(2023, 0, 1);
  const buckets: HistoricalBucket[] = [];
  const region = "UA-32"; // Kyiv oblast
  const eventClass = "missile";

  // 30 days of low baseline (0–3/hour, deterministic pseudo-noise).
  for (let h = 0; h < 24 * 30; h++) {
    const base = (h * 1103515245 + 12345) % 4; // 0..3
    buckets.push({ timestampMs: start + h * HOUR, region, eventClass, count: base });
  }

  // Injected barrage on day 31: 18-hour spike of 20–30/hour.
  const spikeStart = start + 24 * 30 * HOUR;
  for (let h = 0; h < 18; h++) {
    buckets.push({
      timestampMs: spikeStart + h * HOUR,
      region,
      eventClass,
      count: 20 + (h % 11),
    });
  }

  const labels: LabeledAnomaly[] = [
    {
      region,
      eventClass,
      startMs: spikeStart,
      endMs: spikeStart + 18 * HOUR,
      label: "Synthetic mass barrage",
    },
  ];

  return { buckets, labels };
}
