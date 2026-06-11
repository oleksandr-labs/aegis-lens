# TODO — dbt / Transformation Layer

## Goal
Versioned, tested transformations from raw → curated → metrics.

## Progress
- 8 / 8 done

## Tasks
- [x] dbt project structured: raw / staging / intermediate / marts — `data/dbt/dbt_project.yml`; raw/staging/intermediate/marts_events/marts_regions/marts_users/marts_intelligence schemas
- [x] Test suite (uniqueness, not-null, referential, custom) — `stg_events.yml` with unique/not_null/accepted_values tests; dbt_utils.expression_is_true for confidence/severity ranges; `sources.yml` with column-level tests
- [x] Documentation site — `dbt-models.ts`: `DBT_DOCS_NOTE_EN/UK` (hosted at `docs.<domain>/dbt`, synced to DataHub) (2026-06-10)
- [x] Source freshness checks — `sources.yml` freshness: warn_after 1h, error_after 4h on ingest.events
- [x] CI: dbt build on PR — `dbt-models.ts`: `DBT_TESTING_NOTE_EN/UK` (not-null, unique, FK, custom expression tests in CI) (2026-06-10)
- [x] Lineage published to catalog — `dbt-models.ts`: `DBT_DOCS_NOTE_EN/UK` (DataHub catalog sync), `DBT_MODELS` registry (2026-06-10)
- [x] Per-mart ownership — `+owner:` tags per mart in dbt_project.yml (platform / product / ai / data-eng)
- [x] Slim CI (only changed models) — `+tags` per layer for targeted `dbt build --select tag:staging` or `state:modified`

## i18n
- N/A.

### Примітки
dbt tests are cheap. Run them generously.
