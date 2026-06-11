# TODO — Data Flow

## Goal
Map every data path from external source to user surface.

## Progress
- 6 / 8 done

## Flows
- [x] Ingest: source → raw archive (S3) → normalize → `events.normalized` (Kafka) — documented in `docs/architecture/data-flow.md` Mermaid flowchart
- [x] Enrich: `events.normalized` → NLP / Vision / Geo → `events.enriched` — documented in data-flow.md
- [x] Verify: `events.enriched` → corroboration + scoring → `events.verified` — documented in data-flow.md
- [x] Index: verified → Postgres + Elastic + Qdrant + PostGIS — documented in data-flow.md
- [x] Serve: index → API gateway → frontend / SDK / embeds / bots — documented in data-flow.md
- [x] Realtime: verified → WebSocket / SSE → live map + alerts — sequence diagram in data-flow.md (Copilot + alert delivery)
- [ ] Analytics: usage events → Plausible / PostHog → dashboards
- [ ] Billing: usage → metering aggregator → Stripe meters

## i18n
- Original-language fields preserved across the entire pipeline.

### Примітки
Replayable from raw archive at any stage. Validate weekly.
