/**
 * Filter diff — compare two AdvancedFilterSet snapshots.
 *
 * Sprint 2.70 — Filter & Search completion.
 */

import type { AdvancedFilterSet } from "./advanced-filters";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FilterDiff {
  /** Keys present in B but not in A (newly applied filters). */
  added: Partial<AdvancedFilterSet>;
  /** Keys present in A but not in B (removed filters). */
  removed: Partial<AdvancedFilterSet>;
  /** Keys present in both but with different values. */
  changed: Partial<AdvancedFilterSet>;
  /** Human-readable summary in English. */
  summary_en: string;
  /** Human-readable summary in Ukrainian. */
  summary_uk: string;
}

export interface SavedFilterComparison {
  savedSearchIdA: string;
  savedSearchIdB: string;
  diff: FilterDiff;
  /** ISO 8601 timestamp when the comparison was computed. */
  computedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deep-equality check sufficient for plain JSON-serializable values. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) =>
    deepEqual(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
    ),
  );
}

function isDefined(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v as object).length > 0;
  return true;
}

// Human-readable key labels for the diff summary.
const KEY_LABELS_EN: Partial<Record<keyof AdvancedFilterSet, string>> = {
  country: "country",
  hours: "time window",
  classes: "event classes",
  minSeverity: "min severity",
  minConfidence: "min confidence",
  verification: "verification state",
  minDanger: "min danger",
  hasMedia: "media type",
  customTimeRange: "custom time range",
  geoFilter: "geographic filter",
  sourceFilter: "source filter",
  entityFilter: "entity filter",
  proximityFilter: "proximity filter",
  crossSourceFilter: "cross-source filter",
  authorFilter: "author filter",
  tagFilter: "tag / case-file filter",
};

const KEY_LABELS_UK: Partial<Record<keyof AdvancedFilterSet, string>> = {
  country: "країна",
  hours: "часове вікно",
  classes: "класи подій",
  minSeverity: "мін. серйозність",
  minConfidence: "мін. впевненість",
  verification: "стан верифікації",
  minDanger: "мін. небезпека",
  hasMedia: "тип медіа",
  customTimeRange: "довільний діапазон часу",
  geoFilter: "географічний фільтр",
  sourceFilter: "фільтр джерел",
  entityFilter: "фільтр сутностей",
  proximityFilter: "фільтр відстані",
  crossSourceFilter: "фільтр крос-джерел",
  authorFilter: "фільтр авторів",
  tagFilter: "фільтр тегів / справ",
};

// ---------------------------------------------------------------------------
// Core diff function
// ---------------------------------------------------------------------------

/**
 * Compute the difference between two AdvancedFilterSet snapshots.
 *
 * Strategy: iterate over the union of keys in A and B, classify each as
 * added / removed / changed, then generate bilingual summaries.
 */
export function computeFilterDiff(
  a: AdvancedFilterSet,
  b: AdvancedFilterSet,
): FilterDiff {
  const added: Partial<AdvancedFilterSet> = {};
  const removed: Partial<AdvancedFilterSet> = {};
  const changed: Partial<AdvancedFilterSet> = {};

  const allKeys = new Set([
    ...Object.keys(a),
    ...Object.keys(b),
  ]) as Set<keyof AdvancedFilterSet>;

  for (const key of allKeys) {
    const aVal = a[key];
    const bVal = b[key];
    const aHas = isDefined(aVal);
    const bHas = isDefined(bVal);

    if (!aHas && bHas) {
      (added as Record<string, unknown>)[key] = bVal;
    } else if (aHas && !bHas) {
      (removed as Record<string, unknown>)[key] = aVal;
    } else if (aHas && bHas && !deepEqual(aVal, bVal)) {
      (changed as Record<string, unknown>)[key] = bVal;
    }
  }

  const addedKeys = Object.keys(added) as (keyof AdvancedFilterSet)[];
  const removedKeys = Object.keys(removed) as (keyof AdvancedFilterSet)[];
  const changedKeys = Object.keys(changed) as (keyof AdvancedFilterSet)[];

  function buildSummary(
    labels: Partial<Record<keyof AdvancedFilterSet, string>>,
    addedWord: string,
    removedWord: string,
    changedWord: string,
    noneWord: string,
  ): string {
    const parts: string[] = [];
    if (addedKeys.length > 0)
      parts.push(`${addedWord}: ${addedKeys.map((k) => labels[k] ?? k).join(", ")}`);
    if (removedKeys.length > 0)
      parts.push(`${removedWord}: ${removedKeys.map((k) => labels[k] ?? k).join(", ")}`);
    if (changedKeys.length > 0)
      parts.push(`${changedWord}: ${changedKeys.map((k) => labels[k] ?? k).join(", ")}`);
    return parts.length > 0 ? parts.join("; ") : noneWord;
  }

  const summary_en = buildSummary(
    KEY_LABELS_EN,
    "Added",
    "Removed",
    "Changed",
    "No differences",
  );

  const summary_uk = buildSummary(
    KEY_LABELS_UK,
    "Додано",
    "Видалено",
    "Змінено",
    "Відмінностей немає",
  );

  return { added, removed, changed, summary_en, summary_uk };
}

// ---------------------------------------------------------------------------
// Human-readable formatter
// ---------------------------------------------------------------------------

/**
 * Format a FilterDiff as a multi-line human-readable string in the given locale.
 */
export function formatFilterDiffHuman(
  diff: FilterDiff,
  locale: "en" | "uk",
): string {
  if (locale === "uk") {
    const lines: string[] = [];
    const added = Object.keys(diff.added) as (keyof AdvancedFilterSet)[];
    const removed = Object.keys(diff.removed) as (keyof AdvancedFilterSet)[];
    const changed = Object.keys(diff.changed) as (keyof AdvancedFilterSet)[];

    if (added.length > 0) {
      lines.push("Додано фільтрів:");
      for (const k of added)
        lines.push(`  + ${KEY_LABELS_UK[k] ?? k}: ${JSON.stringify(diff.added[k])}`);
    }
    if (removed.length > 0) {
      lines.push("Видалено фільтрів:");
      for (const k of removed)
        lines.push(`  - ${KEY_LABELS_UK[k] ?? k}: ${JSON.stringify(diff.removed[k])}`);
    }
    if (changed.length > 0) {
      lines.push("Змінено фільтрів:");
      for (const k of changed)
        lines.push(`  ~ ${KEY_LABELS_UK[k] ?? k}: ${JSON.stringify(diff.changed[k])}`);
    }
    return lines.length > 0 ? lines.join("\n") : "Відмінностей немає.";
  }

  // Default: English
  const lines: string[] = [];
  const added = Object.keys(diff.added) as (keyof AdvancedFilterSet)[];
  const removed = Object.keys(diff.removed) as (keyof AdvancedFilterSet)[];
  const changed = Object.keys(diff.changed) as (keyof AdvancedFilterSet)[];

  if (added.length > 0) {
    lines.push("Added filters:");
    for (const k of added)
      lines.push(`  + ${KEY_LABELS_EN[k] ?? k}: ${JSON.stringify(diff.added[k])}`);
  }
  if (removed.length > 0) {
    lines.push("Removed filters:");
    for (const k of removed)
      lines.push(`  - ${KEY_LABELS_EN[k] ?? k}: ${JSON.stringify(diff.removed[k])}`);
  }
  if (changed.length > 0) {
    lines.push("Changed filters:");
    for (const k of changed)
      lines.push(`  ~ ${KEY_LABELS_EN[k] ?? k}: ${JSON.stringify(diff.changed[k])}`);
  }
  return lines.length > 0 ? lines.join("\n") : "No differences.";
}
