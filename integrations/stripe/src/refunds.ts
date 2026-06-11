/**
 * Refund + chargeback (dispute) workflow.
 *
 * Task: "Refund + chargeback workflow".
 *
 * Refunds: full/partial, idempotent, with a reason taxonomy that maps to Stripe
 * reasons. Chargebacks (disputes): we model the dispute lifecycle, assemble
 * evidence, and decide whether to contest or accept based on amount + reason.
 *
 * https://stripe.com/docs/refunds
 * https://stripe.com/docs/disputes
 */

import { idempotencyKey } from "./idempotency";
import type { StripeRequest, I18nString } from "./types";

// ── Refunds ──────────────────────────────────────────────────────────────────

export type RefundReason = "requested_by_customer" | "duplicate" | "fraudulent" | "service_issue";

/** Map our internal reason to Stripe's accepted refund reasons. */
export function stripeRefundReason(reason: RefundReason): "requested_by_customer" | "duplicate" | "fraudulent" {
  if (reason === "service_issue") return "requested_by_customer";
  return reason;
}

export interface RefundInput {
  /** Charge or PaymentIntent id. */
  chargeId: string;
  reason: RefundReason;
  /** Minor units; omit for a full refund. */
  amount?: number;
  /** Reverse the Connect application fee + transfer (plugin sales). */
  reverseTransfer?: boolean;
  refundApplicationFee?: boolean;
  /** Free-form note stored in metadata. */
  note?: string;
}

export function refundRequest(input: RefundInput): StripeRequest {
  const params: Record<string, unknown> = {
    charge: input.chargeId,
    reason: stripeRefundReason(input.reason),
    metadata: { internal_reason: input.reason, note: input.note ?? "" },
  };
  if (typeof input.amount === "number") params.amount = input.amount;
  if (input.reverseTransfer) params.reverse_transfer = true;
  if (input.refundApplicationFee) params.refund_application_fee = true;
  return {
    method: "POST",
    path: "/v1/refunds",
    params,
    // Deterministic on (charge, amount) → a retried refund won't double-refund.
    idempotencyKey: idempotencyKey("refund", input.chargeId, String(input.amount ?? "full")),
  };
}

// ── Chargebacks / disputes ─────────────────────────────────────────────────────

export type DisputeReason =
  | "fraudulent"
  | "duplicate"
  | "product_not_received"
  | "product_unacceptable"
  | "subscription_canceled"
  | "credit_not_processed"
  | "general"
  | "unrecognized";

export type DisputeDecision = "contest" | "accept";

/**
 * Decide whether to contest a dispute. Policy:
 *  - "fraudulent" / "unrecognized": contest if we have IP/login evidence,
 *    otherwise accept (contesting genuine fraud is costly).
 *  - "product_not_received" / "unacceptable": contest with delivery evidence.
 *  - "duplicate" / "credit_not_processed": usually accept + refund (we likely erred).
 *  - tiny amounts below threshold: accept (contest cost > amount).
 */
export interface DisputeContext {
  reason: DisputeReason;
  amount: number;
  currency: string;
  hasUsageEvidence: boolean; // login/IP/API-usage logs proving the customer used the service
  hasDeliveryEvidence: boolean; // receipts, access grants
}

/** Below this (USD minor units equiv), contesting is not worth it. */
export const CONTEST_MIN_AMOUNT = 2000; // ~$20

export function decideDispute(ctx: DisputeContext): DisputeDecision {
  if (ctx.amount < CONTEST_MIN_AMOUNT) return "accept";
  switch (ctx.reason) {
    case "duplicate":
    case "credit_not_processed":
      return "accept";
    case "fraudulent":
    case "unrecognized":
      return ctx.hasUsageEvidence ? "contest" : "accept";
    case "product_not_received":
    case "product_unacceptable":
      return ctx.hasDeliveryEvidence ? "contest" : "accept";
    case "subscription_canceled":
      return ctx.hasUsageEvidence ? "contest" : "accept";
    default:
      return ctx.hasUsageEvidence || ctx.hasDeliveryEvidence ? "contest" : "accept";
  }
}

/** Evidence bundle for contesting a dispute (mapped to Stripe dispute.evidence). */
export interface DisputeEvidence {
  customer_email_address?: string;
  customer_purchase_ip?: string;
  service_date?: string;
  service_documentation?: string; // file id of access/usage report
  access_activity_log?: string;
  uncategorized_text?: string;
}

export function submitDisputeRequest(disputeId: string, decision: DisputeDecision, evidence?: DisputeEvidence): StripeRequest {
  if (decision === "accept") {
    return {
      method: "POST",
      path: `/v1/disputes/${disputeId}/close`,
      params: {},
      idempotencyKey: idempotencyKey("dispute_close", disputeId),
    };
  }
  return {
    method: "POST",
    path: `/v1/disputes/${disputeId}`,
    params: { evidence: { ...(evidence ?? {}) }, submit: true },
    idempotencyKey: idempotencyKey("dispute_contest", disputeId),
  };
}

/** Bilingual customer-facing messages for refund/dispute outcomes. */
export const REFUND_MESSAGES: Record<string, I18nString> = {
  refund_issued: {
    en: "Your refund has been issued and will appear in 5–10 business days.",
    uk: "Ваше відшкодування оформлено і з'явиться протягом 5–10 робочих днів.",
  },
  dispute_received: {
    en: "We received a payment dispute and are reviewing it.",
    uk: "Ми отримали оскарження платежу й розглядаємо його.",
  },
};
