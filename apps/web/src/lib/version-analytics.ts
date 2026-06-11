import "server-only";

// ── Types ─────────────────────────────────────────────────────────────────────

export type VersionUsageRecord = {
  /** API version, e.g. "v1" */
  version: string;
  /** Endpoint path, e.g. "/api/v1/events" */
  endpoint: string;
  /** Stable org identifier */
  orgId: string;
  /** ISO-8601 timestamp */
  timestamp: string;
};

export type VersionKillSwitch = {
  /** API version this switch governs */
  version: string;
  /** Optional specific endpoint; if omitted applies to the whole version */
  endpoint?: string;
  /** Whether the kill switch is armed (actively blocking when threshold exceeded) */
  enabled: boolean;
  /**
   * Number of requests since last reset above which the kill switch fires.
   * Set to a very high number to effectively disable.
   */
  threshold: number;
  /** Current accumulated request count (updated by recordVersionUsage) */
  currentCount: number;
};

// ── In-memory storage ─────────────────────────────────────────────────────────

/** Usage records since last process restart */
const usageLog: VersionUsageRecord[] = [];

/** Per-version counters: version → count */
const versionCounts = new Map<string, number>();

// ── Kill switch configuration ─────────────────────────────────────────────────

/**
 * Configurable kill-switch thresholds.
 *
 * Set `enabled: true` and a realistic `threshold` before wiring the middleware.
 * Sprint 2: persist config in DB; add admin UI toggle.
 *
 * Example: block /api/v0 (legacy) after 1000 requests to force migration.
 */
export const KILL_SWITCH_CONFIG: VersionKillSwitch[] = [
  {
    version: "v0",
    enabled: false,
    threshold: 1_000,
    currentCount: 0,
  },
  {
    version: "v1",
    enabled: false,
    threshold: 999_999_999, // v1 is current — effectively never triggers
    currentCount: 0,
  },
];

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Record a single API version usage event.
 * Call this from API route middleware on every request.
 *
 * Sprint 2: batch-flush to analytics DB rather than in-memory.
 */
export function recordVersionUsage(record: VersionUsageRecord): void {
  usageLog.push(record);

  // Increment per-version counter
  const prev = versionCounts.get(record.version) ?? 0;
  versionCounts.set(record.version, prev + 1);

  // Keep kill-switch counts in sync
  for (const ks of KILL_SWITCH_CONFIG) {
    if (ks.version === record.version) {
      if (!ks.endpoint || ks.endpoint === record.endpoint) {
        ks.currentCount += 1;
      }
    }
  }
}

/**
 * Return aggregated request counts per API version.
 *
 * Example: { "v1": 18432, "v0": 3 }
 */
export function getVersionUsageCounts(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [version, count] of versionCounts) {
    result[version] = count;
  }
  return result;
}

/**
 * Check whether a version (optionally scoped to an endpoint) should be blocked.
 *
 * Returns `true` (block the request) when ALL of:
 *   1. The kill switch is `enabled`
 *   2. `currentCount` has exceeded `threshold`
 *
 * @param version   — e.g. "v1"
 * @param endpoint  — optional endpoint path for finer-grained switches
 */
export function checkKillSwitch(version: string, endpoint?: string): boolean {
  for (const ks of KILL_SWITCH_CONFIG) {
    if (ks.version !== version) continue;
    if (ks.endpoint && ks.endpoint !== endpoint) continue;

    if (ks.enabled && ks.currentCount >= ks.threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Reset counters for a specific version kill switch.
 * Call after performing a manual review / threshold adjustment.
 */
export function resetKillSwitchCount(version: string, endpoint?: string): void {
  for (const ks of KILL_SWITCH_CONFIG) {
    if (ks.version !== version) continue;
    if (ks.endpoint && ks.endpoint !== endpoint) continue;
    ks.currentCount = 0;
  }
}
