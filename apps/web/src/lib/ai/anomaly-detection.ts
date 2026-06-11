/**
 * Anomaly Detection — z-score based spike / silence detection
 *
 * Phase 2 — Anomaly detection v1
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type AnomalyType =
  | "event-spike"
  | "source-silence"
  | "geo-cluster"
  | "tone-shift"
  | "volume-drop";

export interface AnomalySignal {
  type: AnomalyType;
  /** Oblast / region code, if applicable. */
  region?: string;
  /** Duration of the observation window in milliseconds. */
  timeWindowMs: number;
  /** Historical baseline value for the metric. */
  baselineValue: number;
  /** Observed value in the current window. */
  observedValue: number;
  /** Standard deviations from the mean. */
  zScore: number;
  /** 0-1 confidence in this signal. */
  confidence: number;
  description_en: string;
  description_uk: string;
}

// ── Thresholds ────────────────────────────────────────────────────────────────

export const ANOMALY_THRESHOLDS: Record<
  AnomalyType,
  { zScoreThreshold: number; minSampleSize: number }
> = {
  "event-spike":    { zScoreThreshold: 2.5, minSampleSize: 10 },
  "source-silence": { zScoreThreshold: 2.0, minSampleSize: 5  },
  "geo-cluster":    { zScoreThreshold: 2.0, minSampleSize: 8  },
  "tone-shift":     { zScoreThreshold: 2.0, minSampleSize: 15 },
  "volume-drop":    { zScoreThreshold: 2.5, minSampleSize: 10 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[], mu: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((s, v) => s + (v - mu) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function zScore(value: number, mu: number, sd: number): number {
  if (sd === 0) return 0;
  return (value - mu) / sd;
}

function confidence(z: number, threshold: number): number {
  // Sigmoid-shaped confidence: 0.5 at threshold, approaches 1 asymptotically
  const normalised = (Math.abs(z) - threshold) / threshold;
  return parseFloat((1 / (1 + Math.exp(-2 * normalised))).toFixed(3));
}

// ── Detector ──────────────────────────────────────────────────────────────────

class AnomalyDetector {
  /**
   * Detect event-rate spikes within a rolling window.
   *
   * @param events  Array of event objects with a `ts` (Unix-ms) timestamp.
   * @param windowMs  Length of the current observation window in ms.
   * @returns Zero or more AnomalySignal instances if thresholds are exceeded.
   */
  detectSpike(
    events: { ts: number }[],
    windowMs: number,
  ): AnomalySignal[] {
    if (events.length === 0) return [];

    const cfg = ANOMALY_THRESHOLDS["event-spike"];
    const now = Date.now();
    const windowStart = now - windowMs;

    // Count events in each equal sub-bucket (ten equal buckets)
    const buckets = 10;
    const bucketMs = windowMs / buckets;
    const counts: number[] = Array(buckets).fill(0);

    for (const e of events) {
      if (e.ts < windowStart || e.ts > now) continue;
      const bucket = Math.min(
        Math.floor((e.ts - windowStart) / bucketMs),
        buckets - 1,
      );
      counts[bucket]++;
    }

    if (counts.filter((c) => c > 0).length < cfg.minSampleSize / 2) return [];

    const mu = mean(counts);
    const sd = stdDev(counts, mu);
    const latestCount = counts[counts.length - 1] ?? 0;
    const z = zScore(latestCount, mu, sd);

    if (Math.abs(z) < cfg.zScoreThreshold) return [];

    const type: AnomalyType = z > 0 ? "event-spike" : "volume-drop";
    const signal: AnomalySignal = {
      type,
      timeWindowMs: windowMs,
      baselineValue: parseFloat(mu.toFixed(2)),
      observedValue: latestCount,
      zScore: parseFloat(z.toFixed(3)),
      confidence: confidence(z, cfg.zScoreThreshold),
      description_en:
        z > 0
          ? `Unusual spike detected: ${latestCount} events vs. baseline ${mu.toFixed(1)} in the last window.`
          : `Unusual volume drop: ${latestCount} events vs. baseline ${mu.toFixed(1)} in the last window.`,
      description_uk:
        z > 0
          ? `Виявлено незвичний стрибок: ${latestCount} подій проти базового рівня ${mu.toFixed(1)} в останньому вікні.`
          : `Незвичне падіння обсягу: ${latestCount} подій проти базового рівня ${mu.toFixed(1)} в останньому вікні.`,
    };

    return [signal];
  }

  /**
   * Detect when a source goes silent beyond its expected reporting interval.
   *
   * @param sourceId        Identifier of the monitored source.
   * @param lastEventTs     Unix-ms timestamp of the most recent event from this source.
   * @param expectedIntervalMs  Normal inter-event interval for this source.
   * @returns AnomalySignal if silence is anomalous, or null.
   */
  detectSilence(
    sourceId: string,
    lastEventTs: number,
    expectedIntervalMs: number,
  ): AnomalySignal | null {
    const cfg = ANOMALY_THRESHOLDS["source-silence"];
    const elapsed = Date.now() - lastEventTs;

    // z-score: how many std-devs past expected have we gone?
    // Assume std-dev ≈ 20% of expected interval (heuristic)
    const sd = expectedIntervalMs * 0.2;
    const z = zScore(elapsed, expectedIntervalMs, sd);

    if (z < cfg.zScoreThreshold) return null;

    return {
      type: "source-silence",
      timeWindowMs: elapsed,
      baselineValue: expectedIntervalMs,
      observedValue: elapsed,
      zScore: parseFloat(z.toFixed(3)),
      confidence: confidence(z, cfg.zScoreThreshold),
      description_en: `Source "${sourceId}" has been silent for ${Math.round(elapsed / 60_000)} min (expected every ${Math.round(expectedIntervalMs / 60_000)} min).`,
      description_uk: `Джерело "${sourceId}" мовчить ${Math.round(elapsed / 60_000)} хв (очікується кожні ${Math.round(expectedIntervalMs / 60_000)} хв).`,
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const anomalyDetector = new AnomalyDetector();
export { AnomalyDetector };
