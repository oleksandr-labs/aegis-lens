/**
 * Arc / line layer configuration for trajectory and flow visualisation.
 * Конфігурація дугового / лінійного шару для візуалізації траєкторій та потоків.
 *
 * Uses deck.gl ArcLayer for great-circle paths. Pairs with deckgl-config.ts.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ArcDataPoint {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  /** Weight 0–1; drives arc width. */
  weight: number;
  label?: string;
  labelUk?: string;
}

export interface ArcLayerConfig {
  layerId: string;
  /** Arc opacity 0–1. */
  opacity: number;
  /** Multiplier applied to arc width (pixels per weight unit). */
  widthScale: number;
  /** RGB colour at arc source. */
  colorFrom: [number, number, number];
  /** RGB colour at arc target. */
  colorTo: [number, number, number];
}

// ── Pre-defined configs ───────────────────────────────────────────────────────

/** Missile / drone trajectory arcs — orange (launch) → red (impact). */
export const TRAJECTORY_ARC_CONFIG: ArcLayerConfig = {
  layerId: 'trajectory-arcs',
  opacity: 0.75,
  widthScale: 3,
  colorFrom: [249, 115, 22],   // orange-500
  colorTo: [220, 38, 38],     // red-600
};

/** Supply chain / information flow arcs — blue (source) → green (destination). */
export const FLOW_ARC_CONFIG: ArcLayerConfig = {
  layerId: 'flow-arcs',
  opacity: 0.65,
  widthScale: 2,
  colorFrom: [37, 99, 235],   // blue-600
  colorTo: [22, 163, 74],     // green-600
};

// ── deck.gl config builder ────────────────────────────────────────────────────

/**
 * Build a deck.gl-compatible ArcLayer constructor props object.
 * Побудова об'єкту props для конструктора ArcLayer deck.gl.
 *
 * Pass the returned object to: new ArcLayer(buildArcDeckGLConfig(arcs, config))
 */
export function buildArcDeckGLConfig(
  arcs: ArcDataPoint[],
  config: ArcLayerConfig,
): Record<string, unknown> {
  return {
    id: config.layerId,
    data: arcs,
    opacity: config.opacity,
    widthScale: config.widthScale,
    greatCircle: true,
    getSourcePosition: (d: ArcDataPoint) => [d.fromLng, d.fromLat],
    getTargetPosition: (d: ArcDataPoint) => [d.toLng, d.toLat],
    getSourceColor: config.colorFrom,
    getTargetColor: config.colorTo,
    getWidth: (d: ArcDataPoint) => d.weight * config.widthScale,
    pickable: true,
  };
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const ARC_LAYER_NOTES_EN: Record<string, string> = {
  'great-circle-paths':
    'ArcLayer uses great-circle interpolation (greatCircle: true) so trajectories ' +
    'curve correctly over long distances. Disable for short local paths (<100 km).',
  'supply-chain-and-trajectories':
    'TRAJECTORY_ARC_CONFIG is designed for missile/drone trajectories (launch→impact). ' +
    'FLOW_ARC_CONFIG is designed for supply chain, reinforcement, or information flow paths.',
};

export const ARC_LAYER_NOTES_UK: Record<string, string> = {
  'great-circle-paths':
    'ArcLayer використовує інтерполяцію великого кола (greatCircle: true), тому траєкторії ' +
    'коректно вигинаються на великих відстанях. Вимикайте для коротких локальних маршрутів (<100 км).',
  'supply-chain-and-trajectories':
    'TRAJECTORY_ARC_CONFIG призначений для траєкторій ракет/дронів (запуск→ціль). ' +
    'FLOW_ARC_CONFIG призначений для шляхів постачання, підкріплень або інформаційних потоків.',
};
