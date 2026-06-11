/**
 * Dashboard widget schema.
 * Widgets are schema-driven so plugins can register new types.
 * See: TODO/pages/TODO_dashboard.md
 */

// ── Widget types ──────────────────────────────────────────────────────────────

export type WidgetType =
  | "event_feed"
  | "alert_feed"
  | "ai_brief"
  | "mini_map"
  | "kpi_events_per_hour"
  | "kpi_confidence_dist"
  | "kpi_source_freshness"
  | "kpi_anomaly_counter"
  | "chart_timeline"
  | "chart_heatmap"
  | "source_health"
  | "case_list"
  | "watchlist"
  | "custom"; // plugin-registered

// ── Widget grid position ──────────────────────────────────────────────────────

export interface GridPosition {
  /** Column index (0-based) */
  x: number;
  /** Row index (0-based) */
  y: number;
  /** Width in grid columns */
  w: number;
  /** Height in grid rows */
  h: number;
}

// ── Per-widget config (discriminated union) ───────────────────────────────────

export interface EventFeedConfig {
  type: "event_feed";
  filter: {
    classes?: string[];
    min_danger_score?: number;
    geo_filter?: { bbox: [number, number, number, number] };
    limit?: number;
  };
}

export interface AlertFeedConfig {
  type: "alert_feed";
  rule_ids?: string[];
  limit?: number;
}

export interface AIBriefConfig {
  type: "ai_brief";
  watchlist_id?: string;
  locale: string;
  refresh_cadence: "manual" | "hourly" | "daily";
}

export interface MiniMapConfig {
  type: "mini_map";
  center: [number, number]; // [lng, lat]
  zoom: number;
  layer_ids: string[];
}

export interface KPIConfig {
  type:
    | "kpi_events_per_hour"
    | "kpi_confidence_dist"
    | "kpi_source_freshness"
    | "kpi_anomaly_counter";
  region_filter?: string; // oblast code or "UA"
  window_hours?: number;
}

export interface ChartTimelineConfig {
  type: "chart_timeline";
  class_filter?: string[];
  region_filter?: string;
  window_days?: number;
  granularity: "hour" | "day";
}

export interface SourceHealthConfig {
  type: "source_health";
  source_ids?: string[];
}

export interface WatchlistConfig {
  type: "watchlist";
  watchlist_id: string;
}

export interface CustomWidgetConfig {
  type: "custom";
  plugin_id: string;
  plugin_config: Record<string, unknown>;
}

export type WidgetConfig =
  | EventFeedConfig
  | AlertFeedConfig
  | AIBriefConfig
  | MiniMapConfig
  | KPIConfig
  | ChartTimelineConfig
  | SourceHealthConfig
  | WatchlistConfig
  | CustomWidgetConfig;

// ── Widget instance (what's stored per dashboard) ────────────────────────────

export interface DashboardWidget {
  widget_id: string;
  title?: string;
  position: GridPosition;
  config: WidgetConfig;
  /** Last refreshed ISO timestamp */
  refreshed_at?: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface Dashboard {
  dashboard_id: string;
  user_id: string;
  org_id?: string;
  name: string;
  /** Number of columns in the grid */
  columns: number;
  widgets: DashboardWidget[];
  is_default: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ── Role-based default templates ──────────────────────────────────────────────

export type DashboardTemplate =
  | "analyst_default"
  | "journalist_default"
  | "ngo_humanitarian"
  | "government_defense"
  | "trader_finance";

export const DASHBOARD_TEMPLATES: Record<DashboardTemplate, Omit<Dashboard, "dashboard_id" | "user_id" | "org_id" | "created_at" | "updated_at">> = {
  analyst_default: {
    name: "Analyst Default",
    columns: 12,
    is_default: true,
    is_public: false,
    widgets: [
      { widget_id: "w1", position: { x: 0, y: 0, w: 8, h: 8 }, config: { type: "mini_map", center: [32.0, 48.5], zoom: 6, layer_ids: ["military_strikes", "air_raid_alerts"] } },
      { widget_id: "w2", position: { x: 8, y: 0, w: 4, h: 4 }, config: { type: "event_feed", filter: { min_danger_score: 50, limit: 20 } } },
      { widget_id: "w3", position: { x: 8, y: 4, w: 4, h: 4 }, config: { type: "alert_feed", limit: 10 } },
      { widget_id: "w4", position: { x: 0, y: 8, w: 3, h: 3 }, config: { type: "kpi_events_per_hour", window_hours: 24 } },
      { widget_id: "w5", position: { x: 3, y: 8, w: 3, h: 3 }, config: { type: "kpi_anomaly_counter", window_hours: 24 } },
      { widget_id: "w6", position: { x: 6, y: 8, w: 6, h: 3 }, config: { type: "ai_brief", locale: "en", refresh_cadence: "daily" } },
    ],
  },
  journalist_default: {
    name: "Journalist Default",
    columns: 12,
    is_default: false,
    is_public: false,
    widgets: [
      { widget_id: "w1", position: { x: 0, y: 0, w: 12, h: 4 }, config: { type: "ai_brief", locale: "en", refresh_cadence: "hourly" } },
      { widget_id: "w2", position: { x: 0, y: 4, w: 6, h: 6 }, config: { type: "event_feed", filter: { min_danger_score: 60, limit: 30 } } },
      { widget_id: "w3", position: { x: 6, y: 4, w: 6, h: 6 }, config: { type: "mini_map", center: [32.0, 48.5], zoom: 5, layer_ids: ["military_strikes", "infrastructure_damage"] } },
    ],
  },
  ngo_humanitarian: {
    name: "NGO / Humanitarian",
    columns: 12,
    is_default: false,
    is_public: false,
    widgets: [
      { widget_id: "w1", position: { x: 0, y: 0, w: 8, h: 6 }, config: { type: "mini_map", center: [32.0, 48.5], zoom: 6, layer_ids: ["air_raid_alerts", "shelters", "infrastructure_damage"] } },
      { widget_id: "w2", position: { x: 8, y: 0, w: 4, h: 6 }, config: { type: "event_feed", filter: { classes: ["civilian_alert", "humanitarian"], limit: 20 } } },
    ],
  },
  government_defense: {
    name: "Government / Defense",
    columns: 12,
    is_default: false,
    is_public: false,
    widgets: [
      { widget_id: "w1", position: { x: 0, y: 0, w: 8, h: 8 }, config: { type: "mini_map", center: [32.0, 48.5], zoom: 7, layer_ids: ["military_strikes", "troop_movement", "air_defense", "aviation"] } },
      { widget_id: "w2", position: { x: 8, y: 0, w: 4, h: 4 }, config: { type: "kpi_anomaly_counter", window_hours: 6 } },
      { widget_id: "w3", position: { x: 8, y: 4, w: 4, h: 4 }, config: { type: "source_health" } },
    ],
  },
  trader_finance: {
    name: "Trader / Finance",
    columns: 12,
    is_default: false,
    is_public: false,
    widgets: [
      { widget_id: "w1", position: { x: 0, y: 0, w: 6, h: 4 }, config: { type: "ai_brief", locale: "en", refresh_cadence: "hourly" } },
      { widget_id: "w2", position: { x: 6, y: 0, w: 6, h: 4 }, config: { type: "event_feed", filter: { classes: ["infrastructure", "maritime", "economic"], limit: 20 } } },
      { widget_id: "w3", position: { x: 0, y: 4, w: 12, h: 4 }, config: { type: "chart_timeline", class_filter: ["infrastructure", "maritime"], granularity: "day", window_days: 30 } },
    ],
  },
};
