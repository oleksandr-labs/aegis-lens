/**
 * Heatmap widget — data model and layer builder for geographic heat visualisation.
 * Віджет теплової карти — модель даних і будівник шару для географічної теплової візуалізації.
 *
 * NOTE (EN): Resolution — cell granularity is controlled by `radius`; smaller radius = finer grid.
 * NOTE (UK): Роздільна здатність — гранулярність комірки визначається `radius`; менший radius = більш детальна сітка.
 *
 * NOTE (EN): Density kernel — intensity values (0–1) should be pre-normalised server-side per time window.
 * NOTE (UK): Ядро щільності — значення інтенсивності (0–1) мають бути нормалізовані на сервері для кожного часового вікна.
 *
 * NOTE (EN): Temporal animation — timeWindow field supports ISO 8601 duration strings (e.g. "PT24H", "P7D").
 * NOTE (UK): Часова анімація — поле timeWindow підтримує рядки тривалості ISO 8601 (напр. "PT24H", "P7D").
 */

// ---------------------------------------------------------------------------
// HeatmapDataPoint
// ---------------------------------------------------------------------------

export interface HeatmapDataPoint {
  lat: number;
  lng: number;
  /** Normalised intensity value in range [0, 1] */
  intensity: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// HeatmapWidgetData
// ---------------------------------------------------------------------------

export interface HeatmapWidgetData {
  points: HeatmapDataPoint[];
  /** ISO 8601 duration string, e.g. "PT24H" or "P7D" */
  timeWindow: string;
  region?: string;
  metric: "event-density" | "danger-score" | "source-coverage";
}

// ---------------------------------------------------------------------------
// HEATMAP_COLOR_SCALE
// ---------------------------------------------------------------------------

/**
 * Color scale for heatmap rendering — maps normalised intensity (0–1) to hex colors.
 * Кольорова шкала для відображення теплової карти — відображає нормалізовану інтенсивність (0–1) у кольори hex.
 */
export const HEATMAP_COLOR_SCALE: Record<number, string> = {
  0:    "#003366", // deep navy — minimal / глибокий темно-синій — мінімальний
  0.25: "#0066cc", // blue — low / синій — низький
  0.5:  "#ffaa00", // amber — moderate / бурштиновий — помірний
  0.75: "#ff4400", // orange-red — high / оранжево-червоний — високий
  1.0:  "#cc0000", // dark red — critical / темно-червоний — критичний
};

// ---------------------------------------------------------------------------
// buildHeatmapLayer
// ---------------------------------------------------------------------------

export interface HeatmapLayerConfig {
  points: HeatmapDataPoint[];
  radius: number;
  maxIntensity: number;
  opacity: number;
  colorScale: Record<number, string>;
  metric: HeatmapWidgetData["metric"];
  timeWindow: string;
  region?: string;
}

/**
 * Build the render config for a heatmap layer from widget data.
 * Будує конфігурацію відображення шару теплової карти з даних віджета.
 *
 * @param data    - HeatmapWidgetData with points and metadata
 * @param radius  - Heatmap cell radius in pixels (default 25)
 * @param opacity - Layer opacity 0–1 (default 0.75)
 */
export function buildHeatmapLayer(
  data: HeatmapWidgetData,
  radius = 25,
  opacity = 0.75,
): HeatmapLayerConfig {
  const maxIntensity = data.points.reduce(
    (max, p) => (p.intensity > max ? p.intensity : max),
    0,
  );

  return {
    points: data.points,
    radius,
    maxIntensity: maxIntensity > 0 ? maxIntensity : 1,
    opacity,
    colorScale: HEATMAP_COLOR_SCALE,
    metric: data.metric,
    timeWindow: data.timeWindow,
    region: data.region,
  };
}
