# TODO — Scaling Roadmap

## Goal
Infra milestones tied to user / event volume thresholds.

## Progress
- 0 / 10 done

## Tasks
- [ ] @ 1k DAU — single-AZ, vertical Postgres
- [ ] @ 10k DAU — read replicas + Redis layer
- [ ] @ 100k DAU — multi-AZ + edge tile cache
- [ ] @ 1M DAU — multi-region read + tiered storage
- [ ] @ 10M DAU — sharded writes, CRDT for hot counters
- [ ] @ 100k events/day — partition events table
- [ ] @ 1M events/day — Kafka tiered storage + Parquet archive
- [ ] @ 10M events/day — sharded ingest + per-region writes
- [ ] AI: @ $50k/mo LLM spend → tiered routing
- [ ] AI: @ $200k/mo LLM spend → open-weights primary fallback

## i18n
- N/A directly.

### Примітки
Pre-plan, don't pre-build. Trigger threshold = "next milestone visible from here".
