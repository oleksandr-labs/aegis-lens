# Compliance — `@ua-map/ova-telegram`

OVA (Oblast Military Administration) official Telegram channels — the
**official-of-record** trust tier (the highest this package emits, short of a
Cabinet of Ministers statement). Conservative by design: where a term is
uncertain we gate to the most restrictive interpretation.

## 1. Sources — official OVA + city-council channels

- **What:** one authoritative Telegram channel per oblast (all 24 active oblasts;
  Crimea + Sevastopol registered for completeness) plus the official city-council
  channels of Kyiv, Kharkiv, Odesa, Dnipro and Lviv. The curated list lives in
  `src/registry.ts` and is **data** — corrections need no code change.
- **Authenticity:** a channel is treated as official ONLY after
  `src/verification.ts` clears it (`authenticity >= 0.5`). The strongest signal is
  a `gov.ua` official-site anchor that declares the exact `@username`; Telegram's
  verified badge, registry membership, a stable numeric `chatId`, and posting
  maturity are secondary. An unverified/hijacked clone is never marked official.

## 2. Access — Telegram **Bot API only** (within ToS)

- Ingestion reuses `@ua-map/telegram → TelegramBotApiClient` — the **read-only
  Bot API** against **public channels only**.
- **No userbot / MTProto scraping of user accounts.** We do not impersonate a
  user, join private chats, or harvest member lists. This is the same ToS posture
  as the existing `alerts-in-ua` OVA fallback.
- **Auth / secrets:** the bot token is read **only** from
  `process.env.OVA_TELEGRAM_BOT_TOKEN`; never hardcoded. With no token the
  package and API route serve a bundled DEMO fixture so the pipeline is
  exercisable offline.
- **Crawler discipline:** per-channel polite cadence derived in `src/cadence.ts`
  (clamped 15 s … 10 min); a single channel outage never aborts the fleet poll.

## 3. Republication & attribution

- OVA posts are official public-interest communications. Public display with
  attribution is permitted. Any UI surface showing this data **must** credit the
  originating institution and link back to the source post
  (`t.me/<channel>/<id>`), which the adapter preserves as a
  `SourceCitation.url` and the widget exposes as `permalink` + `attribution`:
  - **uk:** «Джерело: офіційні канали ОВА (Telegram)»
  - **en:** "Source: official OVA channels (Telegram)"
- The **Ukrainian original is always preserved verbatim** (`OvaPost.textUk` /
  `AegisEventV1.originalText`). EN + RU are clearly-marked **derived
  translations** (`src/translate.ts`) and must never overwrite or be presented in
  place of the authoritative UA text.

## 4. Trust tier & cross-validation

- OVA = `official_of_record` (city councils = `official_municipal`) in
  `src/provenance.ts`. Base channel trust 0.85; the adapter forwards
  `channelTrust × authenticity × reputation` as the canonical event confidence.
- `src/alert-validation.ts` cross-references OVA posts with the alerts.in.ua
  siren feed: agreement boosts confidence, contradiction is surfaced for human
  review (never silently resolved) — life-safety fail-safe bias.

## 5. Translation provider

- `src/translate.ts` is a **seam**: the default is an offline pass-through that
  tags untranslated text. A real MT provider (DeepL / Google / on-prem) is
  injected via `setTranslator`; that provider reads its own key from env. No MT
  key is read or stored in this package.

## 6. Liability / verification note

- Marking a post "verified" reflects **channel authenticity**, not independent
  confirmation of each claim. Event-level verification remains the analyst
  workflow (`verificationState` on the canonical event). Backup failover
  (`src/backup-detection.ts`) never auto-promotes an unverified mirror to
  official; discovered mirrors are surfaced for human review only.
