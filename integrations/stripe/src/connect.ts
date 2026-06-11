/**
 * Stripe Connect (Express) — payouts to plugin / marketplace authors.
 *
 * Task: "Stripe Connect (Express) for plugin payouts".
 *
 * Plugin authors are onboarded as Express connected accounts. When a user buys
 * a paid plugin, we take an application fee and the remainder is settled to the
 * author's connected account (destination charge / separate transfer). Payouts
 * are managed by Stripe (Express dashboard). KYC/onboarding is via Account Links.
 *
 * https://stripe.com/docs/connect/express-accounts
 */

import { idempotencyKey } from "./idempotency";
import type { Currency, StripeRequest } from "./types";

/** Default platform commission on plugin sales (basis points). */
export const DEFAULT_PLATFORM_FEE_BPS = 2000; // 20%

export interface ConnectAccountSpec {
  /** Internal author/org id (stored in account metadata). */
  authorId: string;
  email: string;
  /** Two-letter country, e.g. "UA", "GB", "DE", "US". */
  country: string;
  defaultCurrency: Currency;
}

/** Build params to create an Express connected account. */
export function createExpressAccountRequest(spec: ConnectAccountSpec): StripeRequest {
  return {
    method: "POST",
    path: "/v1/accounts",
    params: {
      type: "express",
      country: spec.country,
      email: spec.email,
      default_currency: spec.defaultCurrency,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_type: "individual",
      metadata: { author_id: spec.authorId, platform: "aegis-lens" },
    },
    idempotencyKey: idempotencyKey("connect_account", spec.authorId),
  };
}

/**
 * Build params for an onboarding Account Link (Express KYC flow).
 * `accountId` is the acct_… id; refresh/return URLs are platform routes.
 */
export function accountLinkRequest(
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
): StripeRequest {
  return {
    method: "POST",
    path: "/v1/account_links",
    params: {
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    },
    // Account links are short-lived; salt with a timestamp bucket so a genuine
    // re-request gets a fresh link while accidental double-submits dedupe.
    idempotencyKey: idempotencyKey("account_link", accountId, String(Math.floor(Date.now() / 60000))),
  };
}

/** Login link to the Express dashboard for an onboarded author. */
export function loginLinkRequest(accountId: string): StripeRequest {
  return {
    method: "POST",
    path: `/v1/accounts/${accountId}/login_links`,
    params: {},
  };
}

/** Compute the application fee (platform cut) for a plugin sale, in minor units. */
export function applicationFee(amount: number, feeBps: number = DEFAULT_PLATFORM_FEE_BPS): number {
  return Math.round((amount * feeBps) / 10000);
}

/**
 * Build a destination charge: customer pays the platform; Stripe routes the
 * net (amount − application fee) to the author's connected account.
 */
export function pluginSaleChargeRequest(args: {
  amount: number;
  currency: Currency;
  customerId: string;
  connectedAccountId: string;
  pluginId: string;
  feeBps?: number;
}): StripeRequest {
  const fee = applicationFee(args.amount, args.feeBps);
  return {
    method: "POST",
    path: "/v1/payment_intents",
    params: {
      amount: args.amount,
      currency: args.currency,
      customer: args.customerId,
      application_fee_amount: fee,
      transfer_data: { destination: args.connectedAccountId },
      metadata: { plugin_id: args.pluginId, kind: "plugin_sale" },
    },
    idempotencyKey: idempotencyKey(
      "plugin_sale",
      `${args.customerId}:${args.pluginId}`,
      String(args.amount),
    ),
  };
}

/** Onboarding status derived from a retrieved Account object. */
export interface ConnectStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  /** True if the author can receive payouts right now. */
  ready: boolean;
}

export function connectStatusFromAccount(acct: {
  id: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}): ConnectStatus {
  const chargesEnabled = !!acct.charges_enabled;
  const payoutsEnabled = !!acct.payouts_enabled;
  const detailsSubmitted = !!acct.details_submitted;
  return {
    accountId: acct.id,
    chargesEnabled,
    payoutsEnabled,
    detailsSubmitted,
    ready: chargesEnabled && payoutsEnabled && detailsSubmitted,
  };
}
