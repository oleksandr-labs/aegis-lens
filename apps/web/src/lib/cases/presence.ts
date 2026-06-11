/**
 * Real-time presence — track who is currently viewing a case.
 * Відстеження присутності в реальному часі — хто переглядає справу.
 *
 * Viewers join on page open and leave on close/disconnect.
 * Stale entries (no heartbeat within PRESENCE_TIMEOUT_MS) are evicted automatically.
 *
 * Глядачі приєднуються при відкритті сторінки і виходять при закритті/розриві.
 * Застарілі записи (без пульсу протягом PRESENCE_TIMEOUT_MS) видаляються автоматично.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Evict a viewer if no heartbeat received within this window (ms). */
export const PRESENCE_TIMEOUT_MS = 30_000;

/** Maximum concurrent viewers tracked per case to cap memory usage. */
const MAX_VIEWERS_PER_CASE = 20;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserPresence {
  userId: string;
  displayName: string;
  /** Two-letter initials derived from displayName (e.g. "AK" for "Anna Koval") */
  avatarInitials: string;
  caseId: string;
  /** ISO timestamp when the user navigated to the case */
  viewingSince: string;
  /** ISO timestamp of the last heartbeat ping — used for eviction */
  lastActiveAt: string;
  /** Optional cursor position (relative to the case canvas / map) */
  cursor?: { x: number; y: number };
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory presence registry.
 * In production, replace with Redis sorted-sets or a Pub/Sub channel so
 * all server replicas share the same presence state.
 *
 * Реєстр присутності в пам'яті.
 * У продакшені замінити Redis sorted-sets або Pub/Sub-каналом
 * для синхронізації між усіма репліками сервера.
 */
export class PresenceStore {
  /** Map<caseId, Map<userId, UserPresence>> */
  private readonly viewers = new Map<string, Map<string, UserPresence>>();

  private getRoom(caseId: string): Map<string, UserPresence> {
    let room = this.viewers.get(caseId);
    if (!room) {
      room = new Map();
      this.viewers.set(caseId, room);
    }
    return room;
  }

  /**
   * Register a viewer entering a case.
   * Silently ignores if the room is at MAX_VIEWERS_PER_CASE (evict stale first).
   *
   * Реєстрація глядача, який входить до справи.
   */
  join(caseId: string, presence: UserPresence): UserPresence {
    const room = this.getRoom(caseId);
    this._evictStale(room);

    if (!room.has(presence.userId) && room.size >= MAX_VIEWERS_PER_CASE) {
      // Room full — do not add; caller may surface a "room full" notice
      return presence;
    }

    room.set(presence.userId, {
      ...presence,
      caseId,
      viewingSince: presence.viewingSince || new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });
    return room.get(presence.userId)!;
  }

  /**
   * Remove a viewer (on disconnect or navigation away).
   *
   * Видалення глядача (при від'єднанні або переходу з сторінки).
   */
  leave(caseId: string, userId: string): void {
    const room = this.viewers.get(caseId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) this.viewers.delete(caseId);
    }
  }

  /**
   * Return all live viewers for a case (evicts stale entries first).
   *
   * Повертає всіх активних глядачів справи (з видаленням застарілих записів).
   */
  getViewers(caseId: string): UserPresence[] {
    const room = this.viewers.get(caseId);
    if (!room) return [];
    this._evictStale(room);
    return [...room.values()];
  }

  /**
   * Update `lastActiveAt` and optionally cursor position.
   * Should be called on every SSE heartbeat (≤ 30 s).
   *
   * Оновлення часу останньої активності та позиції курсора.
   * Викликати при кожному SSE-пульсі (≤ 30 с).
   */
  updateActivity(
    caseId: string,
    userId: string,
    cursor?: { x: number; y: number },
  ): void {
    const room = this.viewers.get(caseId);
    const entry = room?.get(userId);
    if (!entry) return;
    entry.lastActiveAt = new Date().toISOString();
    if (cursor !== undefined) entry.cursor = cursor;
  }

  /** Evict entries older than PRESENCE_TIMEOUT_MS. */
  private _evictStale(room: Map<string, UserPresence>): void {
    const cutoff = Date.now() - PRESENCE_TIMEOUT_MS;
    for (const [userId, p] of room) {
      if (new Date(p.lastActiveAt).getTime() < cutoff) {
        room.delete(userId);
      }
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory presence store singleton. */
export const presenceStore = new PresenceStore();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive two-letter avatar initials from a display name.
 * "Anna Koval" → "AK"; "Oleksandr" → "OL"; "" → "??"
 *
 * Два ініціали для аватара з відображуваного імені.
 */
export function avatarInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Real-time via SSE:
 * The web client opens a persistent SSE connection to /api/v1/cases/[id]/presence.
 * Joins and leaves are broadcast as typed events so all co-viewers see live updates.
 * On reconnect, the client re-sends its join event to re-establish presence.
 *
 * [1] Реальний час через SSE:
 * Клієнт відкриває SSE-з'єднання до /api/v1/cases/[id]/presence.
 * Входи та виходи транслюються як типізовані події для всіх глядачів.
 * При повторному підключенні клієнт повторно надсилає подію приєднання.
 */
export const NOTE_REALTIME_SSE_EN =
  "Real-time via SSE: presence events are broadcast to all co-viewers through a " +
  "server-sent events channel at /api/v1/cases/[id]/presence. " +
  "Client heartbeat interval must be < PRESENCE_TIMEOUT_MS (30 s).";

export const NOTE_REALTIME_SSE_UK =
  "Реальний час через SSE: події присутності транслюються всім глядачам через " +
  "канал Server-Sent Events на /api/v1/cases/[id]/presence. " +
  "Інтервал пульсу клієнта має бути < PRESENCE_TIMEOUT_MS (30 с).";

/**
 * [2] Privacy — name only:
 * Only displayName and avatarInitials are shared across viewers.
 * Full user profiles, emails, and roles are never broadcast via the presence channel.
 *
 * [2] Конфіденційність — лише ім'я:
 * Через канал присутності передаються лише displayName та avatarInitials.
 * Повні профілі, електронні адреси та ролі ніколи не транслюються.
 */
export const NOTE_PRIVACY_EN =
  "Privacy — name only: only displayName and avatarInitials are exposed through the " +
  "presence channel. Emails, roles, and profile data are never broadcast.";

export const NOTE_PRIVACY_UK =
  "Конфіденційність — лише ім'я: через канал присутності передаються лише displayName " +
  "та avatarInitials. Електронні адреси, ролі та дані профілів ніколи не транслюються.";

/**
 * [3] Max 20 viewers:
 * A maximum of 20 concurrent viewer slots are tracked per case to bound memory use.
 * Late joiners beyond the cap are not evicted — they still see the case but do not
 * appear in other viewers' presence list until a slot frees up.
 *
 * [3] Максимум 20 глядачів:
 * Відстежується максимум 20 одночасних глядачів на справу для обмеження пам'яті.
 * Пізні учасники понад ліміт не видаляються — вони бачать справу, але не відображаються
 * у списку присутності інших до звільнення місця.
 */
export const NOTE_MAX_VIEWERS_EN =
  "Max 20 viewers per case: tracked in-memory. " +
  "Stale entries (no heartbeat for 30 s) are evicted first to make room. " +
  "Upgrade to Redis for higher limits in production.";

export const NOTE_MAX_VIEWERS_UK =
  "Максимум 20 глядачів на справу: відстеження в пам'яті. " +
  "Застарілі записи (без пульсу 30 с) видаляються першими для звільнення місця. " +
  "Для більших лімітів у продакшені використовуйте Redis.";
