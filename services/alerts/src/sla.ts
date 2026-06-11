/**
 * Alert Service SLA Monitor
 *
 * Tracks rule-match → notification latency to enforce:
 *   SLA_THRESHOLD_MS = 5 000 ms at p95.
 *
 * Ring-buffer of last 1 000 SLA events; percentiles computed on demand.
 */

import type { AlertChannel } from "./types";

// ── SLA threshold ─────────────────────────────────────────────────────────────

export const SLA_THRESHOLD_MS = 5_000;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertSlaEvent {
  /** Rule that triggered the notification */
  ruleId: string;
  /** ISO-8601 — when the rule matched */
  triggeredAt: string;
  /** ISO-8601 — when the notification was dispatched to the channel */
  notifiedAt: string;
  /** Channel the notification was sent through */
  channelType: AlertChannel;
  /** Derived: notifiedAt - triggeredAt in milliseconds */
  latencyMs: number;
}

export interface SlaStats {
  p50ms: number;
  p95ms: number;
  p99ms: number;
  /** Number of events that exceeded SLA_THRESHOLD_MS */
  breachCount: number;
  sloMs: number;
}

// ── Ring buffer ───────────────────────────────────────────────────────────────

const RING_SIZE = 1_000;

class SlaMonitor {
  private readonly buffer: AlertSlaEvent[] = [];
  private head = 0;
  private count = 0;

  recordSlaEvent(event: AlertSlaEvent): void {
    if (this.count < RING_SIZE) {
      this.buffer.push(event);
      this.count++;
    } else {
      this.buffer[this.head] = event;
      this.head = (this.head + 1) % RING_SIZE;
    }
  }

  getSlaStats(): SlaStats {
    if (this.count === 0) {
      return { p50ms: 0, p95ms: 0, p99ms: 0, breachCount: 0, sloMs: SLA_THRESHOLD_MS };
    }

    const latencies = this.buffer.slice(0, this.count).map((e) => e.latencyMs);
    latencies.sort((a, b) => a - b);

    const breachCount = latencies.filter((l) => l > SLA_THRESHOLD_MS).length;

    return {
      p50ms: percentile(latencies, 50),
      p95ms: percentile(latencies, 95),
      p99ms: percentile(latencies, 99),
      breachCount,
      sloMs: SLA_THRESHOLD_MS,
    };
  }

  /** Total events recorded (capped at ring size) */
  get size(): number {
    return this.count;
  }

  /** Drain all events for inspection (test helper) */
  snapshot(): AlertSlaEvent[] {
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

export const slaMonitor = new SlaMonitor();

export { SlaMonitor };

// ── Convenience factory ───────────────────────────────────────────────────────

/**
 * Build an AlertSlaEvent from raw timestamps and record it.
 * Latency is computed automatically.
 */
export function recordSlaEvent(params: {
  ruleId: string;
  triggeredAt: string;
  notifiedAt: string;
  channelType: AlertChannel;
}): AlertSlaEvent {
  const latencyMs =
    new Date(params.notifiedAt).getTime() - new Date(params.triggeredAt).getTime();
  const event: AlertSlaEvent = { ...params, latencyMs };
  slaMonitor.recordSlaEvent(event);
  return event;
}

export function getSlaStats(): SlaStats {
  return slaMonitor.getSlaStats();
}
