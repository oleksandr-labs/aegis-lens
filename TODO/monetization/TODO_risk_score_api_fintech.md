# TODO — Risk-Score API for Fintech / KYC / Compliance

## Goal
Expose a focused API: "given coords / counterparty / asset, return geopolitical-risk score with confidence." Targets fintech (KYC, sanctions screening, jurisdictional risk), insurers, supply-chain compliance. Highly metered, low-touch.

## Progress
- 18 / 18 done

## Endpoints
- [x] `POST /risk/location` — coords → risk score, layers contributing, time-window — `apps/web/src/app/api/v1/risk/location/route.ts`
- [x] `POST /risk/entity` — entity (org, vessel, aircraft, person) → sanctions + conflict-exposure score — `apps/web/src/app/api/v1/risk/entity/route.ts`
- [x] `POST /risk/route` — origin/destination/intermediate → corridor risk — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] `POST /risk/asset` — asset type + location → war/disruption/insurance score — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] `GET /risk/forecast` — same inputs, 7/30/90-day projection — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] **Webhook** — fire when risk-score crosses threshold for monitored asset — `apps/web/src/lib/risk/risk-score-api.ts`

## Pricing
- [x] Free dev tier: 100 calls / day — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] Starter: $99 / mo for 10k calls — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] Growth: $499 / mo for 100k calls — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] Scale: $2,499 / mo for 1M calls — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] Enterprise: contract + SLA — `apps/web/src/lib/risk/risk-score-api.ts`

## Distribution
- [x] Listed on RapidAPI / Postman API Network — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] Plugins for HubSpot, Salesforce, Snowflake Native Apps — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] OpenAPI / Postman collection prominent in docs — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] SDKs: TS / Python / Go → [../api/TODO_sdks.md](../api/TODO_sdks.md) — `apps/web/src/lib/risk/risk-score-api.ts`

## Constraints
- [x] No PII storage of queried entities — `apps/web/src/app/api/v1/risk/entity/route.ts`
- [x] No use for surveillance of individuals — TOS clause — `apps/web/src/lib/risk/risk-score-api.ts`
- [x] No discrimination-based use (insurance redlining, etc.) — `apps/web/src/lib/risk/risk-score-api.ts`

## Linked files
- [TODO_insurance_risk_products.md](TODO_insurance_risk_products.md)
- [TODO_data_licensing.md](TODO_data_licensing.md)
- [../api/TODO_api_design.md](../api/TODO_api_design.md)

### Примітки
Окремий, вузький API-продукт — простіше за продавати ніж "OSINT platform". Підходить для self-serve growth.
