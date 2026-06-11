/**
 * Task (Common) — Schedule + rate-limit policy (YouTube).
 *
 * YouTube Data API v3 bills in *quota units* (10,000/day by default): search.list
 * costs 100, videos.list/playlistItems.list cost 1, captions.list costs 50. A
 * naive poll of every curated channel via search.list would exhaust the daily
 * quota almost immediately, so this module encodes:
 *   - the per-endpoint quota cost table,
 *   - a polite poll schedule (channels polled via the cheap uploads-playlist path,
 *     not search),
 *   - a daily quota budget guard that refuses calls that would overspend.
 */

/** Quota cost (units) per Data API endpoint. */
export const QUOTA_COST: Record<string, number> = {
  "search.list": 100,
  "videos.list": 1,
  "playlistItems.list": 1,
  "captions.list": 50,
  "channels.list": 1,
};

/** Default daily quota for a standard Data API project. */
export const DEFAULT_DAILY_QUOTA = 10_000;

/** Recommended poll cadence so the curated fleet fits the daily budget. */
export const YOUTUBE_SCHEDULE = {
  /** Poll each channel's uploads playlist (cost 1) this often. */
  channelPollIntervalMs: 30 * 60_000, // 30 min
  /** Run keyword search.list (cost 100) sparingly. */
  searchIntervalMs: 6 * 3600_000, // 4×/day
  /** Reserve this fraction of the daily quota as headroom. */
  reserveFraction: 0.15,
} as const;

/**
 * Tracks quota spend within a rolling UTC day and gates calls. Reset at UTC
 * midnight (quota resets at midnight Pacific in reality — the host can override
 * `dayKey`; the guard logic is identical).
 */
export class YouTubeQuotaGuard {
  private spent = 0;
  private dayKey: string;

  constructor(
    private readonly dailyQuota = DEFAULT_DAILY_QUOTA,
    private readonly reserveFraction = YOUTUBE_SCHEDULE.reserveFraction,
    now: number = Date.now(),
  ) {
    this.dayKey = utcDay(now);
  }

  private rollover(now: number): void {
    const k = utcDay(now);
    if (k !== this.dayKey) {
      this.dayKey = k;
      this.spent = 0;
    }
  }

  private get budget(): number {
    return Math.floor(this.dailyQuota * (1 - this.reserveFraction));
  }

  /** Units still available today after reserve. */
  remaining(now: number = Date.now()): number {
    this.rollover(now);
    return Math.max(0, this.budget - this.spent);
  }

  /** Can we afford `endpoint`? */
  canAfford(endpoint: keyof typeof QUOTA_COST | string, now: number = Date.now()): boolean {
    const cost = QUOTA_COST[endpoint] ?? 1;
    return this.remaining(now) >= cost;
  }

  /** Record a spend; throws if it would breach the budget. */
  spend(endpoint: keyof typeof QUOTA_COST | string, now: number = Date.now()): void {
    this.rollover(now);
    const cost = QUOTA_COST[endpoint] ?? 1;
    if (this.spent + cost > this.budget) {
      throw Object.assign(new Error(`YouTube quota budget exhausted for ${endpoint}`), {
        retryAfterMs: msUntilUtcMidnight(now),
      });
    }
    this.spent += cost;
  }

  snapshot(): { spent: number; budget: number; dayKey: string } {
    return { spent: this.spent, budget: this.budget, dayKey: this.dayKey };
  }
}

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function msUntilUtcMidnight(now: number): number {
  const d = new Date(now);
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return next - now;
}
