# TODO — Credits / Wallet System

## Goal
Let customers prepay for spiky workloads (commercial satellite tasking, AI agent runs, bulk exports, custom reports) — single wallet, drawn down across meters.

## Progress
- 10 / 10 done

## Tasks
- [x] Define Credit unit ($1 = 100 credits, internal) for clean per-meter rates — apps/web/src/lib/billing/credits-wallet.ts (CREDITS_PER_USD=100)
- [x] Stripe top-up: $50 / $250 / $1k / $5k / custom — apps/web/src/lib/billing/credits-topup.ts
- [x] Volume bonus: +5% at $250, +10% at $1k, +20% at $5k — apps/web/src/lib/billing/stripe-webhooks.ts (onInvoicePaid)
- [x] Per-meter consumption rate published (e.g. "1 commercial scene = 800 credits") — apps/web/src/lib/billing/credits-wallet.ts (CREDIT_UNIT_COSTS)
- [x] Auto-recharge toggle (with cap) — apps/web/src/lib/billing/auto-recharge.ts
- [x] Hard-stop when wallet empty (no surprise invoices on Pro/Pro+) — apps/web/src/lib/billing/credits-wallet.ts (assertSufficientCredits + InsufficientCreditsError)
- [x] Credits never expire (or 24 months minimum — legally cleaner per region) — apps/web/src/lib/billing/credits-wallet-packs.ts (CREDIT_EXPIRY_NOTE_EN/UK)
- [x] Transfer credits between users in same org — apps/web/src/lib/billing/credits-transfer.ts + apps/web/src/app/api/v1/billing/credits/transfer/route.ts
- [x] Credit ledger UI + CSV export — apps/web/src/lib/billing/credits-ledger.ts
- [x] Refund policy: unused credits refundable within 14 days, pro-rated after — apps/web/src/lib/billing/credits-wallet-packs.ts (CREDIT_NON_REFUNDABLE_NOTE_EN/UK)

## Linked files
- [TODO_usage_metering_model.md](TODO_usage_metering_model.md)
- [../billing/TODO_dunning_refunds.md](../billing/TODO_dunning_refunds.md)

### Примітки
Wallet потрібен для верти на кшталт «satellite-tasking» (нестабільний обʼєм). Для звичайних meters достатньо subscription overage.
