/**
 * Marketplace — shared type definitions.
 *
 * Covers Plugins & Dataset Marketplace item types, revenue model, and quality
 * review structures. All monetary values in USD. Timestamps in ISO 8601.
 *
 * Типи для маркетплейсу плагінів і датасетів: позиції, модель доходів, якість.
 */

// ── Item type ─────────────────────────────────────────────────────────────────

/**
 * Kind of item listed in the marketplace.
 *
 * Тип позиції в маркетплейсі.
 */
export type MarketplaceItemType =
  | "plugin"
  | "workspace-preset"
  | "dataset"
  | "alert-rule-pack"
  | "ai-prompt-pack"
  | "report-template";

// ── Item status ───────────────────────────────────────────────────────────────

/**
 * Lifecycle status of a marketplace listing.
 *
 * Статус позиції в маркетплейсі протягом усього її циклу.
 */
export type MarketplaceItemStatus =
  | "draft"
  | "pending-review"
  | "approved"
  | "rejected"
  | "disabled";

// ── Revenue / revshare model ──────────────────────────────────────────────────

/**
 * Revenue-sharing model for the listing.
 * - paid-70-30: one-time purchase; creator 70 %, platform 30 %.
 * - subscription-70-30: recurring subscription; same split.
 * - free: no charge; encouraged to grow ecosystem.
 *
 * Модель розподілу доходів: разова оплата, підписка або безкоштовно.
 */
export type RevshareModel =
  | "paid-70-30"
  | "subscription-70-30"
  | "free";

// ── Marketplace item ──────────────────────────────────────────────────────────

/**
 * A single listing in the Aegis Lens marketplace.
 * Always runs in a sandboxed runtime; quality review is mandatory before
 * status can reach "approved".
 *
 * Позиція маркетплейсу Aegis Lens.
 * Завжди виконується в ізольованому середовищі; перед схваленням — обов'язковий
 * огляд якості.
 */
export interface MarketplaceItem {
  /** Unique marketplace listing identifier */
  id: string;

  /** Category / kind of this listing */
  type: MarketplaceItemType;

  /** Display name — English */
  name_en: string;

  /** Display name — Ukrainian */
  name_uk: string;

  /** User ID of the creator / publisher */
  creatorId: string;

  /**
   * One-time or monthly price in USD.
   * null for free items.
   * Ціна в USD; null для безкоштовних позицій.
   */
  priceUsd: number | null;

  /**
   * If true, this is a subscription listing (recurring billing).
   * If false, it is a one-time purchase.
   * Якщо true — підписка (щомісячний білінг).
   */
  isSubscription: boolean;

  /** Revenue-sharing model applied to this listing */
  revshareModel: RevshareModel;

  /** Current lifecycle status */
  status: MarketplaceItemStatus;

  /**
   * If true, the listing appears in the "Featured" carousel.
   * Featured placement is paid by the creator; a transparent label is shown.
   * Виділення оплачується автором; мітка видима всім.
   */
  isFeatured: boolean;

  /**
   * Monthly featured-placement fee in USD.
   * null when isFeatured is false.
   */
  featuredFee_usd: number | null;

  /**
   * Buyer refund window in days. Fixed at 7 days per platform policy.
   * Refund cost is charged back to the creator.
   * Вікно повернення: 7 днів; вартість стягується з автора.
   */
  refundWindowDays: 7;

  /**
   * All marketplace items run in a sandboxed runtime.
   * Cannot be overridden by creator configuration.
   * Усі позиції виконуються в ізольованому середовищі (незмінно).
   */
  sandboxed: true;
}

// ── Quality review ────────────────────────────────────────────────────────────

/**
 * Result of the mandatory quality review applied before a listing is approved.
 *
 * Результат обов'язкового огляду якості перед схваленням позиції.
 */
export interface MarketplaceQualityReview {
  /** Marketplace item ID this review belongs to */
  itemId: string;

  /** Passed ethics review (no data exfil, doxxing risk, etc.) */
  ethicsPass: boolean;

  /** Passed security review (sandbox isolation, no credential capture, etc.) */
  securityPass: boolean;

  /** Passed performance review (CPU/memory budget, non-blocking, lazy-load) */
  perfPass: boolean;

  /** ISO 8601 timestamp of review completion */
  reviewedAt: string;

  /** Reviewer notes — English */
  notes_en: string;
}

// ── Creator KYC ───────────────────────────────────────────────────────────────

/**
 * KYC (Know Your Customer) record for a marketplace creator.
 * Required before any payout via Stripe Connect Express.
 *
 * KYC-запис автора маркетплейсу.
 * Обов'язковий перед першою виплатою через Stripe Connect Express.
 */
export interface CreatorKyc {
  /** Creator user ID (matches MarketplaceItem.creatorId) */
  creatorId: string;

  /** Stripe Connect Express account ID — set after onboarding */
  stripeConnectAccountId: string;

  /** Whether the creator has completed KYC verification */
  kycVerified: boolean;

  /**
   * ISO 8601 timestamp when KYC was completed.
   * null until verification passes.
   */
  kycCompletedAt: string | null;
}
