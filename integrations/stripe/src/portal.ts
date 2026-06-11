/**
 * Customer portal — self-service billing management.
 *
 * Task: "Customer portal for self-service".
 *
 * The Stripe Billing Customer Portal lets customers update payment methods,
 * change/cancel subscriptions, view invoices, and update tax IDs — without us
 * touching card data. This module builds the portal configuration and a portal
 * session request. Allowed plan switches are derived from the catalog's
 * self-serve tiers so we never expose enterprise (sales-led) upgrades.
 *
 * https://stripe.com/docs/customer-management
 */

import { selfServeTiers, CATALOG } from "./catalog";
import type { StripeRequest } from "./types";
import { idempotencyKey } from "./idempotency";

/** Portal feature configuration (passed to billing_portal.configurations). */
export interface PortalConfig {
  features: {
    customer_update: { enabled: boolean; allowed_updates: string[] };
    invoice_history: { enabled: boolean };
    payment_method_update: { enabled: boolean };
    subscription_cancel: { enabled: boolean; mode: "at_period_end" | "immediately" };
    subscription_update: {
      enabled: boolean;
      default_allowed_updates: string[];
      proration_behavior: "create_prorations" | "none" | "always_invoice";
      /** Products (tiers) the customer may switch between. */
      products: Array<{ productEnv: string; tier: string }>;
    };
  };
  business_profile: { headline: string };
}

/** Default portal configuration: self-service plan changes + cancel at period end. */
export function defaultPortalConfig(): PortalConfig {
  const products = selfServeTiers().map((tier) => ({
    productEnv: CATALOG[tier].productIdEnv,
    tier,
  }));
  return {
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address", "tax_id", "name"],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price", "quantity", "promotion_code"],
        proration_behavior: "create_prorations",
        products,
      },
    },
    business_profile: { headline: "Aegis Lens — manage your subscription" },
  };
}

/**
 * Build a portal session request for a customer. `returnUrl` is where Stripe
 * sends the customer back after they finish.
 */
export function portalSessionRequest(
  customerId: string,
  returnUrl: string,
  configurationId?: string,
): StripeRequest {
  const params: Record<string, unknown> = {
    customer: customerId,
    return_url: returnUrl,
  };
  if (configurationId) params.configuration = configurationId;
  return {
    method: "POST",
    path: "/v1/billing_portal/sessions",
    params,
    // Salt with a coarse time bucket so a fresh visit gets a fresh session but
    // a double-click within the minute dedupes.
    idempotencyKey: idempotencyKey("portal_session", customerId, String(Math.floor(Date.now() / 60000))),
  };
}
