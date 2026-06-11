'use server';

/**
 * Marketplace — Quality gate: review checklist, auto-disable triggers, DMCA.
 *
 * All marketplace items must pass three quality dimensions before approval:
 *   ethics | security | performance
 *
 * An in-memory store tracks review results (replace with DB in production).
 *
 * Усі позиції маркетплейсу проходять три виміри якості перед схваленням.
 * In-memory сховище для результатів огляду (замінити на БД у продакшені).
 */

import type { MarketplaceQualityReview } from "./types";

// ── Quality dimension ─────────────────────────────────────────────────────────

/**
 * Three mandatory review dimensions applied to every marketplace submission.
 *
 * Три обов'язкових виміри огляду для кожної позиції маркетплейсу.
 */
export type QualityDimension = "ethics" | "security" | "performance";

// ── Quality checklist ─────────────────────────────────────────────────────────

/**
 * Checklist items per quality dimension.
 * Reviewers must verify each item before marking a dimension as passed.
 *
 * Контрольний список для кожного виміру якості.
 */
export const QUALITY_CHECKLIST: Record<QualityDimension, string[]> = {
  ethics: [
    "No data exfiltration vectors (no silent outbound requests with user data)",
    "No doxxing risk (cannot surface personal identifying data without consent)",
    "No sanctioned-entity data included or facilitated",
    "No political-bias amplification (balanced framing required for conflict zones)",
    "Declared data sources only — undisclosed sources trigger immediate rejection",
  ],
  security: [
    "Sandbox isolation enforced — no direct DOM or runtime escape paths",
    "No external API calls without explicit disclosure in listing metadata",
    "No credential capture (no access to auth tokens, cookies, or session storage)",
    "CSP compliance verified — no inline script injection",
    "Dependency audit passed — no known CVEs above CVSS 7.0 in dependency tree",
  ],
  performance: [
    "Max CPU budget respected: sustained CPU usage must not exceed 10 % of one core",
    "Max memory budget respected: heap usage must stay under 50 MB at runtime",
    "No blocking of the main thread (all heavy work must run in a worker or be async)",
    "Lazy-load required — item must not inflate initial bundle by more than 20 kB gzipped",
    "Render frame budget observed — no UI jank exceeding 16 ms frame budget on p75",
  ],
};

// ── Auto-disable triggers ─────────────────────────────────────────────────────

/**
 * Conditions that trigger automatic disabling of a marketplace item.
 * Evaluated continuously by the telemetry pipeline.
 *
 * Умови для автоматичного відключення позиції маркетплейсу.
 */
export const AUTO_DISABLE_TRIGGERS_EN: string[] = [
  "Excessive resource use detected",
  "Data exfiltration pattern detected",
  "Telemetry anomaly threshold exceeded",
];

/**
 * Auto-disable trigger descriptions — Ukrainian.
 */
export const AUTO_DISABLE_TRIGGERS_UK: string[] = [
  "Виявлено надмірне використання ресурсів",
  "Виявлено патерн витоку даних",
  "Перевищено поріг аномалій телеметрії",
];

// ── DMCA / takedown policy ────────────────────────────────────────────────────

/**
 * DMCA and content takedown policy — English.
 */
export const DMCA_TAKEDOWN_POLICY_EN =
  "Rights holders may submit a DMCA takedown notice to legal@aegislens.com. " +
  "Upon receipt of a valid notice, the listed item will be disabled within 24 hours " +
  "and the creator notified. Counter-notices are accepted per DMCA Section 512(g). " +
  "Repeat infringers will have their creator accounts permanently suspended.";

/**
 * DMCA and content takedown policy — Ukrainian.
 * Правовласники можуть надіслати повідомлення DMCA на legal@aegislens.com.
 */
export const DMCA_TAKEDOWN_POLICY_UK =
  "Правовласники можуть надіслати повідомлення DMCA на legal@aegislens.com. " +
  "Після отримання дійсного повідомлення позицію буде відключено протягом 24 годин, " +
  "а автора — повідомлено. Контрповідомлення приймаються відповідно до §512(g) DMCA. " +
  "Облікові записи авторів-рецидивістів буде назавжди заблоковано.";

// ── Review store ──────────────────────────────────────────────────────────────

/**
 * In-memory store for marketplace quality reviews.
 * Tracks the review result per item ID.
 *
 * In-memory сховище результатів огляду якості.
 * Key: itemId. Replace Map with DB query in production.
 */
export class MarketplaceReviewStore {
  private readonly _reviews: Map<string, MarketplaceQualityReview> = new Map();

  /**
   * Submit or update a quality review for a marketplace item.
   *
   * @param review - Completed review record to persist.
   * Зберегти результат огляду якості.
   */
  submitReview(review: MarketplaceQualityReview): void {
    this._reviews.set(review.itemId, review);
  }

  /**
   * Retrieve the review for a given item, if it exists.
   *
   * @param itemId - Marketplace item ID.
   * @returns The review record, or undefined if not yet reviewed.
   * Отримати результат огляду, якщо він існує.
   */
  getReview(itemId: string): MarketplaceQualityReview | undefined {
    return this._reviews.get(itemId);
  }

  /**
   * Check whether a marketplace item has passed all quality dimensions.
   * An item is approved only when all three pass flags are true.
   *
   * @param itemId - Marketplace item ID.
   * @returns true if all dimensions pass; false otherwise.
   * Перевірити, чи пройшла позиція всі виміри якості.
   */
  isApproved(itemId: string): boolean {
    const review = this._reviews.get(itemId);
    if (!review) return false;
    return review.ethicsPass && review.securityPass && review.perfPass;
  }
}

/** Module-level singleton — shared across the server process lifetime. */
export const marketplaceReviewStore = new MarketplaceReviewStore();
