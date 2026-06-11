/**
 * analytics-gate/teaser-policy.ts
 * Teaser display logic for locked analytics.
 *
 * Section A rules from TODO_analytics_gating.md:
 *   1. Always show the analytic EXISTS (label + lock icon).
 *   2. Show a blurred preview if the analytic is visual.
 *   3. Show the headline number heavily rounded ("≈ 1.2k" instead of 1,247).
 *   4. Never hide that it exists — discoverability drives upgrades.
 *   5. Never show a fake locked feature that doesn't actually exist.
 *
 * Правило: не ховати аналітику — вона має бути видима зі значком замку.
 */

import { ANALYTIC_GATES } from "./gate-config";
import { TIER_RANK, type AnalyticId, type Tier } from "./types";

// ── TeaserData ────────────────────────────────────────────────────────────────

export interface TeaserData {
  /** Heavily rounded display value, e.g. "≈ 1.2k". */
  roundedValue: string | null;
  /** Upgrade prompt label from the gate config. */
  label: string;
  /** Minimum tier needed to unlock this analytic. */
  upgradeToTier: Tier;
  /** Whether to render a blurred visual preview. */
  showBlurredPreview: boolean;
  /** Whether to render a lock icon. */
  showLockIcon: boolean;
}

// ── Always-on teaser rules ────────────────────────────────────────────────────

/**
 * TEASER_RULES encodes the 4 "always show" rules from section A.
 *
 * These are invariants applied to every locked analytic regardless of config.
 */
export const TEASER_RULES = {
  /** Rule 1 + 4: Always show existence (label + lock icon). */
  alwaysShowExistence: true,
  /** Rule 2: Show blurred preview for visual analytics if gate permits. */
  showBlurredPreviewWhenAvailable: true,
  /** Rule 3: Show heavily rounded headline number. */
  showRoundedNumber: true,
  /** Rule 5: Never render a teaser for a non-existent analytic. */
  neverFakeLockedFeatures: true,
} as const;

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Round a raw number to 1 significant figure and format with "≈" prefix.
 *
 * Examples:
 *   1247   → "≈ 1.2k"
 *   340    → "≈ 300"
 *   88500  → "≈ 89k"
 *   1_200_000 → "≈ 1.2M"
 *   42     → "≈ 40"
 *
 * Формат: тільки 1 значуща цифра, суфікс k/M де доречно.
 */
export function formatTeaserNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "≈ ?";

  let value: number;
  let suffix: string;

  if (n >= 1_000_000) {
    value = n / 1_000_000;
    suffix = "M";
  } else if (n >= 1_000) {
    value = n / 1_000;
    suffix = "k";
  } else {
    // Round to 1 sig fig for sub-1k numbers
    const magnitude = Math.pow(10, Math.floor(Math.log10(n || 1)));
    return `≈ ${Math.round(n / magnitude) * magnitude}`;
  }

  // 1 decimal place, but strip trailing zero (1.0k → 1k, 1.2k → 1.2k)
  const rounded = Math.round(value * 10) / 10;
  const formatted = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  return `≈ ${formatted}${suffix}`;
}

/**
 * Build the full teaser data for a locked analytic.
 *
 * @param analyticId  - which analytic
 * @param userTier    - current user tier (must be below minTier for the call to make sense)
 * @param rawValue    - optional raw metric value to round and display
 */
export function buildTeaserData(
  analyticId: AnalyticId,
  userTier: Tier,
  rawValue?: number,
): TeaserData {
  const gate = ANALYTIC_GATES[analyticId];
  const policy = gate.teaserPolicy;

  // Enforce rule 5: analytic must actually exist in the config.
  // (TypeScript ensures analyticId is valid, this is a runtime guard.)
  if (!gate) {
    throw new Error(`[analytics-gate] Unknown analyticId: ${String(analyticId)}`);
  }

  const roundedValue =
    TEASER_RULES.showRoundedNumber && rawValue !== undefined
      ? formatTeaserNumber(rawValue)
      : null;

  return {
    roundedValue,
    label: policy.upgradeLabel,
    upgradeToTier: policy.unlockTier,
    // Only show blurred preview if both the rule and the gate policy allow it
    showBlurredPreview:
      TEASER_RULES.showBlurredPreviewWhenAvailable && policy.showBlurredPreview,
    // Rule 1 + 4: always true
    showLockIcon: TEASER_RULES.alwaysShowExistence,
  };
}

/**
 * Returns true when the lock icon should be rendered for an analytic.
 *
 * Always true when the user is below minTier (rules 1 + 4).
 */
export function shouldShowLockIcon(analyticId: AnalyticId, userTier: Tier): boolean {
  const gate = ANALYTIC_GATES[analyticId];
  return TIER_RANK[userTier] < TIER_RANK[gate.minTier];
}
