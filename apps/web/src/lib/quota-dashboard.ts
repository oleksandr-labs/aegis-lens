import "server-only";

import { TIER_LIMITS, type UserTier } from "./rate-limit";

// ── Types ────────────────────────────────────────────────────────────────────

export type QuotaMetric = {
  /** Endpoint family / resource name */
  name: string;
  /** Units consumed in the current period */
  used: number;
  /** Maximum allowed in the period */
  limit: number;
  /** What is being counted — "requests/min", "exports/day", etc. */
  unit: string;
  /** ISO-8601 datetime when the bucket resets */
  resetAt: string;
  /** 0–100 */
  percentUsed: number;
};

export type QuotaDashboard = {
  orgId: string;
  tier: string;
  metrics: QuotaMetric[];
  /** ISO-8601 period label e.g. "2026-06-10T00:00:00Z" */
  period: string;
};

export type QuotaWarning = {
  metric: string;
  severity: "warn" | "critical";
  message: string;
};

// ── Thresholds ────────────────────────────────────────────────────────────────

const WARN_THRESHOLD = 75;
const CRITICAL_THRESHOLD = 90;

// ── Helpers ──────────────────────────────────────────────────────────────────

function periodStart(): string {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString();
}

function minuteResetAt(): string {
  const now = new Date();
  now.setSeconds(60, 0);
  return now.toISOString();
}

/**
 * In-memory usage store keyed by "orgId:endpoint".
 * Sprint 2: swap for Redis HGETALL.
 */
const usageStore = new Map<string, number>();

function getUsed(orgId: string, endpoint: string): number {
  return usageStore.get(`${orgId}:${endpoint}`) ?? 0;
}

/** Increment usage counter (called from rate-limit middleware) */
export function incrementUsage(orgId: string, endpoint: string, by = 1): void {
  const key = `${orgId}:${endpoint}`;
  usageStore.set(key, (usageStore.get(key) ?? 0) + by);
}

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Build a quota dashboard for an org.
 *
 * @param orgId  — stable org identifier
 * @param tier   — billing tier; 'team' falls back to 'pro' limits
 */
export function buildQuotaDashboard(
  orgId: string,
  tier: "free" | "pro" | "team" | "enterprise",
): QuotaDashboard {
  // 'team' is a UI label; rate-limiting treats it as 'pro'
  const resolvedTier: UserTier = tier === "team" ? "pro" : tier;
  const tierConfig = TIER_LIMITS[resolvedTier];

  const endpointFamilies = [
    "events",
    "search",
    "copilot",
    "export",
    "layers",
    "default",
  ] as const;

  const resetAt = minuteResetAt();

  const metrics: QuotaMetric[] = endpointFamilies.map((family) => {
    const { rpm } = tierConfig[family];
    const used = getUsed(orgId, family);
    const percentUsed = rpm === 0 ? 100 : Math.min(100, Math.round((used / rpm) * 100));

    return {
      name: family,
      used,
      limit: rpm,
      unit: "requests/min",
      resetAt,
      percentUsed,
    };
  });

  return {
    orgId,
    tier,
    metrics,
    period: periodStart(),
  };
}

/**
 * Return warnings for metrics that are approaching or over their limits.
 *
 * Severity:
 *   - "warn"     — ≥ 75% used
 *   - "critical" — ≥ 90% used
 */
export function getQuotaWarnings(dashboard: QuotaDashboard): QuotaWarning[] {
  const warnings: QuotaWarning[] = [];

  for (const metric of dashboard.metrics) {
    if (metric.percentUsed >= CRITICAL_THRESHOLD) {
      warnings.push({
        metric: metric.name,
        severity: "critical",
        message: `Quota critical: ${metric.name} is at ${metric.percentUsed}% (${metric.used}/${metric.limit} ${metric.unit}). Requests may be rejected.`,
      });
    } else if (metric.percentUsed >= WARN_THRESHOLD) {
      warnings.push({
        metric: metric.name,
        severity: "warn",
        message: `Quota warning: ${metric.name} is at ${metric.percentUsed}% (${metric.used}/${metric.limit} ${metric.unit}).`,
      });
    }
  }

  return warnings;
}
