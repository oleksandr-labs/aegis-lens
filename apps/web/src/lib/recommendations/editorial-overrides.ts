/**
 * Editorial overrides — allow editors to boost or suppress specific items.
 *
 * Boost:    multiply the item's score by 2 (capped at 1.0).
 * Suppress: remove the item from the result set entirely.
 *
 * Overrides have an optional TTL (`expiresAt`). Expired overrides are
 * ignored automatically.
 */

import type { ScoredItem } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EditorialOverride {
  itemId: string;
  action: "boost" | "suppress";
  reason: string;
  expiresAt?: string;
  createdBy: string;
}

// ── Expiry check ──────────────────────────────────────────────────────────────

/**
 * Returns true when the override has passed its `expiresAt` timestamp.
 * If no `expiresAt` is set the override never expires.
 */
export function isOverrideExpired(
  override: EditorialOverride,
  now: Date = new Date(),
): boolean {
  if (!override.expiresAt) return false;
  return new Date(override.expiresAt) <= now;
}

// ── Apply overrides ───────────────────────────────────────────────────────────

/**
 * Apply a list of editorial overrides to a scored item set.
 *
 * Processing order:
 *   1. Filter out expired overrides.
 *   2. Build lookup maps for boosts and suppressions.
 *   3. Remove suppressed items.
 *   4. Multiply score by 2 (max 1.0) for boosted items and append
 *      "editorial_boost" to the item's explanation signals.
 */
export function applyEditorialOverrides(
  items: ScoredItem[],
  overrides: EditorialOverride[],
): ScoredItem[] {
  const now = new Date();
  const active = overrides.filter((o) => !isOverrideExpired(o, now));

  const suppressSet = new Set<string>(
    active.filter((o) => o.action === "suppress").map((o) => o.itemId),
  );
  const boostSet = new Set<string>(
    active.filter((o) => o.action === "boost").map((o) => o.itemId),
  );

  return items
    .filter((si) => !suppressSet.has(si.item.id))
    .map((si) => {
      if (!boostSet.has(si.item.id)) return si;
      return {
        ...si,
        score: Math.min(1, si.score * 2),
        explanation: {
          ...si.explanation,
          signals: [...si.explanation.signals, "editorial_boost"],
        },
      };
    });
}
