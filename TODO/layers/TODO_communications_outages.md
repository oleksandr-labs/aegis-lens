# TODO — Layer: Communication / Internet Outages

## Goal
Track ISP / mobile / submarine cable outages affecting civilian comms.

## Progress
- 9 / 9 done

## Tasks
- [x] Cloudflare Radar feed — `integrations/cloudflare-radar/src/client.ts` CloudflareRadarClient; `adapter.ts` CloudflareRadarAdapter; availability-drop detection for UA + neighbors
- [x] NetBlocks alerts — `integrations/netblocks/` @ua-map/integration-netblocks; NetBlocksClient + NetBlocksAdapter; 5 incident types; severity from fraction; partner API key + demo fallback
- [x] RIPE Atlas measurements — `integrations/netblocks/src/ripe-atlas.ts` RipeAtlasClient (probe-drop + packet-loss anomaly), toIncidents() → NetBlocksIncident
- [x] Operator status pages (Kyivstar, Vodafone UA, lifecell, etc.) — `integrations/netblocks/src/operator-status.ts` OperatorStatusRecord + OPERATOR_NAMES, operatorStatusToIncidents() (en/uk)
- [x] BGP anomaly detection (RIPE NCC, BGPmon) — `integrations/netblocks/src/bgp-anomaly.ts` classifyBgpAnomaly() (mass_withdrawal/origin_change/route_leak/as_path), RIPEstat-style; bgpAnomaliesToIncidents()
- [x] Submarine cable status (TeleGeography) — `integrations/netblocks/src/submarine-cables.ts` CableStatusRecord, cableStatusToIncidents() per landing country
- [x] Per-region severity index — `integrations/netblocks/src/severity-index.ts` computeSeverityIndex() weighted saturating 0–100 + 1–5 band (en/uk labels)
- [x] Map style: dashed outline over affected region — shared paint spec `communication_outages` in `c:\tmp\sprint257_shared_C4.txt` (lineDasharray [2,2], band-colored outline + faint fill)
- [x] Cross-link to power outages (correlation) — `integrations/netblocks/src/power-correlation.ts` correlateCommsWithPower(); neutral hedged note (correlation ≠ causation, per Примітки)

## i18n
- Operator + region names localized.

### Примітки
Outages can be intentional (sanctions, censorship). Keep editorial neutrality.
