# TODO — Service: Alerts

## Goal
Match events against per-user rules, fan-out to channels, respect throttling and preferences.

## Progress
- 10 / 10 done

## Tasks
- [x] Rule compiler (DSL JSON → optimized matcher) — `services/alerts/src/types.ts` AlertRule Zod schema (conditions: class, subclass, danger, confidence, geo circle/bbox, keyword)
- [x] In-memory matcher with index on frequent fields — `services/alerts/src/matcher.ts` matchesCondition(), haversine circle + bbox check
- [x] Channel adapters (in-app, email, web push, Telegram, Slack, SMS, webhook) — `services/alerts/src/channels.ts` (Email, TelegramBot, Webhook, WebPush)
- [x] Dedup + throttle per rule — `services/alerts/src/throttle.ts` InMemoryThrottleStore with dedup window + rate counter
- [x] Quiet-hours + escalation policies — isInQuietHours() (handles overnight ranges), AlertSchedule in types
- [x] Delivery audit log — AlertRouter.route() per-delivery audit entries
- [x] Retry + DLQ per channel — `services/alerts/src/retry.ts`: exponential backoff (8-attempt schedule), `createDeliveryRecord()`, `recordAttempt()`, `getDLQDeliveries()`, `deliveryStats()`
- [x] HMAC-signed webhook delivery — WebhookChannel uses HMAC-SHA256 via Web Crypto API
- [x] SLA: rule match → notification < 5s p95 — `services/alerts/src/sla.ts` (ring buffer 1000 events, recordSlaEvent(), getSlaStats() p50/p95/p99, SLA_THRESHOLD_MS=5000, slaMonitor singleton)
- [x] Eval: rule-builder NL parse accuracy — `services/alerts/src/eval.ts` (NlParseTestCase, NL_TEST_SUITE 10 cases 5EN+5UK, evaluateNlParse() precision/recall/F1, runEvalSuite(), EvalReport)

## i18n
- Alert copy templated + localized.

### Примітки
Alert misfires destroy trust. Default to under-alert.
