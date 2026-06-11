/**
 * Stripe Tax — automatic tax calculation & collection.
 *
 * Task: "Stripe Tax (auto-collection)".
 *
 * We enable `automatic_tax` on Checkout Sessions, Subscriptions and Invoices so
 * Stripe determines the jurisdiction (from customer address / IP) and applies
 * VAT/GST/sales tax. Customer tax IDs (EU VAT, UK VAT, etc.) are attached for
 * B2B reverse-charge. Nothing here computes tax ourselves — Stripe is the source
 * of truth; we only configure and forward tax-relevant fields.
 *
 * https://stripe.com/docs/tax
 */

import type { Currency } from "./types";

/** Stripe tax_code for our digital-SaaS product. Override per product via env. */
export const DEFAULT_TAX_CODE = "txcd_10103001"; // SaaS — business use

/** Customer tax ID types we accept (B2B reverse charge). */
export type TaxIdType = "eu_vat" | "gb_vat" | "ua_tax" | "us_ein";

export interface CustomerTaxId {
  type: TaxIdType;
  value: string;
}

/** Flag to set on Checkout/Subscription/Invoice to enable Stripe Tax. */
export const automaticTax = { enabled: true } as const;

/**
 * Tax behavior for a price: whether the listed amount is tax-inclusive.
 * EU/UK consumer pricing is typically tax-inclusive; US is exclusive.
 */
export type TaxBehavior = "inclusive" | "exclusive";

export function taxBehaviorFor(currency: Currency): TaxBehavior {
  // USD: tax shown on top (exclusive). EUR/GBP/UAH: VAT-inclusive display.
  return currency === "usd" ? "exclusive" : "inclusive";
}

/**
 * Build the `automatic_tax` + `customer_update` block for a Checkout Session so
 * Stripe collects the address it needs to localize tax.
 */
export function checkoutTaxConfig(): {
  automatic_tax: { enabled: true };
  customer_update: { address: "auto"; name: "auto" };
  tax_id_collection: { enabled: true };
} {
  return {
    automatic_tax: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    tax_id_collection: { enabled: true },
  };
}

/** Build the params to attach a customer tax ID (B2B). */
export function attachTaxIdParams(taxId: CustomerTaxId): { type: TaxIdType; value: string } {
  return { type: taxId.type, value: taxId.value };
}

/**
 * Validate a tax ID's coarse shape before sending to Stripe (Stripe does the
 * authoritative validation; this just avoids obvious junk).
 */
export function looksLikeTaxId(taxId: CustomerTaxId): boolean {
  const v = taxId.value.trim();
  switch (taxId.type) {
    case "eu_vat": return /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(v);
    case "gb_vat": return /^GB?\d{9}(\d{3})?$/.test(v) || /^\d{9}$/.test(v);
    case "ua_tax": return /^\d{8,12}$/.test(v);
    case "us_ein": return /^\d{2}-?\d{7}$/.test(v);
    default: return v.length > 3;
  }
}
