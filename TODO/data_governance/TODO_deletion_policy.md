# TODO — Deletion Policy

## Goal
Right-to-erasure that works across all derived stores.

## Progress
- 9 / 9 done

## Tasks
- [x] Per-store deletion procedure (Postgres + Elastic + Qdrant + S3 + Parquet) → [data-governance.md §4](../../docs/data/data-governance.md) (7-step ordered procedure)
- [x] Cascade rules (deleting a user → what else?) → §4 (cascade table: user/org deletion)
- [x] Soft-delete vs hard-delete per data class → §4 (soft/hard table per class)
- [x] Per-deletion audit log (immutable, even after deletion) → §4 (tombstone record in deletion_log; retained 5 years)
- [x] DSAR-driven deletion → §4 (Temporal workflow; 30-day legal requirement; legal register)
- [x] Source-takedown propagation → §4 (5-step: reject ingest → flag events → delete if required → block display → takedown register)
- [x] Per-deletion verification (no orphan rows) → §4 (Postgres/ES/Qdrant count verification; P1 if orphan found)
- [x] Backup-retention exception handling (legal hold) → §4 (snapshots flagged; restore blocked; not retroactively modified)
- [x] Tombstone records (deleted-at timestamp preserved) → §4 (deletion_log schema)

## i18n
- Per-locale deletion confirmation emails.

### Done notes (2026-05-30)
→ [docs/data/data-governance.md §4](../../docs/data/data-governance.md).
"Hardest part: derived stores. Forget the cascade and you have a GDPR violation."
DSAR deletion is a Temporal workflow with per-store verification + immutable tombstone.
