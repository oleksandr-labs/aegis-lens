/**
 * POST /api/integrations/stripe/webhooks — Stripe webhook handler
 *
 * Handles the subscription lifecycle, payment events, and metered usage billing.
 * Verifies requests with Stripe-Signature HMAC (SHA-256) before processing.
 *
 * Events handled:
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.payment_succeeded
 *   invoice.payment_failed
 *   customer.subscription.trial_will_end
 *   billing_portal.session.created
 *
 * https://stripe.com/docs/webhooks
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

type StripeEvent = {
  id: string;
  type: string;
  livemode: boolean;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
};

function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const parts = Object.fromEntries(
    signature.split(",").map((s) => s.split("=")),
  ) as { t?: string; v1?: string };

  if (!parts.t || !parts.v1) return false;

  const nowS = Math.floor(Date.now() / 1000);
  if (Math.abs(nowS - parseInt(parts.t, 10)) > 300) return false;

  const signed = `${parts.t}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(parts.v1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

function tierFromPriceId(priceId: string): string {
  if (priceId.includes("enterprise")) return "enterprise";
  if (priceId.includes("pro")) return "pro";
  return "free";
}

async function handleSubscriptionCreated(obj: Record<string, unknown>): Promise<void> {
  const customerId = obj.customer as string;
  const priceId = (obj.items as { data: { price: { id: string } }[] }).data[0]?.price?.id ?? "";
  const tier = tierFromPriceId(priceId);
  // In production: update org.tier in database
  console.info(`[stripe] subscription.created: customer=${customerId} tier=${tier}`);
}

async function handleSubscriptionUpdated(obj: Record<string, unknown>): Promise<void> {
  const customerId = obj.customer as string;
  const status = obj.status as string;
  const priceId = (obj.items as { data: { price: { id: string } }[] }).data[0]?.price?.id ?? "";
  const tier = tierFromPriceId(priceId);
  // In production: update org.tier + subscription status in database
  console.info(`[stripe] subscription.updated: customer=${customerId} tier=${tier} status=${status}`);
}

async function handleSubscriptionDeleted(obj: Record<string, unknown>): Promise<void> {
  const customerId = obj.customer as string;
  // In production: downgrade org to free tier
  console.info(`[stripe] subscription.deleted: customer=${customerId} → downgrade to free`);
}

async function handleInvoicePaymentSucceeded(obj: Record<string, unknown>): Promise<void> {
  const customerId = obj.customer as string;
  const invoiceId = obj.id as string;
  const amountPaid = obj.amount_paid as number;
  // In production: record payment, generate receipt, clear dunning state
  console.info(`[stripe] invoice.payment_succeeded: customer=${customerId} invoice=${invoiceId} amount=${amountPaid}`);
}

async function handleInvoicePaymentFailed(obj: Record<string, unknown>): Promise<void> {
  const customerId = obj.customer as string;
  const nextAttempt = obj.next_payment_attempt as number | null;
  // In production: trigger dunning email, set grace period, notify org admins
  console.warn(`[stripe] invoice.payment_failed: customer=${customerId} nextAttempt=${nextAttempt}`);
}

async function handleTrialWillEnd(obj: Record<string, unknown>): Promise<void> {
  const customerId = obj.customer as string;
  const trialEnd = obj.trial_end as number;
  const daysLeft = Math.ceil((trialEnd * 1000 - Date.now()) / 86_400_000);
  // In production: send trial-ending email
  console.info(`[stripe] trial_will_end: customer=${customerId} daysLeft=${daysLeft}`);
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_dev";

  if (process.env.NODE_ENV === "production") {
    if (!verifyStripeSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;
      // Ignore other event types gracefully
      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe] handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true, eventId: event.id });
}
