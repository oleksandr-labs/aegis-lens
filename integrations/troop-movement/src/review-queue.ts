/**
 * TASK 9 — Editorial review queue, MANDATORY before publish.
 *
 * Mirrors the HITL pattern in `services/verify/src/review-queue.ts`, but for the
 * troop-movement layer the gate is HARD: a report can only become public after
 * an editor has explicitly moved it to `approved`. Default state is `draft`
 * (fail-closed). Nothing auto-publishes.
 */

import type { PublishState, TroopMovementReport } from "./types";

export type EditorialVerdict = "approve" | "reject" | "needs_more_info" | "retract";

export interface EditorialReviewItem {
  reviewId: string;
  reportId: string;
  publishState: PublishState;
  status: "pending" | "in_review" | "resolved";
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  verdict?: EditorialVerdict;
  reviewerNotes?: string;
}

/** Map an editorial verdict to the resulting publish state. */
export function verdictToPublishState(verdict: EditorialVerdict): PublishState {
  switch (verdict) {
    case "approve": return "approved";
    case "reject": return "rejected";
    case "retract": return "retracted";
    case "needs_more_info": return "in_review";
  }
}

/**
 * THE publish gate. A report may only be published to ANY audience when an
 * editor has approved it. Fail-closed: any non-approved state blocks publish.
 */
export function canPublish(report: Pick<TroopMovementReport, "publishState">): boolean {
  return report.publishState === "approved";
}

/**
 * Combined hard gate for PUBLIC exposure: editorial approval AND the `isPublic`
 * flag (which the delay policy controls). Both must hold.
 */
export function canExposeToPublic(
  report: Pick<TroopMovementReport, "publishState" | "isPublic">,
): boolean {
  return canPublish(report) && report.isPublic === true;
}

class EditorialReviewQueue {
  private items = new Map<string, EditorialReviewItem>();
  private seq = 0;

  /** Enqueue a draft report for mandatory editorial review. */
  enqueue(reportId: string): EditorialReviewItem {
    const reviewId = `tm-rev-${++this.seq}-${Date.now()}`;
    const item: EditorialReviewItem = {
      reviewId,
      reportId,
      publishState: "in_review",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.items.set(reviewId, item);
    return item;
  }

  claimNext(reviewer: string): EditorialReviewItem | undefined {
    const item = [...this.items.values()].find((i) => i.status === "pending");
    if (!item) return undefined;
    item.status = "in_review";
    item.assignedTo = reviewer;
    return item;
  }

  /** Resolve a review with an editorial verdict; returns the new publish state. */
  resolve(reviewId: string, verdict: EditorialVerdict, notes?: string): EditorialReviewItem | undefined {
    const item = this.items.get(reviewId);
    if (!item) return undefined;
    item.status = "resolved";
    item.verdict = verdict;
    item.reviewerNotes = notes;
    item.publishState = verdictToPublishState(verdict);
    item.resolvedAt = new Date().toISOString();
    return item;
  }

  list(status?: EditorialReviewItem["status"]): EditorialReviewItem[] {
    const all = [...this.items.values()];
    return status ? all.filter((i) => i.status === status) : all;
  }
}

export const editorialReviewQueue = new EditorialReviewQueue();
