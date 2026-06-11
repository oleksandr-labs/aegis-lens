/**
 * Trend Forecasting v1 — event-volume and danger-score forecasting.
 *
 * Phase 3 feature providing short-to-medium term forecasts using classical
 * time-series (ARIMA), deep learning (LSTM), and meta-learner (Prophet) models.
 *
 * Прогнозування трендів v1: ARIMA + LSTM + Prophet для фази 3.
 */

'use server';

// ── Horizons ──────────────────────────────────────────────────────────────────

export type ForecastHorizon = '24h' | '7d' | '30d' | '90d';

export const FORECAST_HORIZONS: ForecastHorizon[] = ['24h', '7d', '30d', '90d'];

// ── Models ────────────────────────────────────────────────────────────────────

export type ForecastModel = 'ARIMA' | 'LSTM' | 'prophet';

export const FORECAST_MODELS: ForecastModel[] = ['ARIMA', 'LSTM', 'prophet'];

// ── Model specs ───────────────────────────────────────────────────────────────

export interface ForecastModelSpec {
  model: ForecastModel;
  /** Suitable horizons — Підходящі горизонти */
  suitableHorizons: ForecastHorizon[];
  /** Training data window in days — Вікно навчальних даних (дні) */
  trainingWindowDays: number;
  /** Retraining cadence in hours — Інтервал перенавчання (год) */
  retrainingIntervalHours: number;
  /** Confidence interval — Довірчий інтервал */
  confidenceInterval: number;
}

export const FORECAST_MODEL_SPECS: Record<ForecastModel, ForecastModelSpec> = {
  ARIMA: {
    model: 'ARIMA',
    suitableHorizons: ['24h', '7d'],
    trainingWindowDays: 30,
    retrainingIntervalHours: 24,
    confidenceInterval: 0.95,
  },
  LSTM: {
    model: 'LSTM',
    suitableHorizons: ['7d', '30d', '90d'],
    trainingWindowDays: 180,
    retrainingIntervalHours: 168,
    confidenceInterval: 0.90,
  },
  prophet: {
    model: 'prophet',
    suitableHorizons: ['24h', '7d', '30d', '90d'],
    trainingWindowDays: 365,
    retrainingIntervalHours: 24,
    confidenceInterval: 0.95,
  },
};

// ── Trend forecast config ─────────────────────────────────────────────────────

export interface TrendForecastConfig {
  horizons: ForecastHorizon[];
  models: ForecastModel[];
  modelSpecs: Record<ForecastModel, ForecastModelSpec>;
  /** Default model for short-horizon — Модель за замовчуванням (короткий горизонт) */
  defaultShortHorizonModel: ForecastModel;
  /** Default model for long-horizon — Модель за замовчуванням (довгий горизонт) */
  defaultLongHorizonModel: ForecastModel;
  /** Metrics to forecast — Метрики для прогнозу */
  forecastMetrics: string[];
  /** Required tier — Необхідний tier */
  requiredTier: string;
}

export const TREND_FORECAST_CONFIG: TrendForecastConfig = {
  horizons: FORECAST_HORIZONS,
  models: FORECAST_MODELS,
  modelSpecs: FORECAST_MODEL_SPECS,
  defaultShortHorizonModel: 'ARIMA',
  defaultLongHorizonModel: 'prophet',
  forecastMetrics: ['event-volume', 'danger-score-avg', 'entity-mention-rate', 'geo-cluster-intensity'],
  requiredTier: 'enterprise',
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export const FORECAST_NOTE_EN =
  'Forecasts are presented as confidence bands on the timeline. ' +
  'Model ensemble weights are updated weekly based on recent accuracy metrics.';

export const FORECAST_NOTE_UK =
  'Прогнози відображаються як довірчі смуги на таймлайні. ' +
  'Ваги ансамблю моделей оновлюються щотижня на основі метрик точності.';
