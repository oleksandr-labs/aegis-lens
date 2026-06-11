/**
 * Billing & Subscription — shared type definitions.
 *
 * All monetary values are in USD unless suffixed otherwise.
 * All timestamps are ISO 8601 strings.
 *
 * Типи для білінгу та підписок. Усі суми в USD, усі дати в ISO 8601.
 */

// ── Subscription ──────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export type BillingPeriod = "monthly" | "annual" | "biennial";

export interface Subscription {
  id: string;
  userId: string;
  /** Matches a Tier value from tiers/constants.ts */
  tierId: string;
  status: SubscriptionStatus;
  period: BillingPeriod;
  /** Amount charged per period in USD */
  priceUsd: number;
  /** ISO 8601 — start of current billing period */
  currentPeriodStart: string;
  /** ISO 8601 — end of current billing period */
  currentPeriodEnd: string;
  /** If true, subscription will not renew at period end */
  cancelAtPeriodEnd: boolean;
  /** Stripe subscription ID — undefined in dev/test */
  stripeSubscriptionId?: string;
  /**
   * Legacy / grandfathered price locked at signup.
   * If present, this overrides priceUsd for renewals.
   * Ціна, зафіксована при реєстрації (гранд-фатер).
   */
  grandfatheredPrice?: number;
  /** ISO 8601 — when trial ends (undefined if not trialing) */
  trialEnd?: string;
}

// ── Invoice ───────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  description_en: string;
  description_uk: string;
  quantity: number;
  unitAmountUsd: number;
  totalAmountUsd: number;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  /** Total amount in the invoice currency (use currency field) */
  amount: number;
  /** ISO 4217 currency code, e.g. "usd" */
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  /** ISO 8601 */
  dueDate: string;
  items: InvoiceLineItem[];
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export interface CheckoutSession {
  id: string;
  /** Stripe-hosted Checkout URL; redirect user to this */
  url: string;
  tierId: string;
  period: BillingPeriod;
  /** Final price after any discount */
  priceUsd: number;
  /** Discount amount in USD (if any) */
  discountApplied?: number;
  /** Human-readable reason for the discount (e.g. "annual discount 20%") */
  discountReason?: string;
  /** ISO 8601 — session expires after this time */
  expiresAt: string;
}

// ── Grant programs ────────────────────────────────────────────────────────────

/**
 * Supported grant / free-access programs.
 * student is treated as a sub-type of academic for application purposes.
 *
 * Підтримувані програми грантового / безкоштовного доступу.
 */
export type GrantProgram =
  | "journalist"
  | "ngo"
  | "ua-resident"
  | "academic"
  | "student";

export interface GrantApplication {
  applicantEmail: string;
  program: GrantProgram;
  /** Organisation name (optional for individuals) */
  organization?: string;
  /** Link to professional profile, institution page, or credential evidence */
  verificationUrl?: string;
  status: "pending" | "approved" | "rejected";
  /** ISO 8601 */
  appliedAt: string;
  /** ISO 8601 — set when status changes to approved or rejected */
  reviewedAt?: string;
  /** ISO 8601 — when approved access expires (null = indefinite, reviewed annually) */
  expiresAt?: string;
}
