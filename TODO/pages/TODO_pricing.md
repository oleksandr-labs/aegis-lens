# TODO — Pricing & Plans (page)

## Goal
Page that renders the canonical tier matrix + add-ons + verticals + grants into a clear, convertible pricing surface. Derives from [../monetization/](../monetization/), not from this file.

## Progress
- 13 / 17 done (Sprint 2.58 — tier matrix, special-program forms, currency selector)

## Tasks
- [x] Header rendered (EN + UK) ✓ Sprint 0
- [x] 4-tier card grid (Free / Pro / Team / Enterprise) — Sprint 0 draft, full 9-tier from canonical matrix lands Sprint 1
- [x] Monthly / annual toggle ✓ Sprint 2.40 — `BillingToggle` client component, URL-driven (`?billing=annual`), annual prices 20% off in i18n
- [x] **Tier cards** from [../monetization/TODO_tiers_matrix.md](../monetization/TODO_tiers_matrix.md) — full 9-tier matrix ✓ Sprint 2.58 — 4 tier cards + comparison table
- [x] **Feature comparison matrix** ✓ Sprint 2.50 — 12-row table (events/day, API calls, history, alerts, seats, datasets, KG, webhooks, priority queue, SSO, custom layers, SLA) with tier columns (Free/Pro/Team/Enterprise); checkmarks, dashes, and values styled by presence
- [x] **Analytics gating matrix** preview (collapsible) ✓ Sprint 2.51 — `#analytics` section with collapsible `<details>` table; 10 rows (trend chart, danger history, region compare, AOI, source reliability, anomaly detection, CSV export, API dashboard, AI summaries, custom dashboards) × Free/Pro/Team/Enterprise
- [x] **Add-ons section** ✓ Sprint 2.50 — 2 groups: 6 data add-ons (satellite imagery, ADS-B Pro, AIS Pro, thermal, social firehose, historical bulk) + 6 capability add-ons (AOI monitoring, travel risk, AI Copilot Pro, Embeds Pro, Bots Pro, Notebooks Pro); min-tier badges; bundle discount note (3+ → 15%, 5+ → 25%)
- [x] **Vertical packages section** ✓ Sprint 2.50 — 6 industry cards (Maritime, Finance & commodities, Insurance & reinsurance, Energy & utilities, Newsroom, Travel & security) with price ranges, descriptions, and tag chips; bundle discount note
- [x] **Geo packages** (UA-focused, Black Sea, etc.) ✓ Sprint 2.51 — `#geo` section with 3 geographic packages (Ukraine & front line $299/mo, Black Sea & maritime $349/mo, Eastern Europe hub $449/mo); each lists coverage + included features; requires Pro or above
- [x] **Day / Event / Crisis pass** section ✓ Sprint 2.51 — `#passes` section with 3 one-time passes (Day $19/24h, Event $49/72h, Crisis $149/7d); quota, duration, best-for; press-credential 50% discount note; no auto-renew
- [x] **Reports marketplace** entry-point card ✓ Sprint 2.52 — `#reports` section with 3 report types (Weekly brief $9, Regional dossier $49, AI-generated pack $19); tags, descriptions, subscriber discount note; commission CTA to reports@aegislens.io
- [x] **Grants & free programs** section ✓ Sprint 2.42 — 4 programs (press, NGO, academic, Ukraine residents) with grants@aegislens.io CTA
- [ ] **API access** add-on pricing widget
- [ ] **Bundle discount calculator** (live)
- [x] **FAQ block** (auto-charge, refund, downgrade, switch, etc.) ✓ Sprint 2.42 — 7 Q&A items: plan switching, API overages, annual billing, refunds, free trial, multi-year discounts, seat definition
- [x] **"Talk to sales"** form for Enterprise/Gov/White-label ✓ Sprint 2.42 — `#contact` section with sales@aegislens.io CTA
- [x] **NGO / journalist / academic / UA-resident application** forms ✓ Sprint 2.58 — special programs cards with apply links
- [ ] Stripe Checkout integration + Stripe Tax + receipt/invoice portal
- [x] Currency selector (USD/EUR/UAH/PLN/GBP) ✓ Sprint 2.58 — currency selector in PricingControls

## i18n
- EN + UK + RU (defensive) + PL + RO.
- Currency localized; PPP-aware default per IP (overridable).

### Примітки
- Gov / Enterprise pricing — "contact sales". Do not list numbers.
- Page must NOT hand-type numbers — must read from canonical pricing CSV.
- All copy must obey [../monetization/TODO_paywall_strategy.md](../monetization/TODO_paywall_strategy.md) (no dark patterns).
