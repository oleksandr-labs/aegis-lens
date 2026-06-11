# Stripe Billing — Compliance & Account Notes (`@ua-map/stripe`)

This package wires Aegis Lens to Stripe for subscriptions, metered billing, tax,
marketplace payouts, and self-service billing. It contains **no secrets**: every
key and resource ID is read from `process.env` at runtime.

## 1. Stripe account setup

- **Account type:** standard Stripe account for the platform business entity.
- **Branding:** logo, statement descriptor (`AEGIS LENS`), support email/URL set
  in Dashboard → Settings → Public/Branding.
- **Currencies:** settlement in **USD (primary)**; charges presented in
  **USD / EUR / UAH / GBP** (see `types.ts` `SUPPORTED_CURRENCIES`). UAH support
  requires Stripe availability in the operating entity's region; where UAH
  settlement is unavailable, UAH is presentment-only with USD settlement.
- **3D Secure / SCA:** enforced for EU/UK via Radar `request_3ds` rules + Stripe's
  automatic SCA. See `radar-rules.ts`.

### Radar (fraud) — `radar-rules.ts`
A typed mirror of the Radar policy authored in Dashboard → Radar → Rules. The
code is the reviewable source of truth; rules are applied via the Dashboard/API.
Baseline: block highest-risk + CVC fail + card-testing velocity; review elevated
risk and IP/card country mismatch; force 3DS on high-value/prepaid. Value lists
(`disposable_email_domains`, `blocklist_ip`) are maintained in Radar.

## 2. Environment variables (never hardcode)

| Env var | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server-side secret API key (`sk_live_…`/`sk_test_…`). |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint signing secret (`whsec_…`). Used by the existing webhook route. |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Connect endpoint signing secret (optional). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client publishable key for Elements (`pk_…`). The only Stripe key exposed to the browser. |
| `STRIPE_API_VERSION` | Pinned API version (default `2024-06-20`). |
| `STRIPE_PRODUCT_{PUBLIC,REGISTERED,PRO,ENTERPRISE}` | Product IDs per tier. |
| `STRIPE_PRICE_{TIER}_{CUR}_{MONTH\|YEAR}` | Recurring base price IDs (e.g. `STRIPE_PRICE_PRO_USD_MONTH`). |
| `STRIPE_METERED_PRICE_{API_CALLS,EVENTS,AI_TOKENS,...}` | Usage-based price IDs (see `metered-billing.ts`). |

`readStripeEnv()` throws in `NODE_ENV=production` if a required key is missing;
in dev it falls back to inert `*_test_dev` placeholders.

## 3. PCI DSS posture — Elements only (`pci.ts`)

- Card data is collected **exclusively in Stripe Elements iframes** in the
  browser. The backend never receives, logs, stores, or transmits raw PAN/CVC.
- The server handles only opaque references: `pm_…`, `tok_…`, `seti_…`, `pi_…`.
- This keeps Aegis Lens in **PCI DSS SAQ A** scope (the lightest self-assessment).
- `assertNoRawCardData()` is a defense-in-depth guard: any inbound billing
  payload containing a Luhn-valid PAN or a CVC field is rejected (fail closed).
- Annual SAQ A attestation is filed via the Stripe Dashboard PCI wizard.

## 4. Tax (`tax.ts`)

- **Stripe Tax** with `automatic_tax.enabled = true` on Checkout Sessions,
  Subscriptions, and Invoices. Stripe determines jurisdiction and applies
  VAT/GST/sales tax; we do not compute tax ourselves.
- `tax_id_collection` enabled for B2B reverse-charge (EU/UK/UA/US tax IDs).
- Tax behavior: USD exclusive (tax on top), EUR/GBP/UAH inclusive (VAT-inclusive
  presentment). Registration thresholds per jurisdiction are monitored in
  Dashboard → Tax → Registrations before enabling collection in that region.

## 5. Connect (Express) — plugin payouts (`connect.ts`)

- Plugin authors onboard as **Express connected accounts**; Stripe handles their
  KYC, payouts, and a hosted Express dashboard.
- Platform takes a **20% application fee** (`DEFAULT_PLATFORM_FEE_BPS`) on plugin
  sales via destination charges; the net settles to the author.
- The platform is the merchant of record for plugin sales; refunds on plugin
  sales reverse the transfer + application fee (`refunds.ts`).
- A Connect service agreement + recipient/Express onboarding is required; the
  platform is responsible for connected-account risk per the Stripe Connected
  Account Agreement.

## 6. Refunds & chargebacks (`refunds.ts`)

- Refund reason taxonomy mapped to Stripe reasons; all refunds idempotent.
- Dispute policy: contest with usage/delivery evidence above ~$20; accept small
  or low-evidence disputes. Evidence assembled from access/usage logs.

## 7. Idempotency (`idempotency.ts`)

- **Every mutating Stripe call** carries a deterministic `Idempotency-Key`
  derived from the logical operation so retries / webhook redelivery / double
  clicks never double-charge. Complemented by an in-process `IdempotencyGuard`.

## 8. Dunning (`dunning.ts`)

- 4-touch failed-payment sequence over a 14-day grace window (email + in-app),
  bilingual (en/uk). Stripe Smart Retries perform the charge retries; this layer
  drives comms + grace-period gating before downgrade to the free tier.

## 9. Scope note

This package is **billing only**. It maps nothing to the canonical OSINT
`packages/event-schema` — payments are not OSINT events. The existing webhook
route (`apps/web/src/app/api/integrations/stripe/webhooks/route.ts`) is kept
intact; this package provides the surrounding billing primitives it can call.
