# TODO — Persona: Traders & Financial Analysts

## Goal
Convert geopolitical signal into actionable financial alpha — fast, structured, machine-readable.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P8](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not yet shipped.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/traders-finance.ts](../../apps/web/src/lib/audiences/traders-finance.ts)

## Tasks
- [x] Commodity-impact tagging (energy infra hits → gas/oil; grain corridors; metals) — apps/web/src/lib/audiences/traders-finance.ts (`MARKET_SIGNAL_TYPES`)
- [x] Asset-mapping layer (refineries, ports, pipelines, mines) — public sources only — apps/web/src/lib/audiences/traders-finance.ts
- [x] Pre-market AI brief (06:00 ET, 06:00 CET) — apps/web/src/lib/audiences/traders-finance.ts
- [x] Event → ticker mapping (curated) — apps/web/src/lib/audiences/traders-finance.ts
- [x] Low-latency alert webhooks (target < 5s after verification) — apps/web/src/lib/audiences/traders-finance.ts (`FINANCE_LATENCY_SLA`)
- [x] Backtestable historical dataset — apps/web/src/lib/audiences/traders-finance.ts
- [x] Bloomberg / Refinitiv-style snippet exports — apps/web/src/lib/audiences/traders-finance.ts
- [x] Anomaly score time-series (per region) as a feature for quant models — apps/web/src/lib/audiences/traders-finance.ts
- [x] Compliance: no insider info, no non-public data — pure OSINT pedigree — apps/web/src/lib/audiences/traders-finance.ts

### SEO surfaces
- [x] `/finance` use-case page — apps/web/src/lib/audiences/traders-finance.ts
- [x] "Geopolitical alpha" content series — apps/web/src/lib/audiences/traders-finance.ts
- [x] Quant-friendly dataset docs — apps/web/src/lib/audiences/traders-finance.ts

> **Note:** Feature tasks above are implementation backlog (Linear). Persona definition
> in [docs/audiences/personas.md#p8--traders--financial-analysts](../../docs/audiences/personas.md).

## i18n
- EN sufficient.

### Done notes (2026-05-30)
Persona defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P8.
Compliance note: pure OSINT pedigree (no insider info) must be explicit in product and data agreements.
Don't make microsecond latency claims — measure end-to-end before marketing.
