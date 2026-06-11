/**
 * Tier definitions, feature flags, and ordering helpers.
 *
 * Free tier is NOT a limited demo — it is a standalone product:
 * civic safety + journalism + education.
 *
 * Вільний рівень — це не «обмежена демка».
 * Це окремий продукт із власним value proposition.
 */

// ── Tier type ─────────────────────────────────────────────────────────────────

export type Tier =
  | "anonymous"
  | "free"
  | "observer"
  | "pro"
  | "pro_plus"
  | "team"
  | "business"
  | "enterprise";

// ── Tier ordering ─────────────────────────────────────────────────────────────

export const TIER_ORDER: Tier[] = [
  "anonymous",
  "free",
  "observer",
  "pro",
  "pro_plus",
  "team",
  "business",
  "enterprise",
];

/**
 * Returns true if `userTier` is equal to or higher than `minTier`.
 *
 * @example
 * tierIsAtLeast("pro", "free")   // true
 * tierIsAtLeast("free", "pro")   // false
 */
export function tierIsAtLeast(userTier: Tier, minTier: Tier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(minTier);
}

// ── What Free MUST always include (non-negotiable) ────────────────────────────

export interface FreeTierFeatures {
  /** Public live map with all visible event layers (with 15-min delay) */
  publicLiveMapWithDelay: true;
  /** Search by place / event type / date */
  searchByPlaceEventTypeDate: true;
  /** One AOI / watchlist with email alert */
  oneAoiWithEmailAlert: true;
  /** All event detail pages (canonical permalinks — SEO + civic value) */
  allEventDetailPages: true;
  /** Source attribution + confidence score (visual only) */
  sourceAttributionAndConfidence: true;
  /** Read access to all reports older than 30 days */
  reportsOlderThan30Days: true;
  /**
   * All public-utility safety layers (civilian alert sirens, evacuation,
   * shelter index) — NEVER behind paywall, even for civilians abroad.
   * Усі публічні шари безпеки — НІКОЛИ не за пейволом.
   */
  allSafetyLayers: true;
  /** Mobile PWA full access */
  mobilePwa: true;
  /** All glossary, academy intro, "how to verify" content */
  educationalContent: true;
  /** Embedded widgets (with light watermark) for blogs / Wikipedia */
  embeddedWidgetsWithWatermark: true;
}

export const FREE_TIER_FEATURES: FreeTierFeatures = {
  publicLiveMapWithDelay: true,
  searchByPlaceEventTypeDate: true,
  oneAoiWithEmailAlert: true,
  allEventDetailPages: true,
  sourceAttributionAndConfidence: true,
  reportsOlderThan30Days: true,
  allSafetyLayers: true,
  mobilePwa: true,
  educationalContent: true,
  embeddedWidgetsWithWatermark: true,
};

// ── What Free does NOT include (the gates) ────────────────────────────────────

export interface FreeTierGates {
  /** Real-time stream (gate: freshness) — 15-min delay for free */
  realtimeStream: "throttle_gate";
  /** History older than 7 days (gate: lookback) */
  historyBeyond7Days: "soft_gate";
  /** More than 1 AOI / watchlist (gate: scope) */
  multipleAois: "quota_gate";
  /** More than 5 AI Copilot messages / day (gate: quota) */
  aiCopilotBeyond5PerDay: "quota_gate";
  /** Sub-country resolution heatmaps (gate: resolution) */
  subCountryHeatmaps: "soft_gate";
  /** Trend / prediction / anomaly / disinfo / forecast analytics (gate: depth) */
  advancedAnalytics: "soft_gate";
  /** API access (gate: redistribution) */
  apiAccess: "hard_gate";
  /** Exports beyond PNG (gate: redistribution) */
  exportsBeyondPng: "soft_gate";
  /** Case files / collaboration (gate: workflow) */
  caseFilesAndCollaboration: "hard_gate";
  /** Custom dashboards (gate: power-user) */
  customDashboards: "hard_gate";
  /** Add-ons — only on paid base */
  addOns: "hard_gate";
  /** Commercial-license use — Observer+ required */
  commercialLicenseUse: "hard_gate";
}

export const FREE_TIER_GATES: FreeTierGates = {
  realtimeStream: "throttle_gate",
  historyBeyond7Days: "soft_gate",
  multipleAois: "quota_gate",
  aiCopilotBeyond5PerDay: "quota_gate",
  subCountryHeatmaps: "soft_gate",
  advancedAnalytics: "soft_gate",
  apiAccess: "hard_gate",
  exportsBeyondPng: "soft_gate",
  caseFilesAndCollaboration: "hard_gate",
  customDashboards: "hard_gate",
  addOns: "hard_gate",
  commercialLicenseUse: "hard_gate",
};
