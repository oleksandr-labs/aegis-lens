# COMPLIANCE — `@ua-map/cert-ua` (CERT-UA + SSSCIP + MISP)

Scope: cyber-incident ingestion for Aegis Lens. Covers license, ToS, attribution,
republication, crawler discipline, lawful-access gating, and the CERT-UA liaison/
partnership track. Conservative by default — when in doubt, gate and attribute.

> **Display rule (applies to every consumer of this package):** cyber events are
> **RETROSPECTIVE**. Published advisories typically describe activity that occurred
> **days to weeks earlier**. Latency is measured in **days, not seconds**. The map
> layer, widget and sector pages MUST surface this (see `update_cadence_label` and
> the `disclaimer`/`cadenceLabel` strings shipped in `widget.ts` / `cyber-layer.ts`).
> Never present this feed as real-time.

---

## 1. CERT-UA (cert.gov.ua)

- **Operator:** Computer Emergency Response Team of Ukraine, under SSSCIP.
- **Content used:** public advisories ("Оповіщення"), the public RSS feed
  (`https://cert.gov.ua/api/articles/rss`), and the public Telegram channel
  `@certua` (Bot API only — see §4).
- **License / status:** material published by a Ukrainian state body for public
  awareness. No paywall, no registration for the public advisory pages/RSS.
- **Republication:** permitted for the **factual indicators and advisory facts**
  (IOCs, CVEs, sector, actor attribution, dates) with **clear attribution** to
  CERT-UA and a **link to the source advisory** (we preserve `url` in every
  `citation`). Do **not** republish full advisory bodies verbatim at scale — link
  out and summarize. We store `originalText` for ingest/analysis only; the public
  API truncates to a short summary.
- **Crawler discipline:**
  - Polite, single-threaded polling. Default cadence **once per 6h**
    (`CertUaClient.minPollIntervalMs`), self-throttled via `canPoll()`.
  - Identifiable `User-Agent` (`AegisLens-CERT-UA-Adapter/1.0 …`).
  - Respect `robots.txt` and any published rate limits; cache between polls.
  - No secrets required for the public feed.

## 2. SSSCIP (cip.gov.ua)

- **Operator:** State Service of Special Communications and Information Protection
  of Ukraine (parent agency of CERT-UA).
- **Content used:** public strategic-comms cyber announcements / news + RSS
  (`https://cip.gov.ua/ua/rss` where available).
- **License / republication:** same posture as CERT-UA — Ukrainian state body,
  public awareness material; attribute + link, summarize rather than mirror bodies.
- **Crawler discipline:** default cadence **once per 12h** (announcements are
  weekly/quarterly summaries); identifiable User-Agent; cache between polls.

## 3. MISP / StateWatch threat-intel feeds — **LAWFUL ACCESS ONLY**

MISP (Malware Information Sharing Platform) and StateWatch-style partner feeds are
**gated** and are **not** open data. This package treats them as restricted:

- **Access requires:** a partnership/membership agreement with the sharing
  community **and** an API auth key. The key is read from
  `process.env.MISP_AUTH_KEY` (and base URL from config) — **never hardcoded**.
  Without both, `MispClient` serves only a small **TLP:CLEAR** demo fixture.
- **Traffic Light Protocol (TLP) enforcement** — `MispClient` filters output by
  TLP at the boundary (`maxPublishableTlp`, default `green`):
  | TLP | Meaning | Aegis Lens handling |
  |-----|---------|---------------------|
  | RED | recipients only | **dropped** — never stored beyond intake, never published |
  | AMBER | limited internal | **dropped from public output** |
  | GREEN | community | may inform analysis; attribute source; not auto-published verbatim |
  | CLEAR / WHITE | public | may be republished with attribution |
- **Consequence:** the public map / API only ever sees TLP:CLEAR(/WHITE) indicators.
  Anything more restrictive is excluded by `filterByTlp`. Do not loosen
  `maxPublishableTlp` for any public-facing route.

## 4. Telegram

- Several sources (incl. `@certua`) also publish via Telegram. Use the shared
  `@ua-map/telegram` **Bot API client only**. **Never scrape user accounts** or use
  unofficial MTProto user sessions. Bot token from `process.env.TELEGRAM_BOT_TOKEN`.

## 5. CERT-UA Partnership / Liaison (Task 4)

Status and intended terms of a formal relationship with CERT-UA:

- **Current basis:** consumption of **public** advisories/RSS/Telegram only, under
  the public-awareness terms above. No special access is assumed or used today.
- **Liaison goal:** establish a documented partnership to (a) receive structured
  IOC feeds (MISP) under an explicit sharing agreement and TLP terms, (b) agree
  attribution wording, and (c) obtain a contact for responsible disclosure /
  takedown of any IOC we surface that becomes sensitive.
- **Commitments we make as a partner / good-faith consumer:**
  1. Always attribute CERT-UA / SSSCIP and link the source advisory.
  2. Honor TLP on any shared (non-public) feed; default-deny RED/AMBER in product.
  3. Provide a point of contact and respond to correction/takedown requests.
  4. Do not present retrospective data as real-time operational intelligence.
  5. Do not republish full advisory bodies at scale; summarize + link.
- **Until a signed agreement exists:** restricted feeds remain **off** in
  production (no `MISP_AUTH_KEY` set ⇒ demo TLP:CLEAR only). This file is the
  codeable contract for that gating.

## 6. CVE / NVD references

- CVE identifiers and NVD/MITRE reference URLs (`cve-xref.ts`) are public and
  freely citable. We only build deterministic reference links; any CVSS enrichment
  is via a caller-supplied lookup (no bundled scraping).

## 7. Data-subject / accuracy notes

- IOCs (IPs, domains, hashes, emails) are technical indicators from official
  advisories; we republish only those **already published** by CERT-UA/SSSCIP.
- Threat-actor attribution mirrors the source's stated attribution; we do not add
  independent attribution.
- Corrections: because advisories can be updated/retracted, the canonical event
  carries `isRetracted` and `verificationState`; consumers should re-ingest daily.

## 8. Secrets

- `MISP_AUTH_KEY`, `MISP_BASE_URL`, `TELEGRAM_BOT_TOKEN` — all from `process.env`.
  None are committed. Public CERT-UA/SSSCIP RSS needs no secret.
