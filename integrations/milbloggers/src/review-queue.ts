/**
 * Editorial review queue for high-impact posts.
 *
 * Not every post needs a human; high-impact ones do. A post is queued when its
 * estimated impact crosses a threshold — e.g. strike/equipment claims, posts
 * carried by many accounts, or any RU-side claim selected for narrative
 * comparison. Editors clear / hold / escalate items here before the content is
 * surfaced as verified in the product.
 *
 * Priority is impact-weighted and reputation-aware. RU-side items are always
 * flagged for the opposition-label treatment so they never slip through
 * unlabelled.
 */

import type { ClassifiedPost, ContentClass, L10nText } from "./types";
import { assertSideLabel } from "./side-label";

export type ReviewStatus = "queued" | "in_review" | "cleared" | "held" | "escalated";

export interface ReviewItem {
  postId: string;
  accountId: string;
  post: ClassifiedPost;
  /** 0–1 impact estimate driving priority. */
  impact: number;
  status: ReviewStatus;
  /** RU-side items must keep their opposition label visible to the reviewer. */
  requiresOppositionLabel: boolean;
  queuedAt: string;
  note?: L10nText;
}

/** Content classes that are intrinsically high-impact. */
const HIGH_IMPACT_CLASSES: ContentClass[] = [
  "strike_claim",
  "equipment_loss",
  "official_statement",
  "geolocation",
];

/** Estimate a post's impact 0–1. */
export function estimateImpact(post: ClassifiedPost, corroborators = 1): number {
  let impact = HIGH_IMPACT_CLASSES.includes(post.contentClass) ? 0.6 : 0.3;
  impact += Math.min(0.25, (corroborators - 1) * 0.08); // more sources = more impact
  impact += post.classConfidence * 0.15;
  if (post.side === "ru") impact += 0.1; // opposition claims warrant a look
  return Math.min(1, impact);
}

export interface QueueConfig {
  /** Impact at/above which a post is queued. */
  threshold: number;
}

export const DEFAULT_QUEUE_CONFIG: QueueConfig = { threshold: 0.55 };

export class ReviewQueue {
  private readonly items = new Map<string, ReviewItem>();

  constructor(private readonly config: QueueConfig = DEFAULT_QUEUE_CONFIG) {}

  /** Offer a post to the queue; returns the item if it was queued, else null. */
  consider(post: ClassifiedPost, corroborators = 1): ReviewItem | null {
    assertSideLabel(post);
    const impact = estimateImpact(post, corroborators);
    if (impact < this.config.threshold) return null;

    const item: ReviewItem = {
      postId: post.postId,
      accountId: post.accountId,
      post,
      impact,
      status: "queued",
      requiresOppositionLabel: post.side === "ru",
      queuedAt: new Date().toISOString(),
    };
    this.items.set(post.postId, item);
    return item;
  }

  /** Items sorted by descending impact (what an editor works first). */
  pending(): ReviewItem[] {
    return [...this.items.values()]
      .filter((i) => i.status === "queued" || i.status === "in_review")
      .sort((a, b) => b.impact - a.impact);
  }

  setStatus(postId: string, status: ReviewStatus, note?: L10nText): void {
    const item = this.items.get(postId);
    if (item) {
      item.status = status;
      if (note) item.note = note;
    }
  }

  get(postId: string): ReviewItem | undefined {
    return this.items.get(postId);
  }

  all(): ReviewItem[] {
    return [...this.items.values()];
  }
}
