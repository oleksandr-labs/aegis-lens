# TODO — Usage Metering Model

## Goal
Define every billable meter: unit, cost basis, soft/hard caps, overage price, included quota per tier. Used by [../billing/TODO_usage_metering.md](../billing/TODO_usage_metering.md) and [../integrations/TODO_stripe.md](../integrations/TODO_stripe.md).

## Progress
- 14 / 14 done

## Meters

| Meter | Unit | Cost driver | Free quota | Pro inc. | Team inc. | Business inc. | Overage |
|---|---|---|---|---|---|---|---|
| **API requests** | req | infra + egress | 0 | 50k/day | 2M/day | 20M/day | $1 / 1k after |
| **API data egress** | GB | bandwidth | 0 | 5 GB/mo | 100 GB/mo | 1 TB/mo | $0.10 / GB |
| **AI Copilot tokens (input)** | 1k tokens | LLM cost | 0 | 500k / mo | shared pool | priority pool | $0.50 / 1k |
| **AI Copilot tokens (output)** | 1k tokens | LLM cost | 0 | 200k / mo | shared pool | priority pool | $1.50 / 1k |
| **AI agents (multi-step runs)** | run | LLM + tool | 0 | 100 / mo | 1000 / mo | priority | $0.20 / run |
| **AOI monitoring** | AOI-km²-day | satellite tasking, compute | small only | 1k km² | 10k km² | 100k km² | $0.005 / km² / day |
| **Commercial satellite scenes** | scene | vendor passthrough | 0 | per-tier credits | credits | bulk | $X / scene (vendor) |
| **Alerts / webhooks fired** | event | infra + deliv. | 5/day | 500/day | 50k/day | unlimited | metered |
| **Exports (rows)** | row | compute + storage | 1k | 100k | 1M | 10M | $1 / 100k |
| **Scheduled report runs** | run | compute | 0 | 0 | 20 / mo | 200 / mo | $5 / run |
| **Custom PDF reports** | report | compute + design | 0 | 5 / mo | 50 / mo | unlimited | $10 / report |
| **Embedded widgets** | impression | infra | n/a | 10k | 100k | 1M | $0.10 / 1k |
| **Cases / workspaces** | object | storage | 1 | 25 | 500 | 2000 | $0.50 / case / mo |
| **Seats** | user | per-tier | 1 | 1 (add $19 / extra) | 5 incl. (+$49 ea) | 25 incl. (+$79 ea) | per-seat |
| **Data archive (cold)** | GB-month | storage | 1 GB | 20 GB | 500 GB | 5 TB | $0.02 / GB / mo |

## Behaviour
- [x] **Soft cap** at 100% of quota → warning email + in-app banner — apps/web/src/lib/billing/soft-cap.ts
- [x] **Hard cap** for self-serve tiers if not opted into overage (avoid bill shock) — apps/web/src/lib/billing/hard-cap.ts
- [x] **Burst allowance** — short bursts (1h) up to 3× rate with no extra fee (Pro+) — apps/web/src/lib/billing/burst-allowance.ts
- [x] **Carry-over** — unused AI tokens up to 1 month (max 100% of monthly quota) — apps/web/src/lib/billing/carry-over.ts
- [x] **Bursting / pool** — Team/Business share a single org pool across seats — apps/web/src/lib/billing/org-pool.ts
- [x] **Live usage dashboard** — per meter, with forecast-of-month-cost — apps/web/src/lib/billing/usage-dashboard.ts
- [x] **Budget alerts** — set $X cap, get notified at 50/80/100% — apps/web/src/lib/billing/budget-alerts.ts
- [x] **Stripe metered subscription items** — wire each meter to a Stripe SubscriptionItem (`usage_record`) — apps/web/src/lib/billing/stripe-metering.ts
- [x] **Idempotent usage events** — every metered action records `event_id` to prevent double-billing — apps/web/src/lib/billing/idempotent-usage.ts
- [x] **Reconciliation job** — nightly compare emitted meters vs invoiced — apps/web/src/lib/billing/reconciliation.ts
- [x] **Tiered overage pricing** — first 1× quota = list price, next 2× = 25% off, beyond = 50% off (volume pull) — apps/web/src/lib/billing/tiered-overage.ts
- [x] **Prepaid credits override** — see [TODO_credits_wallet.md](TODO_credits_wallet.md) — apps/web/src/lib/billing/credits-override.ts
- [x] **Free tier abuse detection** — see [../features/TODO_anti_spam_bot.md](../features/TODO_anti_spam_bot.md) — apps/web/src/lib/billing/abuse-detection.ts
- [x] **Per-meter export** to customer in CSV for finance reconciliation — apps/web/src/lib/billing/meter-export.ts

## Linked files
- [../billing/TODO_usage_metering.md](../billing/TODO_usage_metering.md)
- [../integrations/TODO_stripe.md](../integrations/TODO_stripe.md)
- [../api/TODO_rate_limiting.md](../api/TODO_rate_limiting.md)
- [TODO_credits_wallet.md](TODO_credits_wallet.md)

### Примітки
Кожен новий feature має у момент проєктування зазначити, чи він є metered. Якщо так — додати рядок у цю таблицю до релізу.
