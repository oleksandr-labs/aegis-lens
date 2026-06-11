import "server-only";

/**
 * Redis caching for hot queries — TTL + tag-based invalidation.
 *
 * Uses an ioredis-compatible interface typed as a local interface (no hard
 * dependency — the caller must install ioredis and pass REDIS_URL).
 *
 * Falls back to calling fn() directly when Redis is unavailable, ensuring
 * the application degrades gracefully without caching.
 *
 * Tags enable bulk invalidation: call `invalidateByTag('events')` after
 * an ingest batch to evict all event-related cached responses at once.
 */

export interface RedisCacheConfig {
  /** Key prefix for namespacing (e.g., 'events-by-region'). */
  keyPrefix: string;
  /** Cache TTL in seconds. */
  ttlSeconds: number;
  /** Tags used for bulk invalidation. */
  tags: string[];
}

export const HOT_QUERY_CACHE_CONFIGS: Record<string, RedisCacheConfig> = {
  "events-by-region": {
    keyPrefix: "aegis:events-by-region",
    ttlSeconds: 30,
    tags: ["events"],
  },
  "active-alerts": {
    keyPrefix: "aegis:active-alerts",
    ttlSeconds: 5,
    tags: ["alerts"],
  },
  "tile-stats": {
    keyPrefix: "aegis:tile-stats",
    ttlSeconds: 60,
    tags: ["tiles"],
  },
  "search-popular": {
    keyPrefix: "aegis:search-popular",
    ttlSeconds: 300,
    tags: ["search"],
  },
  "equipment-losses-summary": {
    keyPrefix: "aegis:equipment-losses-summary",
    ttlSeconds: 120,
    tags: ["events", "equipment"],
  },
  "region-stats": {
    keyPrefix: "aegis:region-stats",
    ttlSeconds: 30,
    tags: ["events", "regions"],
  },
};

// ---------------------------------------------------------------------------
// ioredis-compatible interface (typed locally — no import needed)
// ---------------------------------------------------------------------------

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, exMode: "EX", ttl: number): Promise<unknown>;
  del(...keys: string[]): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
  smembers(key: string): Promise<string[]>;
  sadd(key: string, ...members: string[]): Promise<unknown>;
  expire(key: string, seconds: number): Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Redis connection (lazy singleton)
// ---------------------------------------------------------------------------

let _client: RedisClient | null = null;

function getRedisClient(): RedisClient | null {
  if (_client) return _client;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    // Dynamic require to avoid hard dependency at module load time
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require("ioredis");
    _client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_000,
      enableReadyCheck: false,
    }) as RedisClient;
    return _client;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cache primitives
// ---------------------------------------------------------------------------

/**
 * Wrap a data-fetching function with Redis caching.
 *
 * The cache key is: `${config.keyPrefix}:${key}`.
 * On cache miss, calls `fn()`, stores the result as JSON, and returns it.
 * Falls back to `fn()` directly if Redis is unavailable.
 */
export async function withCache<T>(
  key: string,
  config: RedisCacheConfig,
  fn: () => Promise<T>
): Promise<T> {
  const client = getRedisClient();
  const cacheKey = `${config.keyPrefix}:${key}`;

  if (client) {
    try {
      const cached = await client.get(cacheKey);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis read failure — fall through to fn()
    }
  }

  const result = await fn();

  if (client) {
    try {
      const serialized = JSON.stringify(result);
      await client.set(cacheKey, serialized, "EX", config.ttlSeconds);

      // Register key under each tag for bulk invalidation
      for (const tag of config.tags) {
        const tagKey = `aegis:tag:${tag}`;
        await client.sadd(tagKey, cacheKey);
        // Tag set TTL = max query TTL + 60s buffer
        await client.expire(tagKey, config.ttlSeconds + 60);
      }
    } catch {
      // Redis write failure — non-fatal, result already fetched
    }
  }

  return result;
}

/**
 * Invalidate all cache keys registered under a given tag.
 *
 * No-ops silently if Redis is unavailable.
 */
export async function invalidateByTag(tag: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const tagKey = `aegis:tag:${tag}`;
    const keys = await client.smembers(tagKey);
    if (keys.length > 0) {
      await client.del(...keys, tagKey);
    }
  } catch {
    // Non-fatal
  }
}
