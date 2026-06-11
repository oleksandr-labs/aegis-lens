/**
 * Lightweight in-memory fetch cache — drop-in until @tanstack/react-query is installed.
 *
 * API surface mirrors what use-events.ts expects:
 *   getFromCache(key)              → cached entry | undefined
 *   setCache(key, data, ttl?)      → stores entry with TTL (default 30 s)
 *   invalidateCache(key)           → removes a specific key
 *   clearCache()                   → wipes everything (useful in tests / logout)
 *
 * When @tanstack/react-query is added, delete this file, create a real
 * QueryClient here, and update use-events.ts to import useQuery.
 */

interface CacheEntry {
  data: unknown;
  fetchedAt: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

/** Returns the cached value if it is still within its TTL, otherwise undefined. */
export function getFromCache<T = unknown>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > entry.ttl) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

/** Stores a value under `key` for `ttl` milliseconds (default 30 s). */
export function setCache(key: string, data: unknown, ttl = 30_000): void {
  cache.set(key, { data, fetchedAt: Date.now(), ttl });
}

/** Removes a single key from the cache (e.g. after a mutation). */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/** Wipes the entire cache. */
export function clearCache(): void {
  cache.clear();
}

/**
 * Builds a stable cache key from an arbitrary object.
 * Uses JSON.stringify with sorted keys for determinism.
 */
export function buildCacheKey(namespace: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {});
  return `${namespace}:${JSON.stringify(sorted)}`;
}
