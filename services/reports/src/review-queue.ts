/**
 * Review queue for analytical intelligence reports.
 *
 * Rule: reports with kind "custom" or "regional" MUST pass human review
 * before delivery. Use assertReviewApproved() as a gate in delivery flows.
 *
 * State machine:
 *   pending → in_review → approved → published
 *                       ↘ rejected
 */

import type { ReportKind } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReviewStatus =
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "published";

export interface ReviewEntry {
  reportId: string;
  reportType: ReportKind | string;
  submittedAt: string;
  reviewer?: string;
  status: ReviewStatus;
  notes?: string;
  publishedAt?: string;
}

// ── Report kinds that require human review before delivery ────────────────────

const REVIEW_REQUIRED_KINDS: ReadonlySet<string> = new Set<ReportKind>([
  "custom",
  "regional",
]);

export function requiresReview(reportType: string): boolean {
  return REVIEW_REQUIRED_KINDS.has(reportType);
}

// ── Guard helper ──────────────────────────────────────────────────────────────

/**
 * Throws if a report has not been approved.
 * Call this before any delivery action for analytical report types.
 */
export function assertReviewApproved(
  reportId: string,
  queue: InMemoryReviewQueue = reviewQueue,
): void {
  const entry = queue.getById(reportId);

  if (!entry) {
    throw new Error(
      `Report "${reportId}" has not been submitted for review. Submit before delivery.`,
    );
  }

  if (entry.status !== "approved" && entry.status !== "published") {
    throw new Error(
      `Report "${reportId}" has not been approved. Current status: "${entry.status}".`,
    );
  }
}

// ── In-memory review queue ────────────────────────────────────────────────────

export class InMemoryReviewQueue {
  private readonly entries = new Map<string, ReviewEntry>();

  /**
   * Submit a report for review.
   * Analytical kinds (custom, regional) are auto-gated; others can also
   * be submitted optionally.
   */
  submit(reportId: string, reportType: string): ReviewEntry {
    if (this.entries.has(reportId)) {
      throw new Error(`Report "${reportId}" is already in the review queue.`);
    }

    const entry: ReviewEntry = {
      reportId,
      reportType,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    this.entries.set(reportId, entry);
    return { ...entry };
  }

  /**
   * Assign a reviewer. Moves status: pending → in_review.
   */
  assign(reportId: string, reviewer: string): ReviewEntry {
    const entry = this.requireEntry(reportId);

    if (entry.status !== "pending" && entry.status !== "in_review") {
      throw new Error(
        `Cannot assign reviewer — report "${reportId}" is already "${entry.status}".`,
      );
    }

    entry.reviewer = reviewer;
    entry.status = "in_review";
    return { ...entry };
  }

  /**
   * Approve a report. Moves status → approved.
   */
  approve(reportId: string, reviewer: string, notes?: string): ReviewEntry {
    const entry = this.requireEntry(reportId);

    if (entry.status === "approved" || entry.status === "published") {
      throw new Error(`Report "${reportId}" is already "${entry.status}".`);
    }
    if (entry.status === "rejected") {
      throw new Error(
        `Report "${reportId}" was rejected. Re-submit a revised draft.`,
      );
    }

    entry.reviewer = reviewer;
    entry.status = "approved";
    if (notes) entry.notes = notes;
    return { ...entry };
  }

  /**
   * Reject a report. Requires a rejection reason note.
   */
  reject(reportId: string, reviewer: string, notes: string): ReviewEntry {
    const entry = this.requireEntry(reportId);

    if (entry.status === "published") {
      throw new Error(`Cannot reject a published report.`);
    }

    entry.reviewer = reviewer;
    entry.status = "rejected";
    entry.notes = notes;
    return { ...entry };
  }

  /**
   * Mark a report as published (called after successful web delivery).
   */
  markPublished(reportId: string): ReviewEntry {
    const entry = this.requireEntry(reportId);

    if (entry.status !== "approved") {
      throw new Error(
        `Report "${reportId}" must be approved before it can be marked published. Current: "${entry.status}".`,
      );
    }

    entry.status = "published";
    entry.publishedAt = new Date().toISOString();
    return { ...entry };
  }

  /** Get a single entry by report ID. */
  getById(reportId: string): ReviewEntry | undefined {
    const entry = this.entries.get(reportId);
    return entry ? { ...entry } : undefined;
  }

  /** All pending entries, oldest first. */
  getPending(): ReviewEntry[] {
    return this.getByStatus("pending");
  }

  /** All entries with the given status, sorted by submittedAt ascending. */
  getByStatus(status: ReviewStatus): ReviewEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.status === status)
      .sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      )
      .map((e) => ({ ...e }));
  }

  /** All entries for a given reviewer. */
  getByReviewer(reviewer: string): ReviewEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.reviewer === reviewer)
      .map((e) => ({ ...e }));
  }

  /** Total queue size. */
  size(): number {
    return this.entries.size;
  }

  private requireEntry(reportId: string): ReviewEntry {
    const entry = this.entries.get(reportId);
    if (!entry) {
      throw new Error(`Report "${reportId}" not found in review queue.`);
    }
    return entry;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const reviewQueue = new InMemoryReviewQueue();
