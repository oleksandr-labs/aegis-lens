# TODO — Analytics Gating (★ canonical)

## Goal
Decide **which analytic** is available at **which tier**, **at what resolution / lookback / freshness**, and **what users see as a teaser** if they're below the gate.

Analytics are the single biggest reason a Pro / Team / Business buyer upgrades. This file is the contract between Product, Pricing, and Engineering.

## Progress
- 65 / 65 done

## Gating Axes
Every analytic is gated along 4 independent axes — combine them per tier:

1. **Existence** — does the analytic exist at all for this tier?
2. **Freshness** — how delayed is the input data (15min / 5min / real-time / push)?
3. **Resolution** — how granular (country / region / city / 1km grid / 100m grid)?
4. **Lookback** — how far back (7d / 30d / 1y / 3y / all-time)?

Each cell in the matrix below names the analytic + axis. Build into a per-feature flag.

---

## Analytics inventory + tier gating

### Level 1 — Descriptive (counts, lists, basics)
- [x] **Event counter / live ticker** — Free (delayed 15m, country-level) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Recent events list** — Free (delayed, last 24h) → Pro (real-time, last 1y) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Watchlist / AOI counters** — Free (1 AOI) → Pro+ (unlimited) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Source-of-event attribution** — Free (one source) → Pro (all sources + cross-link) — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 2 — Aggregations (heatmaps, time-buckets)
- [x] **Heatmap (event density)** — Observer (country level, daily) → Pro (1 km, hourly) → Pro+ (100 m, 5-min) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Time-bucket histograms** — Observer (daily) → Pro (hourly) → Pro+ (5-min) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **By-category / by-layer breakdown** — Observer → Pro (cross-category drill) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **By-source breakdown + reliability score** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 3 — Trend & comparison
- [x] **7-day / 30-day trend lines** — Pro — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Period-over-period delta** (Δ vs prior week / month / year) — Pro — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Cross-region comparison** (compare 2–10 AOIs) — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Cross-layer correlation** (drones vs power outages, etc.) — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Cohort analytics** (event clusters by initiator / unit / weapon class) — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Seasonality decomposition** — Business — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 4 — Scoring (proprietary)
- [x] **Confidence score on every event** — Free (display only) → Pro (filter by ≥ threshold) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Danger score on AOIs** — Observer (country) → Pro (AOI) → Pro+ (real-time recomputation) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Trust / source reliability score** — Pro — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Disinformation likelihood score** — Business — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Escalation index (regional)** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 5 — Predictive
- [x] **24-hour forecast (event likelihood by AOI)** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **72-hour forecast** — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **7-day forecast** — Business — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Forecast confidence intervals + back-test** — Business — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Counterfactual ("what if X happens") scenarios** — Enterprise — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Custom-trained forecast models on customer data** — Enterprise — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 6 — Knowledge-graph & entity
- [x] **Entity profile pages (units, equipment, locations)** — Free (basic) → Pro (relations) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Network graph visualization** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Sub-graph extraction + export** — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Entity timeline analytics** — Pro — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Entity-level danger / activity score** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 7 — Investigative (case-level)
- [x] **Case file with linked events** — Pro — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Multi-source corroboration matrix** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Geolocation sandbox (assist with manual)** — Pro — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Reverse-image / chrono-geolocation tools** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Collaborative annotation + audit log** — Team — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 8 — Anomaly & alerting analytics
- [x] **"Unusual activity" anomaly score per AOI** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Sustained-trend detector** — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **AI rule builder ("alert me when …")** — Pro+ (basic) → Business (regex + agents) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Multi-condition compound alerts** — Team — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 9 — Media & sentiment
- [x] **Volume of social mentions per AOI** — Observer (country) → Pro (city) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Sentiment trend** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Narrative cluster detection** (LLM-summarized) — Business — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Coordinated inauthentic behavior detection** — Business+ — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Source-language-mix analytics** — Pro+ — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 10 — Economic / impact (vertical-driven)
- [x] **Infrastructure damage estimation ($)** — Business (insurance vertical add-on) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Maritime trade-disruption index** — Business (maritime vertical) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Aviation no-fly impact** — Business (aviation vertical) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Commodity-flow disruption forecast** — Business (finance vertical) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Humanitarian impact score (IDP, casualties)** — NGO/Granted free + Business paid — apps/web/src/lib/analytics-gate/gate-config.ts

### Level 11 — Custom / advanced
- [x] **Bring-your-own-data overlay (CSV / GeoJSON)** — Pro+ (small) → Team (large) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Custom KPI dashboards** — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Saved cross-AOI dashboards w/ live data** — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Scheduled analytic snapshots → email/Slack** — Team — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] **Embedded analytic widgets (iframe)** — Business — apps/web/src/lib/analytics-gate/gate-config.ts

---

## Gating rules (cross-cutting)

### A. Teaser policy (what a lower-tier user sees of a locked analytic)
- **Always show** the analytic *exists* (label + lock icon).
- **Show** a blurred preview if the analytic is visual (heatmap / chart).
- **Show** the headline number rounded heavily (e.g. "≈ 1.2k events" instead of "1,247").
- **Never hide** that it exists — discoverability drives upgrade.
- **Never** show a fake locked feature that doesn't actually exist.

### B. Freshness gates
Same analytic, different freshness:
- Free / Observer → batch (15m / 5m delayed)
- Pro / Pro+ → real-time
- Team / Business → real-time + WebSocket push + back-fill on disconnect
- Enterprise → dedicated stream

### C. Lookback gates
Same analytic, different lookback:
- Free → 7d
- Observer → 30d
- Pro → 1y
- Pro+ → 3y
- Team → all
- Business → all + raw archive

### D. Resolution gates
Same analytic, different resolution:
- Free → country (admin-0)
- Observer → admin-1 (oblast / state)
- Pro → admin-2 (raion / county) + city
- Pro+ → 1 km grid
- Team → 250 m grid
- Business → 100 m grid + per-asset

### E. Export gates
Same analytic, but ability to export:
- Free → screenshot only
- Pro → CSV / PNG
- Pro+ → CSV / PDF report with branding
- Team+ → scheduled exports, S3 push
- Business+ → bulk raw data

### F. API gates
Same analytic exposed via API:
- Below Pro → no API
- Pro → 50k req/day, no historical bulk
- Pro+ → 500k req/day, 90d historical bulk
- Team → 2M req/day, 1y historical bulk
- Business → bulk archive + redistribution rights (limited)
- Enterprise → unlimited + redistribution license

---

## Linked files
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md) — overall tier limits
- [TODO_paywall_strategy.md](TODO_paywall_strategy.md) — UI/UX of teasers + upgrade prompts
- [TODO_freemium_strategy.md](TODO_freemium_strategy.md) — what stays free forever
- [../product_specs/TODO_spec_confidence_score.md](../product_specs/TODO_spec_confidence_score.md)
- [../product_specs/TODO_spec_danger_score.md](../product_specs/TODO_spec_danger_score.md)
- [../product_specs/TODO_spec_anomaly_detection.md](../product_specs/TODO_spec_anomaly_detection.md)
- [../design/TODO_data_viz.md](../design/TODO_data_viz.md) — viz design must support locked / blurred / preview states

## Tasks (rollup)
- [x] Lock canonical analytic inventory (this file) → freeze v1 — apps/web/src/lib/analytics-gate/types.ts
- [x] Encode each analytic as a feature flag with `min_tier`, `freshness_axis`, `lookback_axis`, `resolution_axis` — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] Build pricing-page matrix from this file (not hand-typed) — apps/web/src/lib/analytics-gate/gate-config.ts
- [x] Build teaser components for every locked analytic — apps/web/src/lib/analytics-gate/teaser-policy.ts
- [x] Telemetry: track lock-impression → upgrade-click → checkout conversion per analytic (drives gating tuning) — apps/web/src/lib/analytics-gate/upgrade-triggers.ts
- [x] Quarterly review: move analytics down or up the gate based on conversion + cost data — apps/web/src/lib/analytics-gate/gate-config.ts

## i18n
- All analytic labels go through i18n. Number formatting is locale-aware (1,247 / 1 247 / 1.247).

### Примітки
Гейт по аналітиці — найсильніший важіль монетизації після швидкості. Один analytic може жити одночасно в 4 тарифах з різною свіжістю/глибиною/роздільністю.
