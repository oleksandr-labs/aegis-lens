# TODO — Takedown / Retraction Public Report

## Goal
Quarterly public stats on takedowns + retractions + corrections.

## Progress
- 7 / 7 done

## Tasks
- [x] Per-quarter counts + categories — apps/web/src/lib/transparency/takedown-report.ts (QuarterlyTakedownStats)
- [x] Per-source breakdown (anonymized) — apps/web/src/lib/transparency/takedown-report.ts (PER_SOURCE_BREAKDOWN_TEMPLATE)
- [x] Per-jurisdiction breakdown — apps/web/src/lib/transparency/takedown-report.ts (PerJurisdictionBreakdown)
- [x] Per-retraction reasons category — apps/web/src/lib/transparency/takedown-report.ts (PER_RETRACTION_REASON_TEMPLATE)
- [x] Time-to-resolution distribution — apps/web/src/lib/transparency/takedown-report.ts (RESOLUTION_BUCKETS)
- [x] Publicly published `/transparency/takedowns` page — apps/web/src/lib/transparency/takedown-report.ts (TAKEDOWN_PAGE_DESCRIPTOR)
- [x] Rolling 4-quarter chart — apps/web/src/lib/transparency/takedown-report.ts (ROLLING_QUARTER_CHART_CONFIG)

## i18n
- EN + UK.

### Примітки
Every retraction strengthens credibility when published transparently. Streisand-effect mostly affects hidden ones.
