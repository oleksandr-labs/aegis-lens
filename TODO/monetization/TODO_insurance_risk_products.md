# TODO — Insurance & Risk Products

## Goal
Sell risk-scoring products to insurance / reinsurance / parametric markets. Distinct from SaaS — this is data + API + actuarial dashboards aimed at underwriting and claims.

## Progress
- 14 / 14 done

## Products
- [x] **War-risk score per AOI** (continuous 0–100, with confidence interval) — apps/web/src/lib/insurance/risk-products.ts
- [x] **Asset risk scoring API** — given coords + asset type, return risk + 30/90/365-day forecast — apps/web/src/lib/insurance/risk-products.ts
- [x] **Parametric trigger feeds** — webhook fires when AOI condition met (for parametric insurance contracts) — apps/web/src/lib/insurance/risk-products.ts
- [x] **Claims-evidence dossier** — for after-event claims, package verified evidence — apps/web/src/lib/insurance/risk-products.ts
- [x] **Annual risk atlas** (report subscription, $25–100k) — apps/web/src/lib/insurance/risk-products.ts
- [x] **Underwriting console** — dashboard for actuaries — apps/web/src/lib/insurance/risk-products.ts

## Mechanics
- [x] Scoring methodology document (auditable, version-pinned, back-tested) — apps/web/src/lib/insurance/risk-products.ts
- [x] Insurance-friendly licensing (B2B redistribution rights inside policy docs) — apps/web/src/lib/insurance/risk-products.ts
- [x] Per-API metering + min commit — apps/web/src/lib/insurance/risk-products.ts
- [x] Annual contracts, $25k–$1M ACV — apps/web/src/lib/insurance/risk-products.ts
- [x] Co-developed with 1–2 anchor insurance partners (LOI before build) — apps/web/src/lib/insurance/risk-products.ts

## Dependencies
- [x] Danger score [../product_specs/TODO_spec_danger_score.md](../product_specs/TODO_spec_danger_score.md) must reach v1 + back-test — apps/web/src/lib/insurance/risk-products.ts
- [x] Confidence score [../product_specs/TODO_spec_confidence_score.md](../product_specs/TODO_spec_confidence_score.md) — apps/web/src/lib/insurance/risk-products.ts
- [x] Anomaly detection [../product_specs/TODO_spec_anomaly_detection.md](../product_specs/TODO_spec_anomaly_detection.md) — apps/web/src/lib/insurance/risk-products.ts

## Linked files
- [TODO_vertical_packages.md](TODO_vertical_packages.md) — insurance vertical
- [TODO_data_licensing.md](TODO_data_licensing.md)

### Примітки
Insurance — найбільший потенційний ACV-сегмент. Але вимагає back-tested-моделі і регуляторно чистого licensing.
