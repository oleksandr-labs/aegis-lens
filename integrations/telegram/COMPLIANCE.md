# Compliance — `@ua-map/integration-telegram`

Telegram is the OSINT firehose for Ukraine coverage (UK + RU + EN priority).
This package ingests **public channels, read-only**, and runs an outbound bot
for users. Where a term is uncertain we gate to the most restrictive reading.

## 1. Two access tiers

### Bot API (default) — `src/bot-api-client.ts`
- The **read-only Bot API** (`api.telegram.org/bot<token>`). Used for the
  outbound bot, `getUpdates`/webhook delivery, and `getFile` media URLs.
- Bot token read **only** from `process.env` — never hardcoded. Absent a token
  the package serves demo/fallback paths so the pipeline runs offline.
- The Bot API cannot expose full channel history; that gap is the only reason
  the userbot tier exists.

### MTProto userbot (gap-fill) — `src/mtproto-client.ts`
- Used **only** for reading **public** broadcast channels (history backfill,
  large media, participant counts) that the Bot API cannot serve.
- **ToS posture:** a real, account-backed MTProto session (gramjs in Node, or a
  telethon sidecar) is permitted for public-channel reading. We do **NOT**:
  impersonate users, join private chats, harvest member lists/PII, send as the
  userbot, or scrape the web app / reuse stolen sessions.
- **Credentials** read only from env, never hardcoded, encrypted at rest:
  `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION` (StringSession).
- This package takes **no hard dependency** on `gramjs`/`telegram`: it ships a
  typed contract (`IMTProtoClient`) + an offline `DemoMTProtoClient`; the real
  gramjs adapter is injected at runtime.

## 2. Flood-wait & rate-limit discipline (`src/mtproto-client.ts`)

- Every MTProto call routes through `RateLimiter` (`RateLimitedMTProtoClient`):
  - min-interval spacing (default 1 s) + a rolling-window cap (default 20/60 s);
  - on a server `FLOOD_WAIT_<n>` the limiter **parks ALL traffic** for the
    server-demanded `n` seconds and retries once — we never race the server,
    and the honoured wait is itself capped (`maxFloodWaitMs`, default 5 min) so
    an absurd demand surfaces rather than hangs the fleet.
- `getHistory` limit is hard-clamped to ≤ 100 (server max) regardless of caller.
- A single channel outage never aborts the fleet poll (caller-side, as today).

## 3. Bounded backfill (`src/backfill.ts`)

- New channels are backfilled **bounded** on two axes — `maxMessages`
  (default 500) and `maxAgeDays` (default 7) — so we ingest *recent* context,
  not entire archives.
- Backfill is **resumable**: an opaque `BackfillCursor` (lowest message id +
  running count) is persisted per page, so a flood-wait pause or crash resumes
  mid-run instead of re-reading. All reads inherit §2 discipline.

## 4. Media — size + MIME + AV policy (`src/media-downloader.ts`)

OSINT media is untrusted. Every attachment passes a four-stage gate; anything
that fails is **quarantined** (metadata kept, bytes withheld), never forwarded:
1. **declared size** vs `maxBytes` (default 20 MiB) — pre-flight reject;
2. **actual bytes** vs `maxBytes` — streaming guard, since declared size lies;
3. **sniffed MIME** allow-list (magic bytes, not the declared mime): jpeg/png/
   webp/gif, mp4/webm, pdf;
4. **AV scan** via an injected `AvScanner` seam (ClamAV/VirusTotal/sandbox).
   Infected → quarantine. With no engine wired, `failClosed` (default true)
   quarantines on scanner error rather than passing unscanned bytes.
- The downloader produces a *vetted artifact reference* only; **re-hosting /
  republication is a separate, gated decision** — we retain summaries + evidence
  permalinks (`t.me/<channel>/<id>`), not bulk media corpora.

## 5. Inbound webhook verification (`src/webhook.ts`)

- Telegram does **not** HMAC webhook bodies. Per Bot API `setWebhook`, it echoes
  the configured `secret_token` in the `X-Telegram-Bot-Api-Secret-Token` header
  on every update. `TelegramWebhookVerifier` compares that header to
  `process.env.TELEGRAM_WEBHOOK_SECRET` in **constant time**; mismatch/missing
  header → reject.
- Optional defence-in-depth IP allow-list against Telegram's published webhook
  ranges `149.154.160.0/20` and `91.108.4.0/22` (enable via
  `TELEGRAM_WEBHOOK_ENFORCE_IP=1`).

## 6. Curation, attribution & PII

- Channels are added only with a documented reliability score and ToS check
  (`src/registry.ts`, `tos_verified_at`); `ChannelRegistryService.revoke()`
  pulls a channel the moment its owner objects or its ToS stance changes.
- Posts are public-interest communications: display **must** preserve the
  source permalink (`t.me/<channel>/<id>`, kept as `SourceCitation.url`).
  The original-language text (UK/RU) is preserved verbatim; EN is a derived
  translation downstream and must not overwrite the original.
- **PII redacted on ingest** (`redactPII` in `src/adapter.ts`) before storage.

## 7. Secrets summary (all from `process.env`, never hardcoded)

| Var | Used by |
|-----|---------|
| `TELEGRAM_BOT_TOKEN` | Bot API client, webhook delivery |
| `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` / `TELEGRAM_SESSION` | MTProto userbot |
| `TELEGRAM_WEBHOOK_SECRET` | inbound webhook verification |
| `TELEGRAM_WEBHOOK_ENFORCE_IP` | optional webhook IP allow-list toggle |

## Compliance changelog
- 2026-06-06 — Initial record: Bot-API + userbot two-tier posture, flood-wait /
  rate-limit discipline, bounded resumable backfill, media size/MIME/AV
  quarantine policy, webhook secret-token verification, secrets table.
