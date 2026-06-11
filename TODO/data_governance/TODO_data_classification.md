# TODO — Data Classification

## Goal
Every data class labeled: handling rules + access tier follow from class.

## Progress
- 10 / 10 done

## Classes
- [x] Public (events, sources, listings) — no restriction → [data-governance.md §1](../../docs/data/data-governance.md)
- [x] Internal (config, dashboards, metrics) — staff only → §1
- [x] Confidential (customer data, paid reports) — auth + ABAC → §1
- [x] Restricted (PII, payment, security keys) — encrypted + audited → §1
- [x] Top-secret (incident-response, exec comms drafts) — leadership only → §1

## Tasks
- [x] Per-class handling rules documented → §1 (handling rules table: encryption/access/audit/retention/indexing/LLM)
- [x] Per-class encryption-at-rest standard → §1
- [x] Per-class encryption-in-transit standard → §1
- [x] Per-class retention policy → §1 (→ §3)
- [x] Per-class access-control gates → §1
- [x] Per-class log + audit policy → §1
- [x] Data-classification training on hire → §1 (30-min onboarding + annual refresh)
- [x] Annual classification review per table / store → §1 + §5 (stewardship annual audit)
- [x] Tagging at ingest (auto where possible) → §1 (NER + regex auto-classification; override with audit log)

## Done notes (2026-05-30)
5 classification levels with full per-class handling rules table at [docs/data/data-governance.md §1](../../docs/data/data-governance.md).
"Classification is what makes access control meaningful — without it, RBAC is theater."
