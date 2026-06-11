/**
 * deck.gl layer configuration for Aegis Lens map overlays.
 * Конфігурація шарів deck.gl для картографічних оверлеїв Aegis Lens.
 *
 * Integration: import @deck.gl/mapbox (npm install @deck.gl/mapbox @deck.gl/layers)
 * and mount a DeckGL instance with interleaved: true on the Mapbox/MapLibre map.
 *
 * Environment variable controlling Mapbox GL swap:
 *   NEXT_PUBLIC_MAPBOX_TOKEN — when set, Mapbox GL JS is used; otherwise MapLibre.
 */

// ── Layer type union ──────────────────────────────────────────────────────────

export type DeckGLLayerType =
  | 'heatmap'
  | 'arc'
  | 'line'
  | 'scatterplot'
  | 'column'
  | 'geojson'
  | 'tile'
  | 'trips';

// ── Core config interface ─────────────────────────────────────────────────────

export interface DeckGLLayerConfig {
  /** Unique identifier for the layer. */
  layerId: string;
  type: DeckGLLayerType;
  visible: boolean;
  /** Opacity 0–1. */
  opacity: number;
  /** GeoJSON URL, tile URL template, or inline data reference. */
  data?: string;
  /** Additional deck.gl layer props (passed through to the constructor). */
  extraProps?: Record<string, unknown>;
}

// ── Per-type defaults ─────────────────────────────────────────────────────────

export const DECKGL_LAYER_DEFAULTS: Record<DeckGLLayerType, Partial<DeckGLLayerConfig>> = {
  heatmap: {
    type: 'heatmap',
    visible: true,
    opacity: 0.8,
  },
  arc: {
    type: 'arc',
    visible: true,
    opacity: 0.7,
  },
  line: {
    type: 'line',
    visible: true,
    opacity: 0.85,
  },
  scatterplot: {
    type: 'scatterplot',
    visible: true,
    opacity: 0.9,
  },
  column: {
    type: 'column',
    visible: true,
    opacity: 0.8,
  },
  geojson: {
    type: 'geojson',
    visible: true,
    opacity: 0.75,
  },
  tile: {
    type: 'tile',
    visible: true,
    opacity: 1.0,
  },
  trips: {
    type: 'trips',
    visible: true,
    opacity: 0.85,
  },
};

// ── Builder functions ─────────────────────────────────────────────────────────

/**
 * Build a HeatmapLayer config for density visualisation.
 * Побудова конфігурації HeatmapLayer для візуалізації щільності.
 *
 * @param sourceUrl  GeoJSON endpoint or static file URL
 * @param radiusPixels  Kernel radius in pixels (default 40)
 */
export function buildDeckGLHeatmapConfig(
  sourceUrl: string,
  radiusPixels = 40,
): DeckGLLayerConfig {
  return {
    ...DECKGL_LAYER_DEFAULTS.heatmap,
    layerId: `deckgl-heatmap-${Date.now()}`,
    type: 'heatmap',
    visible: true,
    opacity: 0.8,
    data: sourceUrl,
    extraProps: {
      radiusPixels,
      intensity: 1,
      threshold: 0.05,
      colorRange: [
        [0, 25, 0, 25],
        [0, 85, 0, 85],
        [0, 127, 0, 127],
        [200, 200, 0, 200],
        [255, 140, 0, 230],
        [255, 0, 0, 255],
      ],
    },
  };
}

/**
 * Build an ArcLayer config for great-circle trajectory arcs.
 * Побудова конфігурації ArcLayer для дуг великих кіл (траєкторії).
 *
 * @param sourceUrl  GeoJSON or JSON endpoint with {fromLat, fromLng, toLat, toLng} features
 */
export function buildDeckGLArcConfig(sourceUrl: string): DeckGLLayerConfig {
  return {
    ...DECKGL_LAYER_DEFAULTS.arc,
    layerId: `deckgl-arc-${Date.now()}`,
    type: 'arc',
    visible: true,
    opacity: 0.7,
    data: sourceUrl,
    extraProps: {
      getSourcePosition: (d: Record<string, number>) => [d['fromLng'], d['fromLat']],
      getTargetPosition: (d: Record<string, number>) => [d['toLng'], d['toLat']],
      getSourceColor: [255, 140, 0],
      getTargetColor: [220, 38, 38],
      widthScale: 2,
      greatCircle: true,
    },
  };
}

/**
 * Build a ColumnLayer config for 3D extrusion (damage / outage intensity).
 * Побудова конфігурації ColumnLayer для 3D-екструзій (збитки / інтенсивність відключень).
 *
 * @param sourceUrl  GeoJSON endpoint with {lat, lng, intensity} properties
 */
export function buildDeckGLColumnConfig(sourceUrl: string): DeckGLLayerConfig {
  return {
    ...DECKGL_LAYER_DEFAULTS.column,
    layerId: `deckgl-column-${Date.now()}`,
    type: 'column',
    visible: true,
    opacity: 0.8,
    data: sourceUrl,
    extraProps: {
      diskResolution: 12,
      radius: 250,
      extruded: true,
      getPosition: (d: Record<string, number>) => [d['lng'], d['lat']],
      getElevation: (d: Record<string, number>) => (d['intensity'] ?? 0) * 2,
      getFillColor: (d: Record<string, number>) => {
        const v = d['intensity'] ?? 0;
        return [255, Math.round(255 * (1 - v / 100)), 0, 200];
      },
    },
  };
}

// ── Integration constant ──────────────────────────────────────────────────────

/** Name of the env var that enables Mapbox GL JS (instead of MapLibre). */
export const MAPBOX_TOKEN_ENV = 'NEXT_PUBLIC_MAPBOX_TOKEN';

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const DECKGL_NOTES_EN: Record<string, string> = {
  'requires-@deck.gl/mapbox-npm':
    'Install @deck.gl/mapbox and @deck.gl/layers via npm. ' +
    'Use DeckGL with interleaved:true to composite layers between Mapbox GL JS base layers.',
  'WebGL2-required':
    'deck.gl requires a WebGL 2.0-capable browser. ' +
    'Check navigator.userAgent + WEBGL_debug_renderer_info before enabling on mobile.',
  'fallback-canvas-heatmap':
    'If WebGL2 is unavailable, fall back to the existing canvas-radial-gradient HeatmapLayer ' +
    '(Sprint 2.59). Gate with typeof WebGL2RenderingContext !== "undefined".',
  'performance-tip-iconlayer-over-htmlmarker':
    'Prefer deck.gl IconLayer over HTML markers for >5 000 simultaneous points. ' +
    'IconLayer renders the entire sprite atlas in one WebGL draw call.',
};

export const DECKGL_NOTES_UK: Record<string, string> = {
  'requires-@deck.gl/mapbox-npm':
    'Встановіть @deck.gl/mapbox та @deck.gl/layers через npm. ' +
    'Використовуйте DeckGL з interleaved:true для накладання шарів між базовими шарами Mapbox GL JS.',
  'WebGL2-required':
    'deck.gl потребує браузер із підтримкою WebGL 2.0. ' +
    'Перевіряйте navigator.userAgent + WEBGL_debug_renderer_info перед увімкненням на мобільних.',
  'fallback-canvas-heatmap':
    'Якщо WebGL2 недоступний, використовуйте канвас-HeatmapLayer з радіальними градієнтами ' +
    '(Sprint 2.59). Перевіряйте typeof WebGL2RenderingContext !== "undefined".',
  'performance-tip-iconlayer-over-htmlmarker':
    'Надавайте перевагу deck.gl IconLayer замість HTML-маркерів при >5 000 точок одночасно. ' +
    'IconLayer рендерить весь спрайт-атлас одним викликом WebGL draw call.',
};
