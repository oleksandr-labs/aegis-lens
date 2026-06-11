# NASA FIRMS Integration — Compliance, Licensing & ToS

Scope: near-real-time active-fire detections (MODIS + VIIRS NRT) ingested by
`@ua-map/integration-nasa-firms` and rendered on the `active_fires` / `thermal`
layers (`apps/web/src/lib/map-style.ts`).

## 1. API key

- **Source:** NASA FIRMS Area API — https://firms.modaps.eosdis.nasa.gov/api/
- A free **MAP_KEY** is required for the Area CSV endpoint. Request it at
  https://firms.modaps.eosdis.nasa.gov/api/map_key/.
- The key MUST come from `process.env.FIRMS_API_KEY` — **never hardcoded**, never
  committed. The typed reader is `src/config.ts` (`readFIRMSConfig`), which throws
  if the key is absent (unless an explicit demo/fallback mode is requested).
- The key gates rate limits, not paid billing — but it identifies us, so treat it
  as a credential and rotate via env only.

## 2. Licensing & attribution

- FIRMS data is **NASA / U.S. Government public-domain** (LANCE/EOSDIS), free to
  use and redistribute. No license fee.
- **Attribution is still required** and is delivered per displayed fire:
  `src/adapter.ts` writes the source URL (`https://firms.modaps.eosdis.nasa.gov/`)
  plus instrument + satellite into each event's `sources[]` and `summary`.
- Cite "NASA FIRMS" + the instrument (MODIS / VIIRS) wherever fires are shown.

## 3. Latency & freshness (SLA posture)

- **NRT data is ~3 hours delayed** after satellite overpass (documented in
  `client.ts` and the user-facing `summary` strings, en + uk).
- We do not over-promise freshness. `src/latency-monitor.ts` tracks observed
  ingest latency against the ~3h NRT expectation and raises a breach signal when
  data is staler than the source's own SLA, so the UI can warn honestly.
- For sub-NRT needs, NASA offers Ultra Real-Time / Real-Time tiers; not used today.

## 4. ToS / crawler discipline

- Poll the Area CSV endpoint on the data's natural cadence (NRT updates are not
  more frequent than the overpass cadence); do not hammer the endpoint.
- Respect the MAP_KEY transaction limits documented by FIRMS.

## 5. General posture

- Confidence is normalized (`normalizeConfidence`) and industrial false positives
  are filtered (`filterFalsePositives`) before display — fire ≠ strike.
- All user-facing strings localized **en + uk**.
- No secrets in the repo; the key is read only from `process.env.FIRMS_API_KEY`.
