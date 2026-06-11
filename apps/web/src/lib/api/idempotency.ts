'use server';
/**
 * Idempotency store for write operations — keyed record store, TTL, and policy notes.
 * Сховище ідемпотентності для операцій запису — зберігання записів за ключем, TTL та правила.
 *
 * Clients send a UUID in the `Idempotency-Key` header on POST/PUT/PATCH requests.
 * If a matching stored record is found and unexpired, the cached response is replayed.
 *
 * Клієнти надсилають UUID у заголовку `Idempotency-Key` для запитів POST/PUT/PATCH.
 * Якщо знайдено відповідний збережений запис і він не застарів, відтворюється кешована відповідь.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key" as const;
export const IDEMPOTENCY_TTL_SECONDS = 86_400; // 24 hours

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IdempotencyRecord {
  key: string;
  requestHash: string;
  response: unknown;
  createdAt: string;
  expiresAt: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Safe retry — idempotency keys allow clients to safely retry failed or timed-out writes */
export const IDEMPOTENCY_NOTE_RETRY_EN =
  "Safe retry — idempotency keys allow clients to safely retry failed or timed-out write requests; the server returns the original response if the key is still active, preventing duplicate records.";
export const IDEMPOTENCY_NOTE_RETRY_UK =
  "Безпечне повторення — ключі ідемпотентності дозволяють клієнтам безпечно повторювати невдалі або тайм-аутні запити на запис; сервер повертає оригінальну відповідь, якщо ключ ще активний, запобігаючи дублюванню записів.";

/** 24h TTL — keys expire after 24 hours; clients must use a new key after expiry */
export const IDEMPOTENCY_NOTE_TTL_EN =
  "24h TTL — idempotency keys expire after 24 hours (86,400 seconds); clients must use a new key for requests after expiry; expired keys are evicted lazily on access or via periodic cleanup.";
export const IDEMPOTENCY_NOTE_TTL_UK =
  "TTL 24 год — ключі ідемпотентності закінчуються через 24 години (86 400 секунд); клієнти повинні використовувати новий ключ для запитів після закінчення терміну; прострочені ключі видаляються ліниво при доступі або через планове очищення.";

export const IDEMPOTENCY_NOTES_EN = [IDEMPOTENCY_NOTE_RETRY_EN, IDEMPOTENCY_NOTE_TTL_EN];
export const IDEMPOTENCY_NOTES_UK = [IDEMPOTENCY_NOTE_RETRY_UK, IDEMPOTENCY_NOTE_TTL_UK];

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory idempotency record store.
 * Сховище записів ідемпотентності в пам'яті.
 */
export class IdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  /** Check for an existing unexpired record by idempotency key. */
  check(key: string): IdempotencyRecord | undefined {
    const record = this.records.get(key);
    if (!record) return undefined;
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      this.records.delete(key);
      return undefined;
    }
    return record;
  }

  /** Store a completed response under the given idempotency key. */
  store(key: string, requestHash: string, response: unknown): IdempotencyRecord {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + IDEMPOTENCY_TTL_SECONDS * 1000);
    const record: IdempotencyRecord = {
      key,
      requestHash,
      response,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    this.records.set(key, record);
    return record;
  }

  /** Evict all expired records. Returns the count of evicted entries. */
  cleanup(): number {
    const now = Date.now();
    let evicted = 0;
    for (const [key, record] of this.records) {
      if (now > new Date(record.expiresAt).getTime()) {
        this.records.delete(key);
        evicted++;
      }
    }
    return evicted;
  }

  /** Number of stored (potentially unexpired) records. */
  size(): number {
    return this.records.size;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory idempotency store singleton. */
export const idempotencyStore = new IdempotencyStore();
