/**
 * Editorial review gate before index.
 *
 * No AI-generated SEO artifact is indexed without passing through here. The
 * gate combines the automated quality verdict with a human / native-reviewer
 * decision and produces the artifact's final `ArtifactStatus`.
 *
 * Policy (see COMPLIANCE.md):
 *   - quality gate failed (or YMYL fail-closed) → status "quality_failed",
 *     NEVER auto-published; routed to the review queue.
 *   - YMYL page types OR tier-1 locales → MANDATORY native-reviewer sign-off
 *     (a machine pass can never approve them).
 *   - everything else → may auto-approve only above a confidence floor;
 *     otherwise queued for editorial review.
 *
 * The queue is an in-memory `ReviewQueue` here; in production it is a DB table.
 */

import type {
  AiDisclosure,
  ArtifactStatus,
  Locale,
  PageType,
  SeoArtifact,
} from "./types";
import { TIER1_LOCALES, isYmyl } from "./types";
import type { QualityGateResult } from "./quality-gate";

export interface ReviewDecisionInput {
  pageType: PageType;
  locale: Locale;
  confidence: number;
  gate: QualityGateResult;
  /** Confidence floor for auto-approval of non-gated artifacts. */
  autoApproveFloor?: number;
}

export interface ReviewRouting {
  status: ArtifactStatus;
  /** True when a human (native) reviewer is REQUIRED before index. */
  requiresHumanReview: boolean;
  /** True when only a native speaker of `locale` may approve. */
  requiresNativeReviewer: boolean;
  reason: string;
}

export const DEFAULT_AUTO_APPROVE_FLOOR = 0.78;

export function routeForReview(input: ReviewDecisionInput): ReviewRouting {
  const floor = input.autoApproveFloor ?? DEFAULT_AUTO_APPROVE_FLOOR;
  const ymyl = isYmyl(input.pageType);
  const tier1 = TIER1_LOCALES.includes(input.locale);

  // 1. Quality gate is authoritative. Any failure → never auto-publish.
  if (!input.gate.passed) {
    return {
      status: "quality_failed",
      requiresHumanReview: true,
      requiresNativeReviewer: ymyl || tier1,
      reason: input.gate.failClosed
        ? "YMYL fail-closed: blocked, mandatory native-reviewer sign-off."
        : `Quality gate failed (severity ${input.gate.aggregateSeverity.toFixed(2)}).`,
    };
  }

  // 2. YMYL always needs a human native reviewer even when the gate passes.
  if (ymyl) {
    return {
      status: "pending_review",
      requiresHumanReview: true,
      requiresNativeReviewer: true,
      reason: "YMYL page type requires native-reviewer sign-off before index.",
    };
  }

  // 3. Tier-1 locales require native-reviewer sign-off (i18n policy).
  if (tier1) {
    return {
      status: "pending_review",
      requiresHumanReview: true,
      requiresNativeReviewer: true,
      reason: `Tier-1 locale "${input.locale}" requires native-reviewer sign-off.`,
    };
  }

  // 4. Non-gated, non-tier-1: auto-approve above the confidence floor, else queue.
  if (input.confidence >= floor) {
    return {
      status: "approved",
      requiresHumanReview: false,
      requiresNativeReviewer: false,
      reason: `Auto-approved: confidence ${input.confidence.toFixed(2)} >= floor ${floor}.`,
    };
  }
  return {
    status: "pending_review",
    requiresHumanReview: true,
    requiresNativeReviewer: false,
    reason: `Confidence ${input.confidence.toFixed(2)} < floor ${floor}; editorial review required.`,
  };
}

// ── Review queue ──────────────────────────────────────────────────────────────

export interface ReviewItem<T = unknown> {
  artifact: SeoArtifact<T>;
  routing: ReviewRouting;
  queuedAt: string;
}

export class ReviewQueue {
  private readonly items = new Map<string, ReviewItem>();

  enqueue<T>(artifact: SeoArtifact<T>, routing: ReviewRouting): void {
    this.items.set(artifact.artifactId, {
      artifact: artifact as SeoArtifact<unknown>,
      routing,
      queuedAt: new Date().toISOString(),
    });
  }

  pending(): ReviewItem[] {
    return [...this.items.values()].filter(
      (i) => i.artifact.status === "pending_review" || i.artifact.status === "quality_failed",
    );
  }

  /** Native-reviewer sign-off → approves and stamps the disclosure. */
  approve(artifactId: string, reviewer: string, disclosureNotice?: AiDisclosure["notice"]): boolean {
    const item = this.items.get(artifactId);
    if (!item) return false;
    item.artifact.status = "approved";
    const now = new Date().toISOString();
    item.artifact.disclosure = {
      generatedByAi: true,
      model: item.artifact.model,
      generatedAt: item.artifact.createdAt,
      reviewedBy: reviewer,
      reviewedAt: now,
      notice: disclosureNotice ??
        item.artifact.disclosure?.notice ?? {
          en: "Drafted with AI and reviewed by an editor.",
          uk: "Створено за допомогою ШІ та перевірено редактором.",
        },
    };
    return true;
  }

  reject(artifactId: string, reviewer: string, reason: string): boolean {
    const item = this.items.get(artifactId);
    if (!item) return false;
    item.artifact.status = "rejected";
    item.routing.reason = `Rejected by ${reviewer}: ${reason}`;
    return true;
  }
}
