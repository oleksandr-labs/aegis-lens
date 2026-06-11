# TODO — Tier Matrix (canonical)

## Goal
Single source of truth for what every tier includes/excludes. Pricing pages, paywalls, billing logic and sales decks all derive from this matrix.

## Progress
- 6 / 6 done

## Tiers

| # | Tier | Audience | Price (target) | Billing |
|---|---|---|---|---|
| 0 | **Free / Public** | Civilians, students, casual readers | $0 | — |
| 1 | **Observer** | Journalists, NGOs (light), researchers | $9–14 / mo | Self-serve |
| 2 | **Pro** | OSINT analysts, investigators | $39–59 / mo | Self-serve |
| 3 | **Pro+** (formerly "Power") | Heavy analysts, freelance intel | $99–149 / mo | Self-serve |
| 4 | **Team** | Newsroom desks, NGO cells, small intel firms | $299–499 / mo (5 seats incl.) | Self-serve / sales |
| 5 | **Business** | Intel firms, finance desks, security vendors | $1.5–3k / mo | Sales |
| 6 | **Enterprise** | Defense primes, large corporates, gov-adjacent | $25k+ / yr, contract | Sales |
| 7 | **Government / Defense** | MoDs, MoIs, intel agencies | Bespoke (often $100k+) | Sales + procurement |
| 8 | **NGO / Journalist (granted)** | Eligible by application | Free or 90% off | Application |
| 9 | **Academic** | Universities, research labs | Free or per-seat granted | Application |

## Feature axes (per tier)

For each axis below, the matrix file (CSV/Storybook table) will state the cell value. Below = high-level intent.

### A. Data freshness
- Free: **15-min delayed** event stream
- Observer: 5-min delayed
- Pro: real-time (≤30s)
- Pro+: real-time + WebSocket push
- Team+: real-time + webhooks + SLA
- Enterprise/Gov: real-time + dedicated edge + custom SLA

### B. History depth
- Free: last **7 days**
- Observer: last 30 days
- Pro: last **1 year**
- Pro+: last 3 years
- Team: full history
- Business+: full history + raw source archive

### C. Watchlists / AOIs
- Free: 1 watchlist, 1 AOI (≤100 km²)
- Observer: 5 watchlists, 5 AOIs
- Pro: 25 / 25 (≤1000 km² each)
- Pro+: 100 / 100
- Team: shared 500 / 500
- Business: 2,000 / 2,000
- Enterprise: unlimited
- AOI add-on: per-AOI / per-month for very large

### D. Alerts
- Free: email-only, 5 alerts/day max
- Observer: + Telegram bot, 50/day
- Pro: + Slack/Discord, 500/day, rule builder
- Pro+: + webhooks, 5k/day, NL rule builder, regex
- Team: + shared rules, 50k/day
- Business+: unlimited + dedicated alert lane

### E. AI Copilot
- Free: **5 messages/day**, no grounding tools
- Observer: 50/day, basic grounding (search only)
- Pro: 500/day, grounding (search + entities + KG)
- Pro+: 2,000/day + agents (multi-step), uploads
- Team: shared pool, custom prompts
- Business+: priority queue, fine-tuned models, RAG over own data

### F. Exports
- Free: PNG screenshot only
- Observer: PNG + CSV up to 1k rows
- Pro: CSV/JSON/GeoJSON up to 100k rows + PDF report
- Pro+: + unlimited CSV, custom branding
- Team+: + scheduled exports, S3 push
- Business+: + raw event archive

### G. API
- Free: ❌
- Observer: read-only, 1k req/day
- Pro: 50k req/day
- Pro+: 500k req/day + webhooks
- Team: 2M req/day
- Business: 20M req/day + bursts
- Enterprise: contract / dedicated capacity
- See [TODO_usage_metering_model.md](TODO_usage_metering_model.md)

### H. Collaboration / case files
- Free–Observer: ❌
- Pro: solo case files
- Pro+: share view-only
- Team: full collab, comments, mentions
- Business+: case approvals, RBAC, audit log

### I. Layers / sources (see add-ons)
- Some layers (satellite-commercial, ADS-B Pro, AIS Pro, thermal-hi-res) **require add-on regardless of tier** — see [TODO_addons_modules.md](TODO_addons_modules.md)

### J. Analytics depth
- See dedicated file [TODO_analytics_gating.md](TODO_analytics_gating.md) (★ canonical for analytics gating)

### K. Support / SLA
- Free: community / docs
- Observer–Pro: email, best-effort
- Pro+/Team: chat, 1 business day
- Business: priority, 4h business hours
- Enterprise/Gov: dedicated CSM, 24/7 + uptime SLA

### L. Compliance / security
- Up to Team: standard SOC2 envelope
- Business+: SSO (SAML), SCIM
- Enterprise: audit log export, DPA, BAA, regional hosting
- Gov: on-prem / air-gapped option, ITAR/EAR flow

## Tasks
- [x] Finalize tier names + prices (post-experiment) — data/pricing/tiers.csv
- [x] Lock matrix as CSV in `/data/pricing/tiers.csv` (build pricing page from it) — data/pricing/tiers.csv
- [x] Render matrix on pricing page → see [../pages/TODO_pricing.md](../pages/TODO_pricing.md) ✓ Sprint 0
- [x] Render matrix in Storybook → apps/web/src/lib/design/tier-matrix-story.ts
- [x] Enforce limits in [../platform/TODO_multitenancy.md](../platform/TODO_multitenancy.md) + [../billing/TODO_usage_metering.md](../billing/TODO_usage_metering.md) — apps/web/src/lib/billing/tier-enforcement.ts
- [x] Map every feature flag in [../platform/TODO_feature_flags.md](../platform/TODO_feature_flags.md) to a tier — apps/web/src/lib/platform/feature-flags-tier-map.ts

## i18n
- Prices per locale, PPP-adjusted (UA/RO/PL/MD/GE) — flag with currency localizer.

### Примітки
Не вводити новий tier без явного persona і unit-economic-обґрунтування.
