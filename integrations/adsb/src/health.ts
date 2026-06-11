/**
 * Per-feed health monitoring for the ADS-B fleet.
 *
 * Multiple feeds (OpenSky polling, ADS-B Exchange, a feeder firehose) can run at
 * once. Each needs independent observability: how fresh is its last message, what
 * is its recent error rate, and is it stale relative to its expected cadence.
 * This module keeps a rolling window per feed and derives a typed status model
 * the API/UI can render. It holds NO global state of its own — callers own the
 * monitor instance.
 */

export type FeedHealthState = "healthy" | "degraded" | "stale" | "down" | "unknown";

/** One observation recorded for a feed. */
export interface FeedObservation {
  /** UTC ISO time the observation was recorded. */
  at: string;
  /** True if the poll/message succeeded. */
  ok: boolean;
  /** Records ingested in this observation (positions parsed). */
  records?: number;
  /** Round-trip latency in ms, if measured. */
  latencyMs?: number;
  /** Error code/message when !ok. */
  error?: string;
}

export interface FeedHealthConfig {
  feedId: string;
  label: { en: string; uk: string };
  /** Expected cadence in ms — gaps beyond `staleAfter` count as stale. */
  expectedIntervalMs: number;
  /** Multiple of expectedIntervalMs after which a feed is "stale". Default 6. */
  staleAfterFactor?: number;
  /** Multiple of expectedIntervalMs after which a feed is "down". Default 20. */
  downAfterFactor?: number;
  /** Error-rate (0..1) over the window above which a feed is "degraded". Default 0.2. */
  degradedErrorRate?: number;
  /** Max observations retained in the rolling window. Default 50. */
  windowSize?: number;
}

export interface FeedHealthStatus {
  feedId: string;
  label: { en: string; uk: string };
  state: FeedHealthState;
  /** UTC ISO of the most recent SUCCESSFUL observation, or null. */
  lastSuccessAt: string | null;
  /** Seconds since the last successful observation, or null. */
  freshnessS: number | null;
  /** Error rate 0..1 across the retained window. */
  errorRate: number;
  /** Mean latency ms across successful observations in the window, or null. */
  avgLatencyMs: number | null;
  /** Total records ingested across the window. */
  recordsInWindow: number;
  /** True when freshness exceeds the stale threshold. */
  stale: boolean;
  observationCount: number;
  /** Human reasons, en + uk. */
  reasonsEn: string[];
  reasonsUk: string[];
}

/** Rolling per-feed monitor. One instance can track many feeds. */
export class FeedHealthMonitor {
  private readonly configs = new Map<string, Required<FeedHealthConfig>>();
  private readonly windows = new Map<string, FeedObservation[]>();

  /** Register (or re-register) a feed with its expected cadence + thresholds. */
  register(config: FeedHealthConfig): void {
    this.configs.set(config.feedId, {
      staleAfterFactor: 6,
      downAfterFactor: 20,
      degradedErrorRate: 0.2,
      windowSize: 50,
      ...config,
    });
    if (!this.windows.has(config.feedId)) this.windows.set(config.feedId, []);
  }

  /** Record one observation; trims the window to `windowSize`. */
  record(feedId: string, obs: FeedObservation): void {
    const cfg = this.configs.get(feedId);
    if (!cfg) throw new Error(`Feed ${feedId} is not registered`);
    const win = this.windows.get(feedId)!;
    win.push(obs);
    if (win.length > cfg.windowSize) win.splice(0, win.length - cfg.windowSize);
  }

  /** Compute the current status for one feed. */
  status(feedId: string, now: string = new Date().toISOString()): FeedHealthStatus {
    const cfg = this.configs.get(feedId);
    if (!cfg) throw new Error(`Feed ${feedId} is not registered`);
    const win = this.windows.get(feedId) ?? [];

    const reasonsEn: string[] = [];
    const reasonsUk: string[] = [];

    if (win.length === 0) {
      return {
        feedId,
        label: cfg.label,
        state: "unknown",
        lastSuccessAt: null,
        freshnessS: null,
        errorRate: 0,
        avgLatencyMs: null,
        recordsInWindow: 0,
        stale: false,
        observationCount: 0,
        reasonsEn: ["No observations recorded yet."],
        reasonsUk: ["Спостережень ще немає."],
      };
    }

    const nowMs = new Date(now).getTime();
    const successes = win.filter((o) => o.ok);
    const lastSuccess = successes.length ? successes[successes.length - 1] : null;
    const lastSuccessAt = lastSuccess ? lastSuccess.at : null;
    const freshnessS =
      lastSuccessAt !== null
        ? Math.max(0, Math.round((nowMs - new Date(lastSuccessAt).getTime()) / 1000))
        : null;

    const errorRate = (win.length - successes.length) / win.length;

    const latencies = successes
      .map((o) => o.latencyMs)
      .filter((l): l is number => typeof l === "number");
    const avgLatencyMs = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : null;

    const recordsInWindow = win.reduce((a, o) => a + (o.records ?? 0), 0);

    const staleMs = cfg.expectedIntervalMs * cfg.staleAfterFactor;
    const downMs = cfg.expectedIntervalMs * cfg.downAfterFactor;
    const freshnessMs = freshnessS !== null ? freshnessS * 1000 : Infinity;
    const stale = freshnessMs > staleMs;

    let state: FeedHealthState;
    if (lastSuccessAt === null || freshnessMs > downMs) {
      state = "down";
      reasonsEn.push("No successful poll within the down threshold.");
      reasonsUk.push("Немає успішного опитування в межах порогу 'down'.");
    } else if (stale) {
      state = "stale";
      reasonsEn.push(`Last success ${freshnessS}s ago (stale after ${Math.round(staleMs / 1000)}s).`);
      reasonsUk.push(`Останній успіх ${freshnessS}с тому (застаріло після ${Math.round(staleMs / 1000)}с).`);
    } else if (errorRate > cfg.degradedErrorRate) {
      state = "degraded";
      reasonsEn.push(`Error rate ${(errorRate * 100).toFixed(0)}% over last ${win.length} polls.`);
      reasonsUk.push(`Частка помилок ${(errorRate * 100).toFixed(0)}% за останні ${win.length} опитувань.`);
    } else {
      state = "healthy";
      reasonsEn.push("Fresh and within error budget.");
      reasonsUk.push("Свіжі дані в межах бюджету помилок.");
    }

    return {
      feedId,
      label: cfg.label,
      state,
      lastSuccessAt,
      freshnessS,
      errorRate: Math.round(errorRate * 100) / 100,
      avgLatencyMs,
      recordsInWindow,
      stale,
      observationCount: win.length,
      reasonsEn,
      reasonsUk,
    };
  }

  /** Status for every registered feed. */
  statusAll(now: string = new Date().toISOString()): FeedHealthStatus[] {
    return Array.from(this.configs.keys()).map((id) => this.status(id, now));
  }

  /** Worst overall state across all feeds (for a single rollup badge). */
  overall(now: string = new Date().toISOString()): FeedHealthState {
    const order: FeedHealthState[] = ["down", "stale", "degraded", "unknown", "healthy"];
    const states = this.statusAll(now).map((s) => s.state);
    if (states.length === 0) return "unknown";
    for (const s of order) if (states.includes(s)) return s;
    return "healthy";
  }
}
