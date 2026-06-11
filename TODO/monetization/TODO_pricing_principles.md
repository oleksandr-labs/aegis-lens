# TODO — Pricing Principles (meta)

## Goal
The "why" behind every pricing decision. Used to settle disputes, brief new hires, train Sales, and audit experiments.

## Progress
- 20 / 20 done

## Principles

### Value, not cost
- [x] **Price reflects value delivered to the buyer**, not our cost of delivery. AOI monitoring saves an underwriter $1M; charging $5k is a giveaway. — apps/web/src/lib/pricing/principles.ts
- [x] **Cost-based pricing only on passthroughs** (vendor sat scenes, SMS, voice). — apps/web/src/lib/pricing/principles.ts

### Anchored to outcomes
- [x] **Price gradients align with outcomes**: speed, scope, depth, redistribution. — apps/web/src/lib/pricing/principles.ts
- [x] **Avoid per-feature pricing**; bundle by buyer-job. — apps/web/src/lib/pricing/principles.ts

### Honest by default
- [x] **Self-serve prices are public.** Sales-led prices may be private but never higher than published comparable-tier. — apps/web/src/lib/pricing/principles.ts
- [x] **No price-discrimination on detected device / OS** without disclosure. — apps/web/src/lib/pricing/principles.ts
- [x] **No surprise fees.** Total at checkout = total invoiced. — apps/web/src/lib/pricing/principles.ts

### Locked for existing
- [x] **Existing paying customers get grandfathering** when a new test changes prices. — apps/web/src/lib/pricing/principles.ts
- [x] **Multi-year commits get hard price-lock.** — apps/web/src/lib/pricing/principles.ts

### Predictable
- [x] **Hard caps on self-serve overage** unless customer opts in. — apps/web/src/lib/pricing/principles.ts
- [x] **Budget alerts mandatory** for metered SKUs. — apps/web/src/lib/pricing/principles.ts

### Mission-aligned
- [x] **Free is mission, not loss-leader.** Civic-safety data never paywalled. — apps/web/src/lib/pricing/principles.ts
- [x] **Discount programs for journalist/NGO/UA/academic** are non-negotiable. — apps/web/src/lib/pricing/principles.ts
- [x] **No dark patterns.** No trial auto-charge without warning, no data hostage, no fake urgency. — apps/web/src/lib/pricing/principles.ts

### Sustainable
- [x] **LTD / aggressive launch tactics are time-bounded.** Sunset before Phase 3. — apps/web/src/lib/pricing/principles.ts
- [x] **Ads ≤ 10% of revenue mix** — protect trust. — apps/web/src/lib/pricing/principles.ts
- [x] **Services ≤ 25% of revenue mix** — protect product focus. — apps/web/src/lib/pricing/principles.ts

### Experimentation
- [x] **Test one axis at a time.** — apps/web/src/lib/pricing/principles.ts
- [x] **Never test price on existing paying customers.** — apps/web/src/lib/pricing/principles.ts
- [x] **Log every winning experiment in [../internal_docs/TODO_decision_records.md](../internal_docs/TODO_decision_records.md).** — apps/web/src/lib/pricing/principles.ts

## Linked files
- [TODO_monetization_overview.md](TODO_monetization_overview.md)
- [TODO_paywall_strategy.md](TODO_paywall_strategy.md)
- [TODO_freemium_strategy.md](TODO_freemium_strategy.md)
- [../experiments/TODO_pricing_experiments.md](../experiments/TODO_pricing_experiments.md)

### Примітки
Цей файл — конституція, не roadmap. Зміни — лише з ADR-обґрунтуванням.
