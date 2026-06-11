# TODO — Add-ons & Data Modules

## Goal
Sell premium data, layers and capabilities independently of tier. Add-ons attach to any paid tier (some require Pro+ minimum), priced per-month or per-usage.

Reason: some data is expensive (commercial sat tasking, AIS firehose, ADS-B Pro) — bundling it into the base tier breaks unit economics. Sell as opt-in.

## Progress
- 18 / 18 done

## Data add-ons

| Add-on | Cost driver | Pricing model | Min tier |
|---|---|---|---|
| [x] **Commercial satellite imagery (Planet / Maxar / Capella SAR)** | vendor passthrough + markup | per-scene credits or AOI-task subscription | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Sentinel Hub paid feed** | API subscription | flat add-on | Pro — `apps/web/src/lib/monetization/addons.ts` |
| [x] **ADS-B Pro (full historical + military mode-S)** | vendor | flat add-on | Pro — `apps/web/src/lib/monetization/addons.ts` |
| [x] **AIS Pro (terrestrial + satellite, full ship detail)** | vendor | flat add-on | Pro — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Thermal hi-res (VIIRS hourly + commercial thermal)** | vendor | flat add-on | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Social firehose (X / Telegram / Reddit / VK full)** | vendor / infra | volume add-on | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Dark / encrypted channels (curated, ethics-reviewed)** | curation cost | bespoke | Business — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Underground / Telegram OSINT bots feed** | curation | flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Maritime cargo manifests** | vendor | flat | Business (maritime vert) — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Power grid telemetry partners** | partners | flat | Business — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Weather pro (numerical models, hi-res)** | vendor | flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Historical archive bulk access (full back-catalog)** | storage + egress | per-GB or flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |

## Capability add-ons

| Add-on | What | Pricing | Min tier |
|---|---|---|---|
| [x] **Custom AOI monitoring (sat-tasking)** | recurring tasking on AOI | per-AOI-month + per-scene | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **KG-graph Pro** | full entity graph traversal + export | flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **AI Copilot Pro** | larger context, agentic tools | flat / tokens | Pro — `apps/web/src/lib/monetization/addons.ts` |
| [x] **AI rule builder Pro** | regex + agentic + ensemble alerts | flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Verification queue priority** | human-in-loop verification slot | per-item or flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Travel-risk module** | per-trip / per-employee risk briefs | per-seat | Team — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Embeds Pro** | white-label embeddable widgets, no watermark | flat | Business — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Bots Pro** | private Telegram/Slack/Discord deploys, branded | flat | Team — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Notebooks Pro** | Jupyter-style env with our SDK preinstalled | flat | Pro+ — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Browser extension Pro** | bulk page extraction, claim verification | flat | Pro — `apps/web/src/lib/monetization/addons.ts` |
| [x] **Workspace presets marketplace** | curated dashboards | per-preset or flat | Pro — `apps/web/src/lib/monetization/addons.ts` |

## Behaviour
- [x] Each add-on is a Stripe `Product` with one or more `Prices` — `apps/web/src/lib/monetization/types.ts` (stripeProductId field)
- [x] Attach to subscription via `SubscriptionItem`; cancel independently — `apps/web/src/lib/monetization/addon-gates.ts`
- [x] Pro-rate on attach / detach (Stripe handles) — `apps/web/src/lib/monetization/addon-gates.ts` (cancelAt field)
- [x] Some add-ons gate analytics — when add-on is attached, unlock corresponding rows in [TODO_analytics_gating.md](TODO_analytics_gating.md) — `apps/web/src/lib/monetization/addon-gates.ts` (assertAddOnAccess)
- [x] Bundle discount: 3+ add-ons → 15% off bundle; 5+ → 25% — `apps/web/src/lib/monetization/addons.ts` (BUNDLE_THRESHOLDS)

## Linked files
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)
- [TODO_bundling_rules.md](TODO_bundling_rules.md)
- [TODO_vertical_packages.md](TODO_vertical_packages.md) — vertical packages = pre-bundled add-ons
- [../features/TODO_aoi_monitoring.md](../features/TODO_aoi_monitoring.md)

### Примітки
Не плутати add-on і tier. Tier — це базовий envelope (швидкість/обʼєм/seats). Add-on — це окремий шматок цінності. Один customer може мати Pro + 4 add-on.
