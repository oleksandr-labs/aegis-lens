# TODO — Backfill & Replay Tools

## Goal
Tools to rebuild any view of the world from raw archive — for a new feature, a fixed bug, a new layer.

## Progress
- 0 / 9 done

## Tasks
- [ ] Per-topic Kafka replay (any time window)
- [ ] Per-source historical backfill (bounded range, rate-limited)
- [ ] Per-event re-enrichment (run new NLP/CV over historical events)
- [ ] Dry-run mode (count + sample, no write)
- [ ] Idempotent re-execution
- [ ] Progress dashboard
- [ ] Backfill cost estimator (LLM tokens + compute)
- [ ] Per-tenant scoping
- [ ] Audit log

## i18n
- N/A.

### Примітки
Replayability is what makes the whole system recoverable. Treat this as P0 infra.
