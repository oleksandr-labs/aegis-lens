# TODO — PII Handling

## Goal
Detect, redact, and minimize PII at every stage.

## Progress
- 10 / 10 done

## Tasks
- [x] PII detector at ingest (NER + regex + ML) → [data-governance.md §2](../../docs/data/data-governance.md) (3-layer: regex + NER + ML classifier)
- [x] Per-field redaction policy → §2 (table: source identity/location/reporter name/IP/payment)
- [x] PII never indexed in Elastic / Qdrant (separate encrypted store) → §2
- [x] Per-customer PII export (DSAR support) → §2 (→ §4 DSAR workflow)
- [x] PII access audit log (every read) → §1 + §2 (Restricted: audit on every read+write)
- [x] PII de-identification for analytics → §2 (Plausible + PostHog de-identified at collection)
- [x] No PII in logs ever (linter enforced) → §2 + dev-standards.md §6
- [x] No PII in LLM prompts (pre-redaction step) → §2 (mandatory pre-redaction, logged)
- [x] PII training data exclusion (we don't train on customer PII) → §2
- [x] Per-employee PII access tier minimization → §2 (support/engineer/data-scientist tiers)

## i18n
- Per-region PII definitions vary (GDPR vs CCPA).

### Done notes (2026-05-30)
→ [docs/data/data-governance.md §2](../../docs/data/data-governance.md).
IP addresses treated as PII regardless of jurisdiction. Pre-redaction before LLM is mandatory + logged.
