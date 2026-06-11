# TODO — Data Stewardship

## Goal
Per-domain data owners accountable for quality + lineage + classification.

## Progress
- 8 / 8 done

## Tasks
- [x] Per-domain data owner appointed (events, listings, users, billing, KG) → [data-governance.md §5](../../docs/data/data-governance.md) (owner table: events/users/billing/KG/listings/security logs)
- [x] Per-domain quality SLO ownership → §5
- [x] Per-table documentation in catalog → §5 (OpenMetadata/DataHub; auto-synced from Dagster assets)
- [x] Stewardship monthly forum → §5 (30-min; agenda: orphan tables, SLO status, DSARs, classification review)
- [x] Per-owner change-approval responsibility → §5
- [x] Cross-domain conflict resolution path → §5 (forum → DPO/Legal as tie-breaker → ADR)
- [x] New-table sponsorship requirement (no orphan tables) → §5 (DB migration PR checklist: owner + class + retention + catalog entry)
- [x] Stewardship audit annual → §5 (scope: classification, owners, retention implementation, DSAR drill)

## i18n
- N/A.

### Done notes (2026-05-30)
→ [docs/data/data-governance.md §5](../../docs/data/data-governance.md).
"Without stewardship, data swamps form." No orphan tables — infra team files P2 for any table without owner.
