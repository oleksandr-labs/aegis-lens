/**
 * Per-layer legend and confidence scale definitions.
 * Визначення легенди та шкали довіри для кожного шару.
 *
 * Each layer should expose a LayerLegend so the UI can render a colour key
 * and confidence scale dynamically. Confidence is always shown.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LayerLegendEntry {
  /** Numeric or string value this entry represents. */
  value: number | string;
  /** Hex colour for the swatch. */
  color: string;
  label: string;
  labelUk: string;
}

export interface LayerLegend {
  layerId: string;
  title: string;
  titleUk: string;
  entries: LayerLegendEntry[];
  /** Whether to also render the confidence scale below the layer legend. */
  showConfidenceScale: boolean;
}

// ── Confidence scale ──────────────────────────────────────────────────────────

/**
 * Universal confidence scale legend — shown on all layers.
 * Універсальна шкала довіри — показується для всіх шарів.
 */
export const CONFIDENCE_SCALE_LEGEND: LayerLegend = {
  layerId: '__confidence__',
  title: 'Confidence',
  titleUk: 'Рівень довіри',
  showConfidenceScale: false, // the scale IS the legend; no nested recursion
  entries: [
    { value: '0–20%',  color: '#e5e7eb', label: 'Very Low',   labelUk: 'Дуже низький' },
    { value: '20–40%', color: '#9ca3af', label: 'Low',         labelUk: 'Низький' },
    { value: '40–60%', color: '#6b7280', label: 'Moderate',   labelUk: 'Помірний' },
    { value: '60–80%', color: '#374151', label: 'High',        labelUk: 'Високий' },
    { value: '80–100%',color: '#111827', label: 'Very High',   labelUk: 'Дуже високий' },
  ],
};

// ── Danger score legend ───────────────────────────────────────────────────────

/**
 * Danger score legend (0–100 scale).
 * Легенда показника небезпеки (шкала 0–100).
 */
export const DANGER_SCORE_LEGEND: LayerLegend = {
  layerId: '__danger_score__',
  title: 'Danger Score',
  titleUk: 'Показник небезпеки',
  showConfidenceScale: true,
  entries: [
    { value: '0–20',  color: '#9ca3af', label: 'Minimal',   labelUk: 'Мінімальний' },
    { value: '20–40', color: '#f59e0b', label: 'Low',        labelUk: 'Низький' },
    { value: '40–60', color: '#f97316', label: 'Moderate',   labelUk: 'Помірний' },
    { value: '60–80', color: '#ef4444', label: 'High',       labelUk: 'Високий' },
    { value: '80–100',color: '#7f1d1d', label: 'Critical',   labelUk: 'Критичний' },
  ],
};

// ── Layer-specific legends registry ──────────────────────────────────────────

const LAYER_LEGENDS: LayerLegend[] = [
  CONFIDENCE_SCALE_LEGEND,
  DANGER_SCORE_LEGEND,
  {
    layerId: 'events',
    title: 'Event Class',
    titleUk: 'Клас події',
    showConfidenceScale: true,
    entries: [
      { value: 'drone',                color: '#f59e0b', label: 'Drone',                  labelUk: 'Дрон' },
      { value: 'missile',              color: '#ef4444', label: 'Missile',                labelUk: 'Ракета' },
      { value: 'airstrike',            color: '#dc2626', label: 'Airstrike',              labelUk: 'Авіаудар' },
      { value: 'artillery',            color: '#f97316', label: 'Artillery',              labelUk: 'Артилерія' },
      { value: 'infrastructure_damage',color: '#8b5cf6', label: 'Infrastructure Damage',  labelUk: 'Пошкодження інфраструктури' },
      { value: 'power_outage',         color: '#eab308', label: 'Power Outage',           labelUk: 'Відключення електроенергії' },
    ],
  },
  {
    layerId: 'damage-extrusion',
    title: 'Damage Intensity',
    titleUk: 'Інтенсивність збитків',
    showConfidenceScale: true,
    entries: [
      { value: '0–25',  color: '#fde68a', label: 'Minor',    labelUk: 'Незначний' },
      { value: '25–50', color: '#f59e0b', label: 'Moderate', labelUk: 'Помірний' },
      { value: '50–75', color: '#ef4444', label: 'Severe',   labelUk: 'Тяжкий' },
      { value: '75–100',color: '#7f1d1d', label: 'Destroyed',labelUk: 'Зруйновано' },
    ],
  },
];

// ── Lookup helper ─────────────────────────────────────────────────────────────

/**
 * Return the legend config for a given layer ID, or undefined if not registered.
 * Повернути конфіг легенди для вказаного ID шару або undefined якщо не зареєстровано.
 */
export function getLegendForLayer(layerId: string): LayerLegend | undefined {
  return LAYER_LEGENDS.find((l) => l.layerId === layerId);
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const LAYER_LEGEND_NOTES_EN: Record<string, string> = {
  'per-layer-configurable':
    'Add new entries to LAYER_LEGENDS to register a legend for any layer ID. ' +
    'The map layer panel reads getLegendForLayer() to render the colour swatch.',
  'confidence-always-shown':
    'The confidence scale is shown on every layer that has showConfidenceScale: true. ' +
    'Renders below the layer-specific legend as a universal reliability indicator.',
};

export const LAYER_LEGEND_NOTES_UK: Record<string, string> = {
  'per-layer-configurable':
    'Додайте нові записи до LAYER_LEGENDS для реєстрації легенди для будь-якого ID шару. ' +
    'Панель шарів карти зчитує getLegendForLayer() для рендерингу кольорового зразка.',
  'confidence-always-shown':
    'Шкала довіри відображається для кожного шару, де showConfidenceScale: true. ' +
    'Рендериться під шаро-специфічною легендою як універсальний індикатор надійності.',
};
