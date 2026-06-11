'use server';
/**
 * Case locking and read-only state management.
 * Управління блокуванням справ та станами лише для читання.
 *
 * Prevents concurrent edits by locking a case to a single user at a time.
 * Archived and system-locked cases are permanently read-only.
 *
 * Запобігає одночасному редагуванню, блокуючи справу для одного користувача.
 * Архівовані та системно заблоковані справи є постійно лише для читання.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CaseLockStatus =
  | "unlocked"              // no active lock; any editor may claim
  | "locked_by_user"        // held by a specific user session
  | "read_only_archived"    // archived case — no edits allowed
  | "read_only_system";     // system-initiated lock (e.g. under legal hold)

export interface CaseLock {
  caseId: string;
  /** null when status is 'unlocked' */
  lockedByUserId: string | null;
  /** ISO timestamp of when the lock was acquired; null when unlocked */
  lockedAt: string | null;
  /** Human-readable reason (e.g. "archived", "legal hold", or undefined for user locks) */
  reason?: string;
  status: CaseLockStatus;
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory lock registry keyed by caseId.
 * In production, replace with a DB row (cases.lockedByUserId + cases.lockedAt)
 * and a WebSocket/SSE broadcast so other sessions see the lock immediately.
 *
 * Реєстр блокувань у пам'яті за caseId.
 * У продакшені замінити рядком БД та WebSocket/SSE-трансляцією.
 */
export class CaseLockStore {
  private readonly locks = new Map<string, CaseLock>();

  /**
   * Acquire a lock for a case on behalf of `userId`.
   * Returns the new lock, or the existing lock if the case is already held
   * by a different user (caller should surface a conflict warning).
   *
   * Захоплення блокування справи від імені користувача.
   */
  lock(caseId: string, userId: string, reason?: string): CaseLock {
    const existing = this.locks.get(caseId);

    // Never override system/archive locks
    if (
      existing?.status === "read_only_archived" ||
      existing?.status === "read_only_system"
    ) {
      return existing;
    }

    // If already locked by someone else, return existing lock (conflict)
    if (
      existing?.status === "locked_by_user" &&
      existing.lockedByUserId !== userId
    ) {
      return existing;
    }

    const lock: CaseLock = {
      caseId,
      lockedByUserId: userId,
      lockedAt: new Date().toISOString(),
      reason,
      status: "locked_by_user",
    };
    this.locks.set(caseId, lock);
    return lock;
  }

  /**
   * Release a user lock. Only the lock holder (or an admin) should call this.
   * System/archive locks must be lifted via `setSystemLock`.
   *
   * Звільнення блокування. Тільки власник блокування або адміністратор.
   */
  unlock(caseId: string, userId: string): CaseLock {
    const existing = this.locks.get(caseId);
    if (!existing) {
      return { caseId, lockedByUserId: null, lockedAt: null, status: "unlocked" };
    }
    if (
      existing.status === "locked_by_user" &&
      existing.lockedByUserId !== userId
    ) {
      // Not the lock holder — return existing unchanged
      return existing;
    }
    const unlocked: CaseLock = {
      caseId,
      lockedByUserId: null,
      lockedAt: null,
      status: "unlocked",
    };
    this.locks.set(caseId, unlocked);
    return unlocked;
  }

  /**
   * Set a permanent read-only state (archive or system hold).
   * Admin-level action; bypasses user lock checks.
   *
   * Встановлення постійного стану лише для читання (адмін).
   */
  setSystemLock(
    caseId: string,
    status: "read_only_archived" | "read_only_system",
    reason: string,
  ): CaseLock {
    const lock: CaseLock = {
      caseId,
      lockedByUserId: null,
      lockedAt: new Date().toISOString(),
      reason,
      status,
    };
    this.locks.set(caseId, lock);
    return lock;
  }

  /**
   * Return the current lock state for a case.
   * If no entry exists, defaults to 'unlocked'.
   *
   * Повертає поточний стан блокування справи.
   */
  getStatus(caseId: string): CaseLock {
    return (
      this.locks.get(caseId) ?? {
        caseId,
        lockedByUserId: null,
        lockedAt: null,
        status: "unlocked",
      }
    );
  }

  /**
   * Returns true if `userId` may edit the case right now.
   * Editable when: unlocked, OR locked by this same user.
   *
   * Повертає true, якщо користувач може редагувати справу.
   */
  isEditable(caseId: string, userId: string): boolean {
    const lock = this.getStatus(caseId);
    if (lock.status === "read_only_archived") return false;
    if (lock.status === "read_only_system") return false;
    if (lock.status === "unlocked") return true;
    return lock.lockedByUserId === userId;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory case lock store singleton. */
export const caseLockStore = new CaseLockStore();

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Concurrent-edit prevention:
 * When an editor opens a case in edit mode, the client calls `lock()`.
 * Other editors see a "Locked by <name>" banner and may only read.
 * Lock is released on explicit save/cancel, tab close (via SSE heartbeat), or timeout (15 min idle).
 *
 * [1] Запобігання одночасному редагуванню:
 * При відкритті справи для редагування клієнт викликає `lock()`.
 * Інші редактори бачать баннер «Заблоковано <ім'ям>» і можуть лише читати.
 * Блокування знімається при збереженні/скасуванні, закритті вкладки або таймауті (15 хв простою).
 */
export const NOTE_CONCURRENT_EDIT_EN =
  "Concurrent-edit prevention: one editor holds the lock at a time. " +
  "Lock auto-expires after 15 minutes of inactivity (SSE heartbeat). " +
  "Admins may forcibly unlock via setSystemLock override.";

export const NOTE_CONCURRENT_EDIT_UK =
  "Запобігання одночасному редагуванню: блокування тримає один редактор одночасно. " +
  "Блокування автоматично закінчується після 15 хвилин неактивності (SSE-пульс). " +
  "Адміністратори можуть примусово зняти блокування через setSystemLock.";

/**
 * [2] Archive auto-lock:
 * When a case status transitions to 'archived', the system automatically calls
 * `setSystemLock(caseId, 'read_only_archived', 'Case archived')`.
 * Archiving is irreversible without an admin action.
 *
 * [2] Автоматичне блокування при архівуванні:
 * При переведенні справи до статусу 'archived' система автоматично викликає
 * `setSystemLock(caseId, 'read_only_archived', 'Справу архівовано')`.
 * Архівування незворотне без дії адміністратора.
 */
export const NOTE_ARCHIVE_AUTO_LOCK_EN =
  "Archive auto-lock: transitioning a case to 'archived' automatically applies " +
  "read_only_archived. No further writes are accepted until an admin restores the case.";

export const NOTE_ARCHIVE_AUTO_LOCK_UK =
  "Автоблокування архіву: перехід справи до статусу 'archived' автоматично застосовує " +
  "read_only_archived. Подальші записи не приймаються до відновлення адміністратором.";

/**
 * [3] Admin override:
 * Admins with `case:admin` permission may call `unlock()` regardless of the lock holder,
 * or `setSystemLock()` to impose/lift read-only states.
 * All admin overrides are written to the audit log (actor, reason, timestamp).
 *
 * [3] Адмін-перевизначення:
 * Адміністратори з дозволом `case:admin` можуть викликати `unlock()` незалежно від власника,
 * або `setSystemLock()` для накладання/зняття станів лише для читання.
 * Усі адмін-дії записуються до журналу аудиту.
 */
export const NOTE_ADMIN_OVERRIDE_EN =
  "Admin override: users with case:admin permission may forcibly unlock any case " +
  "or apply system-level locks. All override actions are written to the audit log.";

export const NOTE_ADMIN_OVERRIDE_UK =
  "Адмін-перевизначення: користувачі з дозволом case:admin можуть примусово розблокувати " +
  "будь-яку справу або накласти системне блокування. Усі дії фіксуються в журналі аудиту.";
