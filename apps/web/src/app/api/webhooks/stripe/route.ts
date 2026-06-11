/**
 * POST /api/webhooks/stripe — Stripe webhook receiver
 *
 * Verifies HMAC signature, then dispatches to the billing event router.
 * Wire STRIPE_WEBHOOK_SECRET in production (via `stripe listen --forward-to …`
 * locally, or Stripe Dashboard → Webhooks in production).
 *
 * POST /api/webhooks/stripe — приймач Stripe вебхуків.
 * Верифікує HMAC підпис, далі маршрутизує до обробника подій.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  handleStripeEvent,
  verifyStripeSignature,
} from "../../../../lib/billing/stripe-webhooks";

export const dynamic = "force-dynamic";

/**
 * Stripe sends the raw body — we must read it as text before parsing,
 * otherwise signature verification fails.
 *
 * Stripe надсилає сире тіло — читаємо як текст до парсингу.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to read request body" },
      { status: 400 },
    );
  }

  const signature = req.headers.get("stripe-signature") ?? "";

  // ── Signature verification ─────────────────────────────────────────────────

  if (!verifyStripeSignature(rawBody, signature)) {
    console.warn("[webhooks/stripe] Invalid signature — request rejected.");
    return NextResponse.json(
      { error: "Invalid Stripe signature" },
      { status: 400 },
    );
  }

  // ── Parse event ────────────────────────────────────────────────────────────

  let event: { type: string; data: { object: unknown } };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json(
      { error: "Failed to parse event JSON" },
      { status: 400 },
    );
  }

  if (!event.type || !event.data) {
    return NextResponse.json(
      { error: "Malformed Stripe event: missing type or data" },
      { status: 400 },
    );
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────

  try {
    await handleStripeEvent(event);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[webhooks/stripe] Error handling event "${event.type}":`, msg);
    // Return 200 to prevent Stripe from retrying (log and handle async)
    // For critical handlers, return 500 to trigger retry.
    return NextResponse.json(
      { received: true, error: msg },
      { status: 200 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
