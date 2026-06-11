/**
 * Latency monitoring vs the FIRMS source SLA.
 *
 * FIRMS NRT data lands ~3 hours after the satellite overpass — that delay is the
 * source's own expected behaviour, NOT a fault. This monitor measures the OBSERVED
 * latency between a detection's acquisition time and when we ingested/served it,
 * compares it to the NRT SLA window, and raises a breach signal only when data is
 * staler than the source itself promises (e.g. a stalled poller or a NASA outage).
 *
 * It consumes the normalized fire points from `client.ts` (which carry
 * `acquired_at`). Pure functions + an in-memory rolling window; wire `observe()`
 * to a metrics sink in production.
 */

import type { FIRMSFirePointNormalized } from "./client";

/** Expected NRT delay (the documented ~3h). */
export const NRT_EXPECTED_DELAY_MS = 3 * 60 * 60 * 1000;

/**
 * SLA budget: data is considered "within SLA" up to expected delay + slack. We
 * allow generous slack because a single late overpass is normal; only sustained
 * staleness beyond this is a breach.
 */
export const NRT_SLA_SLACK_MS = 3 * 60 * 60 * 1000; // +3h slack → 6h hard ceiling
export const NRT_SLA_CEILING_MS = NRT_EXPECTED_DELAY_MS + NRT_SLA_SLACK_MS;

export type LatencyStatus = "fresh" | "expected_nrt" | "degraded" | "breach";

export interface LatencySample {
  /** ISO-8601 acquisition time of the detection. */
  acquiredAt: string;
  /** ISO-8601 time we ingested/served it. */
  ingestedAt: string;
  latencyMs: number;
}

export interface LatencyReport {
  sampleCount: number;
  /** Median observed latency (ms). */
  medianLatencyMs: number;
  /** Worst (max) observed latency (ms). */
  maxLatencyMs: number;
  status: LatencyStatus;
  /** True when the freshest data is staler than the SLA ceiling — actionable. */
  breach: boolean;
  /** Human-readable note, en + uk, safe to surface to users. */
  notice: { en: string; uk: string };
}

/** Classify a single latency value against the NRT SLA. */
export function classifyLatency(latencyMs: number): LatencyStatus {
  if (latencyMs < 60 * 60 * 1000) return "fresh"; // < 1h, unusually fast
  if (latencyMs <= NRT_EXPECTED_DELAY_MS) return "expected_nrt";
  if (latencyMs <= NRT_SLA_CEILING_MS) return "degraded";
  return "breach";
}

/** Compute latency (ms) for one detection given an "as of" time. */
export function detectionLatencyMs(
  point: Pick<FIRMSFirePointNormalized, "acquired_at">,
  asOf: Date = new Date(),
): number {
  return Math.max(0, asOf.getTime() - new Date(point.acquired_at).getTime());
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Rolling latency monitor over a batch of detections. The batch-level status is
 * driven by the FRESHEST detection (best the source could give us); a breach
 * means even the newest data we have is past the SLA ceiling.
 */
export class FIRMSLatencyMonitor {
  private readonly window: LatencySample[] = [];
  constructor(private readonly maxSamples = 5000) {}

  /** Record observed latency for a batch of detections. */
  observe(points: FIRMSFirePointNormalized[], asOf: Date = new Date()): void {
    for (const p of points) {
      this.window.push({
        acquiredAt: p.acquired_at,
        ingestedAt: asOf.toISOString(),
        latencyMs: detectionLatencyMs(p, asOf),
      });
    }
    if (this.window.length > this.maxSamples) {
      this.window.splice(0, this.window.length - this.maxSamples);
    }
  }

  report(): LatencyReport {
    const latencies = this.window.map((s) => s.latencyMs);
    const freshest = latencies.length ? Math.min(...latencies) : Infinity;
    const status = latencies.length ? classifyLatency(freshest) : "breach";
    const breach = status === "breach";
    return {
      sampleCount: latencies.length,
      medianLatencyMs: median(latencies),
      maxLatencyMs: latencies.length ? Math.max(...latencies) : 0,
      status,
      breach,
      notice: breach
        ? {
            en: "Active-fire data is staler than expected (NASA FIRMS NRT delay exceeded). Treat fire markers with caution.",
            uk: "Дані про активні пожежі застаріли більше, ніж очікувалося (перевищено затримку NRT NASA FIRMS). Ставтеся до позначок пожеж обережно.",
          }
        : {
            en: "Active-fire data within the expected ~3h near-real-time delay.",
            uk: "Дані про активні пожежі в межах очікуваної затримки ~3 год (майже реальний час).",
          },
    };
  }
}
