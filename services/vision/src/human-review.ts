/**
 * Human-in-the-loop override + retraining feedback (Geolocation AI cluster, and the
 * safety gate for ALL high-stakes vision outputs).
 *
 * Two jobs:
 *   1. Gate high-stakes / low-confidence vision outputs into a review queue instead
 *      of auto-publishing (geolocation, aircraft/vessel ID, damage ≥ sev3,
 *      manipulation verdicts). Mirrors `services/nlp/src/review-queue.ts`.
 *   2. Capture the reviewer's decision (approve / override-coordinate / reject) as a
 *      labelled `RetrainingSample` that feeds back into model + calibrator training.
 *      The override is the human's correction; the original model output is kept as
 *      the "before", so we get a supervised pair for free.
 *
 * In-memory store — swap for Postgres in production; the contract is stable.
 */

import { GeolocationAiResult, GeolocationCandidate, RiskTier, VisionTaskType } from "./types";

// ── Review gating ─────────────────────────────────────────────────────────────────

export type VisionReviewReason =
  | "high_stakes_output"
  | "low_calibrated_confidence"
  | "uncalibrated_score"
  | "geolocation_always_reviewed"
  | "manipulation_verdict";

export interface VisionReviewItem {
  recordId: string;
  mediaId: string;
  task: VisionTaskType;
  riskTier: RiskTier;
  reasons: VisionReviewReason[];
  /** Snapshot of the model output under review (task-specific shape). */
  output: unknown;
  priority: number;
  status: "pending" | "approved" | "overridden" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: string;
}

export interface ReviewGateInput {
  recordId: string;
  mediaId: string;
  task: VisionTaskType;
  riskTier: RiskTier;
  /** Calibrated confidence of the headline output 0–1. */
  confidence: number;
  /** Whether that confidence came from a fitted calibrator. */
  isCalibrated: boolean;
  /** Detector already flagged this for review. */
  detectorRequiresReview?: boolean;
  output: unknown;
}

/** Below this calibrated confidence, an advisory output is also routed to review. */
export const REVIEW_CONFIDENCE_FLOOR = 0.5;

/**
 * Decide whether a vision output needs human review, and why. Returns null to
 * auto-publish (only possible for non-high-stakes, calibrated, confident outputs).
 */
export function gateForReview(input: ReviewGateInput): VisionReviewItem | null {
  const reasons: VisionReviewReason[] = [];
  if (input.task === "geolocation_ai") reasons.push("geolocation_always_reviewed");
  if (input.riskTier === "high_stakes" || input.detectorRequiresReview) reasons.push("high_stakes_output");
  if (input.task === "deepfake_detection") reasons.push("manipulation_verdict");
  if (!input.isCalibrated) reasons.push("uncalibrated_score");
  if (input.confidence < REVIEW_CONFIDENCE_FLOOR) reasons.push("low_calibrated_confidence");

  if (reasons.length === 0) return null;

  // Priority: high-stakes floats up; uncertainty adds.
  let priority = 1 - input.confidence;
  if (reasons.includes("high_stakes_output") || reasons.includes("geolocation_always_reviewed")) priority = Math.max(priority, 0.85);
  priority = parseFloat(Math.min(1, priority + 0.05 * (reasons.length - 1)).toFixed(3));

  return {
    recordId: input.recordId,
    mediaId: input.mediaId,
    task: input.task,
    riskTier: input.riskTier,
    reasons: Array.from(new Set(reasons)),
    output: input.output,
    priority,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

// ── Retraining feedback ─────────────────────────────────────────────────────────

export interface RetrainingSample {
  mediaId: string;
  task: VisionTaskType;
  /** What the model predicted (label or coordinate). */
  modelOutput: unknown;
  /** The human-corrected ground truth (label or coordinate). */
  humanLabel: unknown;
  /** Was the model's headline prediction correct (for calibration ECE)? */
  modelWasCorrect: boolean;
  /** Model's calibrated confidence at prediction time (for calibration fitting). */
  modelConfidence: number;
  reviewerId: string;
  createdAt: string;
}

// ── Queue + feedback store ────────────────────────────────────────────────────────

export class VisionReviewQueue {
  private items = new Map<string, VisionReviewItem>();
  private samples: RetrainingSample[] = [];

  /** Enqueue a gated output; returns the item, or null if auto-published. */
  enqueue(input: ReviewGateInput): VisionReviewItem | null {
    const item = gateForReview(input);
    if (item) this.items.set(input.recordId, item);
    return item;
  }

  pending(limit = 50): VisionReviewItem[] {
    return [...this.items.values()]
      .filter((i) => i.status === "pending")
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /**
   * Record a reviewer decision. `humanLabel` is the correction (e.g. an overridden
   * coordinate or corrected class). Emits a RetrainingSample for the training loop.
   */
  resolve(params: {
    recordId: string;
    decision: "approved" | "overridden" | "rejected";
    reviewerId: string;
    humanLabel?: unknown;
    modelConfidence?: number;
  }): { item: VisionReviewItem; sample?: RetrainingSample } | undefined {
    const item = this.items.get(params.recordId);
    if (!item) return undefined;
    item.status = params.decision;
    item.reviewerId = params.reviewerId;
    item.reviewedAt = new Date().toISOString();

    let sample: RetrainingSample | undefined;
    if (params.decision !== "approved" || params.humanLabel !== undefined) {
      sample = {
        mediaId: item.mediaId,
        task: item.task,
        modelOutput: item.output,
        humanLabel: params.humanLabel ?? item.output,
        modelWasCorrect: params.decision === "approved",
        modelConfidence: params.modelConfidence ?? 0,
        reviewerId: params.reviewerId,
        createdAt: item.reviewedAt,
      };
      this.samples.push(sample);
    }
    return { item, sample };
  }

  /** Export accumulated samples for the offline retraining / calibration job. */
  exportRetrainingSamples(task?: VisionTaskType): RetrainingSample[] {
    return task ? this.samples.filter((s) => s.task === task) : [...this.samples];
  }

  get pendingCount(): number {
    return [...this.items.values()].filter((i) => i.status === "pending").length;
  }
}

/**
 * Apply a human coordinate override to an AI geolocation result, producing the
 * authoritative, publish-ready location. This is the explicit "human override"
 * step the TODO asks for — the AI proposes, the human disposes.
 */
export function applyGeolocationOverride(
  result: GeolocationAiResult,
  override: { lat: number; lon: number; uncertaintyM?: number; reviewerId: string },
): { final: GeolocationCandidate; result: GeolocationAiResult } {
  const final: GeolocationCandidate = {
    lat: override.lat,
    lon: override.lon,
    uncertaintyM: override.uncertaintyM ?? 100,
    confidence: { raw: 1, calibrated: 1, isCalibrated: true, calibratorId: "human_verified" },
    supportingClues: ["other"],
    method: "fusion",
  };
  // Surface the human-verified candidate as best; keep AI candidates for the audit trail.
  return { final, result: { ...result, best: final, candidates: [final, ...result.candidates] } };
}
