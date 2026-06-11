/**
 * Task (Common) — Schedule + rate-limit policy (Reddit side).
 *
 * Reddit's OAuth API allows ~100 requests/minute per token (advertised as 600
 * req / 10 min) and asks clients to honour the `X-Ratelimit-*` response headers.
 * This module encodes a token-bucket throttle + the curated-subreddit poll
 * schedule so the fleet stays well under the limit and backs off on 429.
 *
 * (The generic per-endpoint quota model for YouTube lives in
 * `integrations/youtube/src/rate-policy.ts`; Reddit's limit is request-rate based
 * rather than weighted-unit based, hence a separate, simpler throttle here.)
 */

export const REDDIT_LIMITS = {
  /** Requests per minute per OAuth token (conservative vs. the 100/min cap). */
  requestsPerMinute: 90,
  /** Poll each curated subreddit's /new this often. */
  subredditPollIntervalMs: 5 * 60_000,
} as const;

/** Live rate-limit state parsed from Reddit response headers. */
export interface RedditRateState {
  /** Requests remaining in the current window (X-Ratelimit-Remaining). */
  remaining?: number;
  /** Seconds until the window resets (X-Ratelimit-Reset). */
  resetSeconds?: number;
  /** Used in the current window (X-Ratelimit-Used). */
  used?: number;
}

/** Parse the X-Ratelimit-* headers Reddit returns on every API call. */
export function parseRedditRateHeaders(headers: {
  get(name: string): string | null;
}): RedditRateState {
  const num = (v: string | null) => (v == null || v === "" ? undefined : Number(v));
  return {
    remaining: num(headers.get("x-ratelimit-remaining")),
    resetSeconds: num(headers.get("x-ratelimit-reset")),
    used: num(headers.get("x-ratelimit-used")),
  };
}

/**
 * Simple token-bucket throttle. Call `take()` before each request; it resolves
 * once a token is available (refilled at `requestsPerMinute`).
 */
export class RedditThrottle {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly perMinute = REDDIT_LIMITS.requestsPerMinute,
    now: number = Date.now(),
  ) {
    this.tokens = perMinute;
    this.lastRefill = now;
  }

  private refill(now: number): void {
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;
    const refilled = (elapsed / 60_000) * this.perMinute;
    this.tokens = Math.min(this.perMinute, this.tokens + refilled);
    this.lastRefill = now;
  }

  /** ms the caller must wait before a token is free (0 if available now). */
  waitMs(now: number = Date.now()): number {
    this.refill(now);
    if (this.tokens >= 1) return 0;
    const needed = 1 - this.tokens;
    return Math.ceil((needed / this.perMinute) * 60_000);
  }

  /** Consume a token (after waiting for `waitMs`). */
  consume(now: number = Date.now()): void {
    this.refill(now);
    this.tokens = Math.max(0, this.tokens - 1);
  }

  /** Apply server-reported state — if the server says 0 remaining, drain. */
  applyServerState(state: RedditRateState): void {
    if (state.remaining !== undefined && state.remaining <= 0) {
      this.tokens = 0;
    }
  }
}
