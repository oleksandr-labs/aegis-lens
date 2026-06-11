/**
 * AOI dashboard stats aggregation.
 *
 * Builds a snapshot of key metrics for each AOI, refreshed every 5 minutes
 * by a background job.  Consumed by the frontend AOI overview panel.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN operational notes */
export const AOI_DASHBOARD_NOTES_EN = [
  "aggregated-per-AOI: stats are pre-computed per-AOI and cached; do not compute on each request",
  "refreshed-5min: background job calls buildAOIDashboardStats() on each AOI every 5 minutes; push via SSE or polling",
] as const;

/** UA операційні примітки */
export const AOI_DASHBOARD_NOTES_UK = [
  "aggregated-per-AOI: статистика попередньо обчислюється для кожного AOI та кешується; не обчислюйте при кожному запиті",
  "refreshed-5min: фоновий процес викликає buildAOIDashboardStats() для кожного AOI кожні 5 хвилин; доставка через SSE або polling",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Aggregated dashboard statistics for a single AOI */
export interface AOIDashboardStats {
  aoiId: string;
  aoiName: string;
  /** Events in the last 24 hours */
  eventCount24h: number;
  /** Events in the last 7 days */
  eventCount7d: number;
  /** Highest danger score among events in the last 24 h (0-100) */
  maxDangerScore24h: number;
  /** Number of distinct sources that reported events in the last 24 h */
  sourcesActive: number;
  /** Latest Sentinel change detection score (0–1), if available */
  changeScore?: number;
  /** ISO-8601 timestamp of the last triggered alert, if any */
  lastAlertAt?: string;
  /** Direction of risk over the last 7 days */
  riskTrend: "rising" | "stable" | "declining";
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const MS_24H = 24 * 60 * 60 * 1000;
const MS_7D = 7 * MS_24H;

/**
 * Build dashboard stats for one AOI from its recent events array.
 *
 * @param aoiId — the AOI identifier
 * @param recentEvents — array of event-like objects expected to have:
 *   - occurredAt: string (ISO-8601)
 *   - dangerScore?: number (0-100)
 *   - sourceId?: string
 *   - isAlert?: boolean
 */
export function buildAOIDashboardStats(
  aoiId: string,
  recentEvents: {
    occurredAt: string;
    dangerScore?: number;
    sourceId?: string;
    isAlert?: boolean;
    aoiId?: string;
  }[],
  aoiName = aoiId,
  changeScore?: number,
): AOIDashboardStats {
  const now = Date.now();

  const events24h = recentEvents.filter(
    (e) => now - new Date(e.occurredAt).getTime() <= MS_24H,
  );
  const events7d = recentEvents.filter(
    (e) => now - new Date(e.occurredAt).getTime() <= MS_7D,
  );

  const maxDangerScore24h = events24h.reduce(
    (max, e) => Math.max(max, e.dangerScore ?? 0),
    0,
  );

  const activeSources = new Set(events24h.map((e) => e.sourceId).filter(Boolean));

  // Determine last alert
  const alertEvents = recentEvents
    .filter((e) => e.isAlert)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const lastAlertAt = alertEvents[0]?.occurredAt;

  // Risk trend: compare avg danger score first 3.5d vs last 3.5d of the 7-day window
  const midpoint = now - 3.5 * MS_24H;
  const olderHalf = events7d.filter((e) => new Date(e.occurredAt).getTime() < midpoint);
  const newerHalf = events7d.filter((e) => new Date(e.occurredAt).getTime() >= midpoint);

  const avgScore = (events: typeof recentEvents) =>
    events.length > 0
      ? events.reduce((s, e) => s + (e.dangerScore ?? 0), 0) / events.length
      : 0;

  const olderAvg = avgScore(olderHalf);
  const newerAvg = avgScore(newerHalf);
  const diff = newerAvg - olderAvg;

  const riskTrend: AOIDashboardStats["riskTrend"] =
    diff > 5 ? "rising" : diff < -5 ? "declining" : "stable";

  return {
    aoiId,
    aoiName,
    eventCount24h: events24h.length,
    eventCount7d: events7d.length,
    maxDangerScore24h: Math.round(maxDangerScore24h),
    sourcesActive: activeSources.size,
    changeScore,
    lastAlertAt,
    riskTrend,
  };
}
