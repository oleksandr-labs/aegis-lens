import "server-only";

// ---------------------------------------------------------------------------
// API Abuse / Anomaly Detection
// In-process sliding-window heuristics — no external dependency required.
// ---------------------------------------------------------------------------

export type AbuseSignalType =
  | "rate_spike"
  | "endpoint_hammering"
  | "suspicious_pattern"
  | "auth_probing";

export interface ApiAbuseSignal {
  type: AbuseSignalType;
  orgId?: string;
  ip: string;
  endpoint: string;
  requestsPerMin: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Internal data structures
// ---------------------------------------------------------------------------

interface RequestEvent {
  orgId: string | undefined;
  ip: string;
  endpoint: string;
  ts: number; // Date.now()
}

/** Auth failure tracking */
interface AuthFailEntry {
  count: number;
  windowStart: number;
}

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const RATE_SPIKE_RPM = 1_000;          // total RPM per IP → rate_spike
const ENDPOINT_HAMMER_RPM = 500;       // same endpoint per IP → endpoint_hammering
const AUTH_PROBE_COUNT = 10;           // auth failures within...
const AUTH_PROBE_WINDOW_MS = 5 * 60_000; // ...5 minutes → auth_probing
const DEFAULT_WINDOW_MS = 60_000;      // 1-minute sliding window

// Auth-related endpoint pattern
const AUTH_ENDPOINT_RE = /\/(auth|login|token|session|password|reset|register)/i;

// ---------------------------------------------------------------------------
// AbuseDetector
// ---------------------------------------------------------------------------

export class AbuseDetector {
  private readonly events: RequestEvent[] = [];
  private readonly authFailures = new Map<string, AuthFailEntry>();
  private readonly emittedSignals: ApiAbuseSignal[] = [];

  /**
   * Record a request and run heuristics.
   * Call this for every incoming API request (e.g., in middleware).
   */
  recordRequest(
    orgId: string | undefined,
    ip: string,
    endpoint: string,
    isAuthFailure = false,
  ): void {
    const now = Date.now();
    this.events.push({ orgId, ip, endpoint, ts: now });

    // Track auth failures
    if (AUTH_ENDPOINT_RE.test(endpoint) && isAuthFailure) {
      const key = ip;
      const entry = this.authFailures.get(key) ?? { count: 0, windowStart: now };
      // Reset window if expired
      if (now - entry.windowStart > AUTH_PROBE_WINDOW_MS) {
        entry.count = 0;
        entry.windowStart = now;
      }
      entry.count++;
      this.authFailures.set(key, entry);

      if (entry.count >= AUTH_PROBE_COUNT) {
        this._emit({
          type: "auth_probing",
          orgId,
          ip,
          endpoint,
          requestsPerMin: Math.round((entry.count / ((now - entry.windowStart) / 60_000)) * 10) / 10,
          timestamp: new Date().toISOString(),
        });
        // Reset so we don't spam signals
        entry.count = 0;
        entry.windowStart = now;
      }
    }

    // Run RPM-based heuristics
    const windowStart = now - DEFAULT_WINDOW_MS;
    const recent = this.events.filter(
      (e) => e.ts >= windowStart && e.ip === ip,
    );

    const totalRpm = recent.length;
    if (totalRpm > RATE_SPIKE_RPM) {
      this._emit({
        type: "rate_spike",
        orgId,
        ip,
        endpoint,
        requestsPerMin: totalRpm,
        timestamp: new Date().toISOString(),
      });
    }

    const endpointRpm = recent.filter((e) => e.endpoint === endpoint).length;
    if (endpointRpm > ENDPOINT_HAMMER_RPM) {
      this._emit({
        type: "endpoint_hammering",
        orgId,
        ip,
        endpoint,
        requestsPerMin: endpointRpm,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Return abuse signals detected within the given window.
   * Defaults to the last 60 seconds.
   */
  getAbuseSignals(windowMs: number = DEFAULT_WINDOW_MS): ApiAbuseSignal[] {
    const cutoff = Date.now() - windowMs;
    return this.emittedSignals.filter(
      (s) => new Date(s.timestamp).getTime() >= cutoff,
    );
  }

  /**
   * Remove raw request events older than `olderThanMs` milliseconds.
   * Call periodically (e.g., every minute) to bound memory usage.
   */
  clearOld(olderThanMs: number): void {
    const cutoff = Date.now() - olderThanMs;
    // Splice out old events from the front (events are appended chronologically)
    let i = 0;
    while (i < this.events.length && this.events[i].ts < cutoff) {
      i++;
    }
    if (i > 0) this.events.splice(0, i);

    // Remove old emitted signals too
    const signalCutoff = cutoff;
    let j = 0;
    while (
      j < this.emittedSignals.length &&
      new Date(this.emittedSignals[j].timestamp).getTime() < signalCutoff
    ) {
      j++;
    }
    if (j > 0) this.emittedSignals.splice(0, j);
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private _emit(signal: ApiAbuseSignal): void {
    // Deduplicate: don't re-emit the same (type+ip+endpoint) within 30 s
    const dedup = 30_000;
    const now = Date.now();
    const duplicate = this.emittedSignals.find(
      (s) =>
        s.type === signal.type &&
        s.ip === signal.ip &&
        s.endpoint === signal.endpoint &&
        now - new Date(s.timestamp).getTime() < dedup,
    );
    if (duplicate) return;

    this.emittedSignals.push(signal);

    // Log for downstream alerting pipeline
    console.log(
      JSON.stringify({
        event: "abuse_signal",
        ...signal,
      }),
    );
  }
}

/** Singleton — import and call `abuseDetector.recordRequest()` in middleware. */
export const abuseDetector = new AbuseDetector();
