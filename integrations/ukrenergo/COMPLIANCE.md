# COMPLIANCE — @ua-map/ukrenergo (Ukrenergo + Oblenergo power-grid status)

Civilian-critical integration. This document encodes the licensing, attribution,
Terms-of-Service, partnership/liaison, and crawler-discipline facts that govern
how this package may ingest and republish Ukrainian electricity-grid data.

Be conservative: where republication terms are unclear, the package republishes
only **status + schedule facts** (which oblast / which queue / which hours), with
attribution and a link back to the source, never wholesale copies of pages.

## Sources & their terms

### 1. Ukrenergo (НЕК «Укренерго») — national TSO
- **Channels:** site `https://ua.energy`, Telegram `https://t.me/Ukrenergo`, and a
  published power-balance / consumption API where issued.
- **Nature of data:** official public-interest announcements (whether GPV/ГСВ
  rotating schedules or emergency shutdowns are in force, and for which oblasts).
- **Use:** factual grid-status reporting in the public interest. We republish the
  *status fact* + a link to the original notice. Full-text reproduction of press
  releases is avoided; short quotation with attribution only.
- **API keys:** read from `process.env` only — never hardcoded. No key is shipped.

### 2. Regional distribution operators (24 oblenergo / DSO) — see `oblenergo-registry.ts`
- Each operator publishes its own per-queue (черга) timetable on its public site
  and Telegram channel. These are public-interest civilian-safety notices.
- **Use:** we parse and republish the *schedule facts* (group → OFF hours) with
  attribution to the operator and a `sourceUrl` link. We do not mirror their HTML.
- **Occupied / contested regions** (Crimea, and parts of Donetsk, Luhansk,
  Kherson, Zaporizhzhia): the registry lists the **Ukrainian licensee**; live
  coverage may be partial (`coverage: "partial"`). Data from occupation
  administrations is **not** ingested.

### 3. Yasno / DTEK — consumer-facing schedules
- **Yasno** (DTEK retail brand) and **DTEK** regional grid operators publish
  consumer rotating-blackout schedules per group (incl. sub-groups like "3.1").
- **DTEK Group ToS:** consumer schedules are published for public safety. We
  ingest the *schedule facts* for the documented service areas only (Kyiv city,
  Kyiv oblast, Dnipro, Odesa, Donetsk) and link back. No account scraping, no
  reproduction of branded assets.

## Telegram ingestion discipline
- **Bot API only** (`integrations/telegram/src/bot-api-client.ts`), public
  channels, read-only. No MTProto userbot, no scraping of private/user accounts.
- Respect Telegram ToS rate limits; polite polling cadence only.

## Crawler discipline (HTTP sources)
- Descriptive `User-Agent` identifying the project + contact (see clients).
- Polite throttle: ≥ 60 s between requests per source (`minIntervalMs`), matching
  the providers' own publish cadence (hourly at most). Respect `robots.txt`.
- Per-region caching cadence; the API route caches responses 5 min.
- No live network call is made unless an explicit endpoint/key is configured;
  the default path returns the bundled **DEMO fixtures**.

## Republication & attribution
- Republish only **facts** (oblast, queue, OFF/ON hours, scheduled-vs-emergency,
  restoration ETA) — not verbatim pages or branded media.
- Always preserve and surface `sourceUrl` for each schedule/record.
- Attribute each schedule to its operator (display name in uk/ru/en from the
  registry) and Ukrenergo for national notices.

## Accuracy, safety & YMYL note
- This is **civilian-critical (YMYL)** data: people rely on it to know when power
  returns. The package marks every fixture `isDemo: true` and the API meta carries
  a demo disclaimer. **Emergency** outages are explicitly flagged as having an
  **unpredictable** restoration time; ETAs for them are low-confidence estimates.
- Production deployment MUST replace demo fixtures with live operator feeds and
  SHOULD reconcile against independent signals (VIIRS night-lights, Cloudflare
  Radar — see `viirs-correlation.ts`, `radar-correlation.ts`) before display.

## Partnership / liaison notes
- No formal data-sharing agreement with Ukrenergo, the oblenergos, or DTEK/Yasno
  is in place. Live ingestion at scale SHOULD be confirmed with each operator's
  press/IT contact, or sourced via an official open-data/API programme where one
  exists, to stay within ToS and ensure data freshness.
- Where an operator offers an official API, prefer it over HTML parsing.

## No new map layer
- This package **feeds the existing `power_outages` layer** via
  `to-power-outages.ts` (emits `OutageSignal[]` for the power-outages fusion
  pipeline). No new `LayerConfig` or paint spec is introduced.
