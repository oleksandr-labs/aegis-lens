// ---------------------------------------------------------------------------
// Service Level Objectives (SLOs)
// No "server-only" — SLO definitions are shared between server and edge.
// ---------------------------------------------------------------------------

export interface ServiceSlo {
  service: string;
  metric: string;
  target: number;
  unit: "ms" | "percent" | "per_minute";
  window: "1h" | "24h" | "7d";
  description: string;
  descriptionUk: string;
}

export interface SloStatus {
  slo: ServiceSlo;
  /** Most recent measured value for the metric. */
  current: number;
  /** True when current satisfies the SLO target. */
  compliant: boolean;
  /**
   * Error budget burn rate.
   * Values > 1.0 mean budget is being consumed faster than allowed.
   */
  burnRate: number;
}

// ---------------------------------------------------------------------------
// SLO definitions
// ---------------------------------------------------------------------------

export const SERVICE_SLOS: ServiceSlo[] = [
  {
    service: "ingest",
    metric: "source_freshness_p99_seconds",
    target: 300, // 5 minutes
    unit: "ms",
    window: "1h",
    description: "Ingest freshness p99 < 5 min",
    descriptionUk: "Актуальність даних (p99) < 5 хв",
  },
  {
    service: "tiles",
    metric: "tile_request_p95_ms",
    target: 200,
    unit: "ms",
    window: "1h",
    description: "Map tile p95 latency < 200 ms",
    descriptionUk: "Затримка тайлів (p95) < 200 мс",
  },
  {
    service: "search",
    metric: "search_p95_ms",
    target: 250,
    unit: "ms",
    window: "1h",
    description: "Search p95 latency < 250 ms",
    descriptionUk: "Затримка пошуку (p95) < 250 мс",
  },
  {
    service: "ai-copilot",
    metric: "copilot_p95_ms",
    target: 3_000,
    unit: "ms",
    window: "1h",
    description: "AI copilot p95 latency < 3 000 ms",
    descriptionUk: "AI-копілот (p95) < 3 000 мс",
  },
  {
    service: "alerts",
    metric: "alert_delivery_p95_ms",
    target: 5_000,
    unit: "ms",
    window: "1h",
    description: "Alert delivery p95 < 5 000 ms",
    descriptionUk: "Доставка сповіщень (p95) < 5 000 мс",
  },
  {
    service: "api",
    metric: "availability_percent",
    target: 99.9,
    unit: "percent",
    window: "7d",
    description: "API availability > 99.9 %",
    descriptionUk: "Доступність API > 99.9 %",
  },
  {
    service: "sources",
    metric: "health_check_success_rate_percent",
    target: 95,
    unit: "percent",
    window: "24h",
    description: "Source health checks > 95 % success",
    descriptionUk: "Успішні перевірки джерел > 95 %",
  },
];

// ---------------------------------------------------------------------------
// Computation
// ---------------------------------------------------------------------------

/**
 * Compute p-th percentile from a sorted sample array.
 * Returns 0 for empty arrays.
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

/**
 * Compute the current SLO status from a series of raw metric samples.
 *
 * For latency SLOs (`unit === 'ms'`): uses p95 of samples and compares to target.
 * For percentage SLOs: uses mean of samples (values 0-100).
 * For rate SLOs: uses mean of samples.
 *
 * `burnRate` is defined as `|current - target| / tolerance`, clamped to 0 when compliant.
 * A burnRate > 1 means the budget is being exhausted faster than the window allows.
 */
export function computeSloStatus(slo: ServiceSlo, samples: number[]): SloStatus {
  if (samples.length === 0) {
    return { slo, current: 0, compliant: false, burnRate: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);

  let current: number;
  if (slo.unit === "ms") {
    current = percentile(sorted, 95);
  } else {
    // percent / per_minute — use mean
    current = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  }

  let compliant: boolean;
  let burnRate: number;

  if (slo.unit === "percent") {
    // Higher is better
    compliant = current >= slo.target;
    const tolerance = 100 - slo.target; // allowed failure budget
    if (tolerance === 0) {
      burnRate = compliant ? 0 : Infinity;
    } else {
      const deficit = Math.max(0, slo.target - current);
      burnRate = deficit / tolerance;
    }
  } else {
    // Lower is better (ms, per_minute)
    compliant = current <= slo.target;
    if (slo.target === 0) {
      burnRate = compliant ? 0 : Infinity;
    } else {
      const excess = Math.max(0, current - slo.target);
      burnRate = excess / slo.target;
    }
  }

  return {
    slo,
    current: Math.round(current * 100) / 100,
    compliant,
    burnRate: Math.round(burnRate * 1000) / 1000,
  };
}
