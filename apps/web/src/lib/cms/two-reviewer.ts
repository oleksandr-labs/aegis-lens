'use server'
/**
 * Two-Reviewer Workflow — enforces a two-reviewer approval gate for analytical
 * content types (reports, briefs). Server-side module.
 *
 * Двох-рецензентський воркфлоу — забезпечує два рецензентських затвердження
 * для аналітичного контенту (звіти, брифінги). Серверний модуль.
 */

import { CmsContentType } from "./content-types";

// ── Roles ─────────────────────────────────────────────────────────────────────

/**
 * Roles in the editorial review workflow.
 *
 * Ролі у редакторському воркфлоу перевірки.
 */
export enum ReviewerRole {
  Author = "author",
  Reviewer = "reviewer",
  Editor = "editor",
}

// ── Content types requiring two reviewers ─────────────────────────────────────

/**
 * Content types that require the two-reviewer gate before publish.
 *
 * Типи контенту, для яких потрібне затвердження двох рецензентів.
 */
export const TWO_REVIEWER_REQUIRED_TYPES: CmsContentType[] = [
  CmsContentType.Report,
  CmsContentType.Brief,
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReviewDecision = "approved" | "rejected" | "pending";

export interface ReviewEntry {
  /** User id of the reviewer. / ID рецензента. */
  reviewerId: string;
  role: ReviewerRole;
  decision: ReviewDecision;
  /** ISO-8601 timestamp of the decision. */
  decidedAt?: string;
  /** Optional comment from the reviewer. / Необов'язковий коментар рецензента. */
  comment?: string;
}

export interface ReviewWorkflowState {
  /** Content document id under review. / ID документа, що рецензується. */
  contentId: string;
  contentType: CmsContentType;
  /** Id of the version being reviewed. / ID версії, що рецензується. */
  versionId: string;
  /** Ordered list of review entries. / Впорядкований список записів перевірки. */
  reviews: ReviewEntry[];
  /**
   * Whether all required reviews are approved.
   *
   * Чи затверджені всі необхідні перевірки.
   */
  approved: boolean;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export class TwoReviewerStore {
  /** Workflow states keyed by contentId. / Стани воркфлоу за contentId. */
  private readonly states = new Map<string, ReviewWorkflowState>();

  /**
   * Open a review workflow for a content version.
   *
   * Відкриває воркфлоу перевірки для версії контенту.
   */
  openReview(
    contentId: string,
    contentType: CmsContentType,
    versionId: string,
    authorId: string,
  ): ReviewWorkflowState {
    const state: ReviewWorkflowState = {
      contentId,
      contentType,
      versionId,
      reviews: [
        {
          reviewerId: authorId,
          role: ReviewerRole.Author,
          decision: "approved", // Author submits implicitly
          decidedAt: new Date().toISOString(),
        },
      ],
      approved: false,
      createdAt: new Date().toISOString(),
    };
    this.states.set(contentId, state);
    return state;
  }

  /**
   * Submit a review decision for a content document.
   * Throws if the workflow does not exist.
   *
   * Подає рішення щодо перевірки документа контенту.
   * Кидає помилку, якщо воркфлоу не існує.
   */
  submitReview(
    contentId: string,
    reviewerId: string,
    role: ReviewerRole,
    decision: ReviewDecision,
    comment?: string,
  ): ReviewWorkflowState {
    const state = this.states.get(contentId);
    if (!state) {
      throw new Error(
        `[cms/two-reviewer] No review workflow for contentId "${contentId}"`,
      );
    }

    // Upsert review entry for this reviewer
    // Оновлюємо або додаємо запис перевірки для цього рецензента
    const existing = state.reviews.find((r) => r.reviewerId === reviewerId);
    if (existing) {
      existing.decision = decision;
      existing.decidedAt = new Date().toISOString();
      existing.comment = comment;
    } else {
      state.reviews.push({
        reviewerId,
        role,
        decision,
        decidedAt: new Date().toISOString(),
        comment,
      });
    }

    state.approved = this._checkApproved(state);
    return state;
  }

  /**
   * Return the current workflow state for a content document.
   *
   * Повертає поточний стан воркфлоу для документа контенту.
   */
  getState(contentId: string): ReviewWorkflowState | undefined {
    return this.states.get(contentId);
  }

  /**
   * Return true if a content type requires the two-reviewer gate.
   *
   * Повертає true, якщо тип контенту вимагає двох рецензентів.
   */
  isRequired(contentType: CmsContentType): boolean {
    return TWO_REVIEWER_REQUIRED_TYPES.includes(contentType);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Approval requires at least one Reviewer AND one Editor to have approved.
   *
   * Затвердження вимагає принаймні одного Reviewer І одного Editor.
   */
  private _checkApproved(state: ReviewWorkflowState): boolean {
    const approved = state.reviews.filter((r) => r.decision === "approved");
    const hasReviewer = approved.some((r) => r.role === ReviewerRole.Reviewer);
    const hasEditor = approved.some((r) => r.role === ReviewerRole.Editor);
    return hasReviewer && hasEditor;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const twoReviewerStore = new TwoReviewerStore();
