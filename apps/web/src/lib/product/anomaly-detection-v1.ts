/**
 * Anomaly Detection v1 — statistical anomaly types and threshold config.
 *
 * Detects unusual patterns in the event stream that may indicate escalation,
 * disinformation operations, or sensor outages.
 *
 * Статистичне виявлення аномалій у потоці подій.
 */

'use server';

// ── Anomaly types ─────────────────────────────────────────────────────────────

/**
 * Five core anomaly types monitored in Phase 2.
 *
 * П'ять типів аномалій, що моніторяться у фазі 2.
 */
export type AnomalyType =
  | 'event-spike'
  | 'source-silence'
  | 'narrative-shift'
  | 'geo-cluster'
  | 'entity-surge';

export const ANOMALY_TYPES: AnomalyType[] = [
  'event-spike',
  'source-silence',
  'narrative-shift',
  'geo-cluster',
  'entity-surge',
];

// ── Thresholds ────────────────────────────────────────────────────────────────

/**
 * Detection thresholds per anomaly type.
 * Values are z-score multipliers or ratio thresholds depending on the detector.
 *
 * Пороги виявлення. Значення — множники z-score або відношення залежно від детектора.
 */
export const ANOMALY_DETECTION_THRESHOLDS: Record<AnomalyType, number> = {
  'event-spike':      3.0,  // z-score: 3 standard deviations above rolling mean
  'source-silence':   0.1,  // ratio: source produces < 10% of its baseline volume
  'narrative-shift':  0.4,  // cosine distance > 0.4 vs 7-day topic embedding centroid
  'geo-cluster':      2.5,  // z-score: spatial density > 2.5 SD in 50km radius
  'entity-surge':     4.0,  // z-score: entity mention frequency > 4 SD in 1h window
};

// ── Detection window ──────────────────────────────────────────────────────────

export const ANOMALY_ROLLING_WINDOW_HOURS = 24;
export const ANOMALY_BASELINE_DAYS = 7;
export const ANOMALY_CHECK_INTERVAL_MINUTES = 5;

// ── Anomaly config ────────────────────────────────────────────────────────────

export interface AnomalyDetectionConfig {
  thresholds: Record<AnomalyType, number>;
  /** Rolling window for short-term statistics — Вікно для короткострокової статистики */
  rollingWindowHours: number;
  /** Baseline window for normal distribution estimation — Базовий період */
  baselineDays: number;
  /** How often to run detection — Інтервал запуску (хв) */
  checkIntervalMinutes: number;
  /** Whether to auto-create alerts on anomaly — Авто-алерт при аномалії */
  autoAlert: boolean;
  /** Minimum event volume to run detection — Мін. обсяг подій для запуску */
  minEventVolume: number;
}

export const ANOMALY_DETECTION_CONFIG: AnomalyDetectionConfig = {
  thresholds: ANOMALY_DETECTION_THRESHOLDS,
  rollingWindowHours: ANOMALY_ROLLING_WINDOW_HOURS,
  baselineDays: ANOMALY_BASELINE_DAYS,
  checkIntervalMinutes: ANOMALY_CHECK_INTERVAL_MINUTES,
  autoAlert: true,
  minEventVolume: 10,
};

// ── Anomaly record ────────────────────────────────────────────────────────────

export interface AnomalyRecord {
  id: string;
  type: AnomalyType;
  detectedAt: string;
  /** Measured score vs threshold — Виміряний показник */
  score: number;
  threshold: number;
  /** Human-readable description — Опис */
  description: string;
  /** Related event IDs — Пов'язані події */
  relatedEventIds: string[];
  /** Whether an alert was fired — Чи спрацював алерт */
  alertFired: boolean;
}
