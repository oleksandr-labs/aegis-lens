/**
 * Filter history — back/forward navigation over AdvancedFilterSet snapshots.
 *
 * Sprint 2.70 — Filter & Search completion.
 *
 * Works like the browser history stack: every push truncates forward-history.
 * Max 50 entries; oldest entries are evicted when the cap is reached.
 */

import type { AdvancedFilterSet } from "./advanced-filters";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterHistoryEntry {
  filters: AdvancedFilterSet;
  /** ISO 8601 timestamp of when the entry was pushed. */
  timestamp: string;
  /** Optional human-readable label (e.g. "Kharkiv region — last 24h"). */
  label?: string;
}

// ---------------------------------------------------------------------------
// FilterHistory class
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50;

export class FilterHistory {
  private _entries: FilterHistoryEntry[] = [];
  private _index = -1;

  // ── reads ──────────────────────────────────────────────────────────────────

  get entries(): FilterHistoryEntry[] {
    return this._entries.slice();
  }

  get currentIndex(): number {
    return this._index;
  }

  get canGoBack(): boolean {
    return this._index > 0;
  }

  get canGoForward(): boolean {
    return this._index < this._entries.length - 1;
  }

  get current(): AdvancedFilterSet | null {
    if (this._index < 0) return null;
    return this._entries[this._index].filters;
  }

  // ── mutations ──────────────────────────────────────────────────────────────

  /**
   * Push a new filter snapshot onto the history stack.
   *
   * Any forward-history (entries after the current index) is discarded,
   * matching the semantics of the browser History API.
   */
  push(filters: AdvancedFilterSet, label?: string): void {
    // Discard forward-history.
    if (this._index < this._entries.length - 1) {
      this._entries.splice(this._index + 1);
    }

    this._entries.push({
      filters: JSON.parse(JSON.stringify(filters)) as AdvancedFilterSet,
      timestamp: new Date().toISOString(),
      label,
    });

    // Evict oldest entry when over cap.
    if (this._entries.length > MAX_HISTORY) {
      this._entries.shift();
    }

    this._index = this._entries.length - 1;
  }

  /**
   * Move one step backward and return the filter snapshot at that position.
   * Returns null if already at the beginning.
   */
  back(): AdvancedFilterSet | null {
    if (!this.canGoBack) return null;
    this._index -= 1;
    return JSON.parse(
      JSON.stringify(this._entries[this._index].filters),
    ) as AdvancedFilterSet;
  }

  /**
   * Move one step forward and return the filter snapshot at that position.
   * Returns null if already at the end.
   */
  forward(): AdvancedFilterSet | null {
    if (!this.canGoForward) return null;
    this._index += 1;
    return JSON.parse(
      JSON.stringify(this._entries[this._index].filters),
    ) as AdvancedFilterSet;
  }

  /**
   * Jump to an arbitrary index.  Returns null if index is out of range.
   */
  goTo(index: number): AdvancedFilterSet | null {
    if (index < 0 || index >= this._entries.length) return null;
    this._index = index;
    return JSON.parse(
      JSON.stringify(this._entries[this._index].filters),
    ) as AdvancedFilterSet;
  }

  /** Clear all history and reset the pointer. */
  clear(): void {
    this._entries = [];
    this._index = -1;
  }
}

// ---------------------------------------------------------------------------
// Session-scoped singleton
// ---------------------------------------------------------------------------

/**
 * Single FilterHistory instance for the current browser/server session.
 * Import this wherever you need to track analyst filter navigation.
 */
export const filterHistory = new FilterHistory();
