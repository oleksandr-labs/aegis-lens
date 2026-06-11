/**
 * Verification eval suite.
 *
 * Backtests the corroboration + confidence + danger pipeline against a
 * gold-standard set of hand-verified historical events. Reports precision,
 * recall, F1, calibration error, and danger-score MAE.
 *
 * "Verification is the moat. Don't tune it on instinct — backtest."
 */

export interface GoldEvent {
  id: string;
  /** Hand-assigned ground truth */
  truthVerified: boolean;
  truthDangerScore: number; // 0–100
  /** Inputs the pipeline would see */
  sourceCount: number;
  independentSourceCount: number;
  hasMedia: boolean;
  mediaVerified: boolean;
  severity: number; // 1–5
  /** Notes for human reviewers */
  note?: string;
}

export const VERIFY_GOLD_SET: GoldEvent[] = [
  { id: "g-001", truthVerified: true, truthDangerScore: 88, sourceCount: 5, independentSourceCount: 4, hasMedia: true, mediaVerified: true, severity: 5, note: "Kinzhal strike, multi-confirmed" },
  { id: "g-002", truthVerified: true, truthDangerScore: 72, sourceCount: 3, independentSourceCount: 3, hasMedia: true, mediaVerified: true, severity: 4, note: "Drone intercept, official + 2 OSINT" },
  { id: "g-003", truthVerified: false, truthDangerScore: 20, sourceCount: 1, independentSourceCount: 1, hasMedia: false, mediaVerified: false, severity: 4, note: "Single Telegram rumor, never confirmed" },
  { id: "g-004", truthVerified: false, truthDangerScore: 10, sourceCount: 2, independentSourceCount: 1, hasMedia: true, mediaVerified: false, severity: 3, note: "Recycled media from 2022" },
  { id: "g-005", truthVerified: true, truthDangerScore: 95, sourceCount: 8, independentSourceCount: 6, hasMedia: true, mediaVerified: true, severity: 5, note: "Mass strike, widely documented" },
  { id: "g-006", truthVerified: true, truthDangerScore: 55, sourceCount: 2, independentSourceCount: 2, hasMedia: false, mediaVerified: false, severity: 3, note: "Power outage, two utilities confirmed" },
  { id: "g-007", truthVerified: false, truthDangerScore: 15, sourceCount: 1, independentSourceCount: 1, hasMedia: true, mediaVerified: false, severity: 2, note: "Misattributed location" },
  { id: "g-008", truthVerified: true, truthDangerScore: 80, sourceCount: 4, independentSourceCount: 3, hasMedia: true, mediaVerified: true, severity: 5, note: "Infrastructure strike, satellite-confirmed" },
  { id: "g-009", truthVerified: false, truthDangerScore: 25, sourceCount: 3, independentSourceCount: 1, hasMedia: false, mediaVerified: false, severity: 4, note: "Coordinated info-op, single origin" },
  { id: "g-010", truthVerified: true, truthDangerScore: 60, sourceCount: 3, independentSourceCount: 2, hasMedia: true, mediaVerified: true, severity: 4, note: "Artillery, geolocated" },
];

export interface VerifyPrediction {
  predictedVerified: boolean;
  predictedConfidence: number; // 0–1
  predictedDangerScore: number; // 0–100
}

export type VerifyPipelineFn = (gold: GoldEvent) => VerifyPrediction;

export interface VerifyEvalSummary {
  total: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  /** Expected calibration error of the confidence scores (lower is better) */
  calibrationError: number;
  /** Mean absolute error of danger scores (0–100) */
  dangerMAE: number;
  confusion: { tp: number; fp: number; tn: number; fn: number };
}

export function runVerifyEval(pipeline: VerifyPipelineFn, gold = VERIFY_GOLD_SET): VerifyEvalSummary {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  let dangerErrSum = 0;
  const confBuckets: Array<{ confSum: number; correct: number; n: number }> = Array.from(
    { length: 10 },
    () => ({ confSum: 0, correct: 0, n: 0 }),
  );

  for (const g of gold) {
    const pred = pipeline(g);

    if (pred.predictedVerified && g.truthVerified) tp++;
    else if (pred.predictedVerified && !g.truthVerified) fp++;
    else if (!pred.predictedVerified && !g.truthVerified) tn++;
    else fn++;

    dangerErrSum += Math.abs(pred.predictedDangerScore - g.truthDangerScore);

    // Calibration: bucket by predicted confidence
    const bucket = Math.min(9, Math.floor(pred.predictedConfidence * 10));
    confBuckets[bucket].confSum += pred.predictedConfidence;
    confBuckets[bucket].n += 1;
    if (pred.predictedVerified === g.truthVerified) confBuckets[bucket].correct += 1;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = (tp + tn) / gold.length;

  // Expected Calibration Error
  let ece = 0;
  for (const b of confBuckets) {
    if (b.n === 0) continue;
    const avgConf = b.confSum / b.n;
    const acc = b.correct / b.n;
    ece += (b.n / gold.length) * Math.abs(avgConf - acc);
  }

  return {
    total: gold.length,
    precision: round(precision),
    recall: round(recall),
    f1: round(f1),
    accuracy: round(accuracy),
    calibrationError: round(ece),
    dangerMAE: round(dangerErrSum / gold.length),
    confusion: { tp, fp, tn, fn },
  };
}

export function formatVerifyEval(s: VerifyEvalSummary): string {
  return [
    `=== Verify Eval (${s.total} gold events) ===`,
    `Precision: ${(s.precision * 100).toFixed(1)}%  Recall: ${(s.recall * 100).toFixed(1)}%  F1: ${(s.f1 * 100).toFixed(1)}%`,
    `Accuracy: ${(s.accuracy * 100).toFixed(1)}%  ECE: ${s.calibrationError.toFixed(3)}  Danger MAE: ${s.dangerMAE.toFixed(1)}`,
    `Confusion — TP:${s.confusion.tp} FP:${s.confusion.fp} TN:${s.confusion.tn} FN:${s.confusion.fn}`,
  ].join("\n");
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
