# AIS Integration — Compliance, Licensing & ToS

Scope: maritime vessel tracking ingested by `@ua-map/ais`. Several sources are
modelled: **AISStream** (live ingest), **Spire Maritime** (commercial, Phase 2),
and **MarineTraffic / VesselFinder** (cross-reference only).

## 1. AISStream (primary live feed)

- **Docs:** https://aisstream.io/documentation
- Free tier: up to 3 bounding boxes, 1 connection (see `aisstream-client.ts`).
- Token via `process.env` — never hardcoded.
- Used for live Black Sea + Sea of Azov coverage.

## 2. Spire Maritime (commercial — Phase 2)

- **Docs:** https://documentation.spire.com/maritime-2-0/
- Satellite + terrestrial AIS with open-ocean coverage where terrestrial AIS
  goes blind. **Paid, contract-gated commercial source.**
- Client: `src/spire-client.ts` (`SpireMaritimeClient`). Live calls are **refused**
  unless `AIS_PHASE2_ENABLED=true` **and** `SPIRE_API_TOKEN` is set — Spire must
  not be queried without an active contract. A `demo()` path + `SPIRE_DEMO_NODE`
  fixture exercise the adapter without billing.
- **Redistribution:** per Spire contract only; raw satellite positions are not
  redistributed outside the licensed display surface.

### Action item (TODO_ais: "Spire Maritime API (commercial, Phase 2)")
Delivered as the Phase-2-gated codeable contract: typed GraphQL client +
`adaptSpireVessel` mapping to canonical `VesselPosition`, gated by env flag +
token, with a demo fixture. Production activation requires a signed Spire
commercial agreement and the two env vars above.

## 3. MarineTraffic / VesselFinder (cross-reference only)

- MarineTraffic and VesselFinder hold richer vessel particulars (name, IMO,
  flag, dimensions, photos) under **licensed, non-redistributable** terms.
- We do NOT redistribute their data. `src/cross-reference.ts` defines the typed
  cross-ref contract (`CrossRefProvider` incl. `marinetraffic`/`vesselfinder`)
  and a provenance-preserving merge (`mergeVesselRefs`) that a licensed adapter
  can feed. Only `detail_url` references are kept, never republished imagery.

## 4. Dark-vessel / SAR correlation

- `src/dark-vessel.ts` correlates AIS-dark gaps against non-cooperative SAR
  detections (Sentinel-1, ICEYE, Capella, coastal radar, optical). SAR imagery
  itself is governed by the relevant imagery provider's license; this module
  consumes derived *detections*, not redistributed imagery.

## 5. Sanctions data

- OFAC SDN + EU consolidated (+ UK/OFSI) lists screened in `src/sanctions.ts`.
- Lists fetched from official sources; staleness is tracked
  (`isSanctionsDataStale`) because stale screening is a legal risk.

## 6. General posture

- **AIS can be spoofed** — confidence is always cross-referenced (SAR + multi-
  provider particulars) before any high-stakes labelling.
- All user-facing strings localized **en + uk** (+ transliteration for names).
- No secrets in the repo; all credentials via `process.env`.
