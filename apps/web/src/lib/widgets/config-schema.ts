/**
 * Widget config schema — typed definitions for all dashboard widget types.
 * Схема конфігурації віджетів — типізовані визначення для всіх типів віджетів дашборду.
 *
 * NOTE (EN): This module defines the canonical WidgetType enum, size/position types,
 *            and per-type discriminated union configs. Add new types here first.
 * NOTE (UK): Цей модуль визначає канонічний enum WidgetType, типи розміру/позиції
 *            та дискримінантні union-конфіги для кожного типу. Нові типи додавати тут.
 *
 * NOTE (EN): BaseWidgetConfig contains all fields common to every widget instance.
 * NOTE (UK): BaseWidgetConfig містить усі поля, спільні для кожного екземпляра віджета.
 *
 * NOTE (EN): WIDGET_DEFAULTS provides sensible grid positions for each type; override as needed.
 * NOTE (UK): WIDGET_DEFAULTS задає розумні позиції сітки для кожного типу; перевизначайте за потреби.
 *
 * NOTE (EN): Discriminated unions enable exhaustive switch-based rendering in the UI layer.
 * NOTE (UK): Дискримінантні union-и дозволяють вичерпну switch-обробку у шарі UI.
 *
 * NOTE (EN): All title/label fields carry both EN and UK variants for full i18n support.
 * NOTE (UK): Усі поля title/label містять варіанти EN та UK для повної підтримки i18n.
 */

// ---------------------------------------------------------------------------
// WidgetType enum
// ---------------------------------------------------------------------------

export type WidgetType =
  | "event-feed"
  | "mini-map"
  | "heatmap"
  | "timeseries"
  | "severity-gauge"
  | "sankey"
  | "source-health"
  | "ai-brief"
  | "alert-feed"
  | "watchlist"
  | "kpi-counter"
  | "anomaly"
  | "custom"
  | "notebook-cell"
  | "travel-risk";

// ---------------------------------------------------------------------------
// WidgetSize
// ---------------------------------------------------------------------------

export type WidgetSize = "small" | "medium" | "large" | "full";

// ---------------------------------------------------------------------------
// Grid position
// ---------------------------------------------------------------------------

export interface WidgetPosition {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

// ---------------------------------------------------------------------------
// BaseWidgetConfig — common to all widget instances
// ---------------------------------------------------------------------------

export interface BaseWidgetConfig {
  widgetId: string;
  type: WidgetType;
  title: string;
  titleUk: string;
  size: WidgetSize;
  position: WidgetPosition;
  visible: boolean;
}

// ---------------------------------------------------------------------------
// Per-type discriminated union configs
// ---------------------------------------------------------------------------

export interface EventFeedWidgetConfig extends BaseWidgetConfig {
  type: "event-feed";
  maxItems: number;
  severityFilter?: number[];
  regionFilter?: string[];
}

export interface MiniMapWidgetConfig extends BaseWidgetConfig {
  type: "mini-map";
  centerLat: number;
  centerLng: number;
  zoom: number;
  layerIds?: string[];
}

export interface HeatmapWidgetConfig extends BaseWidgetConfig {
  type: "heatmap";
  metric: "event-density" | "danger-score" | "source-coverage";
  timeWindowHours: number;
  radius: number;
  regionCode?: string;
}

export interface TimeseriesWidgetConfig extends BaseWidgetConfig {
  type: "timeseries";
  seriesIds: string[];
  timeWindowDays: number;
  smoothing: boolean;
  yAxisLabel: string;
  yAxisLabelUk: string;
  showLegend: boolean;
}

export interface SeverityGaugeWidgetConfig extends BaseWidgetConfig {
  type: "severity-gauge";
  region: string;
  showTrend: boolean;
  showHistory: boolean;
}

export interface SankeyWidgetConfig extends BaseWidgetConfig {
  type: "sankey";
  flowType: "arms" | "supply-chain" | "financial" | "information" | "entities";
  maxNodes: number;
  timeWindowDays: number;
}

export interface SourceHealthWidgetConfig extends BaseWidgetConfig {
  type: "source-health";
  sourceIds?: string[];
  showLatency: boolean;
  showUptime: boolean;
}

export interface AiBriefWidgetConfig extends BaseWidgetConfig {
  type: "ai-brief";
  region?: string;
  tone: "neutral" | "analytical" | "concise";
  maxWords: number;
}

export interface AlertFeedWidgetConfig extends BaseWidgetConfig {
  type: "alert-feed";
  maxItems: number;
  orgId: string;
  severityMin: number;
}

export interface WatchlistWidgetConfig extends BaseWidgetConfig {
  type: "watchlist";
  entityIds?: string[];
  maxItems: number;
}

export interface KpiCounterWidgetConfig extends BaseWidgetConfig {
  type: "kpi-counter";
  metric: string;
  metricUk: string;
  compareWithPrevious: boolean;
  timeWindowDays: number;
}

export interface AnomalyWidgetConfig extends BaseWidgetConfig {
  type: "anomaly";
  sensitivity: "low" | "medium" | "high";
  region?: string;
  maxItems: number;
}

export interface CustomWidgetConfig extends BaseWidgetConfig {
  type: "custom";
  componentKey: string;
  props: Record<string, unknown>;
}

export interface NotebookCellWidgetConfig extends BaseWidgetConfig {
  type: "notebook-cell";
  notebookId: string;
  cellIndex: number;
  readOnly: boolean;
}

export interface TravelRiskWidgetConfig extends BaseWidgetConfig {
  type: "travel-risk";
  region: string;
  showAdvisories: boolean;
  showHistory: boolean;
}

// ---------------------------------------------------------------------------
// WidgetConfig — discriminated union of all types
// ---------------------------------------------------------------------------

export type WidgetConfig =
  | EventFeedWidgetConfig
  | MiniMapWidgetConfig
  | HeatmapWidgetConfig
  | TimeseriesWidgetConfig
  | SeverityGaugeWidgetConfig
  | SankeyWidgetConfig
  | SourceHealthWidgetConfig
  | AiBriefWidgetConfig
  | AlertFeedWidgetConfig
  | WatchlistWidgetConfig
  | KpiCounterWidgetConfig
  | AnomalyWidgetConfig
  | CustomWidgetConfig
  | NotebookCellWidgetConfig
  | TravelRiskWidgetConfig;

// ---------------------------------------------------------------------------
// WIDGET_DEFAULTS — sensible defaults for each WidgetType
// ---------------------------------------------------------------------------

export const WIDGET_DEFAULTS: Record<WidgetType, BaseWidgetConfig> = {
  "event-feed": {
    widgetId: "",
    type: "event-feed",
    title: "Event Feed",
    titleUk: "Стрічка подій",
    size: "medium",
    position: { col: 0, row: 0, colSpan: 4, rowSpan: 6 },
    visible: true,
  },
  "mini-map": {
    widgetId: "",
    type: "mini-map",
    title: "Mini Map",
    titleUk: "Міні-карта",
    size: "medium",
    position: { col: 4, row: 0, colSpan: 4, rowSpan: 6 },
    visible: true,
  },
  heatmap: {
    widgetId: "",
    type: "heatmap",
    title: "Heatmap",
    titleUk: "Теплова карта",
    size: "large",
    position: { col: 0, row: 0, colSpan: 8, rowSpan: 6 },
    visible: true,
  },
  timeseries: {
    widgetId: "",
    type: "timeseries",
    title: "Time Series",
    titleUk: "Часовий ряд",
    size: "large",
    position: { col: 0, row: 6, colSpan: 8, rowSpan: 4 },
    visible: true,
  },
  "severity-gauge": {
    widgetId: "",
    type: "severity-gauge",
    title: "Severity Gauge",
    titleUk: "Шкала небезпеки",
    size: "small",
    position: { col: 8, row: 0, colSpan: 2, rowSpan: 3 },
    visible: true,
  },
  sankey: {
    widgetId: "",
    type: "sankey",
    title: "Flow Diagram",
    titleUk: "Діаграма потоків",
    size: "large",
    position: { col: 0, row: 10, colSpan: 8, rowSpan: 5 },
    visible: true,
  },
  "source-health": {
    widgetId: "",
    type: "source-health",
    title: "Source Health",
    titleUk: "Стан джерел",
    size: "small",
    position: { col: 8, row: 3, colSpan: 2, rowSpan: 3 },
    visible: true,
  },
  "ai-brief": {
    widgetId: "",
    type: "ai-brief",
    title: "AI Brief",
    titleUk: "AI-зведення",
    size: "medium",
    position: { col: 0, row: 0, colSpan: 4, rowSpan: 4 },
    visible: true,
  },
  "alert-feed": {
    widgetId: "",
    type: "alert-feed",
    title: "Alert Feed",
    titleUk: "Стрічка сповіщень",
    size: "medium",
    position: { col: 4, row: 6, colSpan: 4, rowSpan: 4 },
    visible: true,
  },
  watchlist: {
    widgetId: "",
    type: "watchlist",
    title: "Watchlist",
    titleUk: "Список спостереження",
    size: "medium",
    position: { col: 8, row: 6, colSpan: 2, rowSpan: 4 },
    visible: true,
  },
  "kpi-counter": {
    widgetId: "",
    type: "kpi-counter",
    title: "KPI Counter",
    titleUk: "Лічильник KPI",
    size: "small",
    position: { col: 8, row: 0, colSpan: 2, rowSpan: 2 },
    visible: true,
  },
  anomaly: {
    widgetId: "",
    type: "anomaly",
    title: "Anomaly Detector",
    titleUk: "Детектор аномалій",
    size: "medium",
    position: { col: 0, row: 10, colSpan: 4, rowSpan: 4 },
    visible: true,
  },
  custom: {
    widgetId: "",
    type: "custom",
    title: "Custom Widget",
    titleUk: "Кастомний віджет",
    size: "medium",
    position: { col: 0, row: 0, colSpan: 4, rowSpan: 4 },
    visible: true,
  },
  "notebook-cell": {
    widgetId: "",
    type: "notebook-cell",
    title: "Notebook Cell",
    titleUk: "Комірка блокнота",
    size: "large",
    position: { col: 0, row: 0, colSpan: 8, rowSpan: 6 },
    visible: true,
  },
  "travel-risk": {
    widgetId: "",
    type: "travel-risk",
    title: "Travel Risk",
    titleUk: "Ризики подорожей",
    size: "small",
    position: { col: 8, row: 0, colSpan: 2, rowSpan: 3 },
    visible: true,
  },
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Get default BaseWidgetConfig for a given WidgetType.
 * Повертає налаштування BaseWidgetConfig за замовчуванням для заданого WidgetType.
 */
export function getWidgetDefaults(type: WidgetType): BaseWidgetConfig {
  return { ...WIDGET_DEFAULTS[type] };
}
