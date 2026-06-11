/**
 * Memory cap and cluster degradation strategy for large feature sets.
 * Обмеження пам'яті та стратегія деградації кластеризації для великих наборів об'єктів.
 *
 * When the number of visible features exceeds thresholds, the renderer
 * switches to progressively coarser cluster radii and may evict features
 * to stay within the WebGL buffer budget.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type FeatureEvictionStrategy =
  | 'oldest'
  | 'lowest-severity'
  | 'outside-viewport';

export interface MemoryCapConfig {
  /** Hard cap on simultaneously visible features. Exceeding triggers eviction. */
  maxVisibleFeatures: number;
  /** Feature count at which cluster radius starts increasing. */
  clusterDegradationThreshold: number;
  /** Base cluster radius in pixels (at or below threshold). */
  clusterRadius: number;
  /** Which features to evict when maxVisibleFeatures is exceeded. */
  featureEvictionStrategy: FeatureEvictionStrategy;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

/**
 * Default memory cap configuration.
 * Конфігурація обмеження пам'яті за замовчуванням.
 *
 * Tuned for a mid-range GPU (GTX 1060 / RX 580 class).
 * Reduce maxVisibleFeatures to 20 000 for mobile / low-end devices.
 */
export const MEMORY_CAP_DEFAULTS: MemoryCapConfig = {
  maxVisibleFeatures: 50_000,
  clusterDegradationThreshold: 10_000,
  clusterRadius: 80,
  featureEvictionStrategy: 'outside-viewport',
};

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Compute the cluster radius for a given feature count.
 * Обчислення радіусу кластеризації для заданої кількості об'єктів.
 *
 * Radius increases linearly from config.clusterRadius at threshold
 * to 3× config.clusterRadius at maxVisibleFeatures.
 */
export function computeClusterRadius(
  featureCount: number,
  config: MemoryCapConfig = MEMORY_CAP_DEFAULTS,
): number {
  if (featureCount <= config.clusterDegradationThreshold) {
    return config.clusterRadius;
  }
  const range = config.maxVisibleFeatures - config.clusterDegradationThreshold;
  if (range <= 0) return config.clusterRadius * 3;
  const excess = Math.min(featureCount - config.clusterDegradationThreshold, range);
  const scale = 1 + (2 * excess) / range; // 1× → 3×
  return Math.round(config.clusterRadius * scale);
}

/**
 * True when the feature count exceeds the degradation threshold.
 * True, коли кількість об'єктів перевищує поріг деградації.
 */
export function shouldDegrade(
  featureCount: number,
  config: MemoryCapConfig = MEMORY_CAP_DEFAULTS,
): boolean {
  return featureCount > config.clusterDegradationThreshold;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const MEMORY_CAP_NOTES_EN: Record<string, string> = {
  'benchmark-on-low-end-device':
    'Always benchmark memory cap thresholds on the lowest-end target device. ' +
    'A 5-year-old laptop or mid-range Android phone is the baseline; ' +
    'reduce maxVisibleFeatures to 15 000–20 000 for mobile builds.',
  'progressive-degradation':
    'Degradation is progressive: cluster radius grows linearly as feature count rises. ' +
    'At maxVisibleFeatures the eviction strategy kicks in to remove off-screen or low-severity features. ' +
    'Never hard-crash the renderer — always show a degraded but functional map.',
};

export const MEMORY_CAP_NOTES_UK: Record<string, string> = {
  'benchmark-on-low-end-device':
    'Завжди тестуйте пороги обмеження пам\'яті на найслабшому цільовому пристрої. ' +
    'Базою є 5-річний ноутбук або середній Android-телефон; ' +
    'зменшіть maxVisibleFeatures до 15 000–20 000 для мобільних збірок.',
  'progressive-degradation':
    'Деградація поступова: радіус кластеризації лінійно зростає зі збільшенням кількості об\'єктів. ' +
    'При maxVisibleFeatures спрацьовує стратегія виселення для видалення позаекранних або малозначущих об\'єктів. ' +
    'Ніколи не допускайте аварійного краша рендерера — завжди показуйте деградовану, але функціональну карту.',
};
