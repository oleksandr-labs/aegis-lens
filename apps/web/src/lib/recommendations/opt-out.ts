/**
 * Opt-out management for recommendation surfaces.
 *
 * Users can opt out of recommendations on a per-surface basis.
 * By default all surfaces are enabled (opt-in model).
 */

import type { RecommendationContext } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OptOutConfig {
  userId: string;
  /** Surfaces the user has opted OUT of. Empty = all surfaces enabled. */
  surfaces: RecommendationContext[];
  updatedAt: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

/** Default: no surfaces opted out (recommendations on everywhere). */
export const OPT_OUT_DEFAULTS: Pick<OptOutConfig, "surfaces"> = {
  surfaces: [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns true when the user has opted out of recommendations on `surface`.
 * A null config means no preferences stored — user is NOT opted out.
 */
export function isOptedOut(
  config: OptOutConfig | null,
  surface: RecommendationContext,
): boolean {
  if (!config) return false;
  return config.surfaces.includes(surface);
}

/**
 * Build a fresh OptOutConfig for a user with the given opted-out surfaces.
 */
export function buildOptOutConfig(
  userId: string,
  surfaces: RecommendationContext[],
): OptOutConfig {
  return {
    userId,
    surfaces,
    updatedAt: new Date().toISOString(),
  };
}
