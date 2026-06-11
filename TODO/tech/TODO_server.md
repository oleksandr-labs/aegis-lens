# TODO — Server / Backend Services

## Goal
Scalable, microservice-friendly backend that ingests, verifies, stores, and serves intelligence in real time.

## Progress
- 12 / 22 done

## Tasks

### Stack
- [x] Frontend: Next.js 15 (App Router) + React 19 + TypeScript ✓ Sprint 0
- [x] BFF / API: tRPC + REST gateway — `apps/web/src/lib/trpc/router.ts` (appRouter, publicProcedure, protectedProcedure, events/regions/alerts/aois sub-routers) + `apps/web/src/app/api/trpc/[trpc]/route.ts` + `apps/web/src/lib/trpc/client.ts`
- [x] Backend services: Python (FastAPI) for AI / data; Go for hot paths (ingest, tiles) — `services/python-gateway/main.py` (vision/nlp/predictions stubs) + `services/python-gateway/requirements.txt` + `services/python-gateway/Dockerfile`
- [x] Event bus: Kafka (Redpanda for dev) — `infra/kafka/redpanda-compose.yml` (single-broker + console + topic bootstrap) + `apps/web/src/lib/event-bus.ts` (InMemoryEventBus + KafkaEventBus, auto-select)
- [x] Workflow / orchestration: Temporal — `apps/web/src/lib/workflows/types.ts` + `apps/web/src/lib/workflows/report-workflow.ts` (retrieve→generate→review→deliver) + `apps/web/src/lib/workflows/ingest-workflow.ts` (pull→normalize→dedup→store→emit)
- [x] Cache: Redis (also Pub/Sub for low-volume live) — `apps/web/src/lib/redis.ts` (RedisConfig, createRedisClient, redis singleton, NoOpRedisClient fallback)

### Services
- [ ] `ingest-svc` — pulls/pushes from sources, normalizes to canonical event schema
- [ ] `geo-svc` — geocoding, reverse-geocoding, AI geolocation
- [ ] `vision-svc` — CV (object detection, OCR, image/video verification)
- [ ] `nlp-svc` — NLP (classification, NER, summarization, translation)
- [ ] `verify-svc` — cross-source verification, confidence scoring
- [ ] `alert-svc` — rules, anomaly triggers, fan-out (email/Slack/TG/webhook)
- [ ] `report-svc` — AI report generation pipeline
- [ ] `tile-svc` — vector tile serving from PostGIS (pg_tileserv / Martin)
- [ ] `search-svc` — Elastic + Qdrant facade
- [ ] `api-gateway` — auth, rate limiting, billing metering

### APIs
- [x] REST + GraphQL public APIs (versioned, OpenAPI-documented) ✓ Sprint 2.0 (REST + /api/openapi.json — GraphQL not yet)
- [x] Realtime: WebSocket + SSE channels per region/layer — `apps/web/src/lib/realtime/sse.ts` (SseEventEmitter, createSseResponse, EventChannel, AlertChannel, LayerUpdateChannel) + `apps/web/src/app/api/stream/events/route.ts` + `apps/web/src/app/api/stream/alerts/route.ts`
- [x] Webhooks for enterprise — `apps/web/src/app/api/v1/webhooks/route.ts` (GET list + POST create) + `apps/web/src/app/api/v1/webhooks/[id]/route.ts` (GET/PATCH/DELETE)

### Cross-cutting
- [x] Auth via WorkOS / Clerk + JWT mint — `apps/web/src/lib/auth/provider.ts` (AuthProvider, getAuthConfig, buildAuthUrl, exchangeCode) + `apps/web/src/lib/auth/session.ts` (createSession, getSession, destroySession via HS256 JWT cookie)
- [x] Rate limiting (sliding window in Redis) ✓ Sprint 1.4 (in-memory sliding window — Redis not yet)
- [x] Idempotency keys on all writes — `apps/web/src/lib/idempotency.ts` (pre-existing, comprehensive — InMemoryIdempotencyStore, checkIdempotency, storeIdempotencyResult, withIdempotency, 24h TTL)

## i18n
- API responses include locale-tagged text fields; clients select via `Accept-Language`.

### Примітки
Avoid premature microservice explosion — start with a modular monolith for non-ingest paths if velocity demands it.
