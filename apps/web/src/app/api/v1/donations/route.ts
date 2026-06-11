/**
 * POST /api/v1/donations  — create a donation checkout session
 * GET  /api/v1/donations/patronage — return PATRONAGE_TIERS
 *
 * POST /api/v1/donations — створити сесію оплати для пожертвування
 * GET  /api/v1/donations/patronage — повернути рівні патронажу
 */

import { NextRequest, NextResponse } from "next/server";
import {
  PATRONAGE_TIERS,
  DONATION_CHANNELS,
  type DonationChannel,
} from "../../../../lib/funding/donations";

export const dynamic = "force-dynamic";

// ── GET — list patronage tiers ─────────────────────────────────────────────────

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: PATRONAGE_TIERS.length,
      data: PATRONAGE_TIERS,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Aegis-API-Version": "v1",
      },
    },
  );
}

// ── POST — create donation checkout session ────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", error_uk: "Невалідне тіло запиту" },
      { status: 400 },
    );
  }

  const { amount, currency = "usd", channel, tierId, donorEmail } = body as {
    amount?: number;
    currency?: string;
    channel?: string;
    tierId?: string;
    donorEmail?: string;
  };

  // Validate amount
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      {
        error: "amount must be a positive number",
        error_uk: "amount має бути позитивним числом",
      },
      { status: 422 },
    );
  }

  // Validate channel
  const validChannels = DONATION_CHANNELS.filter((c) => c.enabled).map(
    (c) => c.channel,
  );
  if (!channel || !validChannels.includes(channel as DonationChannel)) {
    return NextResponse.json(
      {
        error: `channel must be one of: ${validChannels.join(", ")}`,
        error_uk: `channel має бути одним з: ${validChannels.join(", ")}`,
      },
      { status: 422 },
    );
  }

  const channelConfig = DONATION_CHANNELS.find((c) => c.channel === channel);
  if (channelConfig && amount < channelConfig.minAmountUsd) {
    return NextResponse.json(
      {
        error: `Minimum donation for ${channel} is $${channelConfig.minAmountUsd}`,
        error_uk: `Мінімальна пожертва для ${channel}: $${channelConfig.minAmountUsd}`,
      },
      { status: 422 },
    );
  }

  // Resolve patronage tier if tierId provided
  const resolvedTier = tierId
    ? PATRONAGE_TIERS.find((t) => t.id === tierId) ?? null
    : null;

  // Route to appropriate payment handler
  if (channel === "stripe") {
    // TODO: integrate with createCheckoutSession from billing/stripe-checkout
    // For now, return a stub response indicating where to redirect
    return NextResponse.json(
      {
        object: "donation_checkout",
        channel: "stripe",
        amount,
        currency: currency.toUpperCase(),
        tier: resolvedTier,
        checkoutUrl: `https://aegislens.uk/donate/checkout?amount=${amount}&currency=${currency}${tierId ? `&tier=${tierId}` : ""}`,
        message_en: "Redirect to Stripe checkout to complete your donation.",
        message_uk: "Перейдіть до Stripe для завершення пожертвування.",
      },
      { status: 201 },
    );
  }

  if (channel === "paypal") {
    return NextResponse.json(
      {
        object: "donation_checkout",
        channel: "paypal",
        amount,
        currency: currency.toUpperCase(),
        tier: resolvedTier,
        checkoutUrl: `https://aegislens.uk/donate/paypal?amount=${amount}&currency=${currency}`,
        message_en: "Redirect to PayPal to complete your donation.",
        message_uk: "Перейдіть до PayPal для завершення пожертвування.",
      },
      { status: 201 },
    );
  }

  if (
    channel === "crypto-btc" ||
    channel === "crypto-eth" ||
    channel === "crypto-usdt"
  ) {
    return NextResponse.json(
      {
        object: "donation_checkout",
        channel,
        amount,
        currency: currency.toUpperCase(),
        tier: resolvedTier,
        checkoutUrl: `https://aegislens.uk/donate/crypto?coin=${channel.replace("crypto-", "")}&amount=${amount}`,
        message_en: "Navigate to our crypto donation page for wallet address and QR code.",
        message_uk: "Перейдіть на сторінку крипто-пожертвувань для адреси гаманця.",
      },
      { status: 201 },
    );
  }

  if (channel === "ua-bank") {
    return NextResponse.json(
      {
        object: "donation_checkout",
        channel: "ua-bank",
        amount,
        currency: "UAH",
        tier: resolvedTier,
        checkoutUrl: "https://aegislens.uk/donate/ua-bank",
        message_en: "Navigate to UA bank donation page for bank details and QR code.",
        message_uk: "Перейдіть на сторінку UA-банку для реквізитів та QR-коду.",
      },
      { status: 201 },
    );
  }

  // Fallback
  return NextResponse.json(
    {
      error: `Channel ${channel} is not yet fully implemented`,
      error_uk: `Канал ${channel} ще не повністю реалізовано`,
    },
    { status: 501 },
  );
}
