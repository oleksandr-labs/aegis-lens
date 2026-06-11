# Compliance — `@ua-map/alerts-in-ua`

Covers task 12 ("Respect API ToS + attribution") and the licensing/partnership
contract for every source this package ingests. Conservative by design: where a
term is uncertain we gate to the most restrictive interpretation.

## 1. Primary source — alerts.in.ua API

- **Provider:** alerts.in.ua (Ukrainian air-raid alert aggregator).
- **Endpoint:** `https://api.alerts.in.ua/v1/` (Bearer token).
- **Tiers:** free (oblast-level, polite ~15s cadence) and commercial/enterprise
  (raion/hromada granularity, faster cadence, websocket). Tier behaviour is
  encoded in `client.ts → TIER_CONFIG`.
- **Auth / secrets:** token read **only** from `process.env.ALERTS_IN_UA_TOKEN`.
  Never hardcoded. Without a token the client serves the bundled DEMO fixture.
- **ToS-respecting behaviour (enforced in code):**
  - Minimum poll interval per tier (`TIER_CONFIG.minPollMs`) — we never poll
    faster than the tier permits (`AlertsInUaClient.pollBackoffMs`).
  - Identifying `User-Agent` on every request.
  - We never request sub-oblast granularity above the tier's `maxGranularity`.
- **Attribution (REQUIRED):** any UI surface showing this data must credit
  **"Дані тривог: alerts.in.ua"** / **"Alert data: alerts.in.ua"** with a link to
  `https://alerts.in.ua/`. The adapter preserves this as a `SourceCitation.url`.
- **Republication:** commercial redistribution of the raw feed requires the
  commercial/enterprise tier. The free tier is for display/personal use; we do
  NOT re-sell or re-expose the raw free-tier feed as a competing API. Public map
  display with attribution is permitted.

## 2. Fallback A — official `@air_alert_ua` Telegram bot/channel

- **Access:** Telegram **Bot API only** (read-only), reusing
  `@ua-map/telegram → TelegramBotApiClient`. **No userbot / MTProto scraping** of
  user accounts (Telegram ToS).
- **Source:** the national air-raid signal as broadcast officially. Used only as
  a degraded-mode fallback when the primary API is unreachable.
- **Attribution:** posts are linked back via `t.me/air_alert_ua/<id>` in the
  `evidenceUrl`.

## 3. Fallback B — regional OVA Telegram channels

- **Access:** same Bot API, read-only, official OVA (Oblast Military
  Administration) channels only. Channel registry in `ova-fallback.ts` is
  publicly-known official channels; correct via data, not scraping.
- **Authority:** OVA channels are government sources; treated as authoritative
  for their own oblast but lower trust weight than the primary API in the quorum
  (`cross-validate.ts → SOURCE_WEIGHT`).
- **Attribution:** each alert links back to the originating channel post.

## 4. Cross-source / safety obligations

- **Fail-safe quorum:** `cross-validate.ts` biases toward RAISING — a single
  trustworthy "active" beats a quorum of "cleared". Silence never clears an
  alert.
- **No civilian delay (task 13):** `no-delay-policy.ts` is a hard invariant —
  civilian-persona raise/clear deliveries are NEVER delayed, throttled, batched,
  or sampled, regardless of commercial quota. `assertNoCivilianDelay` makes a
  violation throw rather than degrade silently.
- **Latency SLO (task 6):** `<5s` source→device budget (`latency-slo.ts`).
- **Freshness (task 11):** silence is shown as degraded confidence, never as
  "all clear" (`freshness-slo.ts`).

## 5. Liability / data-quality note

This is a life-safety feed but a best-effort one. Alert data may be delayed or
incorrect upstream; the platform must not present it as a guaranteed warning of
all threats. Always advise users to also heed official local sirens and DSNS
guidance. This package does not constitute an official government warning system.

## 6. Crawler discipline

- No HTML scraping of `alerts.in.ua` — API only.
- No Telegram userbot. Bot API, public channels, read-only.
- Polite cadence + backoff per tier; identifying User-Agent.
- Secrets exclusively from environment variables.
