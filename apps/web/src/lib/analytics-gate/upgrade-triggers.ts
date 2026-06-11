/**
 * analytics-gate/upgrade-triggers.ts
 * Upgrade trigger moments — when to show an upgrade prompt to the user.
 *
 * 7 trigger definitions from TODO_analytics_gating.md "Upgrade trigger moments".
 * Each trigger fires when a user hits a gate wall mid-task (not just on page load).
 *
 * Тригери — найвищий момент конверсії: показуємо апґрейд саме тоді, коли
 * користувач відчув обмеження, а не просто побачив ціновий план.
 */

import type { AnalyticId, Tier } from "./types";

// ── Trigger event ─────────────────────────────────────────────────────────────

/** The event that fires a trigger check. */
export interface UpgradeTriggerEvent {
  /** What type of trigger fired. */
  type: UpgradeTriggerType;
  /** Current user tier. */
  userTier: Tier;
  /** Analytic the user was trying to access (when relevant). */
  analyticId?: AnalyticId;
  /** Extra payload (e.g. AOI count, date range in days, etc.). */
  payload?: Record<string, unknown>;
}

/** The prompt shown to the user after a trigger fires. */
export interface UpgradePrompt {
  /** Short headline for the upgrade CTA. */
  headline: string;
  /** Supporting body text. */
  body: string;
  /** Minimum tier that resolves this limitation. */
  suggestedTier: Tier;
  /** Which analytic (or gate wall) triggered this. */
  triggeredBy: UpgradeTriggerType;
  /** Tracking label for telemetry. */
  telemetryLabel: string;
}

// ── Trigger types ─────────────────────────────────────────────────────────────

export type UpgradeTriggerType =
  | "aoi_limit_reached"         // trigger 1
  | "lookback_wall"             // trigger 2
  | "freshness_wall"            // trigger 3
  | "locked_analytic_clicked"   // trigger 4
  | "export_blocked"            // trigger 5
  | "api_access_denied"         // trigger 6
  | "resolution_degraded";      // trigger 7

// ── Trigger definitions ───────────────────────────────────────────────────────

export interface UpgradeTriggerDefinition {
  type: UpgradeTriggerType;
  /** Human-readable description of when this trigger fires. */
  description: string;
  /** Evaluate whether this trigger fires for a given event. */
  matches: (event: UpgradeTriggerEvent) => boolean;
  /** Build the upgrade prompt when this trigger fires. */
  buildPrompt: (event: UpgradeTriggerEvent) => UpgradePrompt;
}

/**
 * All 7 upgrade trigger definitions.
 * Add new triggers here; checkUpgradeTrigger iterates this list in order.
 */
export const UPGRADE_TRIGGERS: UpgradeTriggerDefinition[] = [
  // Trigger 1 — AOI limit reached (watchlist_counters, Free: 1 AOI)
  {
    type: "aoi_limit_reached",
    description: "User tries to add more than their tier's AOI quota.",
    matches: (e) =>
      e.type === "aoi_limit_reached" &&
      (e.userTier === "free" || e.userTier === "anonymous"),
    buildPrompt: (e) => ({
      headline: "You've reached your AOI limit",
      body:
        "Free accounts support 1 Area of Interest. " +
        "Upgrade to Pro+ to monitor unlimited AOIs simultaneously.",
      suggestedTier: "pro_plus",
      triggeredBy: e.type,
      telemetryLabel: "aoi_limit_reached__free_to_pro_plus",
    }),
  },

  // Trigger 2 — Lookback wall (user drags date picker beyond tier limit)
  {
    type: "lookback_wall",
    description: "User requests a date range deeper than their tier allows.",
    matches: (e) => e.type === "lookback_wall",
    buildPrompt: (e) => {
      const days = (e.payload?.requestedDays as number | undefined) ?? 0;
      const tier: Tier =
        days > 365 * 3 ? "team"
        : days > 365   ? "pro_plus"
        : days > 30    ? "pro"
        :                "observer";
      return {
        headline: "Extend your historical window",
        body: `Your current plan only shows ${
          e.userTier === "free" ? "7 days" :
          e.userTier === "observer" ? "30 days" :
          e.userTier === "pro" ? "1 year" :
          "3 years"
        } of history. Upgrade to see further back.`,
        suggestedTier: tier,
        triggeredBy: e.type,
        telemetryLabel: `lookback_wall__${e.userTier}_to_${tier}`,
      };
    },
  },

  // Trigger 3 — Freshness wall (user tries to enable real-time toggle)
  {
    type: "freshness_wall",
    description: "User tries to switch to real-time data but tier only allows batch.",
    matches: (e) => e.type === "freshness_wall",
    buildPrompt: (e) => ({
      headline: "Real-time data requires Pro",
      body:
        "Your plan delivers data with a " +
        (e.userTier === "observer" ? "5-minute" : "15-minute") +
        " delay. Upgrade to Pro for live event streams.",
      suggestedTier: "pro",
      triggeredBy: e.type,
      telemetryLabel: `freshness_wall__${e.userTier}_to_pro`,
    }),
  },

  // Trigger 4 — Locked analytic clicked (user clicks a blurred / locked card)
  {
    type: "locked_analytic_clicked",
    description: "User clicks on a teaser-displayed locked analytic.",
    matches: (e) => e.type === "locked_analytic_clicked" && !!e.analyticId,
    buildPrompt: (e) => {
      const analyticId = e.analyticId ?? "this analytic";
      return {
        headline: "Unlock this analytic",
        body: `${String(analyticId).replace(/_/g, " ")} is not available on your current plan. Upgrade to access it.`,
        suggestedTier: "pro",   // gate-config has per-analytic minTier; UI layer can override
        triggeredBy: e.type,
        telemetryLabel: `locked_analytic_clicked__${String(analyticId)}__${e.userTier}`,
      };
    },
  },

  // Trigger 5 — Export blocked (user clicks Export but format is unavailable)
  {
    type: "export_blocked",
    description: "User attempts to export in a format not available on their tier.",
    matches: (e) => e.type === "export_blocked",
    buildPrompt: (e) => {
      const format = (e.payload?.format as string | undefined) ?? "this format";
      return {
        headline: `Export as ${format} requires a higher plan`,
        body:
          "Free accounts can export screenshots only. " +
          "Upgrade to Pro for CSV/PNG, or Pro+ for branded PDF reports.",
        suggestedTier: format === "bulk_raw" ? "business" : format === "s3" ? "team" : "pro",
        triggeredBy: e.type,
        telemetryLabel: `export_blocked__${e.userTier}__${format}`,
      };
    },
  },

  // Trigger 6 — API access denied (user generates an API key but hits a gate)
  {
    type: "api_access_denied",
    description: "User tries to use the REST API but their tier has no API access.",
    matches: (e) =>
      e.type === "api_access_denied" &&
      (e.userTier === "anonymous" || e.userTier === "free" || e.userTier === "observer"),
    buildPrompt: (e) => ({
      headline: "API access starts at Pro",
      body:
        "Your current plan does not include REST / streaming API access. " +
        "Upgrade to Pro to integrate Aegis Lens data into your own tools.",
      suggestedTier: "pro",
      triggeredBy: e.type,
      telemetryLabel: `api_access_denied__${e.userTier}_to_pro`,
    }),
  },

  // Trigger 7 — Resolution degraded (user zooms map past their tier's grid limit)
  {
    type: "resolution_degraded",
    description: "User zooms into a map level finer than their tier's resolution gate.",
    matches: (e) => e.type === "resolution_degraded",
    buildPrompt: (e) => {
      const requestedRes = (e.payload?.requestedResolution as string | undefined) ?? "higher";
      const tier: Tier =
        requestedRes === "per_asset" ? "enterprise"
        : requestedRes === "100m"   ? "business"
        : requestedRes === "250m"   ? "team"
        : requestedRes === "1km"    ? "pro_plus"
        : requestedRes === "admin2_city" ? "pro"
        : "observer";
      return {
        headline: "Zoom in with a higher-resolution plan",
        body:
          "Your current plan shows data at " +
          (e.userTier === "free" ? "country" :
           e.userTier === "observer" ? "oblast" : "city") +
          " level. Upgrade to see finer grid resolution.",
        suggestedTier: tier,
        triggeredBy: e.type,
        telemetryLabel: `resolution_degraded__${e.userTier}_to_${tier}`,
      };
    },
  },
];

// ── Evaluation ────────────────────────────────────────────────────────────────

/**
 * Evaluate a trigger event against all defined triggers.
 * Returns the first matching UpgradePrompt, or null if no trigger fires.
 *
 * Повертає перший спрацьований тригер (список впорядкований за пріоритетом).
 */
export function checkUpgradeTrigger(event: UpgradeTriggerEvent): UpgradePrompt | null {
  for (const trigger of UPGRADE_TRIGGERS) {
    if (trigger.matches(event)) {
      return trigger.buildPrompt(event);
    }
  }
  return null;
}
