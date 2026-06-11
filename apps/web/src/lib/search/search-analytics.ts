/**
 * Search analytics — ring buffer for query logging, popular/zero-result queries.
 *
 * Sprint 2.70 — Search infra completion.
 *
 * The store is intentionally in-memory (no external dependency) so it works
 * on both server and client.  For production, flush entries to a time-series
 * DB (ClickHouse, PostHog, or a dedicated analytics service) via the
 * /api/internal/search-analytics route.
 *
 * Ring buffer capacity: 5 000 entries.  Oldest entries are evicted when full.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchQueryLog {
  /** UUID v4 for this individual query execution. */
  queryId: string;
  /** Raw user query string (trimmed). */
  query: string;
  /** BCP-47 locale, e.g. "en", "uk". */
  locale: string;
  /** Number of hits returned to the user (0 = zero-result). */
  resultCount: number;
  /** eventId the user clicked, if any. */
  clickedEventId?: string;
  wasZeroResult: boolean;
  /** Session identifier (e.g. cookie-derived or tab-scoped UUID). */
  sessionId: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Ring-buffer analytics store
// ---------------------------------------------------------------------------

const BUFFER_SIZE = 5_000;

export class SearchAnalyticsStore {
  private _buffer: SearchQueryLog[] = [];
  private _head = 0; // points to the next write slot
  private _count = 0; // total entries written (saturates at BUFFER_SIZE)

  // ── write ─────────────────────────────────────────────────────────────────

  log(entry: SearchQueryLog): void {
    if (this._buffer.length < BUFFER_SIZE) {
      this._buffer.push(entry);
    } else {
      this._buffer[this._head] = entry;
    }
    this._head = (this._head + 1) % BUFFER_SIZE;
    if (this._count < BUFFER_SIZE) this._count++;
  }

  // ── reads ─────────────────────────────────────────────────────────────────

  /** All entries currently in the ring buffer, newest-first. */
  private get _all(): SearchQueryLog[] {
    // Reconstruct order: from oldest to newest, then reverse.
    if (this._buffer.length < BUFFER_SIZE) {
      return this._buffer.slice().reverse();
    }
    // Wrap-around: head points to oldest slot.
    const ordered: SearchQueryLog[] = [
      ...this._buffer.slice(this._head),
      ...this._buffer.slice(0, this._head),
    ];
    return ordered.reverse();
  }

  /**
   * Return the top N most-queried terms for the given locale.
   * Pass "" for locale to aggregate across all locales.
   */
  getPopularQueries(
    locale: string,
    limit = 20,
  ): { query: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of this._all) {
      if (locale && entry.locale !== locale) continue;
      const key = entry.query.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * Return the top N zero-result queries (across all locales, unless locale given).
   */
  getZeroResultQueries(
    limit = 20,
    locale = "",
  ): { query: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of this._all) {
      if (!entry.wasZeroResult) continue;
      if (locale && entry.locale !== locale) continue;
      const key = entry.query.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  /**
   * Click-through rate: fraction of queries that resulted in a click.
   */
  getClickThroughRate(): number {
    const all = this._all;
    if (all.length === 0) return 0;
    const clicks = all.filter((e) => Boolean(e.clickedEventId)).length;
    return clicks / all.length;
  }

  /** Total number of queries logged (capped at BUFFER_SIZE). */
  get size(): number {
    return this._buffer.length;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const searchAnalyticsStore = new SearchAnalyticsStore();
