"use server";

/**
 * Stripe Checkout & Customer Portal integration.
 *
 * In production, install and import the official `stripe` npm package and
 * replace the mock implementations with real Stripe SDK calls.
 * In dev (no STRIPE_SECRET_KEY), the functions return typed mock objects so
 * the rest of the app can be developed without a live Stripe account.
 *
 * В продакшені — підключити stripe SDK. В dev — повертаємо typed mock.
 */

import type { BillingPeriod, CheckoutSession } from "./types";

// ── URL constants ─────────────────────────────────────────────────────────────

export const CHECKOUT_SUCCESS_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL ??
  "https://aegislens.uk/billing/success?session_id={CHECKOUT_SESSION_ID}";

export const CHECKOUT_CANCEL_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_CANCEL_URL ??
  "https://aegislens.uk/billing/cancel";

/** Enable Stripe Tax automatic collection (VAT / GST / sales tax). */
export const STRIPE_TAX_ENABLED = true;

// ── Price ID map ──────────────────────────────────────────────────────────────

/**
 * Maps tierId → BillingPeriod → Stripe Price ID environment variable name.
 * Pre-create each Price in the Stripe dashboard, then set the env vars.
 *
 * Маппінг tierId + BillingPeriod → назва env-змінної Stripe Price ID.
 */
export const STRIPE_PRICE_IDS: Record<string, Record<BillingPeriod, string>> = {
  observer: {
    monthly: process.env.STRIPE_PRICE_OBSERVER_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_OBSERVER_ANNUAL ?? "",
    biennial: process.env.STRIPE_PRICE_OBSERVER_BIENNIAL ?? "",
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
    biennial: process.env.STRIPE_PRICE_PRO_BIENNIAL ?? "",
  },
  pro_plus: {
    monthly: process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_PRO_PLUS_ANNUAL ?? "",
    biennial: process.env.STRIPE_PRICE_PRO_PLUS_BIENNIAL ?? "",
  },
  team: {
    monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_TEAM_ANNUAL ?? "",
    biennial: process.env.STRIPE_PRICE_TEAM_BIENNIAL ?? "",
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL ?? "",
    biennial: process.env.STRIPE_PRICE_BUSINESS_BIENNIAL ?? "",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isDev(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── createCheckoutSession ─────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for a new subscription or upgrade.
 *
 * Returns a `CheckoutSession` with a `url` to redirect the user to.
 * In dev (no STRIPE_SECRET_KEY), returns a mock session with a local URL.
 *
 * @param userId         Internal user ID (stored in Stripe metadata)
 * @param tierId         Target tier (must exist in STRIPE_PRICE_IDS)
 * @param period         Billing period
 * @param discountCode   Optional Stripe coupon / promo code
 *
 * Створює Stripe Checkout Session. В dev повертає mock.
 */
export async function createCheckoutSession(
  userId: string,
  tierId: string,
  period: BillingPeriod,
  discountCode?: string,
): Promise<CheckoutSession> {
  const priceId = STRIPE_PRICE_IDS[tierId]?.[period];

  if (!priceId && !isDev()) {
    throw new Error(
      `[stripe-checkout] No Stripe Price ID configured for ${tierId}/${period}`,
    );
  }

  // ── Dev / stub path ──────────────────────────────────────────────────────────
  if (isDev()) {
    const sessionId = generateId("cs_test");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    console.info(
      `[stripe-checkout] DEV mode — returning mock session for ${tierId}/${period}`,
    );

    return {
      id: sessionId,
      url: `${CHECKOUT_SUCCESS_URL.replace("{CHECKOUT_SESSION_ID}", sessionId)}&dev=1`,
      tierId,
      period,
      priceUsd: 0,
      discountApplied: discountCode ? 0 : undefined,
      discountReason: discountCode ? `code:${discountCode}` : undefined,
      expiresAt,
    };
  }

  // ── Production path — replace with real Stripe SDK call ─────────────────────
  //
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  //   const session = await stripe.checkout.sessions.create({
  //     mode: "subscription",
  //     line_items: [{ price: priceId, quantity: 1 }],
  //     success_url: CHECKOUT_SUCCESS_URL,
  //     cancel_url: CHECKOUT_CANCEL_URL,
  //     automatic_tax: { enabled: STRIPE_TAX_ENABLED },
  //     discounts: discountCode ? [{ coupon: discountCode }] : [],
  //     metadata: { userId, tierId, period },
  //   });
  //   return { id: session.id, url: session.url!, tierId, period, priceUsd: ..., expiresAt: ... };

  throw new Error(
    "[stripe-checkout] Production Stripe SDK not yet wired — set STRIPE_SECRET_KEY to enable.",
  );
}

// ── createPortalSession ───────────────────────────────────────────────────────

/**
 * Create a Stripe Customer Portal session URL.
 * The user is redirected here to manage their subscription (cancel, upgrade,
 * update payment method, download invoices).
 *
 * @param stripeCustomerId  Stripe customer ID (cus_…)
 * @param returnUrl         URL to send the user back to after portal actions
 *
 * Створює URL Stripe Customer Portal для управління підпискою.
 */
export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<string> {
  if (isDev()) {
    console.info(
      `[stripe-checkout] DEV mode — returning mock portal URL for customer ${stripeCustomerId}`,
    );
    return `${returnUrl}?dev_portal=1&customer=${stripeCustomerId}`;
  }

  // ── Production path ──────────────────────────────────────────────────────────
  //
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  //   const session = await stripe.billingPortal.sessions.create({
  //     customer: stripeCustomerId,
  //     return_url: returnUrl,
  //   });
  //   return session.url;

  throw new Error(
    "[stripe-checkout] Production Stripe SDK not yet wired — set STRIPE_SECRET_KEY to enable.",
  );
}
