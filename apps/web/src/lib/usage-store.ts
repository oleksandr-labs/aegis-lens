import "server-only";

export type UsageMetric =
  | "api_calls"
  | "events_ingested"
  | "ai_tokens"
  | "copilot_queries"
  | "exports"
  | "alert_deliveries"
  | "webhook_deliveries";

export interface UsageBucket {
  metric: UsageMetric;
  /** YYYY-MM-DD */
  date: string;
  count: number;
}

export interface UsageSummary {
  metric: UsageMetric;
  total: number;
  last7d: number;
  last30d: number;
  limit: number | null;
  pctUsed: number | null;
}

// In-memory usage store — in production backed by TimescaleDB hypertable
const buckets: UsageBucket[] = [];

// Limits per tier
const TIER_LIMITS: Record<string, Partial<Record<UsageMetric, number>>> = {
  free:       { api_calls: 1000, copilot_queries: 10, exports: 5 },
  pro:        { api_calls: 60_000, copilot_queries: 500, exports: 100 },
  enterprise: { api_calls: null as unknown as number, copilot_queries: null as unknown as number, exports: null as unknown as number },
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function incrementUsage(metric: UsageMetric, by = 1, date: Date = new Date()): void {
  const dateStr = isoDate(date);
  const existing = buckets.find((b) => b.metric === metric && b.date === dateStr);
  if (existing) {
    existing.count += by;
  } else {
    buckets.push({ metric, date: dateStr, count: by });
  }
}

export function getUsageSummary(tier: string = "free"): UsageSummary[] {
  const now = new Date();
  const sevenDaysAgo = isoDate(new Date(now.getTime() - 7 * 86_400_000));
  const thirtyDaysAgo = isoDate(new Date(now.getTime() - 30 * 86_400_000));

  const metrics: UsageMetric[] = [
    "api_calls", "events_ingested", "ai_tokens", "copilot_queries",
    "exports", "alert_deliveries", "webhook_deliveries",
  ];

  return metrics.map((metric) => {
    const all = buckets.filter((b) => b.metric === metric);
    const total = all.reduce((s, b) => s + b.count, 0);
    const last7d = all.filter((b) => b.date >= sevenDaysAgo).reduce((s, b) => s + b.count, 0);
    const last30d = all.filter((b) => b.date >= thirtyDaysAgo).reduce((s, b) => s + b.count, 0);
    const tierLimits = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
    const limit = tierLimits[metric] ?? null;
    const pctUsed = limit != null ? parseFloat(((last30d / limit) * 100).toFixed(1)) : null;
    return { metric, total, last7d, last30d, limit, pctUsed };
  });
}

export function getUsageHistory(metric: UsageMetric, days = 30): UsageBucket[] {
  const cutoff = isoDate(new Date(Date.now() - days * 86_400_000));
  return buckets
    .filter((b) => b.metric === metric && b.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Seed some demo data
function seedDemo(): void {
  const metrics: UsageMetric[] = ["api_calls", "copilot_queries", "events_ingested", "exports", "alert_deliveries"];
  for (let d = 30; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86_400_000);
    for (const metric of metrics) {
      const base = metric === "api_calls" ? 800 : metric === "events_ingested" ? 250 : metric === "alert_deliveries" ? 45 : 12;
      incrementUsage(metric, Math.floor(base * (0.6 + Math.random() * 0.8)), date);
    }
  }
}

seedDemo();
