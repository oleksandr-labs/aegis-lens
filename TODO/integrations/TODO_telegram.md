# TODO — Integration: Telegram

## Goal
Read-only ingestion from curated public channels; outbound bot for users.

## Progress
- 10 / 10 done

## Tasks
- [x] Curated channel registry (provenance + region + lang + reliability) — `integrations/telegram/src/registry.ts` (ChannelEntry, CHANNEL_REGISTRY with 6 initial channels, ChannelRegistryService)
- [x] Read access via Bot API (where channels permit) + userbot tier within ToS — `integrations/telegram/src/bot-api-client.ts` (TelegramBotApiClient)
- [x] MTProto client with rate-limit discipline — `integrations/telegram/src/mtproto-client.ts` (IMTProtoClient contract wrapping gramjs/telethon-style API; RateLimiter with min-interval + rolling-window + FloodWaitError parking; RateLimitedMTProtoClient decorator; DemoMTProtoClient offline baseline; createMTProtoClient reads TELEGRAM_API_ID/HASH/SESSION from env, no gramjs dep)
- [x] Per-channel poll cadence — `integrations/telegram/src/registry.ts` (poll_cadence_min per entry)
- [x] Media downloader (with virus + size limits) — `integrations/telegram/src/media-downloader.ts` (MediaDownloader: declared+actual size cap via streaming readCapped, sniffed-MIME allow-list, injectable AvScanner hook with NoopAvScanner failClosed default, quarantine result type)
- [x] Backfill for new channels (bounded) — `integrations/telegram/src/backfill.ts` (Backfiller over IMTProtoClient: bounded by maxMessages + maxAgeDays, resumable BackfillCursor with lowestId paging, step()/run() generator, inherits rate-limit/flood-wait discipline)
- [x] Outbound bot for search / alerts / briefs — `integrations/telegram/src/bot-handler.ts` (AegisLensBot: /search /region /event /subscribe /ask /help; UA/RU/EN locale detection; pollOnce loop)
- [x] Webhook signature for inbound — `integrations/telegram/src/webhook.ts` (TelegramWebhookVerifier: constant-time check of X-Telegram-Bot-Api-Secret-Token vs TELEGRAM_WEBHOOK_SECRET per Bot API setWebhook, optional IP allow-list against Telegram's published CIDRs)
- [x] ToS posture documented; revoke if a channel objects — `integrations/telegram/src/registry.ts` (tos_verified_at field, ChannelRegistryService.revoke())
- [x] PII filter on ingest — `integrations/telegram/src/adapter.ts` (calls redactPII from @ua-map/ingest before storing text)

## i18n
- UK + RU + EN coverage priority.

### Примітки
Telegram is THE OSINT firehose for UA. Get the curation right.
