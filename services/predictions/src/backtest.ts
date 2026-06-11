/**
 * Backtest results published per model version.
 *
 * Every AI forecast model version (e.g. "aegis-forecast-v0.3") must publish a
 * backtest scorecard before its output is shown on the map. This module defines
 * the typed scorecard schema (Brier score, calibration, hit-rate) and a small
 * "published results" registry so the UI can surface honest accuracy numbers
 * next to the "AI prediction — not observation" badge.
 *
 * Heuristic baseline (no ML pipeline available locally): scores are computed
 * from a set of evaluated (predictedProbability, observedOutcome) pairs exactly
 * as a real offline eval would, so wiring a true backfill later is a drop-in.
 */

export type PredictionType =
  | "event_density"
  | "escalation_index"
  | "anomaly_probability";

export type PredictionHorizon = "24h" | "7d";

/** One scored prediction/outcome pair fed into the backtest. */
export interface ScoredOutcome {
  /** Model probability in [0,1] that the predicted event occurred. */
  predictedProbability: number;
  /** Ground truth: 1 if the event occurred, 0 if it did not. */
  observedOutcome: 0 | 1;
}

/** A single calibration bin (reliability diagram point). */
export interface CalibrationBin {
  /** Bin lower edge, inclusive (e.g. 0.0, 0.1 … 0.9). */
  rangeLow: number;
  /** Bin upper edge, exclusive (except the last bin which is inclusive). */
  rangeHigh: number;
  /** Number of predictions that fell in this bin. */
  count: number;
  /** Mean predicted probability of predictions in this bin. */
  meanPredicted: number;
  /** Observed frequency of the event in this bin. */
  observedFrequency: number;
}

/** Typed per-model-version backtest result schema. */
export interface BacktestResult {
  modelVersion: string;
  predictionType: PredictionType;
  horizon: PredictionHorizon;
  /** Number of (prediction, outcome) pairs evaluated. */
  sampleSize: number;
  /** Mean squared error of probability vs outcome. Lower is better (0–1). */
  brierScore: number;
  /**
   * Brier skill score vs a base-rate climatology forecast.
   * >0 means the model beats always-predicting-the-base-rate; <0 means worse.
   */
  brierSkillScore: number;
  /**
   * Expected Calibration Error: weighted mean |predicted − observed| over bins.
   * Lower is better (0 = perfectly calibrated).
   */
  expectedCalibrationError: number;
  /** Reliability-diagram bins. */
  calibration: CalibrationBin[];
  /**
   * Hit-rate (recall) at the decision threshold: of events that occurred,
   * the fraction the model flagged at p ≥ hitRateThreshold.
   */
  hitRate: number;
  /** False-alarm rate at the same threshold (1 − specificity). */
  falseAlarmRate: number;
  /** Threshold used for hit-rate / false-alarm-rate. */
  hitRateThreshold: number;
  /** ISO-8601 window the backtest covers. */
  evaluatedFrom: string;
  evaluatedTo: string;
  computedAt: string;
}

/** A backtest result approved for public display next to the layer. */
export interface PublishedBacktest extends BacktestResult {
  /** Set true only after an analyst signs off on the numbers. */
  published: boolean;
  publishedAt?: string;
  /** Honest, non-actionable note shown in the UI. */
  noteEn: string;
  noteUk: string;
}

const DISCLAIMER_NOTE_EN =
  "Backtest accuracy on historical data only. Past performance does not guarantee future forecasts. AI output, not observation.";
const DISCLAIMER_NOTE_UK =
  "Точність бектесту лише на історичних даних. Минулі результати не гарантують майбутніх прогнозів. Вихід AI, не спостереження.";

const DEFAULT_BIN_COUNT = 10;

/** Mean Brier score over scored outcomes. */
function brier(outcomes: ScoredOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const sum = outcomes.reduce(
    (acc, o) => acc + (o.predictedProbability - o.observedOutcome) ** 2,
    0,
  );
  return sum / outcomes.length;
}

function baseRate(outcomes: ScoredOutcome[]): number {
  if (outcomes.length === 0) return 0;
  return outcomes.reduce((acc, o) => acc + o.observedOutcome, 0) / outcomes.length;
}

function buildCalibration(
  outcomes: ScoredOutcome[],
  binCount = DEFAULT_BIN_COUNT,
): CalibrationBin[] {
  const bins: CalibrationBin[] = [];
  for (let b = 0; b < binCount; b++) {
    const rangeLow = b / binCount;
    const rangeHigh = (b + 1) / binCount;
    const isLast = b === binCount - 1;
    const members = outcomes.filter((o) => {
      const p = o.predictedProbability;
      return p >= rangeLow && (isLast ? p <= rangeHigh : p < rangeHigh);
    });
    const count = members.length;
    const meanPredicted =
      count > 0
        ? members.reduce((acc, o) => acc + o.predictedProbability, 0) / count
        : 0;
    const observedFrequency =
      count > 0
        ? members.reduce((acc, o) => acc + o.observedOutcome, 0) / count
        : 0;
    bins.push({
      rangeLow: parseFloat(rangeLow.toFixed(2)),
      rangeHigh: parseFloat(rangeHigh.toFixed(2)),
      count,
      meanPredicted: parseFloat(meanPredicted.toFixed(3)),
      observedFrequency: parseFloat(observedFrequency.toFixed(3)),
    });
  }
  return bins;
}

function expectedCalibrationError(
  bins: CalibrationBin[],
  total: number,
): number {
  if (total === 0) return 0;
  const ece = bins.reduce(
    (acc, b) =>
      acc + (b.count / total) * Math.abs(b.meanPredicted - b.observedFrequency),
    0,
  );
  return parseFloat(ece.toFixed(3));
}

/**
 * Compute a typed backtest scorecard for one model version from scored outcomes.
 */
export function computeBacktest(params: {
  modelVersion: string;
  predictionType: PredictionType;
  horizon: PredictionHorizon;
  outcomes: ScoredOutcome[];
  evaluatedFrom: string;
  evaluatedTo: string;
  hitRateThreshold?: number;
  binCount?: number;
}): BacktestResult {
  const {
    modelVersion,
    predictionType,
    horizon,
    outcomes,
    evaluatedFrom,
    evaluatedTo,
  } = params;
  const threshold = params.hitRateThreshold ?? 0.5;

  const brierScore = brier(outcomes);
  const rate = baseRate(outcomes);
  // Climatology forecast: always predict the base rate.
  const climatologyBrier =
    outcomes.length === 0
      ? 0
      : brier(
          outcomes.map((o) => ({
            predictedProbability: rate,
            observedOutcome: o.observedOutcome,
          })),
        );
  const brierSkillScore =
    climatologyBrier > 0 ? 1 - brierScore / climatologyBrier : 0;

  const calibration = buildCalibration(outcomes, params.binCount);
  const ece = expectedCalibrationError(calibration, outcomes.length);

  const positives = outcomes.filter((o) => o.observedOutcome === 1);
  const negatives = outcomes.filter((o) => o.observedOutcome === 0);
  const hits = positives.filter(
    (o) => o.predictedProbability >= threshold,
  ).length;
  const falseAlarms = negatives.filter(
    (o) => o.predictedProbability >= threshold,
  ).length;
  const hitRate = positives.length > 0 ? hits / positives.length : 0;
  const falseAlarmRate =
    negatives.length > 0 ? falseAlarms / negatives.length : 0;

  return {
    modelVersion,
    predictionType,
    horizon,
    sampleSize: outcomes.length,
    brierScore: parseFloat(brierScore.toFixed(4)),
    brierSkillScore: parseFloat(brierSkillScore.toFixed(4)),
    expectedCalibrationError: ece,
    calibration,
    hitRate: parseFloat(hitRate.toFixed(3)),
    falseAlarmRate: parseFloat(falseAlarmRate.toFixed(3)),
    hitRateThreshold: threshold,
    evaluatedFrom,
    evaluatedTo,
    computedAt: new Date().toISOString(),
  };
}

/** Wrap a computed backtest as a (not-yet-published) public scorecard. */
export function toPublishable(result: BacktestResult): PublishedBacktest {
  return {
    ...result,
    published: false,
    noteEn: DISCLAIMER_NOTE_EN,
    noteUk: DISCLAIMER_NOTE_UK,
  };
}

/**
 * Registry of published backtest scorecards, keyed by `${modelVersion}:${type}:${horizon}`.
 * The map UI should refuse to surface accuracy claims for any version not present here.
 */
export class PublishedBacktestRegistry {
  private readonly results = new Map<string, PublishedBacktest>();

  private key(modelVersion: string, type: PredictionType, horizon: PredictionHorizon): string {
    return `${modelVersion}:${type}:${horizon}`;
  }

  /** Stage a scorecard (unpublished until an analyst calls publish). */
  stage(result: BacktestResult): PublishedBacktest {
    const entry = toPublishable(result);
    this.results.set(this.key(result.modelVersion, result.predictionType, result.horizon), entry);
    return entry;
  }

  /** Mark a staged scorecard as approved for public display. */
  publish(modelVersion: string, type: PredictionType, horizon: PredictionHorizon): PublishedBacktest | null {
    const entry = this.results.get(this.key(modelVersion, type, horizon));
    if (!entry) return null;
    entry.published = true;
    entry.publishedAt = new Date().toISOString();
    return entry;
  }

  get(modelVersion: string, type: PredictionType, horizon: PredictionHorizon): PublishedBacktest | null {
    return this.results.get(this.key(modelVersion, type, horizon)) ?? null;
  }

  /** Only results an analyst has signed off on. */
  getPublished(): PublishedBacktest[] {
    return [...this.results.values()].filter((r) => r.published);
  }
}
