/**
 * Human-in-the-loop (HITL) review queue feed.
 *
 * Low-confidence or disputed events are queued for human reviewers.
 * Priority is computed from danger score × ambiguity × freshness so that
 * high-impact, uncertain events surface first.
 */

import type { VState } from "./state-machine";

export type ReviewReason =
  | "low_confidence"        // confidence below the verify threshold
  | "source_disagreement"   // corroboration found conflicting sources
  | "single_source_high_severity" // severe event, only one source
  | "manipulation_flag"     // vision/misinfo flagged possible manipulation
  | "geo_uncertain"         // geolocation requires human disambiguation
  | "user_reported"         // a user flagged the event
  | "random_audit";         // sampled for QA even if auto-verified

export type ReviewVerdict = "verify" | "dispute" | "retract" | "needs_more_info";

export interface ReviewItem {
  reviewId: string;
  eventId: string;
  currentState: VState;
  reasons: ReviewReason[];
  /** 0–100 — higher = review sooner */
  priority: number;
  /** Inputs used to compute priority (for explainability) */
  signals: {
    dangerScore: number;     // 0–100
    confidence: number;      // 0–1
    sourceCount: number;
    ageMinutes: number;
  };
  orgId: string;
  /** Optional reviewer the item is assigned to */
  assignedTo?: string;
  status: "pending" | "in_review" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  verdict?: ReviewVerdict;
  reviewerNotes?: string;
}

/**
 * Compute review priority 0–100.
 *  - High danger score → urgent
 *  - Low confidence + high severity → most valuable to review
 *  - Fresh events prioritised (decays with age)
 */
export function computePriority(signals: ReviewItem["signals"]): number {
  const dangerComponent = signals.dangerScore * 0.5; // up to 50
  // Uncertainty bonus: most valuable when danger is high but confidence is low
  const uncertainty = (1 - signals.confidence) * 30; // up to 30
  // Single-source penalty for high danger
  const sourcePenalty = signals.sourceCount <= 1 && signals.dangerScore > 60 ? 10 : 0;
  // Freshness: full bonus < 30 min, decays to 0 by 6 h
  const freshness = Math.max(0, 10 * (1 - signals.ageMinutes / 360));
  return Math.min(100, Math.round(dangerComponent + uncertainty + sourcePenalty + freshness));
}

class ReviewQueue {
  private items = new Map<string, ReviewItem>();
  private seq = 0;

  enqueue(params: {
    eventId: string;
    currentState: VState;
    reasons: ReviewReason[];
    signals: ReviewItem["signals"];
    orgId: string;
  }): ReviewItem {
    const reviewId = `rev-${++this.seq}-${Date.now()}`;
    const item: ReviewItem = {
      reviewId,
      eventId: params.eventId,
      currentState: params.currentState,
      reasons: params.reasons,
      priority: computePriority(params.signals),
      signals: params.signals,
      orgId: params.orgId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.items.set(reviewId, item);
    return item;
  }

  /** Pull the next-highest priority pending item, optionally for a reviewer. */
  claimNext(reviewer: string, orgId?: string): ReviewItem | undefined {
    const candidates = [...this.items.values()]
      .filter((i) => i.status === "pending" && (!orgId || i.orgId === orgId))
      .sort((a, b) => b.priority - a.priority);
    const item = candidates[0];
    if (!item) return undefined;
    item.status = "in_review";
    item.assignedTo = reviewer;
    return item;
  }

  resolve(reviewId: string, verdict: ReviewVerdict, notes?: string): ReviewItem | undefined {
    const item = this.items.get(reviewId);
    if (!item) return undefined;
    item.status = "resolved";
    item.verdict = verdict;
    item.reviewerNotes = notes;
    item.resolvedAt = new Date().toISOString();
    return item;
  }

  list(opts: { status?: ReviewItem["status"]; orgId?: string; limit?: number } = {}): ReviewItem[] {
    let items = [...this.items.values()];
    if (opts.status) items = items.filter((i) => i.status === opts.status);
    if (opts.orgId) items = items.filter((i) => i.orgId === opts.orgId);
    items.sort((a, b) => b.priority - a.priority);
    return items.slice(0, opts.limit ?? 50);
  }

  stats(): { pending: number; inReview: number; resolved: number; avgPriority: number } {
    const all = [...this.items.values()];
    const pending = all.filter((i) => i.status === "pending");
    return {
      pending: pending.length,
      inReview: all.filter((i) => i.status === "in_review").length,
      resolved: all.filter((i) => i.status === "resolved").length,
      avgPriority: pending.length
        ? Math.round(pending.reduce((s, i) => s + i.priority, 0) / pending.length)
        : 0,
    };
  }
}

export const reviewQueue = new ReviewQueue();
