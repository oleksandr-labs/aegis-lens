# TODO — Webhooks

## Goal
Reliable, signed, replayable webhook delivery to customer endpoints.

## Progress
- 10 / 10 done

## Tasks
- [x] HMAC-SHA256 signature with rotating secrets — `services/webhooks/src/signer.ts` (`signPayload`, `verifySignature`)
- [x] At-least-once delivery + idempotency key — `x-aegis-delivery-id` header in dispatcher
- [x] Exponential backoff with jitter — `services/webhooks/src/retry.ts` (8-attempt schedule)
- [x] DLQ + manual replay UI — `WebhookDispatcher.replay()` in `dispatcher.ts`; `status="dead"` for DLQ
- [x] Per-endpoint health (success rate, latency) — `services/webhooks/src/health.ts` (`computeHealth`, `EndpointHealthMonitor`)
- [x] Auto-disable on persistent failure (with notification) — `EndpointHealthMonitor.evaluate()` (10 consecutive failures)
- [x] Customer-side testing tool (Webhook playground) — `POST /api/integrations/webhooks/playground` with signed delivery + latency + response capture
- [x] Event filtering at the webhook level — `eventFilters` on endpoint + `resolveRecipients()` in registry
- [x] Per-region URL routing for compliance — `services/webhooks/src/regional-routing.ts` (WebhookRegion type, REGIONAL_ENDPOINTS, COMPLIANCE_REGION_MAP, getWebhookRegion, buildRegionalEndpointUrl)
- [x] Webhook event catalog page (SEO + docs) — `docs/webhooks/event-catalog.md` (9 event types: event.created/verified/retracted, alert.triggered/delivered, report.ready/published, source.degraded, aoi.breach; EN + UK descriptions)

## i18n
- N/A for payload; localized docs in EN + UK.

### Примітки
Webhook reliability is its own product. Treat seriously.
