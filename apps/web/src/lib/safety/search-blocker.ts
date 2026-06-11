'use server';

/**
 * Search Blocker — prevent search queries that target known private individuals.
 *
 * Maintains a server-side blocklist of private person names. Any search query
 * containing a blocked name is rejected before reaching the search index.
 *
 * Серверний блокувальник пошуку по іменах приватних осіб.
 */

// ── BlockedNameEntry ──────────────────────────────────────────────────────────

export interface BlockedNameEntry {
  /** Normalised lowercase name as stored in the blocklist */
  normalised: string;
  /** ISO timestamp when this entry was added */
  addedAt: string;
  /** ID of the moderator / admin who added the entry */
  addedBy: string;
  /** Human-readable reason for blocking */
  reason: string;
}

// ── SearchBlockerStore ────────────────────────────────────────────────────────

/**
 * Singleton store for private-name blocklist.
 * Backed by in-memory Map — in production sync with a persistent store (Redis / Postgres).
 *
 * Синглтон-сховище блокованих імен. У продакшені — синхронізація з Redis / Postgres.
 */
export class SearchBlockerStore {
  private static instance: SearchBlockerStore;
  private readonly blocklist = new Map<string, BlockedNameEntry>();

  private constructor() {}

  static getInstance(): SearchBlockerStore {
    if (!SearchBlockerStore.instance) {
      SearchBlockerStore.instance = new SearchBlockerStore();
    }
    return SearchBlockerStore.instance;
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Add a private name to the blocklist.
   * Name is normalised to lowercase and trimmed before storage.
   *
   * Додати ім'я до списку блокувань (нормалізується до нижнього регістру).
   */
  addToBlocklist(
    name: string,
    addedBy: string,
    reason = "private individual protection",
  ): void {
    const normalised = name.toLowerCase().trim();
    if (!normalised) return;

    this.blocklist.set(normalised, {
      normalised,
      addedAt: new Date().toISOString(),
      addedBy,
      reason,
    });
  }

  /**
   * Remove an entry from the blocklist (e.g. after successful appeal).
   *
   * Видалити запис зі списку блокувань після успішного апеляційного розгляду.
   */
  removeFromBlocklist(name: string): boolean {
    return this.blocklist.delete(name.toLowerCase().trim());
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Return true if `query` contains any blocked name token.
   * Performs case-insensitive substring matching.
   *
   * Повертає true якщо запит містить заблоковане ім'я (без урахування регістру).
   */
  isSearchBlocked(query: string): boolean {
    const lower = query.toLowerCase();
    for (const normalised of this.blocklist.keys()) {
      if (lower.includes(normalised)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return all current blocklist entries (for admin audit view).
   *
   * Повернути всі записи блокувань для адмін-панелі.
   */
  listAll(): BlockedNameEntry[] {
    return Array.from(this.blocklist.values());
  }

  size(): number {
    return this.blocklist.size;
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const searchBlockerStore = SearchBlockerStore.getInstance();

// ── Convenience functions ─────────────────────────────────────────────────────

/**
 * Check whether a search query is blocked.
 *
 * Перевірити, чи заблоковано пошуковий запит.
 */
export function isSearchBlocked(query: string): boolean {
  return searchBlockerStore.isSearchBlocked(query);
}

/**
 * Add a name to the global blocklist.
 *
 * Додати ім'я до глобального списку блокувань.
 */
export function addToBlocklist(name: string, addedBy = "system"): void {
  searchBlockerStore.addToBlocklist(name, addedBy);
}
