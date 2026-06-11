# TODO — Vertical Packages

## Goal
Pre-bundled SKUs tuned for a single industry vertical: includes Pro/Team baseline + vertical-specific add-ons, data, dashboards, alert templates, and reports. Higher price than à la carte but framed around vertical pain.

## Progress
- 10 / 10 done

## Verticals + bundles

### [x] **Insurance & Reinsurance** ($3–10k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: infrastructure-damage analytics, $-impact estimator, AOI monitoring, satellite, weather pro, historical bulk.
- Use cases: war-risk underwriting, marine cargo, energy assets, parametric triggers.

### [x] **Maritime** ($2–5k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: AIS Pro, maritime cargo manifests, port disruption, trade-route alerts, GPS-spoofing detector, Black Sea / Red Sea / SCS focus.
- Use cases: shipping ops, P&I clubs, naval-OSINT, sanctions monitoring.

### [x] **Aviation** ($2–5k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: ADS-B Pro, airspace closures, military air activity, NOTAM correlation, mil-air-traffic dashboards.

### [x] **Finance & commodities** ($3–10k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: commodity-flow disruption, energy-infra strikes, market-moving event alerts, sentiment, narrative cluster detection, low-latency webhooks.
- Use cases: hedge funds, commodity traders, equity research.

### [x] **Energy & utilities** ($2–8k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: power-grid telemetry partners, outage maps, refinery / pipeline / substation AOI monitoring, thermal hi-res.

### [x] **Agriculture & supply chain** ($1–4k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: thermal / fire / weather pro, harvest-disruption analytics, port-and-rail correlated alerts.

### [x] **NGO & humanitarian** (discounted; $0 grant-eligible) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: IDP tracking, casualty datasets, shelter index, evacuation routing, anonymized data exports for partner reports.

### [x] **Newsroom** ($500–3k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: verification queue priority, embed Pro, archive bulk, journalist-friendly licensing, group seats, takedown-licensing helper.

### [x] **Defense contractor / prime** ($25k+ / yr) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: Business + on-prem/edge option, ITAR/EAR review, dedicated stream, custom layers.
- Sales-led.

### [x] **Travel & security** ($500–2k / mo) — `apps/web/src/lib/monetization/vertical-packages.ts`
- Includes: travel-risk module per-employee, mobile alerts, briefings.
- Use cases: corporate security, NGO field-staff safety.

## Mechanics
- [x] Each bundle = predefined add-on stack + tier + custom analytics presets — `apps/web/src/lib/monetization/vertical-packages.ts` (includedAddOnIds, baseTierId)
- [x] Sold via pricing page (transparent) + sales pages (`/industries/insurance`, etc.) — see [../programmatic/TODO_template_industry_hub.md](../programmatic/TODO_template_industry_hub.md) — `apps/web/src/lib/monetization/vertical-packages.ts` (landingSlug)
- [x] Discounted vs sum-of-parts (~15–25%) to incentivize bundling — `apps/web/src/lib/monetization/vertical-packages.ts` (computeVerticalDiscount)
- [x] Each vertical has 1–2 dedicated dashboards / report templates pre-loaded — `apps/web/src/lib/monetization/vertical-packages.ts` (useCases_en, pricingNote_en)

## Linked files
- [TODO_addons_modules.md](TODO_addons_modules.md)
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)
- [../audiences/](../audiences/) (persona files)
- [../pages/TODO_industries_hub.md](../pages/TODO_industries_hub.md)

### Примітки
Vertical bundle — це pricing + packaging, не нова інженерія. Кожен має конкретний owner/sales lead.
