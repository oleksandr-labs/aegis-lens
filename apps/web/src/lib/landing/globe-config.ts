/**
 * Live Globe configuration for the landing page hero.
 * Uses deck.gl WebGL globe mode for real-time event visualisation.
 *
 * Конфігурація живої глобуси для секції hero на головній сторінці.
 * Використовує deck.gl WebGL globe mode для візуалізації подій у реальному часі.
 */

// ---------------------------------------------------------------------------
// Layer types
// ---------------------------------------------------------------------------

export type GlobeLayerType =
  | "events-scatter"
  | "conflict-arc"
  | "heatmap"
  | "atmosphere";

export interface GlobeLayerConfig {
  layerId: string;
  type: GlobeLayerType;
  visible: boolean;
  opacity: number;
}

// ---------------------------------------------------------------------------
// Globe config
// ---------------------------------------------------------------------------

export interface LiveGlobeConfig {
  /** Initial [lat, lng] centre — Ukraine */
  initialLatLng: [number, number];
  /** Camera altitude in km */
  initialAltitude: number;
  /** Degrees per second auto-rotation speed */
  rotationSpeed: number;
  autoRotate: boolean;
  layers: GlobeLayerConfig[];
  /** SSE / WebSocket URL for live event stream */
  eventStreamUrl: string;
}

export const LIVE_GLOBE_CONFIG: LiveGlobeConfig = {
  initialLatLng: [49.0, 32.0],
  initialAltitude: 2_500_000,
  rotationSpeed: 0.5,
  autoRotate: true,
  layers: [
    { layerId: "atmosphere",     type: "atmosphere",     visible: true,  opacity: 1.0  },
    { layerId: "event-heatmap",  type: "heatmap",        visible: true,  opacity: 0.6  },
    { layerId: "events-scatter", type: "events-scatter", visible: true,  opacity: 0.85 },
    { layerId: "conflict-arcs",  type: "conflict-arc",   visible: true,  opacity: 0.7  },
  ],
  eventStreamUrl: "/api/v1/events/stream",
};

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

/** Static fallback image when WebGL is unavailable */
export const GLOBE_FALLBACK_IMAGE = "/images/map-preview.jpg";

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const GLOBE_NOTES_EN: string[] = [
  "deck.gl-globe-mode-beta: globe rendering uses deck.gl GlobeView; enable via experimental flag until deck.gl ≥ 9.x ships stable globe mode.",
  "WebGL2-required: the live globe requires WebGL2 support; browsers without it receive the static fallback image defined in GLOBE_FALLBACK_IMAGE.",
  "fallback-static-map-image: when WebGL2 is unavailable or on mobile low-power mode, serve GLOBE_FALLBACK_IMAGE as a full-bleed hero background.",
  "performance-budget-2s-LCP: globe canvas must not block LCP — lazy-load the WebGL bundle after TTI; LCP element is the headline text, not the canvas.",
];

export const GLOBE_NOTES_UK: string[] = [
  "deck.gl-globe-mode-beta: рендеринг глобуси використовує deck.gl GlobeView; увімкнути через experimental flag до виходу стабільного globe mode у deck.gl ≥ 9.x.",
  "WebGL2-required: жива глобуса потребує підтримки WebGL2; браузери без неї отримують статичне зображення-замінник, визначене у GLOBE_FALLBACK_IMAGE.",
  "fallback-static-map-image: коли WebGL2 недоступний або у режимі Low Power на мобільних, відобразити GLOBE_FALLBACK_IMAGE як фон секції hero.",
  "performance-budget-2s-LCP: canvas глобуси не повинен блокувати LCP — ліниво завантажувати WebGL bundle після TTI; елементом LCP є заголовок, а не canvas.",
];
