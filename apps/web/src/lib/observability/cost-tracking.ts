import "server-only";

// ---------------------------------------------------------------------------
// Cost-Per-Event Dashboard
// Tracks spend across LLM calls, satellite imagery, maps, storage, compute, CDN.
// ---------------------------------------------------------------------------

export type CostCategory =
  | "llm"
  | "satellite"
  | "maps"
  | "storage"
  | "compute"
  | "cdn";

export interface CostRecord {
  category: CostCategory;
  subCategory: string;
  units: number;
  unitCost: number;
  totalUsd: number;
  timestamp: string;
  eventId?: string;
}

export interface CostDashboard {
  period: string;
  totalUsd: number;
  byCategory: Record<CostCategory, number>;
  costPerEvent: number;
  eventsProcessed: number;
  breakdown: CostRecord[];
}

// ---------------------------------------------------------------------------
// Baseline unit cost estimates
// Update these as actual contract/API pricing is confirmed.
// ---------------------------------------------------------------------------

export const UNIT_COSTS: Record<string, number> = {
  // LLM — per 1000 tokens (approximate 2025 pricing)
  "anthropic/claude-sonnet-4-5/input": 0.003,    // $3 / MTok
  "anthropic/claude-sonnet-4-5/output": 0.015,   // $15 / MTok
  "anthropic/claude-haiku-3/input": 0.00025,
  "anthropic/claude-haiku-3/output": 0.00125,
  "openai/gpt-4o/input": 0.005,
  "openai/gpt-4o/output": 0.015,
  "openai/gpt-4o-mini/input": 0.00015,
  "openai/gpt-4o-mini/output": 0.0006,
  "openai/text-embedding-3-small": 0.00002,       // per 1000 tokens

  // Satellite — per scene / km²
  "sentinel-hub/scene": 0.10,                     // per Sentinel-2 scene
  "planet/ps-scene": 2.50,                        // per PlanetScope scene
  "maxar/30cm": 15.00,                            // per km² at 30cm
  "airbus/spot": 8.00,                            // per scene

  // Maps / tiles
  "mapbox/tile-request": 0.0000014,               // per tile request (>50k/mo)
  "google-maps/static": 0.002,                    // per static map request
  "google-maps/geocode": 0.005,                   // per geocode request

  // Storage (Hetzner / S3 equivalent) — per GB per month
  "storage/object-gb-month": 0.0184,
  "storage/egress-gb": 0.02,

  // Compute — per vCPU-hour
  "compute/vcpu-hour": 0.025,
  "compute/gpu-hour": 0.50,

  // CDN — per GB transferred
  "cdn/gb": 0.01,
};

// ---------------------------------------------------------------------------
// CostTracker
// ---------------------------------------------------------------------------

export class CostTracker {
  private readonly records: CostRecord[] = [];
  private eventsProcessed = 0;

  /** Record a cost event. */
  record(entry: CostRecord): void {
    this.records.push(entry);
  }

  /** Increment the events-processed counter (call once per ingested OSINT event). */
  incrementEvents(count = 1): void {
    this.eventsProcessed += count;
  }

  /**
   * Build a cost dashboard for the last `periodHours` hours.
   * Default: 24 h.
   */
  getDashboard(periodHours = 24): CostDashboard {
    const cutoff = Date.now() - periodHours * 60 * 60_000;
    const periodRecords = this.records.filter(
      (r) => new Date(r.timestamp).getTime() >= cutoff,
    );

    const totalUsd = periodRecords.reduce((a, r) => a + r.totalUsd, 0);

    const byCategory: Record<CostCategory, number> = {
      llm: 0,
      satellite: 0,
      maps: 0,
      storage: 0,
      compute: 0,
      cdn: 0,
    };
    for (const r of periodRecords) {
      byCategory[r.category] += r.totalUsd;
    }

    // Round to 6 decimal places (avoid float noise in display)
    for (const k of Object.keys(byCategory) as CostCategory[]) {
      byCategory[k] = Math.round(byCategory[k] * 1_000_000) / 1_000_000;
    }

    const costPerEvent =
      this.eventsProcessed === 0
        ? 0
        : Math.round((totalUsd / this.eventsProcessed) * 1_000_000) / 1_000_000;

    return {
      period: `${periodHours}h`,
      totalUsd: Math.round(totalUsd * 1_000_000) / 1_000_000,
      byCategory,
      costPerEvent,
      eventsProcessed: this.eventsProcessed,
      breakdown: periodRecords,
    };
  }

  /**
   * Return the cost-per-event ratio for the given period.
   * Convenience shorthand for `getDashboard(periodHours).costPerEvent`.
   */
  getCostPerEvent(periodHours = 24): number {
    return this.getDashboard(periodHours).costPerEvent;
  }

  // -------------------------------------------------------------------------
  // Factory helpers — build a CostRecord from common patterns
  // -------------------------------------------------------------------------

  /**
   * Build a CostRecord for an LLM call.
   * `tokenKey` should match a key in UNIT_COSTS, e.g. "anthropic/claude-sonnet-4-5/input".
   */
  static llmRecord(
    subCategory: string,
    tokens: number,
    tokenKey: string,
    eventId?: string,
  ): CostRecord {
    const unitCost = UNIT_COSTS[tokenKey] ?? 0;
    const totalUsd = (tokens / 1000) * unitCost;
    return {
      category: "llm",
      subCategory,
      units: tokens,
      unitCost,
      totalUsd,
      timestamp: new Date().toISOString(),
      eventId,
    };
  }
}

/** Singleton cost tracker — import and call `.record()` in feature handlers. */
export const costTracker = new CostTracker();
