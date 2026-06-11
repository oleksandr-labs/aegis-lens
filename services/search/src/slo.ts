/**
 * Search Service — SLO Monitor
 *
 * Tracks query latency and reports against the SLO target:
 *   SEARCH_SLO_MS = 250 ms at p95.
 *
 * Ring-buffer of last 500 samples; percentiles computed on demand.
 */

// ── SLO target ────────────────────────────────────────────────────────────────

export const SEARCH_SLO_MS = 250;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchLatencySample {
  queryId: string;
  latencyMs: number;
  queryType: "hybrid" | "lexical" | "semantic" | "geo";
  /** ISO-8601 */
  timestamp: string;
}

export interface SloReport {
  p95ms: number;
  p99ms: number;
  sloMs: number;
  /** True when p95 <= sloMs */
  sloMet: boolean;
  /** Number of samples in the current window */
  windowSize: number;
}

// ── Ring buffer ───────────────────────────────────────────────────────────────

const RING_SIZE = 500;

export class SloMonitor {
  private readonly buffer: SearchLatencySample[] = [];
  private head = 0;
  private count = 0;

  recordLatency(sample: SearchLatencySample): void {
    if (this.count < RING_SIZE) {
      this.buffer.push(sample);
      this.count++;
    } else {
      this.buffer[this.head] = sample;
      this.head = (this.head + 1) % RING_SIZE;
    }
  }

  getSloReport(): SloReport {
    if (this.count === 0) {
      return {
        p95ms: 0,
        p99ms: 0,
        sloMs: SEARCH_SLO_MS,
        sloMet: true,
        windowSize: 0,
      };
    }

    const latencies = this.buffer
      .slice(0, this.count)
      .map((s) => s.latencyMs);
    latencies.sort((a, b) => a - b);

    const p95ms = percentile(latencies, 95);
    const p99ms = percentile(latencies, 99);

    return {
      p95ms,
      p99ms,
      sloMs: SEARCH_SLO_MS,
      sloMet: p95ms <= SEARCH_SLO_MS,
      windowSize: this.count,
    };
  }

  /** Drain snapshot for inspection (test helper) */
  snapshot(): SearchLatencySample[] {
    return this.buffer.slice(0, this.count);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const frac = idx - lower;
  return Math.round(sorted[lower] * (1 - frac) + sorted[upper] * frac);
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const searchSloMonitor = new SloMonitor();

// ── Convenience wrappers ──────────────────────────────────────────────────────

export function recordLatency(sample: SearchLatencySample): void {
  searchSloMonitor.recordLatency(sample);
}

export function getSloReport(): SloReport {
  return searchSloMonitor.getSloReport();
}
