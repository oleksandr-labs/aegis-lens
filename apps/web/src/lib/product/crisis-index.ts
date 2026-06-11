/**
 * Crisis Index — predictive per-country crisis severity score.
 *
 * Aggregates six weighted dimensions into a 0–100 crisis score, updated
 * daily for each tracked country. Phase 4 feature.
 *
 * Індекс кризи: 6 вимірів → оцінка 0–100 по країні. Оновлюється щодня.
 */

'use server';

// ── Dimensions ────────────────────────────────────────────────────────────────

/**
 * Six dimensions of the crisis index.
 *
 * Шість вимірів індексу кризи.
 */
export const CRISIS_INDEX_DIMENSIONS = [
  'conflict-intensity',
  'humanitarian-stress',
  'economic-fragility',
  'political-instability',
  'information-manipulation',
  'infrastructure-degradation',
] as const;

export type CrisisIndexDimension = typeof CRISIS_INDEX_DIMENSIONS[number];

// ── Country list ──────────────────────────────────────────────────────────────

/**
 * Twenty countries tracked in the initial Phase 4 release.
 *
 * Двадцять країн у першому релізі фази 4.
 */
export const CRISIS_INDEX_COUNTRIES = [
  'UA', 'RU', 'IL', 'PS', 'SY', 'IQ', 'YE',
  'SD', 'SS', 'ML', 'BF', 'NE', 'ET', 'SO',
  'MM', 'AF', 'HT', 'LY', 'CF', 'CD',
] as const;

export type CrisisIndexCountry = typeof CRISIS_INDEX_COUNTRIES[number];

// ── Dimension weights ─────────────────────────────────────────────────────────

export const CRISIS_INDEX_DIMENSION_WEIGHTS: Record<CrisisIndexDimension, number> = {
  'conflict-intensity':       0.30,
  'humanitarian-stress':      0.20,
  'economic-fragility':       0.15,
  'political-instability':    0.15,
  'information-manipulation': 0.10,
  'infrastructure-degradation': 0.10,
};

// ── Score interface ───────────────────────────────────────────────────────────

export interface CrisisIndexScore {
  countryCode: CrisisIndexCountry;
  date: string;
  /** Composite score 0–100 — Комплексна оцінка 0–100 */
  score: number;
  /** Per-dimension sub-scores — Оцінки по вимірах */
  dimensions: Record<CrisisIndexDimension, number>;
  /** 7-day trend direction — Напрямок тренду за 7 днів */
  trend: 'improving' | 'stable' | 'deteriorating';
  /** Confidence in this score 0–1 — Довіра до оцінки */
  confidence: number;
}

// ── Crisis index config ───────────────────────────────────────────────────────

export interface CrisisIndexConfig {
  dimensions: ReadonlyArray<CrisisIndexDimension>;
  dimensionWeights: Record<CrisisIndexDimension, number>;
  countries: ReadonlyArray<CrisisIndexCountry>;
  /** Update cadence in hours — Інтервал оновлення (год) */
  updateIntervalHours: number;
  /** Historical score retention in days — Зберігання оцінок (дні) */
  retentionDays: number;
  /** Required tier — Необхідний tier */
  requiredTier: string;
  /** Whether public API access is available — Чи доступний публічний API */
  publicApiAccess: boolean;
}

export const CRISIS_INDEX_CONFIG: CrisisIndexConfig = {
  dimensions: CRISIS_INDEX_DIMENSIONS,
  dimensionWeights: CRISIS_INDEX_DIMENSION_WEIGHTS,
  countries: CRISIS_INDEX_COUNTRIES,
  updateIntervalHours: 24,
  retentionDays: 730,
  requiredTier: 'pro',
  publicApiAccess: true,
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const CRISIS_INDEX_NOTE_EN =
  'The crisis index is a proprietary composite score. Dimension data is sourced ' +
  'from Aegis Lens event stream, ACLED, UNOCHA, and World Bank macro indicators.';

export const CRISIS_INDEX_NOTE_UK =
  'Індекс кризи — власна комплексна оцінка. Дані по вимірах надходять із ' +
  'потоку подій Aegis Lens, ACLED, UNOCHA та макропоказників Світового банку.';
