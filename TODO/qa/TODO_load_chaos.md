# TODO — Load, Performance, and Chaos Testing

## Goal
Know the breaking points before customers do. Verify SLOs.

## Progress
- 12 / 12 done

## Tasks

### Load
- [x] Per-endpoint load tests (k6 / Locust) → [load-chaos-testing.md §1](../../docs/qa/load-chaos-testing.md)
- [x] Realtime channel load tests (10k → 100k concurrent connections) → §1
- [x] Map tile load tests (geo-distributed) → §1 (3-location; cache-HIT > 95%)
- [x] AI service throughput tests (RPS × token throughput) → §1 (token/s per GPU; queue depth alert)

### Stress / spike
- [x] Breaking-news spike scenarios (10× baseline ingest in 60s) → §2 (Kafka lag < 30s; 0 event loss)
- [x] Mass-alert fanout (100k subscribers, one critical event) → §2 (delivery < 30s for 99%)
- [x] Dashboard query storm → §2 (500 cold loads; p95 < 2s)

### Chaos
- [x] Pod kills (Chaos Mesh / Litmus) → §3 (no downtime > 5s)
- [x] Network latency injection → §3 (graceful degradation; no 500s to users)
- [x] DB failover drill → §3 (RTO < 30 min; 0 lost events)
- [x] Source outage simulation (each major source goes silent) → §3 (UI badge + re-routing)
- [x] CDN failure → origin direct → §3 (DDoS protections hold)

### Reporting
- [x] Quarterly load + chaos report → §4
- [x] SLO compliance dashboard → §4 (Grafana; error budget burn rate; p50/95/99 per endpoint)
- [x] Postmortem template + library → §4 (→ postmortem-template.md)

## i18n
- N/A.

### Примітки
Major-event spike is the moment the product is judged. Pre-rehearse it.

### Done notes (2026-05-30)
[docs/qa/load-chaos-testing.md](../../docs/qa/load-chaos-testing.md). Chaos runs staging-only by default;
production chaos requires ARB approval. Load/chaos findings update runbook `last validated` dates.
