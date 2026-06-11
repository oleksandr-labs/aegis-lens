/**
 * Trend Forecasting — codeable contract + heuristic stub
 *
 * Phase 3 codeable contract — not production.
 *
 * Provides a typed interface for directional conflict-trend forecasting.
 * Returns heuristic stubs with `isProduction: false` until an ML model
 * (ARIMA / Prophet / transformer) is trained and integrated.
 */

// ── Disclaimer strings ────────────────────────────────────────────────────────

export const FORECAST_DISCLAIMER_EN =
  "This forecast is a heuristic directional estimate, not a trained prediction model. " +
  "It should be treated as an analytical aid only. Aegis Lens makes no warranty as to " +
  "its accuracy. Always cross-reference with primary sources before operational use.";

export const FORECAST_DISCLAIMER_UK =
  "Цей прогноз є евристичною спрямованою оцінкою, а не навченою моделлю передбачень. " +
  "Його слід розглядати виключно як аналітичний інструмент. Aegis Lens не гарантує " +
  "його точності. Перед оперативним використанням завжди звіряйтеся з первинними джерелами.";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ForecastHorizon = "24h" | "7d" | "30d";

export interface TrendForecast {
  region: string;
  eventType: string;
  horizon: ForecastHorizon;
  /**
   * 0-1 confidence that the direction (up/flat/down) is correct.
   * Heuristic baseline ≈ 0.35; production model target ≈ 0.70.
   */
  directionConfidence: number;
  /**
   * Predicted percentage change relative to the trailing baseline.
   * Positive = increase, negative = decrease.
   */
  predictedDelta: number;
  basisDescription_en: string;
  basisDescription_uk: string;
  modelVersion: string;
  /** False until a real forecasting model is deployed. */
  isProduction: boolean;
}

// ── Heuristic stub ────────────────────────────────────────────────────────────

/**
 * Simple heuristic: no historical data available at this layer, so we return
 * a neutral (flat) forecast with low confidence and `isProduction: false`.
 * This contract allows UI, tests, and downstream consumers to be built now
 * while the ML model is under development.
 */
class TrendForecaster {
  async forecast(
    region: string,
    eventType: string,
    horizon: ForecastHorizon,
  ): Promise<TrendForecast> {
    // Heuristic: flat forecast with below-random confidence
    return {
      region,
      eventType,
      horizon,
      directionConfidence: 0.33,
      predictedDelta: 0,
      basisDescription_en:
        `Heuristic stub: no trained model available for "${eventType}" in "${region}" ` +
        `over ${horizon}. ${FORECAST_DISCLAIMER_EN}`,
      basisDescription_uk:
        `Евристична заглушка: навченої моделі для "${eventType}" у "${region}" ` +
        `на горизонт ${horizon} немає. ${FORECAST_DISCLAIMER_UK}`,
      modelVersion: "heuristic-stub-v0",
      isProduction: false,
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const trendForecaster = new TrendForecaster();
export { TrendForecaster };
