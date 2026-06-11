/**
 * Feature Flags → Tier Map
 *
 * Maps every platform feature flag to the minimum tier required to access it.
 * Used by isFeatureEnabled() to gate features server- and client-side.
 *
 * Відображення прапорців функцій на мінімальний tier. Використовується для воротарства.
 */

import { getTierForUser } from "../billing/tier-enforcement";
import { TIER_ORDER } from "../tiers/constants";
import type { Tier } from "../tiers/constants";

// ── FeatureFlag enum ───────────────────────────────────────────────────────────

/**
 * Canonical set of feature flags across the platform.
 * Add new flags here; the tier map below must include every entry.
 *
 * Канонічний перелік прапорців. Кожен прапорець повинен мати запис у FEATURE_FLAG_MINIMUM_TIER.
 */
export enum FeatureFlag {
  // Data access
  REALTIME_STREAM         = "realtime-stream",
  WEBSOCKET_PUSH          = "websocket-push",
  FULL_HISTORY            = "full-history",
  RAW_ARCHIVE             = "raw-archive",

  // AOI / watchlists
  MULTI_AOI               = "multi-aoi",
  LARGE_AOI               = "large-aoi",        // >1,000 km²
  UNLIMITED_AOI           = "unlimited-aoi",

  // Alerts
  WEBHOOK_ALERTS          = "webhook-alerts",
  SLACK_DISCORD_ALERTS    = "slack-discord-alerts",
  UNLIMITED_ALERTS        = "unlimited-alerts",

  // AI Copilot
  COPILOT_GROUNDING       = "copilot-grounding",
  COPILOT_AGENTS          = "copilot-agents",
  COPILOT_FINE_TUNED      = "copilot-fine-tuned",

  // Exports & API
  CSV_EXPORT              = "csv-export",
  API_READ                = "api-read",
  API_WRITE               = "api-write",
  SCHEDULED_EXPORTS       = "scheduled-exports",

  // Collaboration
  CASE_FILES              = "case-files",
  TEAM_COLLABORATION      = "team-collaboration",

  // Enterprise / compliance
  SSO_SAML                = "sso-saml",
  AUDIT_LOG_EXPORT        = "audit-log-export",
}

// ── Minimum tier per feature flag ─────────────────────────────────────────────

/**
 * Minimum tier required to access each feature flag.
 * "free" means the feature is available to all authenticated users.
 * "anonymous" means even unauthenticated access is allowed (rare).
 *
 * Мінімальний tier для кожного прапорця. "free" = доступно всім авторизованим.
 */
export const FEATURE_FLAG_MINIMUM_TIER: Record<FeatureFlag, string> = {
  // Data access
  [FeatureFlag.REALTIME_STREAM]:          "pro",
  [FeatureFlag.WEBSOCKET_PUSH]:           "pro_plus",
  [FeatureFlag.FULL_HISTORY]:             "team",
  [FeatureFlag.RAW_ARCHIVE]:              "business",

  // AOI / watchlists
  [FeatureFlag.MULTI_AOI]:                "observer",
  [FeatureFlag.LARGE_AOI]:               "pro",
  [FeatureFlag.UNLIMITED_AOI]:           "enterprise",

  // Alerts
  [FeatureFlag.WEBHOOK_ALERTS]:           "pro_plus",
  [FeatureFlag.SLACK_DISCORD_ALERTS]:     "pro",
  [FeatureFlag.UNLIMITED_ALERTS]:         "business",

  // AI Copilot
  [FeatureFlag.COPILOT_GROUNDING]:        "observer",
  [FeatureFlag.COPILOT_AGENTS]:           "pro_plus",
  [FeatureFlag.COPILOT_FINE_TUNED]:       "business",

  // Exports & API
  [FeatureFlag.CSV_EXPORT]:              "observer",
  [FeatureFlag.API_READ]:                "observer",
  [FeatureFlag.API_WRITE]:               "pro",
  [FeatureFlag.SCHEDULED_EXPORTS]:        "team",

  // Collaboration
  [FeatureFlag.CASE_FILES]:              "pro",
  [FeatureFlag.TEAM_COLLABORATION]:       "team",

  // Enterprise / compliance
  [FeatureFlag.SSO_SAML]:                "business",
  [FeatureFlag.AUDIT_LOG_EXPORT]:         "enterprise",
};

// ── isFeatureEnabled ───────────────────────────────────────────────────────────

/**
 * Returns true if the user's current tier is at or above the minimum tier
 * required for the given feature flag.
 *
 * Повертає true, якщо tier користувача дозволяє доступ до прапорця.
 */
export async function isFeatureEnabled(
  userId: string,
  flag: FeatureFlag,
): Promise<boolean> {
  const userTier = await getTierForUser(userId);
  const minimumTier = FEATURE_FLAG_MINIMUM_TIER[flag];

  if (!minimumTier) return false;

  const userIndex  = TIER_ORDER.indexOf(userTier as Tier);
  const minIndex   = TIER_ORDER.indexOf(minimumTier as Tier);

  // Unknown tier → treat as "free" (index 1); unknown minimum → block
  const resolvedUserIndex = userIndex  === -1 ? 1 : userIndex;
  const resolvedMinIndex  = minIndex   === -1 ? TIER_ORDER.length : minIndex;

  return resolvedUserIndex >= resolvedMinIndex;
}
