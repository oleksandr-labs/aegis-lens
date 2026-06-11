/**
 * Stripe Webhook event router.
 *
 * Verifies HMAC signature (stub — wire real crypto.timingSafeEqual in prod),
 * then dispatches to per-event handlers that update the subscription store,
 * wallet, and usage meters.
 *
 * Маршрутизатор Stripe вебхуків. Stub для HMAC перевірки — довести до ладу в prod.
 */

import { subscriptionStore } from "./subscription-store";
import { walletStore } from "./credits-wallet";
import type { Subscription } from "./types";

// ── Event type union ──────────────────────────────────────────────────────────

export type StripeEventType =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "checkout.session.completed";

// ── Signature verification (stub) ─────────────────────────────────────────────

/**
 * Verify Stripe webhook HMAC signature.
 *
 * In production, replace with:
 *   stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
 *
 * Returns true in dev (no STRIPE_WEBHOOK_SECRET set) to allow local testing.
 *
 * В продакшені — замінити на stripe.webhooks.constructEvent.
 */
export function verifyStripeSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[stripe-webhooks] STRIPE_WEBHOOK_SECRET not set — skipping signature verification (dev mode).",
    );
    return true;
  }

  // TODO: replace with real HMAC verification using crypto.timingSafeEqual
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // try { stripe.webhooks.constructEvent(rawBody, signature, secret); return true; }
  // catch { return false; }

  console.warn(
    "[stripe-webhooks] Signature verification stub — implement before going live.",
  );
  return !!signature && !!rawBody;
}

// ── Per-event handlers ────────────────────────────────────────────────────────

export async function onSubscriptionCreated(data: unknown): Promise<void> {
  const obj = data as Record<string, unknown>;
  const sub: Subscription = {
    id: String(obj["id"] ?? ""),
    userId: String((obj["metadata"] as Record<string, string>)?.["userId"] ?? ""),
    tierId: String((obj["metadata"] as Record<string, string>)?.["tierId"] ?? "free"),
    status: "active",
    period: "monthly",
    priceUsd: Number(obj["items"]) ?? 0,
    currentPeriodStart: new Date(
      Number(obj["current_period_start"] ?? 0) * 1000,
    ).toISOString(),
    currentPeriodEnd: new Date(
      Number(obj["current_period_end"] ?? 0) * 1000,
    ).toISOString(),
    cancelAtPeriodEnd: Boolean(obj["cancel_at_period_end"]),
    stripeSubscriptionId: String(obj["id"] ?? ""),
  };

  if (!sub.userId) {
    console.warn("[stripe-webhooks] onSubscriptionCreated: missing userId in metadata — skipping.");
    return;
  }

  subscriptionStore.create(sub);
  console.info(`[stripe-webhooks] Subscription created: ${sub.id} for user ${sub.userId}`);
}

export async function onSubscriptionUpdated(data: unknown): Promise<void> {
  const obj = data as Record<string, unknown>;
  const stripeId = String(obj["id"] ?? "");

  const patch: Partial<Subscription> = {
    status: (obj["status"] as Subscription["status"]) ?? "active",
    cancelAtPeriodEnd: Boolean(obj["cancel_at_period_end"]),
    currentPeriodEnd: new Date(
      Number(obj["current_period_end"] ?? 0) * 1000,
    ).toISOString(),
  };

  // Find internal subscription by Stripe ID
  // In production, query the DB instead of scanning
  const userId = String((obj["metadata"] as Record<string, string>)?.["userId"] ?? "");
  if (!userId) {
    console.warn("[stripe-webhooks] onSubscriptionUpdated: missing userId in metadata — skipping.");
    return;
  }

  const existing = subscriptionStore.getByUserId(userId);
  if (!existing) {
    console.warn(`[stripe-webhooks] No subscription found for user ${userId} — creating from update.`);
    return;
  }

  subscriptionStore.update(existing.id, patch);
  console.info(`[stripe-webhooks] Subscription updated: ${stripeId}`);
}

export async function onSubscriptionDeleted(data: unknown): Promise<void> {
  const obj = data as Record<string, unknown>;
  const userId = String((obj["metadata"] as Record<string, string>)?.["userId"] ?? "");
  if (!userId) return;

  const existing = subscriptionStore.getByUserId(userId);
  if (!existing) return;

  subscriptionStore.cancel(existing.id, false);
  console.info(`[stripe-webhooks] Subscription deleted for user ${userId}`);
}

export async function onInvoicePaid(data: unknown): Promise<void> {
  const obj = data as Record<string, unknown>;
  const amountPaid = Number(obj["amount_paid"] ?? 0); // in cents
  const userId = String(
    (obj["subscription_details"] as Record<string, unknown>)?.["metadata"]
      ? ((obj["subscription_details"] as Record<string, Record<string, string>>)["metadata"]?.["userId"] ?? "")
      : "",
  );

  if (!userId) {
    console.warn("[stripe-webhooks] onInvoicePaid: could not resolve userId — skipping bonus.");
    return;
  }

  // Award any volume bonus credits on top-ups
  const dollars = amountPaid / 100;
  let bonusPct = 0;
  if (dollars >= 5000) bonusPct = 0.2;
  else if (dollars >= 1000) bonusPct = 0.1;
  else if (dollars >= 250) bonusPct = 0.05;

  if (bonusPct > 0) {
    const bonusCredits = Math.floor(dollars * 100 * bonusPct);
    walletStore.credit(
      userId,
      bonusCredits,
      "bonus",
      `Volume bonus for $${dollars} payment (+${Math.round(bonusPct * 100)}%)`,
      `Бонус за оплату $${dollars} (+${Math.round(bonusPct * 100)}%)`,
    );
  }

  console.info(`[stripe-webhooks] Invoice paid $${dollars} for user ${userId}`);
}

export async function onInvoicePaymentFailed(data: unknown): Promise<void> {
  const obj = data as Record<string, unknown>;
  const invoiceId = String(obj["id"] ?? "");
  const userId = String(
    (obj["subscription_details"] as Record<string, Record<string, string>>)?.["metadata"]?.["userId"] ?? "",
  );

  console.warn(
    `[stripe-webhooks] Invoice payment failed: ${invoiceId} for user ${userId}. ` +
      "Dunning flow should be triggered here.",
  );

  // TODO: update subscription status to past_due, trigger dunning email
  if (userId) {
    const existing = subscriptionStore.getByUserId(userId);
    if (existing) {
      subscriptionStore.update(existing.id, { status: "past_due" });
    }
  }
}

export async function onCheckoutCompleted(data: unknown): Promise<void> {
  const obj = data as Record<string, unknown>;
  const sessionId = String(obj["id"] ?? "");
  const userId = String((obj["metadata"] as Record<string, string>)?.["userId"] ?? "");
  const tierId = String((obj["metadata"] as Record<string, string>)?.["tierId"] ?? "");
  const mode = String(obj["mode"] ?? "");

  console.info(
    `[stripe-webhooks] Checkout completed: session ${sessionId} mode=${mode} user=${userId} tier=${tierId}`,
  );

  // Subscription mode — subscription store is updated via onSubscriptionCreated
  // Payment mode (one-off pass) — no subscription to update
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

/**
 * Route a verified Stripe event to the appropriate handler.
 *
 * Call this only after verifyStripeSignature() returns true.
 *
 * Маршрутизує верифікований Stripe-подія до відповідного обробника.
 */
export async function handleStripeEvent(event: {
  type: string;
  data: { object: unknown };
}): Promise<void> {
  const { type, data } = event;

  switch (type as StripeEventType) {
    case "customer.subscription.created":
      return onSubscriptionCreated(data.object);
    case "customer.subscription.updated":
      return onSubscriptionUpdated(data.object);
    case "customer.subscription.deleted":
      return onSubscriptionDeleted(data.object);
    case "invoice.paid":
      return onInvoicePaid(data.object);
    case "invoice.payment_failed":
      return onInvoicePaymentFailed(data.object);
    case "checkout.session.completed":
      return onCheckoutCompleted(data.object);
    default:
      console.info(`[stripe-webhooks] Unhandled event type: ${type}`);
  }
}
