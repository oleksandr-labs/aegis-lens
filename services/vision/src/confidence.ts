/**
 * Confidence calibration for vision detectors.
 *
 * Raw softmax/sigmoid outputs from a neural net are NOT calibrated probabilities —
 * a YOLO "0.9" does not mean "right 90% of the time". For an OSINT-verification
 * tool whose outputs feed danger scores and human decisions, mis-calibration is a
 * safety problem (over-confidence → false alarms; under-confidence → missed strikes).
 *
 * This module provides:
 *   1. Temperature scaling (single-parameter calibration for softmax classifiers).
 *   2. Platt scaling (logistic calibration for binary detectors).
 *   3. A `calibrate()` helper that wraps a raw score into a `CalibratedConfidence`,
 *      degrading gracefully to an identity stub when no fitted calibrator exists yet.
 *
 * === MODEL WEIGHTS / CALIBRATORS PENDING ===
 * Calibration parameters (T for temperature, A/B for Platt) must be FITTED on a
 * held-out, human-labelled validation set per model version. Until those weights
 * ship, `getCalibrator()` returns `undefined` and `calibrate()` returns the raw
 * score with `isCalibrated: false`. Do NOT treat uncalibrated scores as
 * probabilities; high-stakes gating (see `human-review.ts`) keys off this flag.
 */

import { CalibratedConfidence } from "./types";

export type CalibratorKind = "temperature" | "platt" | "identity";

/** A fitted calibrator. Parameters come from the model registry, NOT hardcoded. */
export interface Calibrator {
  id: string;
  kind: CalibratorKind;
  /** Temperature scaling: divide logits by T (>1 softens over-confidence). */
  temperature?: number;
  /** Platt scaling: sigmoid(A * score + B). */
  plattA?: number;
  plattB?: number;
}

/**
 * Registry of fitted calibrators, keyed by model id.
 *
 * INTENTIONALLY EMPTY until calibration runs ship. Populate from the model
 * registry at load time (see `model-registry.ts`). Each entry is fitted on a
 * labelled validation split — never guess these numbers.
 */
const CALIBRATORS = new Map<string, Calibrator>();

export function registerCalibrator(modelId: string, calibrator: Calibrator): void {
  CALIBRATORS.set(modelId, calibrator);
}

export function getCalibrator(modelId: string): Calibrator | undefined {
  return CALIBRATORS.get(modelId);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function logit(p: number): number {
  const c = Math.min(0.999, Math.max(0.001, p));
  return Math.log(c / (1 - c));
}

/** Apply temperature scaling to a single softmax probability. */
export function applyTemperature(rawProb: number, temperature: number): number {
  if (temperature <= 0) return rawProb;
  // Approximate per-class temperature scaling via logit space.
  return sigmoid(logit(rawProb) / temperature);
}

/** Apply Platt scaling: sigmoid(A * raw + B). */
export function applyPlatt(rawScore: number, a: number, b: number): number {
  return sigmoid(a * rawScore + b);
}

/**
 * Wrap a raw model score into a CalibratedConfidence.
 *
 * If a fitted calibrator is registered for `modelId`, it is applied. Otherwise
 * the raw score is returned unchanged with `isCalibrated: false` so downstream
 * consumers know not to trust the magnitude as a probability.
 */
export function calibrate(rawScore: number, modelId: string): CalibratedConfidence {
  const raw = clamp01(rawScore);
  const cal = getCalibrator(modelId);
  if (!cal || cal.kind === "identity") {
    return { raw, calibrated: raw, isCalibrated: false, calibratorId: cal?.id };
  }
  let calibrated = raw;
  if (cal.kind === "temperature" && cal.temperature) {
    calibrated = applyTemperature(raw, cal.temperature);
  } else if (cal.kind === "platt" && cal.plattA != null && cal.plattB != null) {
    calibrated = applyPlatt(raw, cal.plattA, cal.plattB);
  }
  return {
    raw,
    calibrated: parseFloat(clamp01(calibrated).toFixed(4)),
    isCalibrated: true,
    calibratorId: cal.id,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * Expected Calibration Error (ECE) — the standard metric for judging whether a
 * calibrator is good enough to ship. Bins predictions by confidence and measures
 * the gap between mean confidence and observed accuracy per bin.
 *
 * Use this in the offline calibration job; ship a calibrator only when ECE drops
 * below the agreed threshold (target < 0.05).
 */
export function expectedCalibrationError(
  samples: Array<{ confidence: number; correct: boolean }>,
  bins = 10,
): number {
  if (samples.length === 0) return 0;
  const binAcc = new Array(bins).fill(0);
  const binConf = new Array(bins).fill(0);
  const binCount = new Array(bins).fill(0);
  for (const s of samples) {
    const b = Math.min(bins - 1, Math.floor(s.confidence * bins));
    binAcc[b] += s.correct ? 1 : 0;
    binConf[b] += s.confidence;
    binCount[b] += 1;
  }
  let ece = 0;
  for (let b = 0; b < bins; b++) {
    if (binCount[b] === 0) continue;
    const acc = binAcc[b] / binCount[b];
    const conf = binConf[b] / binCount[b];
    ece += (binCount[b] / samples.length) * Math.abs(acc - conf);
  }
  return parseFloat(ece.toFixed(4));
}
