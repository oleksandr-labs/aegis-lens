# TODO — Logging Conventions

## Goal
Structured, searchable, PII-safe logs across all services.

## Progress
- 11 / 11 done

## Tasks
- [x] JSON structured logging everywhere → [dev-standards.md §6](../../docs/engineering/dev-standards.md)
- [x] Required fields: `ts`, `level`, `service`, `trace_id`, `span_id`, `org_id`, `event`, `msg` → §6 (full JSON example)
- [x] Levels: trace / debug / info / warn / error / fatal → §6 (level table with when)
- [x] No PII in logs (linter-enforced) → §6 + [data-governance.md §2](../../docs/data/data-governance.md)
- [x] No secrets in logs → §6
- [x] Per-request correlation ID propagated through gateways → §6 (gateway generates trace_id)
- [x] Sampling: 100% errors, 10% info, configurable per env → §6
- [x] Per-service log volume budget → §6 (Helm values; exceeding = auto-sample + alert)
- [x] Per-error fingerprinting (Sentry-style) → §6 + §5
- [x] Log retention per data_governance retention policy → §6 (90d hot + 1y cold)
- [x] Slow-query / slow-call auto-logged with context → §6 (> 500ms → warn)

## i18n
- Log messages EN (operators' language).

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §6](../../docs/engineering/dev-standards.md).
"A log without trace_id is half-useful. Always include."
