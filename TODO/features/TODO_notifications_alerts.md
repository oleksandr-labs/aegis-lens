# TODO — Notifications & Alerts

## Goal
Right alert, right user, right channel, right moment. No alarm fatigue.

## Progress
- 18 / 18 done (Sprint 2.69 — AI suggestions, source-health, Teams, preferences, escalation, backoff)

## Tasks

### Alert types
- [x] Rule-based (user-defined filter → trigger) — `services/alerts/src/types.ts` (AlertRule Zod schema with conditions), `services/alerts/src/matcher.ts`
- [x] AI-suggested (anomaly + relevance to user's watchlists) — `services/alerts/src/ai-suggestions.ts`
- [x] Critical alerts (civilian safety — high priority, override quiet hours) — quiet-hours override logic in `services/alerts/src/throttle.ts`
- [x] Digest alerts (hourly / daily / weekly rollups) — AlertSchedule.digest_mode in types.ts
- [x] Source-health alerts (a watched source went silent) — `services/alerts/src/source-health-alerts.ts`

### Channels
- [x] In-app toast + alert center — AlertChannel.in_app in types.ts
- [x] Web push (PWA) — `services/alerts/src/channels.ts` WebPushChannel
- [x] Email (transactional + digest) — `services/alerts/src/channels.ts` EmailChannel
- [x] Telegram bot — `services/alerts/src/channels.ts` TelegramBotChannel (MarkdownV2 escaping)
- [x] Slack app — `SlackChannel` in `services/alerts/src/channels.ts` (Incoming Webhook, Block Kit, priority color coding)
- [x] Microsoft Teams — `services/alerts/src/teams-channel.ts`
- [x] SMS (enterprise tier only) — AlertChannel.sms in types.ts
- [x] Webhook (any URL with HMAC signing) — `services/alerts/src/channels.ts` WebhookChannel (HMAC-SHA256 via Web Crypto API)

### Rule builder
- [x] Visual rule builder (no-code) reusing the filter system ✓ Sprint 2.59 — Alert Rule Builder visual mode
- [x] Natural-language rule creation via copilot ("alert me when…") ✓ Sprint 2.59 — Alert Rule Builder NL mode (parse with AI)
- [x] Per-rule throttling + dedup window — `services/alerts/src/throttle.ts` InMemoryThrottleStore
- [x] Per-rule schedule (quiet hours, work hours, on-call) — isInQuietHours() handles overnight ranges

### Routing & ops
- [x] Per-user channel preferences — `services/alerts/src/preferences.ts`, `apps/web/src/app/api/v1/alerts/preferences/route.ts`
- [x] Per-org escalation policies (on-call rotations) — `services/alerts/src/escalation-policy.ts`, `apps/web/src/app/api/v1/alerts/escalation/route.ts`
- [x] Delivery audit log — `services/alerts/src/router.ts` AlertRouter audit per delivery
- [x] Backoff + retry policy — `services/alerts/src/retry.ts` (added BACKOFF_CONFIG + computeBackoffDelay)

## i18n
- Alert text localized per user locale; original-language sample attached for verifiability.

### Примітки
The 1-minute median time-to-alert is our north-star UX metric for this feature.
