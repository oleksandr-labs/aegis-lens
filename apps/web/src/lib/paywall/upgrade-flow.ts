/**
 * Upgrade flow helpers — trigger moments, anti-friction rules, deep-links.
 *
 * Design principles:
 *   - Show upgrade prompt only when user hits a concrete lock.
 *   - Always name the SPECIFIC feature unlocked ("Unlock 1-year history").
 *   - Never show the same modal twice within 24 hours.
 *   - Pricing page is always public (no login required).
 *
 * Апгрейд-промпт показується лише при конкретному блокуванні.
 * Завжди вказується конкретна функція, а не «Get more features».
 */

import type { Tier } from "./gate-types";

// ── Forbidden dark patterns ───────────────────────────────────────────────────

/**
 * The 7 dark patterns that are STRICTLY FORBIDDEN in all upgrade flows.
 * Used as documentation, UI audits, and automated lint targets.
 *
 * 7 заборонених тёмних паттернів — для документування та аудиту.
 */
export const FORBIDDEN_DARK_PATTERNS: string[] = [
  "Trial auto-converts to paid without 72h prior warning to the user.",
  "Downgrade requires a call to sales for self-serve tiers (Pro / Team / Business).",
  "Data loss threat: telling users they will lose their data if they do not upgrade.",
  "Fake countdown timers or artificial urgency ('only today!', 'offer expires soon!').",
  "Pre-checked add-ons at checkout — all add-ons must be explicitly opted into.",
  "Price discrimination by detected device or OS without clear public disclosure.",
  "Requiring 'speak to sales' to see prices for self-serve plans — all prices must be public.",
];

// ── Upgrade trigger moments ───────────────────────────────────────────────────

export interface UpgradeTriggerMoment {
  /** Machine identifier for analytics / A/B testing. */
  id: string;
  /** Short human-readable label. */
  label: string;
  /** uk: label */
  labelUk: string;
  /** Suggested minimum target tier to resolve the block. */
  suggestedTargetTier: Tier;
}

/**
 * The 7 high-intent upgrade moments defined in the paywall strategy.
 * Each maps directly to a concrete user action that signals upgrade intent.
 */
export const UPGRADE_TRIGGER_EVENTS: UpgradeTriggerMoment[] = [
  {
    id: "export_quota_exceeded",
    label: "User tries to export beyond free quota",
    labelUk: "Користувач намагається експортувати понад ліміт безкоштовного плану",
    suggestedTargetTier: "observer",
  },
  {
    id: "aoi_second_create",
    label: "User tries to open / create AOI #2",
    labelUk: "Користувач намагається створити другу зону спостереження",
    suggestedTargetTier: "observer",
  },
  {
    id: "history_beyond_7d",
    label: "User tries to scroll history past 7 days",
    labelUk: "Користувач намагається переглянути історію старше 7 днів",
    suggestedTargetTier: "pro",
  },
  {
    id: "copilot_prediction_query",
    label: "User asks Copilot about predictions or trends",
    labelUk: "Користувач запитує у Copilot прогнози або тренди",
    suggestedTargetTier: "pro",
  },
  {
    id: "second_seat_invite",
    label: "User invites a 2nd seat to their workspace",
    labelUk: "Користувач запрошує другого учасника робочого простору",
    suggestedTargetTier: "team",
  },
  {
    id: "api_page_view",
    label: "User views the API documentation page (referral attribution)",
    labelUk: "Користувач переглядає сторінку API (атрибуція реферала)",
    suggestedTargetTier: "observer",
  },
  {
    id: "pro_analytic_repeated_preview",
    label: "User views any Pro-only analytic preview ≥3× in 7 days",
    labelUk: "Користувач переглядає аналітику Pro-рівня ≥3 рази за 7 днів",
    suggestedTargetTier: "pro",
  },
];

// ── Anti-friction rules ───────────────────────────────────────────────────────

export interface AntifrictionRules {
  /**
   * All upgrades are 1-click for existing Stripe customers
   * (payment method already on file — no re-entry required).
   */
  oneClickUpgradeForExistingCustomers: true;
  /**
   * Upgrade modal can be dismissed. The same modal must not auto-show
   * again within 24 hours of dismissal.
   */
  noRepeatModalWithin24h: true;
  /**
   * After a successful upgrade, redirect the user back to the exact feature
   * that triggered the upgrade gate (deep-link preserved).
   */
  deepLinkBackAfterUpgrade: true;
  /**
   * Pricing page is publicly accessible — no login required.
   * URL: /pricing (no auth middleware).
   */
  pricingPagePublic: true;
  /**
   * Self-serve downgrade available in ≤2 clicks from account settings.
   * No sales call, no retention chat mandatory.
   */
  selfServeDowngradeIn2Clicks: true;
}

export const ANTI_FRICTION_RULES: AntifrictionRules = {
  oneClickUpgradeForExistingCustomers: true,
  noRepeatModalWithin24h: true,
  deepLinkBackAfterUpgrade: true,
  pricingPagePublic: true,
  selfServeDowngradeIn2Clicks: true,
};

// ── Modal deduplication guard ─────────────────────────────────────────────────

const MODAL_DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Returns `true` if the upgrade modal should be shown.
 *
 * Rules (from anti-friction spec):
 *   - First time ever (lastShownAt is null): always show.
 *   - Shown less than 24h ago: do NOT show.
 *   - Shown more than 24h ago: show again.
 *
 * @param lastShownAt — timestamp when the modal was last shown, or null.
 * @param now         — current time (injectable for testing).
 */
export function shouldShowUpgradeModal(
  lastShownAt: Date | null,
  now: Date,
): boolean {
  if (lastShownAt === null) return true;
  return now.getTime() - lastShownAt.getTime() > MODAL_DEDUP_WINDOW_MS;
}

// ── Deep-link builder ─────────────────────────────────────────────────────────

/**
 * Build a pricing-page URL that will deep-link back to the gated feature
 * after a successful upgrade.
 *
 * Pattern: /pricing?plan=<tier>&return=<encodedFeatureUrl>
 *
 * @param featureUrl  — the URL of the feature that triggered the gate.
 * @param targetTier  — the minimum tier the user needs.
 */
export function buildUpgradeDeepLink(
  featureUrl: string,
  targetTier: Tier,
): string {
  const encoded = encodeURIComponent(featureUrl);
  return `/pricing?plan=${targetTier}&return=${encoded}`;
}
