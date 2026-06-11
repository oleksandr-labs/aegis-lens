/**
 * analytics-gate/gate-config.ts
 * Full gate configuration for every analytic identifier.
 *
 * Rules encoded from TODO_analytics_gating.md sections A–F:
 *   A. Teaser policy
 *   B. Freshness gates  (Free→15min, Observer→5min, Pro/Pro+→realtime, Team/Business→realtime, Enterprise→realtime)
 *   C. Lookback gates   (Free→7d, Observer→30d, Pro→1y, Pro+→3y, Team→all, Business→all_raw)
 *   D. Resolution gates (Free→country, Observer→admin1, Pro→admin2_city, Pro+→1km, Team→250m, Business→100m, Enterprise→per_asset)
 *   E. Export gates     (Free→screenshot, Pro→csv/png, Pro+→csv/pdf, Team+→s3, Business+→bulk_raw)
 *   F. API gates        (below Pro→false, Pro+→true)
 *
 * Конфігурація — єдине джерело правди. Pricing-page та UI teaser будуються з цього файлу.
 */

import type {
  AnalyticGate,
  AnalyticId,
  ExportFormat,
  FreshnessLevel,
  LookbackWindow,
  ResolutionLevel,
  TeaserPolicy,
  Tier,
  TierMap,
} from "./types";

// ── Shared axis defaults ────────────────────────────────────────────────────

/**
 * Standard freshness map applied to most analytics.
 * Team/Business share realtime; Enterprise gets dedicated (also realtime for latency).
 */
const STD_FRESHNESS: TierMap<FreshnessLevel> = {
  free:       "15min",
  observer:   "5min",
  pro:        "realtime",
  pro_plus:   "realtime",
  team:       "realtime",
  business:   "realtime",
  enterprise: "realtime",
};

const STD_LOOKBACK: TierMap<LookbackWindow> = {
  free:       "7d",
  observer:   "30d",
  pro:        "1y",
  pro_plus:   "3y",
  team:       "all",
  business:   "all_raw",
  enterprise: "all_raw",
};

const STD_RESOLUTION: TierMap<ResolutionLevel> = {
  free:       "country",
  observer:   "admin1",
  pro:        "admin2_city",
  pro_plus:   "1km",
  team:       "250m",
  business:   "100m",
  enterprise: "per_asset",
};

/** Export formats per tier (section E). */
const STD_EXPORTS: TierMap<ExportFormat[]> = {
  anonymous:  ["screenshot"],
  free:       ["screenshot"],
  observer:   ["screenshot"],
  pro:        ["screenshot", "csv", "png"],
  pro_plus:   ["screenshot", "csv", "png", "pdf"],
  team:       ["screenshot", "csv", "png", "pdf", "s3"],
  business:   ["screenshot", "csv", "png", "pdf", "s3", "bulk_raw"],
  enterprise: ["screenshot", "csv", "png", "pdf", "s3", "bulk_raw"],
};

/** API access per tier (section F). */
const STD_API: TierMap<boolean> = {
  anonymous:  false,
  free:       false,
  observer:   false,
  pro:        true,
  pro_plus:   true,
  team:       true,
  business:   true,
  enterprise: true,
};

// ── Teaser policy builders ───────────────────────────────────────────────────

function teaser(unlockTier: Tier, upgradeLabel: string, showBlurredPreview = false): TeaserPolicy {
  return {
    showBlurredPreview,
    showRoundedNumber: true,
    showLockIcon: true,
    upgradeLabel,
    unlockTier,
  };
}

// ── Gate helper ──────────────────────────────────────────────────────────────

function gate(
  id: AnalyticId,
  minTier: Tier,
  teaserPolicy: TeaserPolicy,
  overrides?: {
    freshness?: TierMap<FreshnessLevel>;
    resolution?: TierMap<ResolutionLevel>;
    lookback?: TierMap<LookbackWindow>;
    exportFormats?: TierMap<ExportFormat[]>;
    apiAccess?: TierMap<boolean>;
  },
): AnalyticGate {
  return {
    id,
    minTier,
    freshness:    overrides?.freshness    ?? STD_FRESHNESS,
    resolution:   overrides?.resolution   ?? STD_RESOLUTION,
    lookback:     overrides?.lookback     ?? STD_LOOKBACK,
    exportFormats: overrides?.exportFormats ?? STD_EXPORTS,
    apiAccess:    overrides?.apiAccess    ?? STD_API,
    teaserPolicy,
  };
}

// ── Full gate configuration ──────────────────────────────────────────────────

export const ANALYTIC_GATES: Record<AnalyticId, AnalyticGate> = {

  // ── L1: Descriptive ────────────────────────────────────────────────────────

  event_counter: gate(
    "event_counter",
    "free",
    teaser("free", "Sign up free to see live event counts"),
    {
      freshness: { ...STD_FRESHNESS, free: "15min", observer: "15min" },
      resolution: { ...STD_RESOLUTION, free: "country", observer: "country" },
    },
  ),

  recent_events_list: gate(
    "recent_events_list",
    "free",
    teaser("free", "Sign up free to browse recent events"),
    {
      freshness: { free: "15min", observer: "5min", pro: "realtime", pro_plus: "realtime", team: "realtime", business: "realtime", enterprise: "realtime" },
      lookback:  { free: "7d", observer: "30d", pro: "1y", pro_plus: "3y", team: "all", business: "all_raw", enterprise: "all_raw" },
    },
  ),

  watchlist_counters: gate(
    "watchlist_counters",
    "free",
    teaser("pro_plus", "Upgrade to Pro+ for unlimited AOI watchlists"),
    {
      // Free: 1 AOI, Pro+: unlimited — encoded via product logic, gate covers existence
      freshness: STD_FRESHNESS,
    },
  ),

  source_attribution: gate(
    "source_attribution",
    "free",
    teaser("pro", "Upgrade to Pro to see all sources + cross-links"),
    {
      // Free: one source displayed, Pro: all sources + cross-link
      freshness: STD_FRESHNESS,
    },
  ),

  // ── L2: Aggregations ───────────────────────────────────────────────────────

  heatmap: gate(
    "heatmap",
    "observer",
    teaser("observer", "Observer plan unlocks event density heatmaps", true),
    {
      freshness:  { observer: "daily", pro: "hourly", pro_plus: "5min", team: "realtime", business: "realtime", enterprise: "realtime" },
      resolution: { observer: "country", pro: "1km", pro_plus: "100m", team: "250m", business: "100m", enterprise: "per_asset" },
    },
  ),

  time_buckets: gate(
    "time_buckets",
    "observer",
    teaser("observer", "Observer plan unlocks time-bucket histograms", true),
    {
      freshness: { observer: "daily", pro: "hourly", pro_plus: "5min", team: "realtime", business: "realtime", enterprise: "realtime" },
    },
  ),

  category_breakdown: gate(
    "category_breakdown",
    "observer",
    teaser("pro", "Upgrade to Pro for cross-category drill-down"),
  ),

  source_breakdown: gate(
    "source_breakdown",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for source breakdown + reliability scores"),
  ),

  // ── L3: Trend & comparison ─────────────────────────────────────────────────

  trend_lines: gate(
    "trend_lines",
    "pro",
    teaser("pro", "Upgrade to Pro to unlock 7-day / 30-day trend lines", true),
  ),

  period_delta: gate(
    "period_delta",
    "pro",
    teaser("pro", "Upgrade to Pro for period-over-period delta analytics"),
  ),

  cross_region: gate(
    "cross_region",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ to compare 2–10 AOIs side-by-side", true),
  ),

  cross_layer: gate(
    "cross_layer",
    "team",
    teaser("team", "Team plan unlocks cross-layer correlation (e.g. drones vs power)"),
  ),

  cohort_analytics: gate(
    "cohort_analytics",
    "team",
    teaser("team", "Team plan unlocks cohort analytics by unit / weapon class"),
  ),

  seasonality: gate(
    "seasonality",
    "business",
    teaser("business", "Business plan unlocks seasonality decomposition"),
  ),

  // ── L4: Scoring ─────────────────────────────────────────────────────────────

  confidence_score: gate(
    "confidence_score",
    "free",
    teaser("pro", "Upgrade to Pro to filter events by confidence threshold"),
    {
      // Free: display only, Pro: filter by ≥ threshold
      freshness: STD_FRESHNESS,
    },
  ),

  danger_score: gate(
    "danger_score",
    "observer",
    teaser("pro_plus", "Upgrade to Pro+ for real-time AOI danger recomputation"),
    {
      freshness:  { observer: "daily", pro: "hourly", pro_plus: "realtime", team: "realtime", business: "realtime", enterprise: "realtime" },
      resolution: { observer: "country", pro: "admin2_city", pro_plus: "1km", team: "250m", business: "100m", enterprise: "per_asset" },
    },
  ),

  trust_score: gate(
    "trust_score",
    "pro",
    teaser("pro", "Upgrade to Pro for source reliability / trust scoring"),
  ),

  disinfo_score: gate(
    "disinfo_score",
    "business",
    teaser("business", "Business plan unlocks disinformation likelihood scoring"),
  ),

  escalation_index: gate(
    "escalation_index",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for the regional escalation index"),
  ),

  // ── L5: Predictive ─────────────────────────────────────────────────────────

  forecast_24h: gate(
    "forecast_24h",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for 24-hour event likelihood forecasts", true),
  ),

  forecast_72h: gate(
    "forecast_72h",
    "team",
    teaser("team", "Team plan unlocks 72-hour forecasts"),
  ),

  forecast_7d: gate(
    "forecast_7d",
    "business",
    teaser("business", "Business plan unlocks 7-day forecasts"),
  ),

  forecast_confidence: gate(
    "forecast_confidence",
    "business",
    teaser("business", "Business plan unlocks forecast confidence intervals + back-testing"),
  ),

  counterfactual: gate(
    "counterfactual",
    "enterprise",
    teaser("enterprise", "Enterprise plan unlocks counterfactual scenario modelling"),
  ),

  custom_forecast: gate(
    "custom_forecast",
    "enterprise",
    teaser("enterprise", "Enterprise plan unlocks custom-trained forecast models"),
  ),

  // ── L6: Knowledge-graph & entity ──────────────────────────────────────────

  entity_profiles: gate(
    "entity_profiles",
    "free",
    teaser("pro", "Upgrade to Pro to see full entity relations"),
    {
      // Free: basic profile, Pro: relations + full graph
      freshness: STD_FRESHNESS,
    },
  ),

  network_graph: gate(
    "network_graph",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for network graph visualization", true),
  ),

  subgraph_export: gate(
    "subgraph_export",
    "team",
    teaser("team", "Team plan unlocks sub-graph extraction and export"),
  ),

  entity_timeline: gate(
    "entity_timeline",
    "pro",
    teaser("pro", "Upgrade to Pro for entity timeline analytics"),
  ),

  entity_score: gate(
    "entity_score",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for entity-level danger / activity scores"),
  ),

  // ── L7: Investigative ─────────────────────────────────────────────────────

  case_file: gate(
    "case_file",
    "pro",
    teaser("pro", "Upgrade to Pro to create case files with linked events"),
  ),

  multi_source_matrix: gate(
    "multi_source_matrix",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for multi-source corroboration matrix"),
  ),

  geolocation_sandbox: gate(
    "geolocation_sandbox",
    "pro",
    teaser("pro", "Upgrade to Pro to access the geolocation sandbox"),
  ),

  reverse_image: gate(
    "reverse_image",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for reverse-image / chrono-geolocation tools"),
  ),

  collab_annotation: gate(
    "collab_annotation",
    "team",
    teaser("team", "Team plan unlocks collaborative annotation + audit log"),
  ),

  // ── L8: Anomaly & alerting ─────────────────────────────────────────────────

  unusual_activity: gate(
    "unusual_activity",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for unusual-activity anomaly detection"),
  ),

  sustained_trend: gate(
    "sustained_trend",
    "team",
    teaser("team", "Team plan unlocks the sustained-trend detector"),
  ),

  ai_rule_builder: gate(
    "ai_rule_builder",
    "pro_plus",
    teaser("business", "Business plan unlocks regex + agent-powered alert rules"),
  ),

  compound_alerts: gate(
    "compound_alerts",
    "team",
    teaser("team", "Team plan unlocks multi-condition compound alerts"),
  ),

  // ── L9: Media & sentiment ─────────────────────────────────────────────────

  social_volume: gate(
    "social_volume",
    "observer",
    teaser("pro", "Upgrade to Pro for city-level social mention volume"),
    {
      resolution: { observer: "country", pro: "admin2_city", pro_plus: "1km", team: "250m", business: "100m", enterprise: "per_asset" },
    },
  ),

  sentiment_trend: gate(
    "sentiment_trend",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for sentiment trend analytics", true),
  ),

  narrative_clusters: gate(
    "narrative_clusters",
    "business",
    teaser("business", "Business plan unlocks LLM-summarized narrative cluster detection"),
  ),

  cib_detection: gate(
    "cib_detection",
    "business",
    teaser("business", "Business plan unlocks coordinated inauthentic behavior detection"),
  ),

  source_language_mix: gate(
    "source_language_mix",
    "pro_plus",
    teaser("pro_plus", "Upgrade to Pro+ for source-language-mix analytics"),
  ),

  // ── L10: Economic / impact ────────────────────────────────────────────────

  infra_damage: gate(
    "infra_damage",
    "business",
    teaser("business", "Business plan (insurance add-on) unlocks infrastructure damage estimates"),
  ),

  maritime_disruption: gate(
    "maritime_disruption",
    "business",
    teaser("business", "Business plan (maritime vertical) unlocks trade-disruption index"),
  ),

  aviation_impact: gate(
    "aviation_impact",
    "business",
    teaser("business", "Business plan (aviation vertical) unlocks no-fly impact analytics"),
  ),

  commodity_flow: gate(
    "commodity_flow",
    "business",
    teaser("business", "Business plan (finance vertical) unlocks commodity-flow disruption forecasts"),
  ),

  humanitarian_impact: gate(
    "humanitarian_impact",
    "observer",
    teaser("observer", "Observer plan or NGO grant unlocks humanitarian impact scores"),
  ),

  // ── L11: Custom / advanced ────────────────────────────────────────────────

  byod_overlay: gate(
    "byod_overlay",
    "pro_plus",
    teaser("team", "Team plan unlocks large bring-your-own-data overlays"),
    {
      // Pro+: small files, Team: large files
    },
  ),

  custom_kpis: gate(
    "custom_kpis",
    "team",
    teaser("team", "Team plan unlocks custom KPI dashboards"),
  ),

  saved_dashboards: gate(
    "saved_dashboards",
    "team",
    teaser("team", "Team plan unlocks saved cross-AOI dashboards with live data"),
  ),

  scheduled_snapshots: gate(
    "scheduled_snapshots",
    "team",
    teaser("team", "Team plan unlocks scheduled analytic snapshots → email / Slack"),
  ),

  embedded_widgets: gate(
    "embedded_widgets",
    "business",
    teaser("business", "Business plan unlocks embeddable analytic widgets (iframe)"),
  ),
};
