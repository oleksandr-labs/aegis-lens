/**
 * Editorial Policy — two-reviewer rule and SLA enforcement for analytical content.
 *
 * Defines which content types require two independent reviewers and
 * the turnaround SLAs per type.
 *
 * Редакційна політика: правило двох рецензентів та SLA для аналітичного контенту.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Content types that require two independent reviewers before publication.
 *
 * Типи контенту, що вимагають двох незалежних рецензентів перед публікацією.
 */
export const TWO_REVIEWER_CONTENT_TYPES = [
  "brief",
  "deep-dive",
  "quarterly-report",
  "methodology",
] as const;

export type ReviewableContentType = (typeof TWO_REVIEWER_CONTENT_TYPES)[number];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ReviewerSla {
  /** Maximum hours from submission to first reviewer response. / Макс. годин до першого відгуку. */
  firstReviewHours: number;
  /** Maximum hours from submission to final approval. / Макс. годин до фінального апруву. */
  finalApprovalHours: number;
  /** Whether a senior analyst must be one of the two reviewers. / Чи потрібен senior analyst. */
  seniorAnalystRequired: boolean;
}

/** Per-type reviewer SLA definitions. / SLA рецензування за типом контенту. */
export const REVIEWER_SLAS: Record<ReviewableContentType, ReviewerSla> = {
  brief: {
    firstReviewHours: 8,
    finalApprovalHours: 24,
    seniorAnalystRequired: false,
  },
  "deep-dive": {
    firstReviewHours: 24,
    finalApprovalHours: 72,
    seniorAnalystRequired: true,
  },
  "quarterly-report": {
    firstReviewHours: 48,
    finalApprovalHours: 120,
    seniorAnalystRequired: true,
  },
  methodology: {
    firstReviewHours: 24,
    finalApprovalHours: 72,
    seniorAnalystRequired: true,
  },
};

export interface EditorialPolicy {
  /** Content type this policy applies to. / Тип контенту. */
  contentType: ReviewableContentType;
  /** Number of required reviewers. / Кількість рецензентів. */
  requiredReviewers: number;
  /** Reviewer IDs assigned. / ID призначених рецензентів. */
  reviewerIds: string[];
  /** SLA for this content type. / SLA для типу контенту. */
  sla: ReviewerSla;
  /** Whether all SLAs have been met. / Чи дотримано SLA. */
  slaCompliant?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Check whether a content type requires two reviewers.
 *
 * Перевіряє, чи тип контенту потребує двох рецензентів.
 */
export function requiresTwoReviewers(
  contentType: string,
): contentType is ReviewableContentType {
  return (TWO_REVIEWER_CONTENT_TYPES as readonly string[]).includes(
    contentType,
  );
}

/**
 * Build an EditorialPolicy object for a given content type.
 *
 * Будує EditorialPolicy для заданого типу контенту.
 */
export function buildEditorialPolicy(
  contentType: ReviewableContentType,
  reviewerIds: string[],
): EditorialPolicy {
  return {
    contentType,
    requiredReviewers: 2,
    reviewerIds,
    sla: REVIEWER_SLAS[contentType],
  };
}
