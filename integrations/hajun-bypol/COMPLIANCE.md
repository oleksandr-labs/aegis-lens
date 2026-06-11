# COMPLIANCE — `@ua-map/hajun-bypol` (Hajun Project / BYPOL — Belarus tracking)

## Source

- **Initiatives ingested:**
  - **Belarusian Hajun (Беларускі Гаюн)** — a volunteer OSINT monitoring project
    tracking Russian military presence and movement through Belarus.
  - **BYPOL** — a Belarusian-opposition initiative of former security officers
    publishing investigations and military-movement analysis.
  - A wider **vetted-contributor community** that feeds both.
- **Channels (PUBLIC only):** the initiatives' own Telegram channels (via the
  **Telegram Bot API only** — read-only, public channels; no userbot/MTProto, no
  scraping of user accounts) and their public websites/feeds. We ingest only
  material that has ALREADY been published by the initiatives.

## SOURCE PROTECTION — the overriding constraint

Belarusian contributors report under an authoritarian regime; deanonymisation
can lead to imprisonment. This integration is built to make deanonymisation
structurally impossible:

- The vetted-contributor registry (`contributors.ts`) stores **only an opaque,
  non-reversible pseudonym + aggregate trust statistics**. It has NO field for a
  real name, phone, email, device id, IP, or precise/home location.
- `assertNoPii()` is a **fail-closed guard**: any attempt to attach an
  identifying field throws, so PII can never silently enter the store.
- Only `PublicContributorView` (pseudonym + coarse trust BAND) may reach the API
  or UI. Raw scores and per-report geography stay internal.
- Contributor attribution is used ONLY as a confidence input during ingest; the
  pseudonym is **never written into the public canonical event** and the API
  route never returns it.
- Sighting coordinates are deliberately **LOW precision** — resolved to a
  rail-node / airbase POI centroid (3–6 km uncertainty), never to a contributor's
  vantage point.

## License / republication terms

- Hajun and BYPOL publish for public awareness. We republish **short factual
  extracts (what / where / equipment) + a link**, never full article bodies.
- **Attribution is required and applied:** every normalised sighting carries a
  `citation` with `sourceId` + source `url` back to the original public post.
  The UI MUST display "Source: Hajun Project / BYPOL" with a link.
- Photos/video remain the initiatives' (or contributors') property and are
  **linked, not rehosted**.
- This integration redistributes **facts about military movement**, not the
  initiatives' branding; it does not imply their endorsement of Aegis Lens.

## ToS constraints

- **Telegram:** Bot API, public channels, read-only. The bot must be added as a
  channel member to receive `channel_post` updates; we never impersonate users.
  Token is read from `process.env.HAJUN_TG_BOT_TOKEN` — never hardcoded.
- **Websites:** respect `robots.txt` and server load. No bulk archival scraping;
  short extracts + link only.
- **Unverified handles are gated** (`official: false` sources are skipped in live
  mode) until the real handle is confirmed against the initiatives' own links.

## Cross-reference data (SAR + RU equipment pools)

- **Sentinel-1 SAR** verification (`sar-xref.ts`) uses Copernicus Sentinel data,
  which is free and open under the Copernicus licence; attribution to "Contains
  modified Copernicus Sentinel data" is applied where imagery-derived results are
  surfaced. We store **derived detections / correlations**, not raw scenes.
- **RU equipment-pool inventories** (`equipment-pool-xref.ts`) are modelled on
  community OSINT datasets; each pool entry carries a `sourceUrl` for provenance.
  The fixture is synthetic. A production deployment must honour the licence of
  whichever inventory dataset it wires in (attribution / non-commercial terms as
  applicable) before redistributing counts.

## Crawler discipline

This is a **low-frequency feed — do NOT hammer it.** The client enforces:

- **Per-host polite rate limit** (`minIntervalMs`, default **5 s**).
- **Per-channel cache TTL** (`cacheTtlMs`, default **5 min**).
- **Descriptive User-Agent** identifying the crawler + contact.
- **Conservative fallback:** any network/parse error falls back to the demo
  fixture and never throws into the pipeline (no retry storms).
- **Daily cadence:** `runDailyIngest()` is designed to run once per day.

## Languages

All user-facing strings carry **en + uk + be** (Belarusian). Cyrillic
(Ukrainian / Belarusian / Russian) is stored and emitted as UTF-8.
