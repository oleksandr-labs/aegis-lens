'use server';

/**
 * Anti-Doxxing Review Queue — triage borderline content for human moderation.
 *
 * Items are classified by risk level and must be reviewed within the SLA window.
 * Critical content (1h SLA) is auto-escalated; lower risks follow standard queues.
 *
 * Черга перегляду потенційного доксингу модераторами з прив'язкою до SLA.
 */

// ── DoxxingRisk ───────────────────────────────────────────────────────────────

export type DoxxingRisk = "low" | "medium" | "high" | "critical";

// ── SLA constants ─────────────────────────────────────────────────────────────

/**
 * Maximum hours to first human review action per risk level.
 *
 * Максимальний час до першої дії модератора залежно від рівня ризику.
 */
export const DOXXING_REVIEW_SLA_HOURS: Record<DoxxingRisk, number> = {
  critical: 1,
  high: 4,
  medium: 24,
  low: 72,
};

// ── DoxxingReviewItem ─────────────────────────────────────────────────────────

export interface DoxxingReviewItem {
  id: string;
  /** Content ID (event, report, comment, etc.) being reviewed */
  contentId: string;
  contentType: "event" | "report" | "comment" | "image" | "search-query";
  /** User who submitted the content */
  submittedBy: string;
  /** Risk level assigned by the automated classifier */
  risk: DoxxingRisk;
  /** Signals that triggered this review */
  signals: string[];
  /** ISO timestamp when the item entered the queue */
  queuedAt: string;
  /** ISO deadline computed from SLA */
  slaDeadline: string;
  /** Moderator who claimed this item (null = unclaimed) */
  claimedBy: string | null;
  /** Resolution: null = pending */
  resolution: "approved" | "rejected" | "escalated" | null;
  resolvedAt: string | null;
}

// ── DoxxingReviewStore ────────────────────────────────────────────────────────

/**
 * Singleton review queue for doxxing risk items.
 *
 * Синглтон — черга перегляду потенційного доксингу.
 */
export class DoxxingReviewStore {
  private static instance: DoxxingReviewStore;
  private readonly items = new Map<string, DoxxingReviewItem>();
  private counter = 0;

  private constructor() {}

  static getInstance(): DoxxingReviewStore {
    if (!DoxxingReviewStore.instance) {
      DoxxingReviewStore.instance = new DoxxingReviewStore();
    }
    return DoxxingReviewStore.instance;
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Enqueue a new item for review. Computes SLA deadline from risk level.
   *
   * Додати елемент до черги. SLA-дедлайн розраховується автоматично.
   */
  enqueue(
    contentId: string,
    contentType: DoxxingReviewItem["contentType"],
    submittedBy: string,
    risk: DoxxingRisk,
    signals: string[],
  ): DoxxingReviewItem {
    const id = `drq-${++this.counter}`;
    const now = new Date();
    const slaMs = DOXXING_REVIEW_SLA_HOURS[risk] * 60 * 60 * 1000;
    const item: DoxxingReviewItem = {
      id,
      contentId,
      contentType,
      submittedBy,
      risk,
      signals,
      queuedAt: now.toISOString(),
      slaDeadline: new Date(now.getTime() + slaMs).toISOString(),
      claimedBy: null,
      resolution: null,
      resolvedAt: null,
    };
    this.items.set(id, item);
    return item;
  }

  /**
   * Claim an item for review (assign to moderator).
   *
   * Взяти елемент на перегляд (призначити модератору).
   */
  claim(id: string, moderatorId: string): boolean {
    const item = this.items.get(id);
    if (!item || item.claimedBy !== null) return false;
    item.claimedBy = moderatorId;
    return true;
  }

  /**
   * Resolve a review item with a decision.
   *
   * Завершити перегляд з рішенням.
   */
  resolve(
    id: string,
    resolution: NonNullable<DoxxingReviewItem["resolution"]>,
  ): boolean {
    const item = this.items.get(id);
    if (!item || item.resolution !== null) return false;
    item.resolution = resolution;
    item.resolvedAt = new Date().toISOString();
    return true;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get all pending items, optionally filtered by risk level.
   *
   * Повернути всі очікуючі елементи, опційно за рівнем ризику.
   */
  getPending(risk?: DoxxingRisk): DoxxingReviewItem[] {
    return Array.from(this.items.values()).filter(
      (i) => i.resolution === null && (risk === undefined || i.risk === risk),
    );
  }

  /**
   * Get items whose SLA deadline has passed and are still unresolved.
   *
   * Елементи, у яких минув SLA-дедлайн.
   */
  getOverdue(): DoxxingReviewItem[] {
    const now = Date.now();
    return Array.from(this.items.values()).filter(
      (i) => i.resolution === null && new Date(i.slaDeadline).getTime() < now,
    );
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

export const doxxingReviewStore = DoxxingReviewStore.getInstance();
