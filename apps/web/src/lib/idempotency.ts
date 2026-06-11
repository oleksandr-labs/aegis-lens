import "server-only";
/**
 * Idempotency keys for write operations.
 *
 * Clients send a UUID in the `Idempotency-Key` header on POST/PUT/PATCH
 * requests. If a request with the same key has already succeeded, the
 * stored response is returned without re-executing the handler.
 *
 * Semantics follow the Stripe idempotency model:
 *   - Keys are scoped per operation (callers should namespace: `op:uuid`)
 *   - TTL: 24 hours (keys expire and can be reused)
 *   - Concurrent requests with the same key: second returns 409 Conflict
 *     while first is in-flight (not implemented here — requires distributed lock)
 *
 * Usage in a route handler:
 *   export async function POST(req: Request) {
 *     const key = extractIdempotencyKey(req);
 *     if (key) {
 *       return withIdempotency(key, () => myHandler(req));
 *     }
 *     return myHandler(req);
 *   }
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const IDEMPOTENCY_HEADER = "Idempotency-Key" as const;

/** Default key TTL in milliseconds (24 hours). */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IdempotencyRecord {
  key: string;
  statusCode: number;
  body: unknown;
  createdAt: string;
  expiresAt: string;
}

// ── IdempotencyStore interface ────────────────────────────────────────────────

export interface IdempotencyStore {
  get(key: string): IdempotencyRecord | undefined;
  set(key: string, record: IdempotencyRecord): void;
  delete(key: string): void;
}

// ── InMemoryIdempotencyStore ──────────────────────────────────────────────────

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly store = new Map<string, IdempotencyRecord>();
  private readonly ttlMs: number;

  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  get(key: string): IdempotencyRecord | undefined {
    const record = this.store.get(key);
    if (!record) return undefined;

    // Lazy expiry: evict on read
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      this.store.delete(key);
      return undefined;
    }

    return record;
  }

  set(key: string, record: IdempotencyRecord): void {
    this.store.set(key, record);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Evict all expired records.
   * Call periodically (e.g. on a setInterval) to prevent unbounded growth.
   */
  evictExpired(): number {
    const now = Date.now();
    let evicted = 0;
    for (const [key, record] of this.store) {
      if (now > new Date(record.expiresAt).getTime()) {
        this.store.delete(key);
        evicted++;
      }
    }
    return evicted;
  }

  /** Number of stored (potentially unexpired) records. */
  size(): number {
    return this.store.size;
  }
}

// ── Module-level singleton ─────────────────────────────────────────────────────

const _store = new InMemoryIdempotencyStore();

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Check whether a key has an existing completed record.
 * Returns the record if found and unexpired, otherwise undefined.
 */
export function checkIdempotency(key: string): IdempotencyRecord | undefined {
  return _store.get(key);
}

/**
 * Store a completed handler result under the given idempotency key.
 * The record expires after 24 hours.
 */
export function storeIdempotencyResult(
  key: string,
  statusCode: number,
  body: unknown,
): IdempotencyRecord {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_TTL_MS);

  const record: IdempotencyRecord = {
    key,
    statusCode,
    body,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  _store.set(key, record);
  return record;
}

/**
 * Extract the idempotency key from an incoming Request.
 * Returns null if the header is absent or blank.
 */
export function extractIdempotencyKey(request: Request): string | null {
  const value = request.headers.get(IDEMPOTENCY_HEADER);
  if (!value || value.trim() === "") return null;
  return value.trim();
}

/**
 * Wrap a handler with idempotency logic.
 *
 * - If the key has been seen and a result is stored, replay the stored response.
 * - Otherwise, execute the handler, store the result, and return it.
 *
 * Only successful responses (2xx) are cached. Errors propagate normally
 * and are NOT stored — clients should retry errored requests with the same key.
 *
 * @param key     The idempotency key extracted from the request header.
 * @param handler An async function that returns a Response.
 */
export async function withIdempotency(
  key: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  // Check for a cached result
  const existing = checkIdempotency(key);
  if (existing) {
    const replayResponse = new Response(JSON.stringify(existing.body), {
      status: existing.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Idempotent-Replayed": "true",
        "Idempotency-Key": key,
      },
    });
    return replayResponse;
  }

  // Execute the handler
  const response = await handler();

  // Cache only on success (2xx)
  if (response.ok) {
    try {
      const cloned = response.clone();
      const body = await cloned.json().catch(() => null);
      storeIdempotencyResult(key, response.status, body);
    } catch {
      // Non-JSON or unreadable body — skip caching, response still sent
    }
  }

  return response;
}
