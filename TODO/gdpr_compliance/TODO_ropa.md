# TODO — ROPA (Record of Processing Activities)

## Tasks
- [x] Per-processing-activity entry — apps/web/src/lib/compliance/ropa.ts (ROPA_ENTRIES)
- [x] Fields: purpose, lawful basis, data categories, retention, transfers, recipients — apps/web/src/lib/compliance/ropa.ts (RopaEntry)
- [x] Per-controller vs per-processor distinction — apps/web/src/lib/compliance/ropa.ts (ProcessingRole)
- [x] Maintained by DPO; reviewed quarterly — apps/web/src/lib/compliance/ropa.ts (ROPA_GOVERNANCE)
- [x] Available on regulator request within 24h — apps/web/src/lib/compliance/ropa.ts (ROPA_GOVERNANCE.regulatorAvailability_en)
- [x] Versioned + audit-logged — apps/web/src/lib/compliance/ropa.ts (RopaAuditRecord, ROPA_GOVERNANCE.versioning_en)

### Примітки
Mandatory under GDPR Art. 30. Build day 1.
