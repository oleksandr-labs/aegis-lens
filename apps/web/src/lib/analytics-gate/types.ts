/**
 * analytics-gate/types.ts
 * Core TypeScript types for the analytics gating system.
 *
 * Every analytic is gated along 4 independent axes:
 *   Existence · Freshness · Resolution · Lookback
 * Plus export formats and API access per tier.
 *
 * Аналітичний гейт — контракт між Product, Pricing та Engineering.
 */

// ── Analytic identifiers ─────────────────────────────────────────────────────

/** Union of every analytic identifier. Maps 1-to-1 to TODO L1–L11 inventory. */
export type AnalyticId =
  // L1 — Descriptive
  | "event_counter"
  | "recent_events_list"
  | "watchlist_counters"
  | "source_attribution"
  // L2 — Aggregations
  | "heatmap"
  | "time_buckets"
  | "category_breakdown"
  | "source_breakdown"
  // L3 — Trend & comparison
  | "trend_lines"
  | "period_delta"
  | "cross_region"
  | "cross_layer"
  | "cohort_analytics"
  | "seasonality"
  // L4 — Scoring
  | "confidence_score"
  | "danger_score"
  | "trust_score"
  | "disinfo_score"
  | "escalation_index"
  // L5 — Predictive
  | "forecast_24h"
  | "forecast_72h"
  | "forecast_7d"
  | "forecast_confidence"
  | "counterfactual"
  | "custom_forecast"
  // L6 — Knowledge-graph & entity
  | "entity_profiles"
  | "network_graph"
  | "subgraph_export"
  | "entity_timeline"
  | "entity_score"
  // L7 — Investigative
  | "case_file"
  | "multi_source_matrix"
  | "geolocation_sandbox"
  | "reverse_image"
  | "collab_annotation"
  // L8 — Anomaly & alerting
  | "unusual_activity"
  | "sustained_trend"
  | "ai_rule_builder"
  | "compound_alerts"
  // L9 — Media & sentiment
  | "social_volume"
  | "sentiment_trend"
  | "narrative_clusters"
  | "cib_detection"
  | "source_language_mix"
  // L10 — Economic / impact
  | "infra_damage"
  | "maritime_disruption"
  | "aviation_impact"
  | "commodity_flow"
  | "humanitarian_impact"
  // L11 — Custom / advanced
  | "byod_overlay"
  | "custom_kpis"
  | "saved_dashboards"
  | "scheduled_snapshots"
  | "embedded_widgets";

// ── Tier hierarchy ───────────────────────────────────────────────────────────

/** Platform subscription tiers in ascending privilege order. */
export type Tier =
  | "anonymous"
  | "free"
  | "observer"
  | "pro"
  | "pro_plus"
  | "team"
  | "business"
  | "enterprise";

/** Numeric rank of each tier — used for comparison logic. */
export const TIER_RANK: Record<Tier, number> = {
  anonymous:  0,
  free:       1,
  observer:   2,
  pro:        3,
  pro_plus:   4,
  team:       5,
  business:   6,
  enterprise: 7,
};

// ── Axis value types ─────────────────────────────────────────────────────────

/** How delayed analytic data is for a given tier. */
export type FreshnessLevel =
  | "realtime"   // dedicated stream or WS push
  | "5min"       // Observer batch
  | "15min"      // Free batch
  | "hourly"     // coarse batch
  | "daily"      // daily snapshot
  | "batch";     // unspecified batch (fallback)

/** Spatial granularity of analytic data. */
export type ResolutionLevel =
  | "country"      // admin-0
  | "admin1"       // oblast / state
  | "admin2_city"  // raion / county + city
  | "1km"          // 1 km grid
  | "250m"         // 250 m grid
  | "100m"         // 100 m grid
  | "per_asset";   // per-asset (infrastructure etc.)

/** Maximum historical depth available for a given tier. */
export type LookbackWindow =
  | "7d"
  | "30d"
  | "1y"
  | "3y"
  | "all"      // all indexed events
  | "all_raw"; // all + raw unprocessed archive

/** Allowed export formats for a given tier. */
export type ExportFormat =
  | "screenshot" // any tier
  | "csv"
  | "png"
  | "pdf"
  | "s3"        // scheduled push to S3
  | "bulk_raw"; // bulk raw data archive

// ── Per-tier maps ─────────────────────────────────────────────────────────────

/** Maps a subset of tiers to a value for a given axis. */
export type TierMap<T> = Partial<Record<Tier, T>>;

// ── Teaser policy ─────────────────────────────────────────────────────────────

/** What a lower-tier user sees for a locked analytic. */
export interface TeaserPolicy {
  /** Show blurred visual preview (heatmap / chart). */
  showBlurredPreview: boolean;
  /** Show headline number heavily rounded (e.g. "≈ 1.2k"). */
  showRoundedNumber: boolean;
  /** Show lock icon on the analytic card. */
  showLockIcon: boolean;
  /** Label shown underneath the locked value. */
  upgradeLabel: string;
  /** Minimum tier needed to unlock this analytic. */
  unlockTier: Tier;
}

// ── Gate definition ────────────────────────────────────────────────────────

/** Full gate definition for one analytic. */
export interface AnalyticGate {
  /** Analytic identifier. */
  id: AnalyticId;
  /** Lowest tier that can access this analytic at all. */
  minTier: Tier;
  /**
   * Freshness level per tier.
   * Tiers below minTier should not be accessed — use checkAnalyticAccess first.
   */
  freshness: TierMap<FreshnessLevel>;
  /** Spatial resolution per tier. */
  resolution: TierMap<ResolutionLevel>;
  /** Lookback window per tier. */
  lookback: TierMap<LookbackWindow>;
  /** Available export formats per tier. */
  exportFormats: TierMap<ExportFormat[]>;
  /** Whether the analytic is accessible via the REST/streaming API at this tier. */
  apiAccess: TierMap<boolean>;
  /** What lower-tier users see in place of the real analytic. */
  teaserPolicy: TeaserPolicy;
}

// ── Gate check result ─────────────────────────────────────────────────────

export type GateResult =
  | { allowed: true }
  | { allowed: false; minTier: Tier; teaserPolicy: TeaserPolicy };
