/**
 * 3D fill-extrusion layer configuration for damage and outage intensity.
 * Конфігурація 3D fill-extrusion шарів для інтенсивності збитків та відключень.
 *
 * Requires Mapbox GL JS or MapLibre GL JS with 3D terrain support.
 * Recommended map pitch: 60°. Requires WebGL 2.0.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExtrusionDataPoint {
  lat: number;
  lng: number;
  /** Intensity 0–100. Drives extrusion height. */
  intensity: number;
  category: 'damage' | 'outage' | 'activity' | 'density';
}

export interface ExtrusionLayerConfig {
  layerId: string;
  /** Base height in Mapbox GL metres (usually 0). */
  baseHeight: number;
  /** Maximum extrusion height in Mapbox GL metres when intensity = 100. */
  maxHeight: number;
  /** Color stops: [[intensity_fraction, hex_color], ...] ordered 0→1. */
  colorStops: [number, string][];
  /** Fill-extrusion opacity 0–1. */
  opacity: number;
}

// ── Pre-defined configs ───────────────────────────────────────────────────────

/** 3D extrusion for infrastructure damage — red gradient, max 200m. */
export const DAMAGE_EXTRUSION_CONFIG: ExtrusionLayerConfig = {
  layerId: 'damage-extrusion',
  baseHeight: 0,
  maxHeight: 200,
  colorStops: [
    [0, '#fde68a'],
    [0.25, '#f59e0b'],
    [0.5, '#ef4444'],
    [0.75, '#b91c1c'],
    [1, '#7f1d1d'],
  ],
  opacity: 0.8,
};

/** 3D extrusion for power / communication outages — blue gradient, max 150m. */
export const OUTAGE_EXTRUSION_CONFIG: ExtrusionLayerConfig = {
  layerId: 'outage-extrusion',
  baseHeight: 0,
  maxHeight: 150,
  colorStops: [
    [0, '#dbeafe'],
    [0.25, '#60a5fa'],
    [0.5, '#2563eb'],
    [0.75, '#1e40af'],
    [1, '#1e3a8a'],
  ],
  opacity: 0.75,
};

// ── Paint spec builder ────────────────────────────────────────────────────────

/**
 * Generate a Mapbox GL JS fill-extrusion paint spec from an ExtrusionLayerConfig.
 * Генерує paint-специфікацію Mapbox GL JS fill-extrusion з ExtrusionLayerConfig.
 *
 * The produced spec assumes GeoJSON features with a numeric `intensity` property (0–100).
 */
export function buildExtrusionPaintSpec(
  config: ExtrusionLayerConfig,
): Record<string, unknown> {
  // Build interpolate expression for height
  const heightExpression: unknown[] = [
    'interpolate',
    ['linear'],
    ['get', 'intensity'],
  ];
  heightExpression.push(0, config.baseHeight);
  heightExpression.push(100, config.maxHeight);

  // Build interpolate expression for color
  const colorExpression: unknown[] = [
    'interpolate',
    ['linear'],
    ['get', 'intensity'],
  ];
  for (const [stop, color] of config.colorStops) {
    colorExpression.push(stop * 100, color);
  }

  return {
    'fill-extrusion-height': heightExpression,
    'fill-extrusion-base': config.baseHeight,
    'fill-extrusion-color': colorExpression,
    'fill-extrusion-opacity': config.opacity,
  };
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const EXTRUSION_NOTES_EN: Record<string, string> = {
  'WebGL2-required':
    'fill-extrusion layers require WebGL 2.0. ' +
    'Detect support with typeof WebGL2RenderingContext !== "undefined" before enabling.',
  'pitch-60deg-recommended':
    'Set the map pitch to 60° (map.setPitch(60)) for optimal 3D extrusion readability. ' +
    'Add a compass control so analysts can re-orient the view.',
};

export const EXTRUSION_NOTES_UK: Record<string, string> = {
  'WebGL2-required':
    'Шари fill-extrusion потребують WebGL 2.0. ' +
    'Перевіряйте підтримку через typeof WebGL2RenderingContext !== "undefined" перед увімкненням.',
  'pitch-60deg-recommended':
    'Встановіть нахил карти 60° (map.setPitch(60)) для оптимальної читабельності 3D-екструзій. ' +
    'Додайте елемент керування компасом, щоб аналітики могли переорієнтувати вигляд.',
};
