# TODO — Integration: ACLED + GDELT + UCDP

## Goal
Academic event datasets — research-grade, citation-friendly, multi-year coverage. Backbone for trend pages + datasets.

## Progress
- 12 / 12 done

## Tasks

### ACLED (Armed Conflict Location & Event Data)
- [x] Academic / commercial license — integrations/acled-gdelt/COMPLIANCE.md (ACLED restrictive: raw rows NOT republishable, attribution + paid commercial tier; gated in code)
- [x] API + bulk download — integrations/acled-gdelt/src/acled-client.ts (REST + bulk contract, polite rate-limit, env creds, demo fixture)
- [x] Per-event mapping to our event schema — integrations/acled-gdelt/src/acled-adapter.ts (→ canonical Event v1 via src/adapter.ts)
- [x] Coverage check (UA + global) — integrations/acled-gdelt/src/acled-coverage.ts (coverage windows + checkCoverage)

### GDELT
- [x] BigQuery public dataset access — integrations/acled-gdelt/src/gdelt-client.ts (injection-safe BigQuery query builder + injected runner + demo fixture)
- [x] Daily incremental ingest — integrations/acled-gdelt/src/gdelt-ingest.ts (cursor-based idempotent daily ingest, catch-up)
- [x] Per-actor / per-event-type extraction — integrations/acled-gdelt/src/gdelt-extract.ts (CAMEO actor/event-code → EventClass, tallyByActor)

### UCDP (Uppsala)
- [x] Annual dataset import — integrations/acled-gdelt/src/ucdp-import.ts (GED export → canonical Event v1, demo fixture)
- [x] Historical baseline for trends — integrations/acled-gdelt/src/ucdp-baseline.ts (per-year baseline + z-score spike detector)

### Use in product
- [x] Trend pages (multi-year context) — integrations/acled-gdelt/src/trends.ts + apps/web/src/app/api/integrations/acled-gdelt/route.ts
- [x] Datasets page (cross-referenced) — integrations/acled-gdelt/src/datasets.ts (localized en/uk catalog with cross-references)
- [x] Cite explicitly per page (academic credibility) — integrations/acled-gdelt/src/citations.ts (per-dataset citation builder + republication gate)

## i18n
- Dataset metadata localized.

### Примітки
Academic licenses are restrictive. Read carefully. Commercial use may require paid tier.
