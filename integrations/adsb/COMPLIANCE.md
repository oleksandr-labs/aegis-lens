# ADS-B Integration — Compliance, Licensing & ToS

Scope: aviation tracking feeds ingested by `@ua-map/adsb`. Two providers are
modelled in code (`src/providers.ts`): **OpenSky Network** and **ADS-B Exchange**.
This document is the authoritative license/billing record; the typed config in
`providers.ts` mirrors it for enforcement (`assertProductionTier`).

## 1. OpenSky Network

- **Terms:** https://opensky-network.org/about/terms-of-use
- **API docs:** https://openskynetwork.github.io/opensky-api/
- **Tiers** (see `OPENSKY_PROVIDER` in `providers.ts`):
  - `anonymous` — free, **400 credits/day**, 10s minimum polling interval.
    **Non-commercial / fair-use only.** Not permitted for production.
  - `research` — free for verified academic/research use behind a registered
    account and a non-commercial declaration; higher credit budget, 5s floor.
    Still **not** a production/commercial license.
  - `commercial` — **required for any production or commercial deployment.**
    Negotiated limits and redistribution terms via a signed agreement.
- **Attribution:** credit "OpenSky Network" on any surface showing its data.
- **Redistribution:** raw state vectors may not be redistributed except under a
  commercial agreement. Cache only transiently for display; do not resell.
- **Crawler discipline:** honour the per-tier `minPollIntervalMs`; back off on
  HTTP 429; send a descriptive User-Agent; never parallelise to dodge the credit
  budget.

### Action item (TODO_adsb: "OpenSky Network access (research / commercial)")
Production use of Aegis Lens requires either a registered **research** agreement
(if and only if the deployment remains genuinely non-commercial) **or** an
OpenSky **commercial** agreement. Until one is in place, the OpenSky client must
run on the `anonymous` tier and is gated out of production by
`assertProductionTier("opensky", ...)`.

## 2. ADS-B Exchange

- **Legal/privacy:** https://www.adsbexchange.com/legal-and-privacy/
- **Data:** https://www.adsbexchange.com/data/
- **Access path:** commercial API via RapidAPI marketplace (or direct enterprise
  subscription). There is **no free production tier**.
- **Tiers** (see `ADSBEXCHANGE_PROVIDER` in `providers.ts`):
  - `rapidapi_basic` — metered per-call billing via RapidAPI. **Commercial
    billing required.** No redistribution of raw positions.
  - `enterprise` — direct commercial subscription, negotiated volume and
    redistribution terms.
- **Redistribution:** raw positions are **forbidden** from redistribution on the
  RapidAPI tier; only contract-defined terms apply on enterprise.
- **Secrets:** `ADSBEXCHANGE_RAPIDAPI_KEY` / `ADSBEXCHANGE_RAPIDAPI_HOST` read
  from `process.env`. Never commit keys.

### Action item (TODO_adsb: "ADS-B Exchange commercial subscription")
Using ADS-B Exchange in production **requires an active commercial subscription**
(RapidAPI metered plan or enterprise contract). This billing obligation is
recorded here and enforced in `providers.ts` — both ADS-B Exchange tiers carry
`requiresAgreement: true`, and only paid tiers are `productionAllowed`.

## 3. Per-feed health monitoring

`src/health.ts` (`FeedHealthMonitor`) tracks each feed independently:
freshness (seconds since last success), rolling error rate, staleness vs the
feed's expected cadence, latency and record volume, producing a typed
`FeedHealthStatus` (`healthy | degraded | stale | down | unknown`) with en+uk
reasons. This supports SLA/observability obligations and lets the UI surface a
per-source health badge plus an `overall()` rollup.

## 4. General posture

- Aircraft positions are operational/public-interest data; nonetheless we do not
  republish raw feeds outside the licensed display surface.
- Privacy filtering for sensitive/blocked aircraft is handled in `src/privacy.ts`.
- All user-facing strings are localized **en + uk**.
- No secrets in the repo; all credentials via `process.env`.
