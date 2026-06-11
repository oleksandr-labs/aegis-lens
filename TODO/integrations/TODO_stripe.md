# TODO — Integration: Stripe

## Goal
Subscriptions, metered API billing, tax, invoices, dunning, Connect for marketplace.

## Progress
- 11 / 11 done

## Tasks
- [x] Stripe account + radar rules — account/branding/currency/3DS setup in `integrations/stripe/COMPLIANCE.md` §1; typed fraud-rule config in `integrations/stripe/src/radar-rules.ts` (`RADAR_RULES`, `RADAR_LISTS`)
- [x] Products + prices for each tier — `integrations/stripe/src/catalog.ts` `CATALOG` (public/registered/pro/enterprise), per-currency `PriceDef`, env-resolved `priceId()`/`productId()`/`tierFromPriceId()`
- [x] Metered billing for API usage + AI tokens — `integrations/stripe/src/metered-billing.ts` (`METERED_WIRING`, `meterEventRequest`, `pushMeterEvents`, `meteredSubscriptionItems`); consumes `services/metering` `buildStripeMeterEvents()` payloads
- [x] Stripe Tax (auto-collection) — `integrations/stripe/src/tax.ts` (`automaticTax`, `checkoutTaxConfig()`, `taxBehaviorFor()`, tax-ID collection); posture in COMPLIANCE.md §4
- [x] Stripe Connect (Express) for plugin payouts — `integrations/stripe/src/connect.ts` (Express account + account-link + login-link + destination-charge requests, `applicationFee`, `connectStatusFromAccount`); COMPLIANCE.md §5
- [x] Customer portal for self-service — `integrations/stripe/src/portal.ts` (`defaultPortalConfig()` self-serve tiers only, `portalSessionRequest()`)
- [x] Webhook handlers (subscription lifecycle, payment failures) — `POST /api/integrations/stripe/webhooks`; HMAC verification; handles subscription.created/updated/deleted, invoice.payment_succeeded/failed, trial_will_end; tier mapping from price ID
- [x] Idempotency on charge actions — `integrations/stripe/src/idempotency.ts` (`idempotencyKey()` deterministic keys, `withIdempotency()`, `IdempotencyGuard`); applied to every mutating request builder in this package
- [x] Refund + chargeback workflow — `integrations/stripe/src/refunds.ts` (`refundRequest()`, `decideDispute()` contest/accept policy, `submitDisputeRequest()`, bilingual `REFUND_MESSAGES`)
- [x] Dunning email + in-app prompts — `integrations/stripe/src/dunning.ts` (`DUNNING_SEQUENCE` 4-touch en/uk, `nextDueStep()`, `dunningBanner()`, `shouldDowngrade()`)
- [x] PCI scope minimization (Stripe Elements only) — `integrations/stripe/src/pci.ts` (`PCI_SAQ_LEVEL` SAQ A, `assertNoRawCardData()` Luhn guard, `PCI_POLICY`); COMPLIANCE.md §3

## i18n
- Per-locale currencies (USD primary, EUR, UAH, GBP).

### Примітки
Pricing experiments live here — coordinate with [../platform/TODO_ab_testing.md](../platform/TODO_ab_testing.md).
