# TODO — Government & Law-Enforcement Requests Transparency

## Goal
Publish counts + outcomes of formal gov requests, per-country, per-type.

## Progress
- 9 / 9 done

## Tasks
- [x] Intake-and-review process (counsel-led) — apps/web/src/lib/transparency/government-requests.ts (INTAKE_REVIEW_PROCESS)
- [x] Per-request classification (data / takedown / surveillance / other) — apps/web/src/lib/transparency/government-requests.ts (GovRequestType)
- [x] Per-request outcome (complied / contested / rejected) — apps/web/src/lib/transparency/government-requests.ts (GovRequestOutcome)
- [x] Where lawful: notify affected user — apps/web/src/lib/transparency/government-requests.ts (USER_NOTIFICATION_POLICY)
- [x] Gag-order handling — apps/web/src/lib/transparency/government-requests.ts (GAG_ORDER_POLICY)
- [x] Quarterly internal aggregation — apps/web/src/lib/transparency/government-requests.ts (QUARTERLY_AGGREGATION_CONFIG)
- [x] Annual public report — apps/web/src/lib/transparency/government-requests.ts (ANNUAL_REPORT_LINKAGE)
- [x] Per-country breakdown — apps/web/src/lib/transparency/government-requests.ts (GOV_REQUEST_COUNTRY_BREAKDOWN_TEMPLATE)
- [x] EFF / similar civil-society liaison — apps/web/src/lib/transparency/government-requests.ts (CIVIL_SOCIETY_LIAISON)

## i18n
- EN canonical; localized per country.

### Примітки
First gov request needs a clean process. Build it before it lands.
