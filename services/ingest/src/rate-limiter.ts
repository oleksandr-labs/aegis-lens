/**
 * Per-source rate limiter for the ingest pipeline.
 *
 * Prevents a single adapter from hammering external APIs.
 * Uses a sliding-window counter with configurable window + max requests.
 *
 * InMemoryRateLimiter: single-process, no Redis dependency.
 * RedisRateLimiter:    distributed, uses INCR + EXPIRE pattern.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** How many requests remain in the current window */
  remaining: number;
  /** Milliseconds until the window resets */
  retryAfterMs: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  consume(key: string): RateLimitResult;
}

// ── In-memory (single process) ────────────────────────────────────────────────

interface WindowState {
  count: number;
  windowStart: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, WindowState>();

  constructor(
    /** Max requests per window */
    private readonly max: number,
    /** Window duration in milliseconds */
    private readonly windowMs: number,
  ) {}

  private getOrCreate(key: string): WindowState {
    const now = Date.now();
    const state = this.windows.get(key);
    if (!state || now - state.windowStart >= this.windowMs) {
      const fresh: WindowState = { count: 0, windowStart: now };
      this.windows.set(key, fresh);
      return fresh;
    }
    return state;
  }

  check(key: string): RateLimitResult {
    const state = this.getOrCreate(key);
    const now = Date.now();
    const remaining = Math.max(0, this.max - state.count);
    const retryAfterMs = Math.max(0, this.windowMs - (now - state.windowStart));
    return { allowed: state.count < this.max, remaining, retryAfterMs };
  }

  consume(key: string): RateLimitResult {
    const state = this.getOrCreate(key);
    const now = Date.now();
    if (state.count < this.max) {
      state.count++;
    }
    const remaining = Math.max(0, this.max - state.count);
    const retryAfterMs = Math.max(0, this.windowMs - (now - state.windowStart));
    return { allowed: state.count <= this.max, remaining, retryAfterMs };
  }
}

// ── Token bucket (burst-friendly) ────────────────────────────────────────────

export class TokenBucketLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; lastRefill: number }>();

  constructor(
    /** Maximum burst size */
    private readonly capacity: number,
    /** Tokens added per second */
    private readonly refillRate: number,
  ) {}

  private getBucket(key: string) {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    } else {
      const elapsed = (now - bucket.lastRefill) / 1000;
      const added = elapsed * this.refillRate;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + added);
      bucket.lastRefill = now;
    }
    return bucket;
  }

  check(key: string): RateLimitResult {
    const bucket = this.getBucket(key);
    const allowed = bucket.tokens >= 1;
    const retryAfterMs = allowed ? 0 : Math.ceil((1 - bucket.tokens) / this.refillRate) * 1000;
    return { allowed, remaining: Math.floor(bucket.tokens), retryAfterMs };
  }

  consume(key: string): RateLimitResult {
    const bucket = this.getBucket(key);
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
    }
    const allowed = bucket.tokens >= 0;
    const retryAfterMs = allowed ? 0 : Math.ceil(-bucket.tokens / this.refillRate) * 1000;
    return { allowed, remaining: Math.floor(Math.max(0, bucket.tokens)), retryAfterMs };
  }
}

// ── Redis rate limiter ────────────────────────────────────────────────────────

export interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

export class RedisRateLimiter implements RateLimiter {
  constructor(
    private readonly redis: RedisClient,
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  // sync interface wraps async; callers must use async variant
  check(_key: string): RateLimitResult {
    throw new Error("Use checkAsync for Redis rate limiter");
  }

  consume(_key: string): RateLimitResult {
    throw new Error("Use consumeAsync for Redis rate limiter");
  }

  async checkAsync(key: string): Promise<RateLimitResult> {
    const ttl = await this.redis.ttl(key);
    // Redis does a best-effort count check without consuming
    return {
      allowed: true, // Optimistic — can't get count without INCR
      remaining: this.max,
      retryAfterMs: ttl > 0 ? ttl * 1000 : 0,
    };
  }

  async consumeAsync(key: string): Promise<RateLimitResult> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, Math.ceil(this.windowMs / 1000));
    }
    const ttl = await this.redis.ttl(key);
    const allowed = count <= this.max;
    const remaining = Math.max(0, this.max - count);
    return {
      allowed,
      remaining,
      retryAfterMs: allowed ? 0 : ttl * 1000,
    };
  }
}

// ── Per-source registry ───────────────────────────────────────────────────────

export interface SourceRateLimitConfig {
  max: number;
  windowMs: number;
  strategy: "sliding_window" | "token_bucket";
}

const DEFAULT_SOURCE_LIMITS: Record<string, SourceRateLimitConfig> = {
  nasa_firms: { max: 10, windowMs: 60_000, strategy: "sliding_window" },
  telegram: { max: 20, windowMs: 60_000, strategy: "token_bucket" },
  opensky: { max: 4, windowMs: 60_000, strategy: "sliding_window" }, // OpenSky: 4/min anonymous
  aisstream: { max: 1, windowMs: 5_000, strategy: "token_bucket" }, // WebSocket — reconnect throttle
  sentinel_hub: { max: 3, windowMs: 60_000, strategy: "sliding_window" },
  nominatim: { max: 60, windowMs: 60_000, strategy: "token_bucket" }, // Nominatim: 1/s
};

export function createSourceLimiter(
  sourceId: string,
  overrides?: SourceRateLimitConfig,
): RateLimiter {
  const cfg = overrides ?? DEFAULT_SOURCE_LIMITS[sourceId] ?? { max: 10, windowMs: 60_000, strategy: "sliding_window" as const };
  if (cfg.strategy === "token_bucket") {
    return new TokenBucketLimiter(cfg.max, cfg.max / (cfg.windowMs / 1000));
  }
  return new InMemoryRateLimiter(cfg.max, cfg.windowMs);
}
