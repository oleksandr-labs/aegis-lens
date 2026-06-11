# TODO — Payments, Merchant-of-Record, Multi-currency

## Goal
Maximize collectable revenue across regions by supporting local payment methods, currencies, tax handling, and (where useful) merchant-of-record vendors.

## Progress
- 10 / 10 done

## Decisions
- [x] **Stripe direct** as primary (US/EU/UK/AU) — apps/web/src/lib/payments/merchant-of-record.ts (MOR_CONFIGS)
- [x] **Paddle / Lemon Squeezy / FastSpring** as MoR for indie / consumer / global tax-heavy markets — apps/web/src/lib/payments/merchant-of-record.ts (MOR_CONFIGS)
- [x] **Local UA payment** (LiqPay / Fondy / Monobank) for hryvnia-priced UA customers — apps/web/src/lib/payments/merchant-of-record.ts (LOCAL_UA_PAYMENT_PROVIDERS)
- [x] **PL / RO / TR local methods** (BLIK, etc.) via Stripe Local Methods — apps/web/src/lib/payments/multi-currency.ts (REGIONAL_PAYMENT_CONFIGS)
- [x] **Crypto** (BTC/USDT/ETH/SOL) — for restricted-region donors + privacy-conscious customers — apps/web/src/lib/payments/multi-currency.ts (CRYPTO_PAYMENT_NOTE_EN/UK)
- [x] **Invoice + wire** for Enterprise/Gov ≥ $5k (NET30/60) — apps/web/src/lib/payments/merchant-of-record.ts (ENTERPRISE_GOV_PAYMENT)
- [x] **ACH / SEPA Direct Debit** for low-fee recurring — apps/web/src/lib/payments/multi-currency.ts (REGIONAL_PAYMENT_CONFIGS)
- [x] **Apple Pay / Google Pay** on mobile flows — apps/web/src/lib/payments/multi-currency.ts (REGIONAL_PAYMENT_CONFIGS)
- [x] **PO + procurement** workflow (PunchOut, Coupa) for Gov/Enterprise — apps/web/src/lib/payments/merchant-of-record.ts (ENTERPRISE_GOV_PAYMENT)

## Operations
- [x] Multi-currency display (USD/EUR/UAH/PLN/GBP) — apps/web/src/lib/payments/multi-currency.ts (SupportedCurrency)
- [x] Settlement currency consolidation — apps/web/src/lib/payments/tax-operations.ts (MULTI_CURRENCY_OPERATIONS)
- [x] Per-region payment-method conversion-rate tracking — apps/web/src/lib/payments/tax-operations.ts (MULTI_CURRENCY_OPERATIONS)
- [x] Tax handled per region (Stripe Tax + manual layer for niches) — apps/web/src/lib/payments/tax-operations.ts (TAX_HANDLERS)
- [x] FX policy: lock price quarterly per currency — apps/web/src/lib/payments/multi-currency.ts (FX_LOCK_POLICY_EN/UK)

## Linked files
- [../integrations/TODO_stripe.md](../integrations/TODO_stripe.md)
- [../billing/TODO_tax_compliance.md](../billing/TODO_tax_compliance.md)
- [../billing/TODO_invoicing.md](../billing/TODO_invoicing.md)

### Примітки
Payment-method coverage = revenue. У Польщі без BLIK конверсія ріже навпіл. У UA без LiqPay — фактично нуль локального B2C.
