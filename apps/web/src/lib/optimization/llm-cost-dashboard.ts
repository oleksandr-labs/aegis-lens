/**
 * LLM cost tracking and dashboard.
 *
 * Records per-request LLM usage (tokens + cost), aggregates into reports,
 * and raises budget alerts when projected monthly spend exceeds the configured limit.
 *
 * Usage:
 *   import { llmCostStore } from '@/lib/optimization/llm-cost-dashboard';
 *   llmCostStore.record({ model, provider, promptTokens, completionTokens, costUsd, feature, timestamp });
 *   const report = llmCostStore.getReport(24); // last 24 hours
 */

export const MONTHLY_LLM_BUDGET_USD = Number(
  process.env.LLM_MONTHLY_BUDGET_USD ?? "500"
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LlmCostEntry {
  /** Model name (e.g., 'claude-sonnet-4-6'). */
  model: string;
  /** Provider (e.g., 'anthropic'). */
  provider: string;
  /** Number of prompt (input) tokens. */
  promptTokens: number;
  /** Number of completion (output) tokens. */
  completionTokens: number;
  /** Cost in USD for this request. */
  costUsd: number;
  /** Feature that triggered the request (e.g., 'copilot', 'event-classify'). */
  feature: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
}

export interface LlmCostReport {
  /** Human-readable period description (e.g., 'last 24h'). */
  period: string;
  /** Total USD spent in period. */
  totalUsd: number;
  /** Cost broken down by model. */
  byModel: Record<string, number>;
  /** Cost broken down by feature. */
  byFeature: Record<string, number>;
  /** 95th-percentile cost per request in the period. */
  p95CostPerRequest: number;
  /** Average cost per event processed (totalUsd / request count). */
  avgCostPerEvent: number;
  /** Extrapolated monthly cost based on the observed rate. */
  projectedMonthlyUsd: number;
}

export interface BudgetAlert {
  exceeded: boolean;
  /** Percentage of monthly budget consumed (based on projection). */
  percent: number;
  projectedUsd: number;
}

// ---------------------------------------------------------------------------
// In-memory store (replace with persistent DB/Redis in production)
// ---------------------------------------------------------------------------

class LlmCostStoreImpl {
  private entries: LlmCostEntry[] = [];

  /** Record a single LLM request cost entry. */
  record(entry: LlmCostEntry): void {
    this.entries.push(entry);

    // Trim old entries to avoid unbounded memory growth.
    // Keep at most 90 days × 100k requests/day = 9M entries max.
    // In practice, flush to a DB and clear the in-memory buffer.
    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const firstRecent = this.entries.findIndex(
      (e) => new Date(e.timestamp).getTime() >= cutoff
    );
    if (firstRecent > 1000) {
      this.entries = this.entries.slice(firstRecent);
    }
  }

  /**
   * Generate a cost report for the last `hours` hours.
   *
   * @param hours - Window size in hours (default: 24). Pass 0 for all-time.
   */
  getReport(hours = 24): LlmCostReport {
    const now = Date.now();
    const windowMs = hours > 0 ? hours * 60 * 60 * 1000 : Infinity;
    const cutoff = now - windowMs;

    const filtered = this.entries.filter(
      (e) => new Date(e.timestamp).getTime() >= cutoff
    );

    if (filtered.length === 0) {
      return {
        period: hours > 0 ? `last ${hours}h` : "all-time",
        totalUsd: 0,
        byModel: {},
        byFeature: {},
        p95CostPerRequest: 0,
        avgCostPerEvent: 0,
        projectedMonthlyUsd: 0,
      };
    }

    let totalUsd = 0;
    const byModel: Record<string, number> = {};
    const byFeature: Record<string, number> = {};

    for (const e of filtered) {
      totalUsd += e.costUsd;
      byModel[e.model] = (byModel[e.model] ?? 0) + e.costUsd;
      byFeature[e.feature] = (byFeature[e.feature] ?? 0) + e.costUsd;
    }

    // p95 cost per request
    const sorted = [...filtered].sort((a, b) => a.costUsd - b.costUsd);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95CostPerRequest = sorted[Math.min(p95Index, sorted.length - 1)].costUsd;

    const avgCostPerEvent = totalUsd / filtered.length;

    // Projected monthly cost: extrapolate from observed rate
    const observedHours = Math.min(hours > 0 ? hours : 24, windowMs / (60 * 60 * 1000));
    const hourlyRate = totalUsd / Math.max(observedHours, 1);
    const projectedMonthlyUsd = hourlyRate * 24 * 30;

    return {
      period: hours > 0 ? `last ${hours}h` : "all-time",
      totalUsd,
      byModel,
      byFeature,
      p95CostPerRequest,
      avgCostPerEvent,
      projectedMonthlyUsd,
    };
  }

  /**
   * Return a budget alert if projected monthly spend is significant.
   *
   * Returns null if no entries have been recorded yet.
   *
   * @param monthlyBudgetUsd - Monthly budget cap in USD.
   */
  getBudgetAlert(monthlyBudgetUsd: number): BudgetAlert | null {
    const report = this.getReport(24);
    if (report.totalUsd === 0) return null;

    const projectedUsd = report.projectedMonthlyUsd;
    const percent = (projectedUsd / monthlyBudgetUsd) * 100;

    return {
      exceeded: projectedUsd > monthlyBudgetUsd,
      percent: Math.round(percent * 10) / 10,
      projectedUsd,
    };
  }
}

/** Singleton cost store — import and use directly in server-side code. */
export const llmCostStore = new LlmCostStoreImpl();
