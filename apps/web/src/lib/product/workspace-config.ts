/**
 * Workspace Config — Mapbox + deck.gl map workspace with 6 core layers.
 *
 * Defines the layer model, default viewport, and workspace settings
 * for the interactive conflict intelligence map.
 *
 * Конфігурація робочого простору: 6 базових шарів на Mapbox + deck.gl.
 */

'use server';

// ── Core layers ───────────────────────────────────────────────────────────────

/**
 * The six core map layers available in every workspace.
 *
 * Шість базових шарів карти, доступних у кожному робочому просторі.
 */
export enum CoreLayer {
  Events     = 'events',
  Entities   = 'entities',
  Heatmap    = 'heatmap',
  Trajectory = 'trajectory',
  Aoi        = 'aoi',
  Satellite  = 'satellite',
}

// ── Layer metadata ────────────────────────────────────────────────────────────

export interface LayerMeta {
  id: CoreLayer;
  /** Display name — Відображувана назва */
  name: string;
  /** deck.gl layer class — Клас шару deck.gl */
  deckLayerClass: string;
  /** Whether enabled by default — Увімкнено за замовчуванням */
  defaultEnabled: boolean;
  /** Minimum zoom to render — Мін. zoom для відображення */
  minZoom: number;
  /** Tier required to enable — Tier, необхідний для активації */
  requiredTier: string;
}

export const CORE_LAYER_META: Record<CoreLayer, LayerMeta> = {
  [CoreLayer.Events]: {
    id: CoreLayer.Events,
    name: 'Verified Events',
    deckLayerClass: 'ScatterplotLayer',
    defaultEnabled: true,
    minZoom: 4,
    requiredTier: 'free',
  },
  [CoreLayer.Entities]: {
    id: CoreLayer.Entities,
    name: 'Named Entities',
    deckLayerClass: 'IconLayer',
    defaultEnabled: true,
    minZoom: 6,
    requiredTier: 'observer',
  },
  [CoreLayer.Heatmap]: {
    id: CoreLayer.Heatmap,
    name: 'Activity Heatmap',
    deckLayerClass: 'HeatmapLayer',
    defaultEnabled: false,
    minZoom: 4,
    requiredTier: 'free',
  },
  [CoreLayer.Trajectory]: {
    id: CoreLayer.Trajectory,
    name: 'Trajectory Paths',
    deckLayerClass: 'TripsLayer',
    defaultEnabled: false,
    minZoom: 7,
    requiredTier: 'pro',
  },
  [CoreLayer.Aoi]: {
    id: CoreLayer.Aoi,
    name: 'Areas of Interest',
    deckLayerClass: 'GeoJsonLayer',
    defaultEnabled: true,
    minZoom: 5,
    requiredTier: 'observer',
  },
  [CoreLayer.Satellite]: {
    id: CoreLayer.Satellite,
    name: 'Satellite Imagery',
    deckLayerClass: 'BitmapLayer',
    defaultEnabled: false,
    minZoom: 8,
    requiredTier: 'pro',
  },
};

export const WORKSPACE_DEFAULT_LAYERS: CoreLayer[] = [
  CoreLayer.Events,
  CoreLayer.Heatmap,
  CoreLayer.Aoi,
];

// ── Workspace config ──────────────────────────────────────────────────────────

export interface WorkspaceConfig {
  mapboxStyle: string;
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  defaultLayers: CoreLayer[];
  layerMeta: Record<CoreLayer, LayerMeta>;
  /** Max saved workspaces per user — Макс. збережених просторів на користувача */
  maxSavedWorkspaces: number;
}

export const WORKSPACE_CONFIG: WorkspaceConfig = {
  mapboxStyle: 'mapbox://styles/mapbox/dark-v11',
  initialViewState: {
    longitude: 31.1656,
    latitude: 48.3794,
    zoom: 6,
    pitch: 0,
    bearing: 0,
  },
  defaultLayers: WORKSPACE_DEFAULT_LAYERS,
  layerMeta: CORE_LAYER_META,
  maxSavedWorkspaces: 10,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const WORKSPACE_NOTE_EN =
  'Default viewport centers on Ukraine. Layer visibility gated by tier. ' +
  'Custom layers (Phase 4 marketplace) share the same CoreLayer interface.';

export const WORKSPACE_NOTE_UK =
  'За замовчуванням вікно перегляду центроване на Україні. Видимість шарів обмежена тієм. ' +
  'Кастомні шари (маркетплейс Фази 4) використовують той самий інтерфейс CoreLayer.';
