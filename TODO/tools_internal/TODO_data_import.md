# TODO — Data Import Tools

## Goal
Tools to bring in third-party datasets (Oryx, ACLED, DataCite-DOI imports) without bespoke scripts each time.

## Progress
- 0 / 8 done

## Tasks
- [ ] Generic CSV / GeoJSON / KML importer with schema mapping
- [ ] Per-dataset adapter registry
- [ ] Idempotent re-import (dedup on natural keys)
- [ ] Schema mismatch surfacing (review before commit)
- [ ] Source-attribution required field
- [ ] Per-import audit log
- [ ] Per-import revert
- [ ] Bulk delete (governance-gated)

## i18n
- N/A.

### Примітки
Every bespoke import script becomes tech debt. Build the generic importer.
