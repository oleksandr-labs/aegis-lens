/**
 * Feedback loop: did the predicted event occur?
 *
 * After a forecast's valid-window closes, match each prediction against the
 * events actually observed in that region/window and label the outcome. The
 * labelled outcomes feed `backtest.ts` (each becomes a ScoredOutcome) so the
 * model can be evaluated honestly over time.
 *
 * Heuristic matcher (no event store wired locally): a prediction "occurred" if
 * at least `minEventsForHit` qualifying observed events landed in the same
 * oblast within the valid window. Swapping in a real spatial/temporal join is a
 * drop-in replacement of `matchObservations`.
 */

import type { PredictionType, ScoredOutcome } from "./backtest";

/** Minimal shape of a forecast we evaluate after the fact. */
export interface EvaluatablePrediction {
  predictionId: string;
  regionCode: string;
  type: PredictionType;
  /** Model probability 0–1 that the event would occur. */
  predictedProbability: number;
  /** ISO-8601 forecast window. */
  validFrom: string;
  validTo: string;
  modelVersion: string;
}

/** Minimal shape of an observed (verified) event used as ground truth. */
export interface ObservedEvent {
  eventId: string;
  regionCode: string;
  /** ISO-8601 occurrence time. */
  occurredAt: string;
  /** Only count confirmed observations as ground truth. */
  verificationState: "verified" | "in_review" | "unverified" | "disputed" | "retracted";
}

export type OutcomeLabel =
  | "true_positive" // predicted likely AND occurred
  | "false_positive" // predicted likely BUT did not occur
  | "false_negative" // predicted unlikely BUT occurred
  | "true_negative"; // predicted unlikely AND did not occur

export interface PredictionOutcome {
  predictionId: string;
  modelVersion: string;
  regionCode: string;
  type: PredictionType;
  predictedProbability: number;
  /** Whether the event was observed in-window. */
  occurred: boolean;
  /** Count of qualifying observed events matched. */
  matchedEventCount: number;
  matchedEventIds: string[];
  label: OutcomeLabel;
  /** Probability threshold used to decide "predicted likely". */
  decisionThreshold: number;
  evaluatedAt: string;
}

const DEFAULT_THRESHOLD = 0.5;
const DEFAULT_MIN_EVENTS_FOR_HIT = 1;

function withinWindow(t: string, from: string, to: string): boolean {
  const ts = Date.parse(t);
  return ts >= Date.parse(from) && ts <= Date.parse(to);
}

/** Find verified observed events matching a prediction's region + window. */
function matchObservations(
  prediction: EvaluatablePrediction,
  events: ObservedEvent[],
): ObservedEvent[] {
  return events.filter(
    (e) =>
      e.regionCode === prediction.regionCode &&
      e.verificationState === "verified" &&
      withinWindow(e.occurredAt, prediction.validFrom, prediction.validTo),
  );
}

function labelOutcome(predictedLikely: boolean, occurred: boolean): OutcomeLabel {
  if (predictedLikely && occurred) return "true_positive";
  if (predictedLikely && !occurred) return "false_positive";
  if (!predictedLikely && occurred) return "false_negative";
  return "true_negative";
}

/** Evaluate one prediction against the observed-event set. */
export function evaluatePrediction(
  prediction: EvaluatablePrediction,
  observedEvents: ObservedEvent[],
  options?: { decisionThreshold?: number; minEventsForHit?: number },
): PredictionOutcome {
  const threshold = options?.decisionThreshold ?? DEFAULT_THRESHOLD;
  const minEvents = options?.minEventsForHit ?? DEFAULT_MIN_EVENTS_FOR_HIT;

  const matched = matchObservations(prediction, observedEvents);
  const occurred = matched.length >= minEvents;
  const predictedLikely = prediction.predictedProbability >= threshold;

  return {
    predictionId: prediction.predictionId,
    modelVersion: prediction.modelVersion,
    regionCode: prediction.regionCode,
    type: prediction.type,
    predictedProbability: prediction.predictedProbability,
    occurred,
    matchedEventCount: matched.length,
    matchedEventIds: matched.map((e) => e.eventId),
    label: labelOutcome(predictedLikely, occurred),
    decisionThreshold: threshold,
    evaluatedAt: new Date().toISOString(),
  };
}

/** Evaluate a batch of predictions (e.g. one daily model run) at once. */
export function evaluateBatch(
  predictions: EvaluatablePrediction[],
  observedEvents: ObservedEvent[],
  options?: { decisionThreshold?: number; minEventsForHit?: number },
): PredictionOutcome[] {
  return predictions.map((p) => evaluatePrediction(p, observedEvents, options));
}

/** Convert evaluated outcomes into ScoredOutcome pairs for `computeBacktest`. */
export function toScoredOutcomes(outcomes: PredictionOutcome[]): ScoredOutcome[] {
  return outcomes.map((o) => ({
    predictedProbability: o.predictedProbability,
    observedOutcome: o.occurred ? 1 : 0,
  }));
}

/** Confusion-matrix summary across a batch of outcomes. */
export interface OutcomeSummary {
  total: number;
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;
  /** TP / (TP + FN) — share of real events that were forecast. */
  recall: number;
  /** TP / (TP + FP) — share of forecasts that were right. */
  precision: number;
}

export function summarizeOutcomes(outcomes: PredictionOutcome[]): OutcomeSummary {
  const tp = outcomes.filter((o) => o.label === "true_positive").length;
  const fp = outcomes.filter((o) => o.label === "false_positive").length;
  const fn = outcomes.filter((o) => o.label === "false_negative").length;
  const tn = outcomes.filter((o) => o.label === "true_negative").length;
  return {
    total: outcomes.length,
    truePositive: tp,
    falsePositive: fp,
    falseNegative: fn,
    trueNegative: tn,
    recall: tp + fn > 0 ? parseFloat((tp / (tp + fn)).toFixed(3)) : 0,
    precision: tp + fp > 0 ? parseFloat((tp / (tp + fp)).toFixed(3)) : 0,
  };
}
