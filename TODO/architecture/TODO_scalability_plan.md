# TODO — Scalability Plan

## Goal
Know the bottleneck at every order-of-magnitude growth and the next step to relieve it.

## Progress
- 9 / 9 done

## Growth tiers
- [x] 1k DAU — single-region, single-AZ Postgres, vertical scale OK — `docs/architecture/scalability-plan.md`
- [x] 10k DAU — read replicas, Redis cache, CDN tightening — documented with action plan
- [x] 100k DAU — partitioned events, materialized views, async heavy queries — documented
- [x] 1M DAU — multi-region read, edge tile serving, tiered storage — documented
- [x] 10M DAU — sharded write path (Citus / Spanner-style), CRDT for hot counters — documented with options analysis

## Per-bottleneck plan
- [x] Postgres writes → partitioning + Debezium + downstream stores — covered + Debezium connector built
- [x] Postgres reads → read replicas + materialized views — per-bottleneck runbook table + RDS replica in Terraform
- [x] Search → Elastic / Qdrant horizontal scaling — runbook table
- [x] LLM cost → model tiering + caching + batch — model tiering plan in scalability-plan.md
- [x] Map tiles → edge cache + pre-generation — tile service TTL config + CDN plan

## i18n
- N/A.

### Примітки
Don't pre-scale. Plan, but build the next tier *just* before you need it.
