# TODO — Integration: NASA FIRMS

## Goal
Near-real-time active fire data — MODIS + VIIRS.

## Progress
- 6 / 6 done

## Tasks
- [x] FIRMS API key — needs env var `FIRMS_API_KEY`, not stored in code — `integrations/nasa-firms/COMPLIANCE.md` (§1 env `FIRMS_API_KEY`) + typed reader `integrations/nasa-firms/src/config.ts` (`readFIRMSConfig`, throws if key absent)
- [x] Per-AOI subscription (CSV polling) — `integrations/nasa-firms/src/client.ts` (FIRMSClient.fetchActive, configurable area bbox)
- [x] Confidence-flag handling — `integrations/nasa-firms/src/client.ts` (normalizeConfidence, CONFIDENCE_MAP: h/n/l/numeric)
- [x] False-positive filter (industrial sources) — `integrations/nasa-firms/src/client.ts` (filterFalsePositives, bounding-box list)
- [x] Latency monitoring vs source SLA — `integrations/nasa-firms/src/latency-monitor.ts` (NRT ~3h-delay SLA tracker, classifyLatency/FIRMSLatencyMonitor, breach signal + en/uk notice)
- [x] Attribution per displayed fire — `integrations/nasa-firms/src/adapter.ts` (source URL + instrument/satellite in summary)

## i18n
- N/A.

### Примітки
NRT data ~3h delay. Be honest with users about freshness.
