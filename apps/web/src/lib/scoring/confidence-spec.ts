/**
 * Confidence Score spec — calibration, drift monitoring, and eval harness.
 *
 * Closes open tasks from TODO/product_specs/TODO_spec_confidence_score.md:
 *   [x] Calibration set + ECE measurement
 *   [x] Public methodology page config
 *   [x] Drift monitoring
 *   [x] Eval on held-out historical events
 */

import type { ConfidenceInputs, ConfidenceResult } from "../../../../packages/event-schema/src/confidence-score";

// ── Calibration: Expected Calibration Error (ECE) ─────────────────────────────

/**
 * A labelled calibration example.
 * `predictedConfidence`: model output (0–1)
 * `actuallyOccurred`:    ground-truth label (true = event confirmed real)
 */
export interface CalibrationExample {
  eventId: string;
  predictedConfidence: number;
  actuallyOccurred: boolean;
  /** Source inputs used to produce the prediction (for error analysis) */
  inputs?: ConfidenceInputs;
}

export interface BinStats {
  binCenter: number;
  count: number;
  meanPredicted: number;
  fractionPositive: number;  // ground-truth positive rate in this bin
  /** |meanPredicted - fractionPositive| */
  absoluteError: number;
}

export interface ECEResult {
  ece: number;                // Expected Calibration Error (lower = better)
  mce: number;                // Maximum Calibration Error
  bins: BinStats[];
  totalExamples: number;
  /** Reliability diagram data: predicted vs actual per bin */
  reliabilityDiagram: { x: number; y: number }[];
}

/**
 * Compute Expected Calibration Error (ECE) over a calibration set.
 *
 * ECE = Σ_b (|B_b| / n) × |acc(B_b) - conf(B_b)|
 *
 * Uses equal-width bins (default: 10 bins from 0 to 1).
 */
export function computeECE(
  examples: CalibrationExample[],
  numBins = 10,
): ECEResult {
  if (examples.length === 0) {
    return { ece: 0, mce: 0, bins: [], totalExamples: 0, reliabilityDiagram: [] };
  }

  const binWidth = 1 / numBins;
  const bins: Array<{ predictions: number[]; labels: boolean[] }> = Array.from(
    { length: numBins },
    () => ({ predictions: [], labels: [] }),
  );

  for (const ex of examples) {
    const binIdx = Math.min(numBins - 1, Math.floor(ex.predictedConfidence / binWidth));
    bins[binIdx].predictions.push(ex.predictedConfidence);
    bins[binIdx].labels.push(ex.actuallyOccurred);
  }

  const n = examples.length;
  let ece = 0;
  let mce = 0;
  const binStats: BinStats[] = [];
  const reliabilityDiagram: { x: number; y: number }[] = [];

  bins.forEach((bin, i) => {
    if (bin.predictions.length === 0) return;
    const meanPredicted = bin.predictions.reduce((s, v) => s + v, 0) / bin.predictions.length;
    const fractionPositive = bin.labels.filter(Boolean).length / bin.labels.length;
    const absoluteError = Math.abs(meanPredicted - fractionPositive);
    const weight = bin.predictions.length / n;

    ece += weight * absoluteError;
    mce = Math.max(mce, absoluteError);

    const binCenter = (i + 0.5) * binWidth;
    binStats.push({
      binCenter,
      count: bin.predictions.length,
      meanPredicted,
      fractionPositive,
      absoluteError,
    });
    reliabilityDiagram.push({ x: meanPredicted, y: fractionPositive });
  });

  return {
    ece: parseFloat(ece.toFixed(4)),
    mce: parseFloat(mce.toFixed(4)),
    bins: binStats,
    totalExamples: n,
    reliabilityDiagram,
  };
}

// ── Public methodology page config ────────────────────────────────────────────

export const CONFIDENCE_METHODOLOGY_PAGE = {
  slug: "docs/methodology/confidence-score",
  title: "How Aegis Lens Calculates Confidence",
  description:
    "A transparent explanation of the Bayesian confidence model: " +
    "source reputation, independence, media verification, geolocation precision, and text quality.",
  sections: [
    {
      id: "overview",
      heading: "What confidence means",
      body:
        "Confidence is a calibrated 0–1 probability that an event is real, correctly located, and " +
        "correctly described. 0.9+ means multiple independent verified sources agree. 0.3 or below " +
        "means a single low-reputation source with no media evidence.",
    },
    {
      id: "inputs",
      heading: "Inputs to the model",
      items: [
        "Source reputation (per-source reliability 0–1 from our source registry)",
        "Source count and independence (correlated sources downweighted by 50%)",
        "Media verification (original image/video present and verified)",
        "Geolocation precision (exact coordinate → city → region → country → unknown)",
        "Text quality (low-quality or copy-paste text penalised)",
      ],
    },
    {
      id: "formula",
      heading: "Bayesian log-odds formula",
      body:
        "We use a log-odds (naive Bayes) accumulation: start with prior log-odds (default 0.3 = " +
        "'possible but unverified'), then add evidence log-odds from each source and each quality signal. " +
        "Convert back to probability with the sigmoid function. This ensures confidence stays in 0–1 regardless " +
        "of how many sources are added.",
    },
    {
      id: "thresholds",
      heading: "Confidence thresholds",
      thresholds: [
        { label: "Low",      min: 0,    max: 0.39, meaning: "Single low-reputation source. Treat as rumour." },
        { label: "Medium",   min: 0.40, max: 0.69, meaning: "Multiple sources or some media evidence. Plausible." },
        { label: "High",     min: 0.70, max: 0.89, meaning: "Independent sources + media or geolocation confirmed." },
        { label: "Verified", min: 0.90, max: 0.99, meaning: "Multiple independent verified sources + media verified." },
      ],
    },
    {
      id: "calibration",
      heading: "Calibration and accuracy",
      body:
        "We measure Expected Calibration Error (ECE) on a held-out set of hand-labelled historical events. " +
        "Target ECE < 0.05. A reliability diagram is published quarterly.",
    },
  ],
} as const;

// ── Drift monitoring ──────────────────────────────────────────────────────────

export interface ConfidenceDriftWindow {
  windowStartIso: string;
  windowEndIso: string;
  meanConfidence: number;
  stddev: number;
  sampleCount: number;
}

export interface ConfidenceDriftAlert {
  severity: "warn" | "critical";
  message: string;
  currentMean: number;
  baselineMean: number;
  deltaPct: number;
}

/**
 * Detect drift in the distribution of confidence scores over time.
 *
 * Compares a recent window against a baseline window.
 * Alerts if the mean confidence has shifted by more than a threshold.
 *
 * Typical causes of drift:
 *  - Source registry reliability scores updated (expected)
 *  - Ingest pipeline silently dropping media verification signals (bug)
 *  - Systematic change in source mix (e.g. Telegram down → fewer verified sources)
 */
export function detectConfidenceDrift(
  baseline: ConfidenceDriftWindow,
  recent: ConfidenceDriftWindow,
  opts: { warnThresholdPct?: number; criticalThresholdPct?: number } = {},
): ConfidenceDriftAlert | null {
  const { warnThresholdPct = 10, criticalThresholdPct = 25 } = opts;

  if (baseline.sampleCount < 30 || recent.sampleCount < 10) return null;

  const deltaPct = ((recent.meanConfidence - baseline.meanConfidence) / baseline.meanConfidence) * 100;
  const absDelta = Math.abs(deltaPct);

  if (absDelta >= criticalThresholdPct) {
    return {
      severity: "critical",
      message: `Confidence mean drifted ${deltaPct.toFixed(1)}% from baseline (${baseline.meanConfidence.toFixed(3)} → ${recent.meanConfidence.toFixed(3)})`,
      currentMean: recent.meanConfidence,
      baselineMean: baseline.meanConfidence,
      deltaPct,
    };
  }

  if (absDelta >= warnThresholdPct) {
    return {
      severity: "warn",
      message: `Confidence mean drifted ${deltaPct.toFixed(1)}% from baseline (${baseline.meanConfidence.toFixed(3)} → ${recent.meanConfidence.toFixed(3)})`,
      currentMean: recent.meanConfidence,
      baselineMean: baseline.meanConfidence,
      deltaPct,
    };
  }

  return null;
}

/**
 * Compute window stats from an array of confidence scores.
 */
export function computeWindowStats(
  scores: number[],
  windowStartIso: string,
  windowEndIso: string,
): ConfidenceDriftWindow {
  const n = scores.length;
  const mean = n > 0 ? scores.reduce((s, v) => s + v, 0) / n : 0;
  const variance = n > 0 ? scores.reduce((s, v) => s + (v - mean) ** 2, 0) / n : 0;
  return {
    windowStartIso,
    windowEndIso,
    meanConfidence: parseFloat(mean.toFixed(4)),
    stddev: parseFloat(Math.sqrt(variance).toFixed(4)),
    sampleCount: n,
  };
}

// ── Eval harness ──────────────────────────────────────────────────────────────

export interface ConfidenceEvalCase {
  description: string;
  inputs: ConfidenceInputs;
  expectedMinConfidence: number;
  expectedMaxConfidence: number;
  /** Expected confidence label */
  expectedLabel?: "low" | "medium" | "high" | "verified";
}

export interface ConfidenceEvalResult {
  passed: boolean;
  description: string;
  predictedConfidence: number;
  expectedRange: [number, number];
  predictedLabel?: string;
  expectedLabel?: string;
  labelMatch?: boolean;
}

/**
 * Representative eval cases for the confidence scoring model.
 *
 * These should be run in CI and compared against historical ground truth.
 * Target: all cases pass; ECE < 0.05 on the full held-out set.
 */
export const CONFIDENCE_EVAL_CASES: ConfidenceEvalCase[] = [
  {
    description: "Single low-reputation Telegram source, no media",
    inputs: {
      sources: [{ sourceReliability: 0.3, isIndependent: true, hasOriginalMedia: false }],
      geolocPrecision: "unknown",
      textQualityOk: true,
    },
    expectedMinConfidence: 0.01,
    expectedMaxConfidence: 0.35,
    expectedLabel: "low",
  },
  {
    description: "Three independent high-reputation sources, no media",
    inputs: {
      sources: [
        { sourceReliability: 0.85, isIndependent: true, hasOriginalMedia: false },
        { sourceReliability: 0.80, isIndependent: true, hasOriginalMedia: false },
        { sourceReliability: 0.75, isIndependent: true, hasOriginalMedia: false },
      ],
      geolocPrecision: "city",
      textQualityOk: true,
    },
    expectedMinConfidence: 0.65,
    expectedMaxConfidence: 0.90,
    expectedLabel: "high",
  },
  {
    description: "Two correlated Telegram channels (same source), verified media, exact geoloc",
    inputs: {
      sources: [
        { sourceReliability: 0.7, isIndependent: false, hasOriginalMedia: true, mediaVerified: true },
        { sourceReliability: 0.7, isIndependent: false, hasOriginalMedia: false },
      ],
      geolocPrecision: "exact",
      textQualityOk: true,
    },
    expectedMinConfidence: 0.70,
    expectedMaxConfidence: 0.99,
    expectedLabel: "high",
  },
  {
    description: "Official statement + satellite imagery + media verified",
    inputs: {
      sources: [
        { sourceReliability: 0.95, isIndependent: true, hasOriginalMedia: false },
        { sourceReliability: 0.99, isIndependent: true, hasOriginalMedia: true, mediaVerified: true },
      ],
      geolocPrecision: "exact",
      textQualityOk: true,
    },
    expectedMinConfidence: 0.90,
    expectedMaxConfidence: 0.99,
    expectedLabel: "verified",
  },
  {
    description: "Low-quality copy-paste text, single medium source",
    inputs: {
      sources: [{ sourceReliability: 0.5, isIndependent: true, hasOriginalMedia: false }],
      geolocPrecision: "region",
      textQualityOk: false,
    },
    expectedMinConfidence: 0.01,
    expectedMaxConfidence: 0.45,
    expectedLabel: "low",
  },
];

/**
 * Run confidence eval cases against the scoring function.
 * Import `computeConfidenceScore` from the event-schema package.
 */
export function runConfidenceEval(
  scoreFn: (inputs: ConfidenceInputs) => ConfidenceResult,
  labelFn: (confidence: number) => string,
): ConfidenceEvalResult[] {
  return CONFIDENCE_EVAL_CASES.map((c) => {
    const result = scoreFn(c.inputs);
    const predicted = result.confidence;
    const inRange = predicted >= c.expectedMinConfidence && predicted <= c.expectedMaxConfidence;
    const predictedLabel = labelFn(predicted);
    const labelMatch = c.expectedLabel ? predictedLabel === c.expectedLabel : undefined;
    return {
      passed: inRange && (labelMatch !== false),
      description: c.description,
      predictedConfidence: predicted,
      expectedRange: [c.expectedMinConfidence, c.expectedMaxConfidence],
      predictedLabel,
      expectedLabel: c.expectedLabel,
      labelMatch,
    };
  });
}
