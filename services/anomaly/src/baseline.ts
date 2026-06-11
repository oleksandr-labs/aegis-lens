/**
 * Time-series baselines per (region × event_class).
 *
 * Maintains rolling statistics (mean, stddev) over multiple windows
 * so we can compute Z-scores and EWMA-based anomaly signals.
 */

export interface TimeSeriesPoint {
  timestampMs: number;
  count: number;
}

export interface BaselineStats {
  mean: number;
  stddev: number;
  sampleCount: number;
  windowHours: number;
}

export interface BaselineKey {
  /** ISO 3166-1 alpha-2 or oblast code */
  region: string;
  eventClass: string;
}

function keyString(k: BaselineKey): string {
  return `${k.region}::${k.eventClass}`;
}

// ── Simple rolling window statistics ─────────────────────────────────────────

function computeStats(values: number[]): { mean: number; stddev: number } {
  if (values.length === 0) return { mean: 0, stddev: 0 };
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return { mean, stddev: Math.sqrt(variance) };
}

export class RollingBaseline {
  /** key → hourly counts for the last `windowHours` hours */
  private readonly buckets = new Map<string, number[]>();

  constructor(private readonly windowHours: number = 168) {} // default 7 days

  /** Ingest a new data point — increments the appropriate hour bucket */
  record(key: BaselineKey, timestampMs: number, increment = 1): void {
    const k = keyString(key);
    if (!this.buckets.has(k)) {
      this.buckets.set(k, new Array(this.windowHours).fill(0));
    }
    const buckets = this.buckets.get(k)!;
    // Shift window if needed: we keep a ring buffer
    const nowHour = Math.floor(timestampMs / 3_600_000);
    const latestHour = Math.floor(Date.now() / 3_600_000);
    const idx = nowHour % this.windowHours;
    buckets[idx] = (buckets[idx] ?? 0) + increment;
  }

  stats(key: BaselineKey): BaselineStats {
    const k = keyString(key);
    const buckets = this.buckets.get(k) ?? [];
    const nonZero = buckets.filter((v) => v > 0);
    const { mean, stddev } = computeStats(buckets.length > 0 ? buckets : [0]);
    return { mean, stddev, sampleCount: nonZero.length, windowHours: this.windowHours };
  }

  /**
   * Z-score for a recent count against this baseline.
   * Positive = above average; negative = below.
   */
  zScore(key: BaselineKey, recentCount: number): number {
    const { mean, stddev } = this.stats(key);
    if (stddev === 0) return 0;
    return (recentCount - mean) / stddev;
  }

  allKeys(): BaselineKey[] {
    return [...this.buckets.keys()].map((k) => {
      const [region, eventClass] = k.split("::");
      return { region: region ?? "", eventClass: eventClass ?? "" };
    });
  }
}

// ── EWMA (Exponentially Weighted Moving Average) ──────────────────────────────

export class EWMADetector {
  /** key → ewma state */
  private readonly states = new Map<string, { ewma: number; variance: number }>();

  constructor(
    /** Smoothing factor α (0 < α < 1). Higher = more reactive */
    private readonly alpha: number = 0.2,
    /** Multiplier for anomaly threshold (default 3σ) */
    private readonly threshold: number = 3.0,
  ) {}

  update(
    key: BaselineKey,
    value: number,
  ): { isAnomaly: boolean; ewma: number; deviation: number } {
    const k = keyString(key);
    let state = this.states.get(k);

    if (!state) {
      state = { ewma: value, variance: 0 };
      this.states.set(k, state);
      return { isAnomaly: false, ewma: value, deviation: 0 };
    }

    const deviation = Math.abs(value - state.ewma);
    const isAnomaly = state.variance > 0 && deviation > this.threshold * Math.sqrt(state.variance);

    state.ewma = this.alpha * value + (1 - this.alpha) * state.ewma;
    state.variance =
      (1 - this.alpha) * state.variance + this.alpha * (value - state.ewma) ** 2;

    return { isAnomaly, ewma: state.ewma, deviation };
  }

  getState(key: BaselineKey) {
    return this.states.get(keyString(key)) ?? null;
  }
}
