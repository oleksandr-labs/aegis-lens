# TODO — Integration: AIS (Maritime)

## Goal
Maritime vessel tracking.

## Progress
- 7 / 7 done

## Tasks
- [x] AISStream WebSocket feed — `integrations/ais/src/aisstream-client.ts` (WSS, Black Sea + Azov bboxes, auto-reconnect 5s)
- [x] Spire Maritime API (commercial, Phase 2) — `integrations/ais/src/spire-client.ts` (`SpireMaritimeClient` Phase-2-gated GraphQL client + `adaptSpireVessel`→canonical `VesselPosition` + demo fixture) + `integrations/ais/COMPLIANCE.md` §2
- [x] MarineTraffic API as cross-reference — already delivered Sprint 2.57: `integrations/ais/src/cross-reference.ts` (`CrossRefProvider` incl. `marinetraffic`/`vesselfinder`, provenance-preserving `mergeVesselRefs`); license terms in `integrations/ais/COMPLIANCE.md` §3
- [x] Dark-vessel correlation with Sentinel-1 SAR — already delivered Sprint 2.57: `integrations/ais/src/dark-vessel.ts` (`SarDetection.sensor` incl. `sentinel_1`, `correlateDarkVessel` joins AIS-off gaps ↔ SAR contacts with confidence + en/uk reasons)
- [x] Vessel database (MMSI / IMO / type) — flag inference from MMSI MID prefix in aisstream-client
- [x] Sanctions list integration (OFAC / EU) — `integrations/ais/src/sanctions.ts` (InMemorySanctionsStore + screenVessel)
- [x] Per-vessel position history retention policy — adapter queue with `fetchSince()` drain pattern

## i18n
- Vessel + flag names localized + transliterated.

### Примітки
AIS can be spoofed. Cross-reference with SAR for confidence.
