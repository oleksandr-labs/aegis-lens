/**
 * POST /api/v1/passes  — issue a pass checkout session
 * GET  /api/v1/passes  — get active pass for the authenticated user
 *
 * Pass types: day-pass (24h), event-pass (72h), crisis-pass (48h free)
 *
 * POST /api/v1/passes — створити сесію покупки пасу
 * GET  /api/v1/passes — отримати активний пас поточного користувача
 */

import { NextRequest, NextResponse } from "next/server";
import { passStore, PassConfig } from "../../../../lib/billing/passes";
import { createCheckoutSession } from "../../../../lib/billing/stripe-checkout";
import type { PassType } from "../../../../lib/billing/passes";
import type { BillingPeriod } from "../../../../lib/billing/types";

export const dynamic = "force-dynamic";

// ── GET — active pass ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // TODO: replace with real session/auth resolver
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", error_uk: "Необхідна автентифікація" },
      { status: 401 },
    );
  }

  const pass = passStore.getActivePass(userId);
  if (!pass) {
    return NextResponse.json(
      {
        active: false,
        pass: null,
        message_en: "No active pass found.",
        message_uk: "Активний пас не знайдено.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ active: true, pass });
}

// ── POST — create checkout session for pass purchase ──────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // TODO: replace with real session/auth resolver
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", error_uk: "Необхідна автентифікація" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", error_uk: "Невалідне тіло запиту" },
      { status: 400 },
    );
  }

  const { type, priceUsd, eventId } = body as {
    type?: string;
    priceUsd?: number;
    eventId?: string;
  };

  // Validate pass type
  const validTypes: PassType[] = ["day-pass", "event-pass", "crisis-pass"];
  if (!type || !validTypes.includes(type as PassType)) {
    return NextResponse.json(
      {
        error: `Invalid pass type. Must be one of: ${validTypes.join(", ")}`,
        error_uk: `Невалідний тип пасу. Допустимі значення: ${validTypes.join(", ")}`,
      },
      { status: 422 },
    );
  }

  const passType = type as PassType;
  const config = PassConfig[passType];
  const resolvedPrice =
    typeof priceUsd === "number" && config.priceUsdOptions.includes(priceUsd)
      ? priceUsd
      : config.defaultPriceUsd;

  // Crisis pass — no payment required; issue directly
  if (passType === "crisis-pass") {
    // TODO: add geo-IP verification before free issue
    const pass = passStore.issue(userId, passType, 0, eventId);
    return NextResponse.json(
      {
        pass,
        checkout: null,
        message_en: "Crisis pass issued. No payment required.",
        message_uk: "Кризовий пас видано. Оплата не потрібна.",
      },
      { status: 201 },
    );
  }

  // Paid pass — create a Stripe Checkout session
  // Pass purchases use a one-time price (not a subscription period)
  // We reuse createCheckoutSession with the pass tier as tierId and "monthly"
  // as a stand-in period; in production, use a separate one-time price ID.
  let session;
  try {
    session = await createCheckoutSession(
      userId,
      `pass:${passType}`,
      "monthly" as BillingPeriod,
    );
  } catch (err) {
    console.error("[passes/route] createCheckoutSession error:", err);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        error_uk: "Не вдалося створити сесію оплати",
      },
      { status: 502 },
    );
  }

  // Pre-issue the pass (activated=false until checkout webhook confirms payment)
  const pass = passStore.issue(userId, passType, resolvedPrice, eventId);

  return NextResponse.json(
    {
      pass,
      checkout: {
        id: session.id,
        url: session.url,
        expiresAt: session.expiresAt,
        priceUsd: resolvedPrice,
      },
      message_en: "Proceed to checkout to activate your pass.",
      message_uk: "Перейдіть до оплати для активації пасу.",
    },
    { status: 201 },
  );
}
