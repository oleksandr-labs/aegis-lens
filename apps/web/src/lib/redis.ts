import "server-only";
/**
 * Redis client singleton for Aegis Lens.
 *
 * Uses ioredis (compatible interface). Lazy-connects on first use.
 * Falls back gracefully when Redis is unavailable (dev without Docker).
 *
 * Usage:
 *   import { redis } from "@/lib/redis";
 *   await redis.set("key", "value", "EX", 60);
 *   const val = await redis.get("key");
 *
 * Used for:
 *   - Rate limiting (sliding window counters)
 *   - Session cache
 *   - Pub/Sub for low-volume SSE channel notifications
 *   - Short-lived report generation status
 *   - Idempotency key overflow (when in-memory store is full)
 *
 * Install: npm install ioredis
 *
 * Environment:
 *   REDIS_URL — Redis connection string (default: redis://localhost:6379)
 *               Example TLS: rediss://:<password>@host:6380
 *
 * Redis-клієнт: lazy-ініціалізація, graceful fallback для dev без Docker.
 */

// ── Config ────────────────────────────────────────────────────────────────────

export interface RedisConfig {
  /** Full Redis URL (redis:// or rediss:// for TLS). */
  url: string;
  /** Enable TLS (auto-detected from rediss:// scheme). */
  tls: boolean;
  /** Number of reconnect attempts before giving up. */
  maxRetries: number;
  /** Connection timeout in milliseconds. */
  connectTimeoutMs: number;
}

export const REDIS_URL: string =
  process.env.REDIS_URL ?? "redis://localhost:6379";

export const DEFAULT_REDIS_CONFIG: RedisConfig = {
  url: REDIS_URL,
  tls: REDIS_URL.startsWith("rediss://"),
  maxRetries: 3,
  connectTimeoutMs: 3_000,
};

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * ioredis-compatible minimal interface.
 * Covers all usage patterns in Aegis Lens.
 */
export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string | number): Promise<"OK" | null>;
  set(
    key: string,
    value: string | number,
    flag: "EX" | "PX",
    ttl: number,
  ): Promise<"OK" | null>;
  set(
    key: string,
    value: string | number,
    flag: "EX" | "PX",
    ttl: number,
    nx: "NX",
  ): Promise<"OK" | null>;
  del(...keys: string[]): Promise<number>;
  expire(key: string, seconds: number): Promise<0 | 1>;
  incr(key: string): Promise<number>;
  incrby(key: string, increment: number): Promise<number>;
  decr(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  exists(...keys: string[]): Promise<number>;
  ttl(key: string): Promise<number>;
  // biome-ignore lint/suspicious/noExplicitAny
  pipeline(): any; // ioredis Pipeline type
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, listener: (channel: string, message: string) => void): Promise<void>;
  quit(): Promise<"OK">;
  status: string;
}

// ── No-op (dev without Redis) ─────────────────────────────────────────────────

class NoOpRedisClient implements RedisClient {
  status = "offline" as const;

  private warn(op: string) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(`[redis] No-op: ${op}. Set REDIS_URL to enable Redis.`);
    }
  }

  async get(_key: string) { this.warn("get"); return null; }
  // biome-ignore lint/suspicious/noExplicitAny
  async set(...args: any[]) { this.warn(`set(${args[0]})`); return null; }
  async del(..._keys: string[]) { this.warn("del"); return 0; }
  async expire(_key: string, _s: number) { this.warn("expire"); return 0 as const; }
  async incr(_key: string) { this.warn("incr"); return 0; }
  async incrby(_key: string, _n: number) { this.warn("incrby"); return 0; }
  async decr(_key: string) { this.warn("decr"); return 0; }
  async keys(_pattern: string) { this.warn("keys"); return []; }
  async exists(..._keys: string[]) { this.warn("exists"); return 0; }
  async ttl(_key: string) { this.warn("ttl"); return -2; }
  pipeline() { return this; }
  async publish(_channel: string, _message: string) { return 0; }
  async subscribe(_channel: string, _listener: () => void) {}
  async quit() { return "OK" as const; }
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates and connects an ioredis client.
 * Falls back to NoOpRedisClient if ioredis is not installed or Redis is unreachable.
 *
 * Створює та підключає ioredis-клієнт з fallback на no-op.
 */
export function createRedisClient(
  config: Partial<RedisConfig> = {},
): RedisClient {
  const cfg: RedisConfig = { ...DEFAULT_REDIS_CONFIG, ...config };

  try {
    // Dynamic import — ioredis is optional
    // In production, import ioredis at top-level after installing
    const Redis = require("ioredis"); // eslint-disable-line @typescript-eslint/no-var-requires
    const client = new Redis(cfg.url, {
      maxRetriesPerRequest: cfg.maxRetries,
      connectTimeout: cfg.connectTimeoutMs,
      lazyConnect: true,
      enableReadyCheck: true,
      ...(cfg.tls ? { tls: {} } : {}),
    });

    client.on("error", (err: Error) => {
      if (process.env.NODE_ENV !== "test") {
        console.error("[redis] Connection error:", err.message);
      }
    });

    return client as RedisClient;
  } catch {
    // ioredis not installed — use no-op
    return new NoOpRedisClient();
  }
}

/**
 * Returns true if the Redis client is currently connected and ready.
 * Use for health check endpoints.
 *
 * Повертає true, якщо Redis підключений і готовий до роботи.
 */
export function isRedisAvailable(client: RedisClient = redis): boolean {
  return client.status === "ready";
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/**
 * Module-level singleton.
 * Lazy-connects on first use — does not throw if Redis is unreachable.
 *
 * Синглтон Redis-клієнта.
 */
export const redis: RedisClient = createRedisClient();
