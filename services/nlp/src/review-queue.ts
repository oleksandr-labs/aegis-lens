/**
 * Human-review queue for low-confidence NLP outputs.
 *
 * Low-confidence enrichments (uncertain language, weak classification, sparse NER,
 * unclear stance, toxic/disinfo flags) are routed to a human-in-the-loop queue
 * rather than published silently. This module is the data + triage layer the review
 * UI binds to: it turns an `NLPOutput` into zero or more `ReviewItem`s, prioritises
 * them, and tracks reviewer decisions.
 *
 * The UI itself (an `apps/web` page) renders this queue; here we define the queue
 * contract, the routing thresholds, and an in-memory store (swap for Postgres in
 * production). en + uk reason strings are provided for the bilingual review panel.
 */

import type { NLPOutput } from "./pipeline";

/**
 * Confidence band labels, mirroring the canonical bands in the event schema
 * (`@aegis/event-schema` getConfidenceLabel). Inlined here to avoid a cross-package
 * dependency for a single threshold lookup.
 */
function confidenceLabel(confidence: number): "low" | "medium" | "high" | "verified" {
  if (confidence >= 0.9) return "verified";
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}

// ── Routing thresholds ──────────────────────────────────────────────────────

export interface ReviewThresholds {
  /** Below this overall language-detect confidence → review. */
  language: number;
  /** Below this classification confidence → review. */
  classification: number;
  /** Below this mean NER confidence (when entities exist) → review. */
  ner: number;
  /** Stance "unclear" with non-trivial polarity → review. */
  reviewUnclearStance: boolean;
  /** Toxicity / disinfo score at or above this → review. */
  toxicity: number;
}

export const DEFAULT_THRESHOLDS: ReviewThresholds = {
  language: 0.6,
  classification: 0.5,
  ner: 0.5,
  reviewUnclearStance: true,
  toxicity: 0.6,
};

// ── Queue item schema ─────────────────────────────────────────────────────────

export type ReviewReasonCode =
  | "low_language_confidence"
  | "low_classification_confidence"
  | "low_ner_confidence"
  | "ambiguous_stance"
  | "toxicity_flag";

export interface ReviewReason {
  code: ReviewReasonCode;
  /** The confidence/score that triggered routing. */
  value: number;
  message: { en: string; uk: string };
}

export type ReviewStatus = "pending" | "approved" | "corrected" | "rejected";

export interface ReviewItem {
  /** Source record / event id. */
  recordId: string;
  /** Snapshot of the NLP output under review. */
  output: NLPOutput;
  reasons: ReviewReason[];
  /**
   * Priority 0-1: how urgently this needs a human. Higher = more uncertain /
   * more flags. Drives queue ordering.
   */
  priority: number;
  status: ReviewStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  /** Human-supplied corrections (free-form patch onto the output). */
  correction?: Partial<NLPOutput>;
}

const REASON_MESSAGES: Record<ReviewReasonCode, { en: string; uk: string }> = {
  low_language_confidence: {
    en: "Language detection confidence is low",
    uk: "Низька впевненість визначення мови",
  },
  low_classification_confidence: {
    en: "Event classification confidence is low",
    uk: "Низька впевненість класифікації події",
  },
  low_ner_confidence: {
    en: "Extracted entities have low confidence",
    uk: "Розпізнані сутності мають низьку впевненість",
  },
  ambiguous_stance: {
    en: "Stance is ambiguous despite emotive content",
    uk: "Позиція неоднозначна попри емоційний зміст",
  },
  toxicity_flag: {
    en: "Toxicity / disinformation signal detected",
    uk: "Виявлено сигнал токсичності / дезінформації",
  },
};

function meanNerConfidence(output: NLPOutput): number {
  const ents = output.ner.entities;
  if (ents.length === 0) return 1; // no entities → not an NER-confidence problem
  return ents.reduce((s, e) => s + e.confidence, 0) / ents.length;
}

/**
 * Evaluate an NLP output against the thresholds and return the reasons it should
 * be reviewed (empty array = auto-publish).
 */
export function evaluateForReview(
  output: NLPOutput,
  thresholds: ReviewThresholds = DEFAULT_THRESHOLDS,
): ReviewReason[] {
  const reasons: ReviewReason[] = [];

  if (output.detection.confidence < thresholds.language) {
    reasons.push({ code: "low_language_confidence", value: output.detection.confidence, message: REASON_MESSAGES.low_language_confidence });
  }
  if (output.classification.confidence < thresholds.classification) {
    reasons.push({ code: "low_classification_confidence", value: output.classification.confidence, message: REASON_MESSAGES.low_classification_confidence });
  }
  const nerConf = meanNerConfidence(output);
  if (nerConf < thresholds.ner) {
    reasons.push({ code: "low_ner_confidence", value: parseFloat(nerConf.toFixed(3)), message: REASON_MESSAGES.low_ner_confidence });
  }
  // Ambiguous stance: the pipeline flags content as emotive-but-unclassifiable via
  // the toxicity stage's disinfo signal. Route when the disinfo signal is present
  // but did not cross the hard toxicity bar (i.e. uncertain, needs a human).
  if (
    thresholds.reviewUnclearStance &&
    output.toxicity.disinfo_score > 0 &&
    output.toxicity.disinfo_score < thresholds.toxicity &&
    !output.toxicity.toxic
  ) {
    reasons.push({ code: "ambiguous_stance", value: parseFloat(output.toxicity.disinfo_score.toFixed(3)), message: REASON_MESSAGES.ambiguous_stance });
  }
  const toxScore = Math.max(output.toxicity.score, output.toxicity.disinfo_score);
  if (output.toxicity.toxic || toxScore >= thresholds.toxicity) {
    reasons.push({ code: "toxicity_flag", value: parseFloat(toxScore.toFixed(3)), message: REASON_MESSAGES.toxicity_flag });
  }

  return reasons;
}

/**
 * Priority = blend of how-uncertain (1 - min confidence across signals) and
 * a flag bonus for safety reasons (toxicity always floats to the top).
 */
export function computePriority(output: NLPOutput, reasons: ReviewReason[]): number {
  if (reasons.length === 0) return 0;
  const minConf = Math.min(
    output.detection.confidence,
    output.classification.confidence,
    meanNerConfidence(output),
  );
  let priority = 1 - minConf;
  if (reasons.some((r) => r.code === "toxicity_flag")) priority = Math.max(priority, 0.9);
  priority += Math.min(0.1 * (reasons.length - 1), 0.3);
  return parseFloat(Math.min(1, priority).toFixed(3));
}

/**
 * Build a `ReviewItem` for a record, or `null` if it passes all thresholds
 * (auto-publish). The confidence band label is attached via the schema helper.
 */
export function buildReviewItem(
  recordId: string,
  output: NLPOutput,
  thresholds: ReviewThresholds = DEFAULT_THRESHOLDS,
): ReviewItem | null {
  const reasons = evaluateForReview(output, thresholds);
  if (reasons.length === 0) return null;
  return {
    recordId,
    output,
    reasons,
    priority: computePriority(output, reasons),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

/** Human-readable confidence band for the panel (reuses canonical schema bands). */
export function classificationBand(output: NLPOutput): string {
  return confidenceLabel(output.classification.confidence);
}

// ── In-memory queue store (swap for Postgres in production) ────────────────────

export class ReviewQueue {
  private readonly items = new Map<string, ReviewItem>();

  /** Enqueue an output; returns the created item or null if auto-published. */
  enqueue(recordId: string, output: NLPOutput, thresholds?: ReviewThresholds): ReviewItem | null {
    const item = buildReviewItem(recordId, output, thresholds);
    if (item) this.items.set(recordId, item);
    return item;
  }

  /** Pending items, highest priority first (queue render order). */
  pending(limit = 50): ReviewItem[] {
    return [...this.items.values()]
      .filter((i) => i.status === "pending")
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /** Record a reviewer decision. */
  resolve(
    recordId: string,
    status: Exclude<ReviewStatus, "pending">,
    reviewerId: string,
    correction?: Partial<NLPOutput>,
  ): ReviewItem | undefined {
    const item = this.items.get(recordId);
    if (!item) return undefined;
    item.status = status;
    item.reviewerId = reviewerId;
    item.reviewedAt = new Date().toISOString();
    if (correction) item.correction = correction;
    return item;
  }

  get size(): number {
    return [...this.items.values()].filter((i) => i.status === "pending").length;
  }
}
