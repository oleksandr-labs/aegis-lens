/**
 * Time-series chart widget — data model and config builder for multi-series charts.
 * Віджет часового ряду — модель даних і будівник конфігурації для багатосерійних графіків.
 *
 * NOTE (EN): Each series carries both EN and UK name fields for bilingual axis/legend labels.
 * NOTE (UK): Кожна серія містить поля name (EN) та nameUk (UK) для двомовних підписів осей/легенди.
 *
 * NOTE (EN): annotations pin arbitrary ISO timestamps with a label — useful for flagging events on the chart.
 * NOTE (UK): annotations прив'язують довільні ISO-мітки часу з підписом — зручно для позначення подій на графіку.
 *
 * NOTE (EN): smoothing applies a simple moving-average; disable for real-time feeds to avoid lag.
 * NOTE (UK): smoothing застосовує просте ковзне середнє; вимикайте для потоків реального часу, щоб уникнути затримки.
 */

// ---------------------------------------------------------------------------
// TimeseriesDataPoint
// ---------------------------------------------------------------------------

export interface TimeseriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

// ---------------------------------------------------------------------------
// TimeseriesSeries
// ---------------------------------------------------------------------------

export interface TimeseriesSeries {
  seriesId: string;
  name: string;
  nameUk: string;
  color: string;
  data: TimeseriesDataPoint[];
}

// ---------------------------------------------------------------------------
// TimeseriesWidgetConfig (display options, not the grid config)
// ---------------------------------------------------------------------------

export interface TimeseriesDisplayConfig {
  series: TimeseriesSeries[];
  xAxisLabel: string;
  xAxisLabelUk: string;
  yAxisLabel: string;
  yAxisLabelUk: string;
  showLegend: boolean;
  smoothing: boolean;
  annotations?: { at: string; label: string }[];
}

// ---------------------------------------------------------------------------
// buildTimeseriesConfig
// ---------------------------------------------------------------------------

/**
 * Build a TimeseriesDisplayConfig from raw series data and overrides.
 * Будує TimeseriesDisplayConfig з необроблених даних серій та перевизначень.
 */
export function buildTimeseriesConfig(
  series: TimeseriesSeries[],
  options: Partial<Omit<TimeseriesDisplayConfig, "series">> = {},
): TimeseriesDisplayConfig {
  return {
    series,
    xAxisLabel:    options.xAxisLabel    ?? "Time",
    xAxisLabelUk:  options.xAxisLabelUk  ?? "Час",
    yAxisLabel:    options.yAxisLabel    ?? "Value",
    yAxisLabelUk:  options.yAxisLabelUk  ?? "Значення",
    showLegend:    options.showLegend    ?? true,
    smoothing:     options.smoothing     ?? false,
    annotations:   options.annotations  ?? [],
  };
}

// ---------------------------------------------------------------------------
// DEFAULT_SERIES_COLORS
// ---------------------------------------------------------------------------

/**
 * Default color palette for up to 8 series.
 * Типова кольорова палітра для до 8 серій.
 */
export const DEFAULT_SERIES_COLORS: string[] = [
  "#0066cc",
  "#ff4400",
  "#00aa55",
  "#ffaa00",
  "#9900cc",
  "#00aacc",
  "#cc0044",
  "#888888",
];
