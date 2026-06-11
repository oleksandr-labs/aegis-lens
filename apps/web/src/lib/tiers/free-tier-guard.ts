import "server-only";

/**
 * Free-tier limit enforcement.
 *
 * All limits are defined once here; enforcement happens in API routes
 * and server actions. Never call from client components.
 *
 * Усі ліміти вільного рівня визначені тут.
 */

import type { Tier } from "./constants";
import { tierIsAtLeast } from "./constants";

// ── Limit definitions ─────────────────────────────────────────────────────────

export interface FreeTierLimits {
  /** Maximum AOIs / watchlists a free user may create */
  maxAois: number;
  /** Maximum alert channels (email, webhook, etc.) on free */
  maxAlertChannels: number;
  /** Maximum AI Copilot messages per calendar day */
  maxAiCopilotMsgsPerDay: number;
  /** Maximum free accounts per IP address */
  maxFreeAccountsPerIp: number;
  /** History lookback window in days */
  historyDays: number;
  /** Real-time delay for free tier in minutes */
  rtDelayMinutes: number;
}

export const FREE_TIER_LIMITS: FreeTierLimits = {
  maxAois: 1,
  maxAlertChannels: 1,
  maxAiCopilotMsgsPerDay: 5,
  maxFreeAccountsPerIp: 3,
  historyDays: 7,
  rtDelayMinutes: 15,
};

// ── Feature enum ──────────────────────────────────────────────────────────────

/**
 * Features that are subject to per-user quotas on the free tier.
 * Extend this union as new gated features are added.
 */
export type FreeLimitedFeature =
  | "aoi_create"
  | "alert_channel_create"
  | "ai_copilot_message"
  | "history_access"
  | "free_account_per_ip";

// ── Check result ──────────────────────────────────────────────────────────────

export type FreeTierCheckResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: string;
      /** en: human-readable upgrade hint */
      upgradeHint: string;
      /** uk: те саме українською */
      upgradeHintUk: string;
      limitKey: keyof FreeTierLimits;
      limitValue: number;
      currentUsage: number;
    };

// ── Guard function ────────────────────────────────────────────────────────────

/**
 * Check whether a user's current usage is within free-tier limits.
 *
 * Pass `currentUsage` as the count BEFORE the new action.
 * Returns `allowed: true` for any tier above "free" (limits don't apply).
 */
export function checkFreeTierLimit(
  feature: FreeLimitedFeature,
  currentUsage: number,
  tier: Tier,
): FreeTierCheckResult {
  // Paid tiers are never blocked by free limits
  if (tierIsAtLeast(tier, "observer")) return { allowed: true };

  switch (feature) {
    case "aoi_create": {
      const limit = FREE_TIER_LIMITS.maxAois;
      if (currentUsage < limit) return { allowed: true };
      return {
        allowed: false,
        reason: `Free tier allows ${limit} AOI. You have reached the limit.`,
        upgradeHint: `Unlock multiple watchlists — upgrade to Observer or Pro.`,
        upgradeHintUk: `Розблокуйте декілька зон спостереження — перейдіть на Observer або Pro.`,
        limitKey: "maxAois",
        limitValue: limit,
        currentUsage,
      };
    }

    case "alert_channel_create": {
      const limit = FREE_TIER_LIMITS.maxAlertChannels;
      if (currentUsage < limit) return { allowed: true };
      return {
        allowed: false,
        reason: `Free tier allows ${limit} alert channel. You have reached the limit.`,
        upgradeHint: `Add more alert channels — upgrade to Observer or Pro.`,
        upgradeHintUk: `Додайте більше каналів сповіщень — перейдіть на Observer або Pro.`,
        limitKey: "maxAlertChannels",
        limitValue: limit,
        currentUsage,
      };
    }

    case "ai_copilot_message": {
      const limit = FREE_TIER_LIMITS.maxAiCopilotMsgsPerDay;
      if (currentUsage < limit) return { allowed: true };
      return {
        allowed: false,
        reason: `Free tier allows ${limit} AI Copilot messages per day. Daily quota reached.`,
        upgradeHint: `Unlock unlimited AI Copilot — upgrade to Pro.`,
        upgradeHintUk: `Розблокуйте необмежений AI Copilot — перейдіть на Pro.`,
        limitKey: "maxAiCopilotMsgsPerDay",
        limitValue: limit,
        currentUsage,
      };
    }

    case "history_access": {
      // currentUsage = days of history being requested
      const limit = FREE_TIER_LIMITS.historyDays;
      if (currentUsage <= limit) return { allowed: true };
      return {
        allowed: false,
        reason: `Free tier provides ${limit} days of history. Requested ${currentUsage} days.`,
        upgradeHint: `Unlock 1-year history — upgrade to Pro.`,
        upgradeHintUk: `Розблокуйте доступ до річної історії — перейдіть на Pro.`,
        limitKey: "historyDays",
        limitValue: limit,
        currentUsage,
      };
    }

    case "free_account_per_ip": {
      const limit = FREE_TIER_LIMITS.maxFreeAccountsPerIp;
      if (currentUsage < limit) return { allowed: true };
      return {
        allowed: false,
        reason: `Maximum ${limit} free accounts per IP address reached.`,
        upgradeHint: `Sign in with an existing account or upgrade for a dedicated seat.`,
        upgradeHintUk: `Увійдіть у наявний обліковий запис або перейдіть на платний план.`,
        limitKey: "maxFreeAccountsPerIp",
        limitValue: limit,
        currentUsage,
      };
    }
  }
}

// ── Never-paywalled features ──────────────────────────────────────────────────

/**
 * Features that must NEVER be placed behind a paywall — civic / safety utility.
 *
 * Pass any feature identifier string; returns `true` if it is unconditionally free.
 *
 * Функції, які НІКОЛИ не можуть бути за пейволом — громадська / безпекова утиліта.
 */
const NEVER_PAYWALLED_FEATURES = new Set<string>([
  // Civilian safety layers
  "civilian_alert_sirens",
  "evacuation_routes",
  "shelter_index",
  "air_raid_alerts",
  "safety_layers",
  // Public informational
  "event_detail_pages",
  "glossary",
  "academy_intro",
  "how_to_verify",
  "source_attribution",
  // Embeds
  "embedded_widget",
  // Search
  "search_basic",
  // Mobile
  "mobile_pwa",
]);

export function isNeverPaywalled(feature: string): boolean {
  return NEVER_PAYWALLED_FEATURES.has(feature);
}
