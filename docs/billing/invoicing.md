# Invoicing

> Customer-grade invoices that **pass procurement scrutiny** — particularly for
> government and enterprise buyers who require PO numbers, custom entity names,
> and wire-payment support. **Gov procurement rejects auto-Stripe invoices;
> a custom invoice flow is required.**

## 1. Stripe Invoicing for subscriptions + add-ons

- All recurring subscriptions and one-off add-ons (extra seats, AOIs, API quota
  top-ups) are invoiced via **Stripe Invoicing**.
- Invoices are generated automatically on the billing cycle start; finalized and
  sent immediately.
- The Stripe invoice ID serves as the canonical reference for support, refunds,
  and audit.

## 2. PO number support (enterprise / government)

- Enterprise and government customers frequently require a **Purchase Order (PO)
  number** on the invoice.
- Flow: customer provides PO number (in the billing settings or via their CSM) →
  stored in Stripe customer metadata → added to the invoice footer and
  description field.
- Orders should not be invoiced until a PO is received for accounts that require
  one (prevents payment delays).
- **Government-specific:** some government buyers require a formal invoice (not a
  Stripe-generated PDF) on letterhead. Maintain a branded PDF invoice template
  (same pipeline as the [legal PDF pipeline](../legal/msa/pdf-pipeline.md)) that
  is generated from Stripe data for these cases.

## 3. Custom invoice fields per customer

Each customer profile supports:
- **Legal entity name** (may differ from the account name)
- **VAT / GST ID** (displayed on invoice and used for tax calculation)
- **Billing address** (full address for VAT and local-law compliance)
- **Billing contact** (separate from the account owner)
- **Custom memo / reference line** (e.g., internal cost-center code)

These are stored in Stripe customer metadata and rendered on every invoice for
that account. CSM sets them up at account creation; customer can edit in the
billing portal.

## 4. Multi-currency invoicing

Supported invoice currencies: **USD** (default) · **EUR** · **GBP** · **UAH**.

- Price list in the customer's invoicing currency is set at order form signature
  and locked for the subscription term.
- FX reference rates (for reporting) are updated monthly; actual billing is in
  the contractual currency.
- UAH support is specifically important for Ukrainian government / NGO customers
  who may have budget denominated in hryvnia.

## 5. PDF + email delivery

- Stripe sends the invoice PDF to the billing contact email automatically.
- Additional CC addresses can be configured per account (useful for finance
  departments who need a copy).
- For enterprise / government: PDF is also available in the billing portal and
  can be re-sent on request by support.
- Branded invoice PDF (§2) is generated on demand via the support/admin tool.

## 6. Invoice portal for customers

- Customers access their invoice history, download PDFs, and update payment
  methods via the **Stripe Customer Portal** (self-serve).
- Link is accessible from within the product's billing settings page.
- CSM / support can access it via the admin panel to assist customers who are
  locked out.

## 7. Past-due automation (dunning)

Handled by the dunning workflow — see [dunning-refunds.md](dunning-refunds.md).
Past-due status is reflected in the invoice portal and triggers the dunning
sequence automatically.

## 8. Receipts archived 7 years (compliance)

- All finalized invoices and receipts are retained for **7 years** in Stripe's
  immutable history plus a backup export to S3 (`/billing/receipts/YYYY/`).
- The 7-year retention satisfies most jurisdictions' accounting record-keeping
  requirements (EU VAT, US IRS, UK HMRC).
- An annual export job verifies completeness and alerts Finance if any gap exists.

## 9. Wire / ACH support for enterprise

- Some enterprise and government buyers cannot or will not pay by card.
- **Wire / bank transfer** is supported: Stripe allows bank-transfer payment for
  invoices above a minimum threshold (configurable).
- **ACH** (US) and **SEPA Direct Debit** (EU) are enabled for recurring
  enterprise subscriptions on request.
- Wire instructions are included on the invoice and in the billing portal.
- Finance monitors wire receipts and reconciles them in Stripe manually within
  `[2 business days]` of receipt.

## i18n

Invoice templates are localized for **VAT terminology** per jurisdiction (e.g.,
"MwSt" in DE, "TVA" in FR, "ПДВ" in UA). Currency and number formatting follow
the customer's locale. Tax-inclusive vs. exclusive display per region — see
[tax-compliance.md](tax-compliance.md).
