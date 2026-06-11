/**
 * Crawl metrics aggregation for the Aegis Lens crawler dashboard.
 *
 * aggregateMetrics() is a pure function — it takes a list of CrawlJob
 * records and returns a CrawlDashboardData snapshot. Persisting or serving
 * that data is handled by the caller.
 */

import type { CrawlJob } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────

/** Per-domain metrics computed over the last 24 hours. */
export interface CrawlMetric {
  domain: string;
  /** Total jobs scheduled for this domain in the last 24 h. */
  crawlsLast24h: number;
  /** Fraction of completed jobs (0–1). */
  successRate: number;
  /** Mean response latency in ms across completed jobs. */
  avgLatencyMs: number;
  /** Total extracted items across all completed jobs (last 24 h). */
  itemsExtractedLast24h: number;
  /** ISO-8601 timestamp of the most recent completed crawl. */
  lastCrawlAt: string;
  /** Counts of error messages encountered (message → count). */
  errors: Record<string, number>;
}

/** Top-level dashboard data object. */
export interface CrawlDashboardData {
  /** Number of distinct domains seen across all jobs. */
  totalDomains: number;
  /** Domains that had at least one job in the last 24 hours. */
  activeDomains: number;
  metrics: CrawlMetric[];
  /** ISO-8601 timestamp when this snapshot was generated. */
  generatedAt: string;
}

// ── Aggregation ───────────────────────────────────────────────────────────

const MS_PER_DAY = 24 * 60 * 60 * 1_000;

/**
 * Aggregate a flat list of CrawlJobs into a CrawlDashboardData snapshot.
 *
 * Only jobs whose `scheduledAt` falls within the last 24 hours are
 * counted in the per-domain stats. Jobs with no `completedAt` are
 * excluded from latency and success-rate calculations.
 */
export function aggregateMetrics(jobs: CrawlJob[]): CrawlDashboardData {
  const now = Date.now();
  const cutoff = now - MS_PER_DAY;

  // Group all jobs by domain (all time, for totalDomains)
  const allDomains = new Set(jobs.map((j) => j.domain));

  // Filter to last-24h window
  const recentJobs = jobs.filter(
    (j) => new Date(j.scheduledAt).getTime() >= cutoff,
  );

  // Group recent jobs by domain
  const byDomain = new Map<string, CrawlJob[]>();
  for (const job of recentJobs) {
    const existing = byDomain.get(job.domain) ?? [];
    existing.push(job);
    byDomain.set(job.domain, existing);
  }

  const metrics: CrawlMetric[] = [];

  for (const [domain, domainJobs] of byDomain.entries()) {
    const completed = domainJobs.filter(
      (j) => j.status === "completed" && j.completedAt && j.startedAt,
    );
    const failed = domainJobs.filter((j) => j.status === "failed");

    // Success rate over all terminal jobs
    const terminal = completed.length + failed.length;
    const successRate = terminal > 0 ? completed.length / terminal : 0;

    // Average latency from startedAt → completedAt on completed jobs
    let totalLatencyMs = 0;
    for (const job of completed) {
      if (job.startedAt && job.completedAt) {
        totalLatencyMs +=
          new Date(job.completedAt).getTime() -
          new Date(job.startedAt).getTime();
      }
    }
    const avgLatencyMs =
      completed.length > 0
        ? Math.round(totalLatencyMs / completed.length)
        : 0;

    // Sum extracted items
    const itemsExtractedLast24h = completed.reduce(
      (acc, j) => acc + (j.extractedItemCount ?? 0),
      0,
    );

    // Most recent completed crawl
    const sortedCompleted = completed
      .filter((j) => j.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      );
    const lastCrawlAt = sortedCompleted[0]?.completedAt ?? "";

    // Error frequency map
    const errors: Record<string, number> = {};
    for (const job of failed) {
      if (job.error) {
        errors[job.error] = (errors[job.error] ?? 0) + 1;
      }
    }

    metrics.push({
      domain,
      crawlsLast24h: domainJobs.length,
      successRate,
      avgLatencyMs,
      itemsExtractedLast24h,
      lastCrawlAt,
      errors,
    });
  }

  // Sort metrics by crawlsLast24h descending for dashboard readability
  metrics.sort((a, b) => b.crawlsLast24h - a.crawlsLast24h);

  return {
    totalDomains: allDomains.size,
    activeDomains: byDomain.size,
    metrics,
    generatedAt: new Date().toISOString(),
  };
}
