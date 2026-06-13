/**
 * Stripe Checkout & Customer Portal — unified entry point.
 *
 * This module consolidates:
 *   - STRIPE_PRICE_IDS map (plan → Stripe price ID)
 *   - createCheckoutSession()        — redirect user to Stripe-hosted checkout
 *   - createCustomerPortalSession()  — redirect user to Stripe billing portal
 *   - StripeWebhookHandler           — type for subscription lifecycle events
 *
 * In production set STRIPE_SECRET_KEY; in dev all functions return typed mocks.
 *
 * Єдина точка входу Stripe Checkout та Customer Portal.
 * В production встановіть STRIPE_SECRET_KEY; в dev — typeed mocks.
 */

"use server";

// ── Plan → Price ID map ────────────────────────────────────────────────────────

/**
 * Maps `plan_name` → Stripe Price ID.
 *
 * Placeholder format: `price_xxx_<plan_name>` (replace with real IDs from the
 * Stripe Dashboard → Products → Prices before going live).
 *
 * Env var names follow the convention: STRIPE_PRICE_<PLAN>_<PERIOD>
 *
 * Маппінг `plan_name` → Stripe Price ID. Замінити реальними ID перед запуском.
 */
export const STRIPE_PRICE_IDS = {
  // ── Observer ───────────────────────────────────────────────────────────────
  observer_monthly:
    process.env.STRIPE_PRICE_OBSERVER_MONTHLY ?? "price_xxx_observer_monthly",
  observer_annual:
    process.env.STRIPE_PRICE_OBSERVER_ANNUAL ?? "price_xxx_observer_annual",
  observer_biennial:
    process.env.STRIPE_PRICE_OBSERVER_BIENNIAL ?? "price_xxx_observer_biennial",

  // ── Pro ────────────────────────────────────────────────────────────────────
  pro_monthly:
    process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_xxx_pro_monthly",
  pro_annual:
    process.env.STRIPE_PRICE_PRO_ANNUAL ?? "price_xxx_pro_annual",
  pro_biennial:
    process.env.STRIPE_PRICE_PRO_BIENNIAL ?? "price_xxx_pro_biennial",

  // ── Pro+ ───────────────────────────────────────────────────────────────────
  pro_plus_monthly:
    process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ?? "price_xxx_pro_plus_monthly",
  pro_plus_annual:
    process.env.STRIPE_PRICE_PRO_PLUS_ANNUAL ?? "price_xxx_pro_plus_annual",
  pro_plus_biennial:
    process.env.STRIPE_PRICE_PRO_PLUS_BIENNIAL ?? "price_xxx_pro_plus_biennial",

  // ── Team ───────────────────────────────────────────────────────────────────
  team_monthly:
    process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "price_xxx_team_monthly",
  team_annual:
    process.env.STRIPE_PRICE_TEAM_ANNUAL ?? "price_xxx_team_annual",
  team_biennial:
    process.env.STRIPE_PRICE_TEAM_BIENNIAL ?? "price_xxx_team_biennial",

  // ── Business ───────────────────────────────────────────────────────────────
  business_monthly:
    process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? "price_xxx_business_monthly",
  business_annual:
    process.env.STRIPE_PRICE_BUSINESS_ANNUAL ?? "price_xxx_business_annual",
  business_biennial:
    process.env.STRIPE_PRICE_BUSINESS_BIENNIAL ?? "price_xxx_business_biennial",

  // ── API add-on tiers ───────────────────────────────────────────────────────
  api_starter_monthly:
    process.env.STRIPE_PRICE_API_STARTER_MONTHLY ?? "price_xxx_api_starter_monthly",
  api_growth_monthly:
    process.env.STRIPE_PRICE_API_GROWTH_MONTHLY ?? "price_xxx_api_growth_monthly",

  // ── Day / Event / Crisis passes ────────────────────────────────────────────
  pass_day:
    process.env.STRIPE_PRICE_PASS_DAY ?? "price_xxx_pass_day",
  pass_event:
    process.env.STRIPE_PRICE_PASS_EVENT ?? "price_xxx_pass_event",
  pass_crisis:
    process.env.STRIPE_PRICE_PASS_CRISIS ?? "price_xxx_pass_crisis",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICE_IDS;

// ── createCheckoutSession params & result ─────────────────────────────────────

export interface CheckoutSessionParams {
  /** Stripe Price ID (from STRIPE_PRICE_IDS) */
  priceId: string;
  /** Internal user ID — stored in Stripe metadata */
  userId: string;
  /** Internal org ID — stored in Stripe metadata */
  orgId: string;
  /**
   * BCP 47 locale tag — passed to Stripe to localise the hosted checkout UI.
   * Examples: "en", "uk", "pl"
   */
  locale: string;
  /** Stripe customer ID if already known; Stripe creates a new one otherwise */
  stripeCustomerId?: string;
  /** Optional coupon / promo code */
  discountCode?: string;
  /** URL to redirect to after successful payment */
  successUrl?: string;
  /** URL to redirect to if the user cancels */
  cancelUrl?: string;
}

export interface CheckoutSessionResult {
  /** Stripe-hosted checkout URL — redirect the user here */
  url: string;
  /** Stripe checkout session ID (cs_…) */
  sessionId: string;
}

// ── createCustomerPortalSession params & result ───────────────────────────────

export interface PortalSessionResult {
  /** Stripe Customer Portal URL — redirect the user here */
  url: string;
}

// ── StripeWebhookHandler type ─────────────────────────────────────────────────

/**
 * Handler function signature for Stripe subscription lifecycle events.
 *
 * Used to wire up the `/api/webhooks/stripe` route handler and the billing
 * event router in `apps/web/src/lib/billing/stripe-webhooks.ts`.
 *
 * Typed for the three core subscription events plus checkout completion.
 *
 * Тип обробника для подій підписки Stripe.
 */
export type StripeSubscriptionEvent =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

export interface StripeSubscriptionObject {
  id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "paused";
  current_period_start: number; // Unix timestamp
  current_period_end: number;   // Unix timestamp
  cancel_at_period_end: boolean;
  metadata: Record<string, string>;
  items?: {
    data: Array<{
      price: { id: string; unit_amount: number | null };
    }>;
  };
}

export interface StripeWebhookPayload {
  type: StripeSubscriptionEvent | "checkout.session.completed" | string;
  data: { object: unknown };
}

/**
 * A typed webhook handler for Stripe subscription lifecycle events.
 *
 * Implement this interface in `billing/stripe-webhooks.ts` to handle each
 * event type independently with full type safety.
 *
 * Типізований обробник вебхуків підписки Stripe.
 */
export interface StripeWebhookHandler {
  onSubscriptionCreated(obj: StripeSubscriptionObject): Promise<void>;
  onSubscriptionUpdated(obj: StripeSubscriptionObject): Promise<void>;
  onSubscriptionDeleted(obj: StripeSubscriptionObject): Promise<void>;
  onCheckoutCompleted(obj: unknown): Promise<void>;
}

// ── Internal helpers ───────────────────────────────────────────────────────────

const DEFAULT_SUCCESS_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_URL ??
  "https://aegislens.uk/billing/success?session_id={CHECKOUT_SESSION_ID}";

const DEFAULT_CANCEL_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_CANCEL_URL ?? "https://aegislens.uk/pricing";

function isDev(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── createCheckoutSession ─────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for a new subscription, add-on, or one-off pass.
 *
 * Returns a `{ url }` to redirect the user to.
 * In dev (no STRIPE_SECRET_KEY), returns a typed mock with a local success URL.
 *
 * Stripe Tax is enabled automatically (automatic_tax: { enabled: true }).
 *
 * @param params  See CheckoutSessionParams
 *
 * Створює Stripe Checkout Session. В dev — typed mock.
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams,
): Promise<CheckoutSessionResult> {
  const {
    priceId,
    userId,
    orgId,
    locale,
    stripeCustomerId,
    discountCode,
    successUrl = DEFAULT_SUCCESS_URL,
    cancelUrl = DEFAULT_CANCEL_URL,
  } = params;

  if (!priceId) {
    throw new Error("[stripe/checkout] priceId is required");
  }
  if (!userId) {
    throw new Error("[stripe/checkout] userId is required");
  }

  // ── Dev path ───────────────────────────────────────────────────────────────
  if (isDev()) {
    const sessionId = generateId("cs_test");
    const url = successUrl.replace("{CHECKOUT_SESSION_ID}", sessionId) + "&dev=1";
    console.info(
      `[stripe/checkout] DEV — mock session priceId=${priceId} user=${userId} org=${orgId} locale=${locale}`,
    );
    return { url, sessionId };
  }

  // ── Production path ────────────────────────────────────────────────────────
  // Wire up the real Stripe SDK here:
  //
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  // const sessionParams: Stripe.Checkout.SessionCreateParams = {
  //   mode: "subscription",
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   success_url: successUrl,
  //   cancel_url: cancelUrl,
  //   automatic_tax: { enabled: true },
  //   tax_id_collection: { enabled: true },
  //   locale: locale as Stripe.Checkout.SessionCreateParams.Locale,
  //   metadata: { userId, orgId },
  //   ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_creation: "always" }),
  //   ...(discountCode ? { discounts: [{ coupon: discountCode }] } : {}),
  // };
  // const session = await stripe.checkout.sessions.create(sessionParams);
  // return { url: session.url!, sessionId: session.id };

  throw new Error(
    "[stripe/checkout] Production Stripe SDK not yet wired. Set STRIPE_SECRET_KEY to enable.",
  );
}

// ── createCustomerPortalSession ───────────────────────────────────────────────

/**
 * Create a Stripe Customer Portal session.
 *
 * The portal lets users manage their subscription: upgrade, downgrade, cancel,
 * update payment method, and download invoices/receipts.
 *
 * In dev (no STRIPE_SECRET_KEY), returns a mock URL.
 *
 * @param customerId  Stripe customer ID (`cus_…`)
 *
 * Створює Stripe Customer Portal session для управління підпискою та інвойсами.
 */
export async function createCustomerPortalSession(
  customerId: string,
): Promise<PortalSessionResult> {
  if (!customerId) {
    throw new Error("[stripe/checkout] customerId is required");
  }

  const returnUrl =
    process.env.NEXT_PUBLIC_PORTAL_RETURN_URL ?? "https://aegislens.uk/account/billing";

  // ── Dev path ───────────────────────────────────────────────────────────────
  if (isDev()) {
    console.info(
      `[stripe/checkout] DEV — mock portal for customer ${customerId}`,
    );
    return {
      url: `${returnUrl}?dev_portal=1&customer=${customerId}`,
    };
  }

  // ── Production path ────────────────────────────────────────────────────────
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: customerId,
  //   return_url: returnUrl,
  // });
  // return { url: session.url };

  throw new Error(
    "[stripe/checkout] Production Stripe SDK not yet wired. Set STRIPE_SECRET_KEY to enable.",
  );
}

// ── Lookup helper ─────────────────────────────────────────────────────────────

/**
 * Resolve a STRIPE_PRICE_IDS key to the actual price ID string.
 * Throws if the key is not found in the map.
 *
 * Повертає Stripe Price ID за ключем або викидає помилку.
 */
export function resolvePriceId(key: StripePriceKey): string {
  const id = STRIPE_PRICE_IDS[key];
  if (!id) {
    throw new Error(`[stripe/checkout] No price ID configured for key "${key}"`);
  }
  return id;
}
