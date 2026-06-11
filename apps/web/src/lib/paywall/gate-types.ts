/**
 * Paywall gate type definitions.
 *
 * Rules:
 *   - Every gate must sell a SPECIFIC feature, never generic "premium".
 *   - Teaser content must use REAL data shape (blurred / rounded), never fake data.
 *   - Hard gates are invisible; soft gates show a teaser + CTA.
 *
 * Гейт продає конкретну функцію, не «преміум». Generic-upgrade-banner — заборонено.
 */

import type { Tier } from "../tiers/constants";

// ── Re-export Tier for convenience ────────────────────────────────────────────
export type { Tier };

// ── Gate types ────────────────────────────────────────────────────────────────

/**
 * How a locked feature is surfaced to the user.
 *
 * - soft     : Feature visible, returns teaser + upgrade CTA.
 * - hard     : Feature hidden from menu entirely (gov-only / enterprise tools).
 * - quota    : Feature works until quota exhausted, then modal at 100%.
 * - throttle : Feature works but slower for lower tiers (e.g. 15-min delay).
 * - watermark: Feature works but output is branded / watermarked.
 */
export type GateType = "soft" | "hard" | "quota" | "throttle" | "watermark";

// ── Teaser shapes ─────────────────────────────────────────────────────────────

/**
 * How the locked feature's data is presented in the teaser.
 *
 * - blurred_visual       : Real chart/heatmap shape, values blurred.
 * - rounded_number       : "≈ 1.2k events" not "1,247" (never fake data).
 * - last_public_datapoint: E.g. "last update 14:32 — real-time in Pro".
 * - hidden               : No preview at all (hard gate).
 */
export type TeaserShape =
  | "blurred_visual"
  | "rounded_number"
  | "last_public_datapoint"
  | "hidden";

// ── Gate config ───────────────────────────────────────────────────────────────

export interface PaywallGateConfig {
  /** The gate mechanic applied to this feature. */
  type: GateType;
  /** Feature identifier, e.g. "history_30d", "heatmap_subcountry". */
  feature: string;
  /** Minimum tier required to access without restriction. */
  minTier: Tier;
  /** Daily quota (for quota gates). */
  quotaPerDay?: number;
  /** Monthly quota (for quota gates). */
  quotaPerMonth?: number;
  /** How the locked feature is previewed. */
  teaserShape: TeaserShape;
}

// ── Upgrade trigger event ─────────────────────────────────────────────────────

export interface UpgradeTriggerEvent {
  /** User who hit the gate. */
  userId: string;
  /** Feature or UI element that caused the trigger. */
  triggeredBy: string;
  /** User's current tier at time of trigger. */
  currentTier: Tier;
  /** Suggested target tier shown in the upgrade CTA. */
  targetTier: Tier;
  /** Feature name the user was attempting to access. */
  featureAttempted: string;
}

// ── Dark pattern check ────────────────────────────────────────────────────────

/**
 * The 7 dark patterns that are STRICTLY FORBIDDEN in upgrade flows.
 *
 * Each constant maps to one prohibited practice.
 * Use this type to document that a code path has been audited.
 *
 * 7 заборонених тёмних паттернів в апгрейд-флоу.
 */
export interface DarkPatternCheck {
  /**
   * FORBIDDEN: Trial auto-converts to paid without 72h prior warning.
   * Required: warn users ≥72h before any charge.
   */
  noSilentTrialAutoConversion: true;

  /**
   * FORBIDDEN: Downgrade requires a call to sales for self-serve tiers.
   * Required: self-serve downgrade in ≤2 clicks.
   */
  noDowngradeRequiresSalesCall: true;

  /**
   * FORBIDDEN: Threatening data loss on non-payment.
   * Required: free tier keeps all user-created data (case files, AOIs) read-only.
   */
  noDataLossThreat: true;

  /**
   * FORBIDDEN: Fake countdowns or artificial urgency messaging.
   * Required: no "only today!", no expiring timers that reset.
   */
  noFakeUrgency: true;

  /**
   * FORBIDDEN: Pre-checked add-ons at checkout.
   * Required: all add-ons must be explicitly opted into.
   */
  noPreCheckedAddOns: true;

  /**
   * FORBIDDEN: Price discrimination by detected device / OS without disclosure.
   * Required: same price for all devices; disclose any regional pricing.
   */
  noPriceDiscriminationByDevice: true;

  /**
   * FORBIDDEN: "Speak to sales" required to see prices for self-serve plans.
   * Required: Pro / Team / Business prices public, no login required.
   */
  noSalesWallForPricing: true;
}

/** Fully-verified dark-pattern-free marker (all fields must be `true`). */
export const DARK_PATTERN_FREE: DarkPatternCheck = {
  noSilentTrialAutoConversion: true,
  noDowngradeRequiresSalesCall: true,
  noDataLossThreat: true,
  noFakeUrgency: true,
  noPreCheckedAddOns: true,
  noPriceDiscriminationByDevice: true,
  noSalesWallForPricing: true,
};
