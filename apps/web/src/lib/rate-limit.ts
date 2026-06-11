import "server-only";

/**
 * In-process sliding-window rate limiter with per-tier limits.
 *
 * Sprint 1.7: in-memory only — fine for single-instance dev + small prod.
 * Sprint 2 swaps for Redis-backed sliding window.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Garbage-collect expired buckets every minute. */
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
};

// ── Per-tier limits ──────────────────────────────────────────────────────────

export type UserTier = "anonymous" | "free" | "pro" | "enterprise" | "internal";

/**
 * Per-tier rate limits for each endpoint family.
 * format: { requests per minute, burst (per 10s) }
 */
export const TIER_LIMITS: Record<
  UserTier,
  {
    events: { rpm: number; burst: number };
    search: { rpm: number; burst: number };
    copilot: { rpm: number; burst: number };
    export: { rpm: number; burst: number };
    layers: { rpm: number; burst: number };
    default: { rpm: number; burst: number };
  }
> = {
  anonymous: {
    events:  { rpm: 30,   burst: 5   },
    search:  { rpm: 20,   burst: 4   },
    copilot: { rpm: 5,    burst: 2   },
    export:  { rpm: 3,    burst: 1   },
    layers:  { rpm: 60,   burst: 10  },
    default: { rpm: 60,   burst: 10  },
  },
  free: {
    events:  { rpm: 100,  burst: 15  },
    search:  { rpm: 60,   burst: 10  },
    copilot: { rpm: 15,   burst: 5   },
    export:  { rpm: 10,   burst: 3   },
    layers:  { rpm: 120,  burst: 20  },
    default: { rpm: 120,  burst: 20  },
  },
  pro: {
    events:  { rpm: 600,  burst: 60  },
    search:  { rpm: 300,  burst: 40  },
    copilot: { rpm: 60,   burst: 15  },
    export:  { rpm: 60,   burst: 10  },
    layers:  { rpm: 600,  burst: 80  },
    default: { rpm: 600,  burst: 80  },
  },
  enterprise: {
    events:  { rpm: 3000, burst: 200 },
    search:  { rpm: 1500, burst: 100 },
    copilot: { rpm: 300,  burst: 50  },
    export:  { rpm: 300,  burst: 50  },
    layers:  { rpm: 3000, burst: 300 },
    default: { rpm: 3000, burst: 300 },
  },
  internal: {
    events:  { rpm: 99999, burst: 99999 },
    search:  { rpm: 99999, burst: 99999 },
    copilot: { rpm: 99999, burst: 99999 },
    export:  { rpm: 99999, burst: 99999 },
    layers:  { rpm: 99999, burst: 99999 },
    default: { rpm: 99999, burst: 99999 },
  },
};

type EndpointFamily = keyof (typeof TIER_LIMITS)[UserTier];

/**
 * Check + consume one token for `key`.
 *
 * @param key — e.g. "copilot:<ip>"
 * @param limit — max requests per window
 * @param windowMs — window length, default 60s
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }

  const ok = b.count < limit;
  if (ok) b.count += 1;

  return {
    ok,
    remaining: Math.max(0, limit - b.count),
    resetSeconds: Math.ceil((b.resetAt - now) / 1000),
    limit,
  };
}

/**
 * Tier-aware rate limit check.
 * Uses the correct limit for the tier + endpoint family.
 */
export function rateLimitTier(
  key: string,
  tier: UserTier,
  endpoint: EndpointFamily,
  windowMs: number = 60_000,
): RateLimitResult {
  const tierLimits = TIER_LIMITS[tier] ?? TIER_LIMITS.anonymous;
  const { rpm } = tierLimits[endpoint] ?? tierLimits.default;
  return rateLimit(key, rpm, windowMs);
}

/**
 * Pick a stable identifier from headers (forwarded IP or anonymous).
 */
export function identifyRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}

/**
 * Extract tier from API key or session header.
 * Production: lookup tier from DB by API key hash.
 */
export function extractTier(req: Request): UserTier {
  const auth = req.headers.get("authorization") ?? "";
  // Internal service calls
  if (req.headers.get("x-aegis-internal") === process.env.INTERNAL_SECRET) return "internal";
  // Enterprise keys start with ak_ent_
  if (auth.includes("ak_ent_")) return "enterprise";
  if (auth.includes("ak_pro_")) return "pro";
  if (auth.includes("ak_")) return "free";
  return "anonymous";
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(r.remaining),
    "X-RateLimit-Reset": String(r.resetSeconds),
    ...(r.ok ? {} : { "Retry-After": String(r.resetSeconds) }),
  };
}
