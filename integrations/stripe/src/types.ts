/**
 * Shared Stripe billing types for Aegis Lens.
 *
 * No secrets here — Stripe keys come from process.env (see COMPLIANCE.md).
 * Currencies: USD (primary), EUR, UAH, GBP.
 */

// ── Locales / currencies ──────────────────────────────────────────────────────

/** Supported settlement / display currencies. USD is the platform primary. */
export type Currency = "usd" | "eur" | "uah" | "gbp";

export const SUPPORTED_CURRENCIES: readonly Currency[] = ["usd", "eur", "uah", "gbp"];
export const PRIMARY_CURRENCY: Currency = "usd";

/** Minor-unit (cents/kopiyok) exponent per currency. Stripe charges in minor units. */
export const CURRENCY_MINOR_UNITS: Record<Currency, number> = {
  usd: 2,
  eur: 2,
  uah: 2,
  gbp: 2,
};

// ── Tiers ──────────────────────────────────────────────────────────────────────

/**
 * Commercial tiers. Aligns with the RBAC OrgTier model
 * (`services/rbac` → enterprise > pro > free > public). The billing layer
 * additionally distinguishes "registered" (a logged-in but unpaid org) which the
 * RBAC layer treats as `free`. Mapping: public→public, registered→free, pro→pro,
 * enterprise→enterprise.
 */
export type BillingTier = "public" | "registered" | "pro" | "enterprise";

/** RBAC tier as defined in services/rbac/src/permissions.ts. */
export type RbacTier = "enterprise" | "pro" | "free" | "public";

export function billingTierToRbac(tier: BillingTier): RbacTier {
  switch (tier) {
    case "enterprise": return "enterprise";
    case "pro": return "pro";
    case "registered": return "free";
    case "public": return "public";
  }
}

// ── Bilingual labels ────────────────────────────────────────────────────────────

export interface I18nString {
  en: string;
  uk: string;
}

// ── Stripe env contract (documented; never inline secret values) ────────────────

export interface StripeEnvConfig {
  /** STRIPE_SECRET_KEY — server-side secret API key (sk_live_… / sk_test_…). */
  secretKey: string;
  /** STRIPE_WEBHOOK_SECRET — endpoint signing secret (whsec_…). */
  webhookSecret: string;
  /** NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — client publishable key for Elements (pk_…). */
  publishableKey: string;
  /** STRIPE_CONNECT_WEBHOOK_SECRET — Connect endpoint signing secret (optional). */
  connectWebhookSecret?: string;
  /** STRIPE_API_VERSION — pinned API version, e.g. "2024-06-20". */
  apiVersion?: string;
}

/**
 * Read the Stripe env contract from process.env. Throws if a required key is
 * missing in production; falls back to dev placeholders otherwise.
 */
export function readStripeEnv(env: NodeJS.ProcessEnv = process.env): StripeEnvConfig {
  const isProd = env.NODE_ENV === "production";
  const get = (name: string, devFallback: string): string => {
    const v = env[name];
    if (!v) {
      if (isProd) throw new Error(`[stripe] missing required env var ${name}`);
      return devFallback;
    }
    return v;
  };
  return {
    secretKey: get("STRIPE_SECRET_KEY", "sk_test_dev"),
    webhookSecret: get("STRIPE_WEBHOOK_SECRET", "whsec_dev"),
    publishableKey: get("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_dev"),
    connectWebhookSecret: env.STRIPE_CONNECT_WEBHOOK_SECRET,
    apiVersion: env.STRIPE_API_VERSION ?? "2024-06-20",
  };
}

// ── Generic Stripe request envelope ─────────────────────────────────────────────

/** Minimal shape of a Stripe API call we emit (the actual SDK is injected). */
export interface StripeRequest<P = Record<string, unknown>> {
  method: "POST" | "GET" | "DELETE";
  /** Resource path, e.g. "/v1/refunds". */
  path: string;
  params: P;
  /** Idempotency-Key header value (mutating calls only). */
  idempotencyKey?: string;
  /** Stripe-Account header for Connect acting-as calls. */
  stripeAccount?: string;
}
