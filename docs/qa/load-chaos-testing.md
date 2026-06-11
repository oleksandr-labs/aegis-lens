# Load, Performance & Chaos Testing

> Know the breaking points before customers do. Verify SLOs under realistic and
> adversarial conditions. **Major-event spikes are the moment the product is
> judged — pre-rehearse them.**

## 1. Load testing

### Per-endpoint load tests (k6)

Tool: **k6** (primary — scripted in JS, CI-native, Grafana Cloud integration).
Locust as a secondary for Python-based data-pipeline tests.

Per-endpoint baseline targets (from the [SLA addendum](../legal/msa/sla-addendum.md) +
[scalability plan](../architecture/scalability-plan.md)):

| Endpoint | Target RPS | p95 latency target | Notes |
| --- | --- | --- | --- |
| `GET /api/events` (map feed) | 500 RPS | < 200 ms | Cacheable; CDN in front |
| `POST /api/query` (search) | 100 RPS | < 500 ms | Elasticsearch-backed |
| `POST /api/copilot` (AI briefing) | 20 RPS | < 3 s | LLM-gated; stream response |
| `GET /api/alerts` (WebSocket feed) | 10 k concurrent | < 100 ms (first frame) | Realtime channel |
| `GET /tiles/{z}/{x}/{y}` | 1 000 RPS | < 100 ms | Tile cache warmth matters |

All load tests run with **authenticated traffic** (real JWT/API keys from test accounts)
and warm caches to avoid cache-cold artifacts.

### Realtime channel load (WebSocket / SSE)

Scenarios (k6 `scenarios` API + k6-ws extension):
- Ramp from 1 k → 10 k → 50 k → 100 k concurrent WebSocket connections.
- Measure: connection establishment time, first-event latency, message fan-out
  delay at each concurrency level, and memory on the gateway pods.
- Acceptance: < 500 ms fan-out for 100 k connections; gateway memory < 70%.

### Map tile load (geo-distributed)

Run from at least **3 locations** (EU, NA-East, NA-West) to test CDN and origin
simultaneously. Tools: k6 cloud or Grafana Cloud k6 distributed.
- Measure: cache-HIT ratio (target > 95%), origin RPS bypass (target < 5%),
  tile render p99 on cache miss.

### AI service throughput (vLLM + Claude proxy)

- Synthetic load: 20–50 concurrent briefing requests, mixed model sizes.
- Measure: token throughput (tokens/sec per GPU), TTFT (time to first token),
  queue depth at saturation.
- Alert threshold: queue depth > 10 requests = scale signal.

---

## 2. Stress & spike scenarios

### Breaking-news spike (10× ingest in 60 s)

Scenario template (Temporal workflow):
1. Ramp ingest adapters to **10× normal event rate** over 60 seconds.
2. Verify: Kafka consumer lag < 30 s, no event loss (compare produced vs. consumed
   counts end-to-end), alert delivery within SLA, no OOM on enrichment pods.
3. Measure pod autoscale latency (HPA response time).

Triggers: before major conflict anniversaries, before product launches, quarterly.

### Mass-alert fanout (100 k subscribers, 1 critical event)

Simulate a SEV-1 event triggering alerts to all subscribers:
- Publish one `CRITICAL` event to the alerts service.
- Measure: time for all 100 k notification records to be enqueued (target < 5 s),
  WebSocket fanout latency, email/webhook delivery rate.
- Acceptance: no alert dropped, delivery within 30 s for 99% of subscribers.

### Dashboard query storm

Simulate 500 users simultaneously opening the dashboard (cold page load):
- Triggers: `mv_events_daily_region` materialized-view refresh, Elasticsearch
  aggregation, Postgres time-series query.
- Acceptance: p95 dashboard load < 2 s; no cascading DB failures.

---

## 3. Chaos engineering

Tool: **Chaos Mesh** (Kubernetes-native) with **Litmus** for scenario library.

| Scenario | Command / spec | Expected outcome | Acceptance |
| --- | --- | --- | --- |
| **Pod kill** (random service pod) | `PodChaos` kill | Pod restarts; traffic shifts to healthy pods | No user-visible downtime > 5 s |
| **Network latency injection** | `NetworkChaos` 200 ms p99 to DB | Slow queries; retries surface | No 500s to users; graceful degradation |
| **DB failover drill** | Promote RDS read replica; repoint app | App reconnects; no data loss | RTO < 30 min; 0 lost events |
| **Source outage simulation** | Kill each major source adapter | UI badge appears; re-routing activates | No stale data served as current |
| **CDN failure → direct origin** | Cloudflare "pause" for a zone | Traffic hits origin; origin handles load | p95 < 2× baseline; DDoS protections hold |
| **Kafka partition leader kill** | Kill leader pod for top-3 partitions | Leader re-election; no message loss | Consumer lag < 60 s; 0 message loss |

Chaos tests run in **staging only** unless an experiment is explicitly approved for
production (via an ARB decision, since production chaos = planned risk).

---

## 4. Reporting & integration

### Quarterly load + chaos report

- Summary of all load tests run, results vs. targets, regressions vs. last quarter.
- List of breaking points discovered and their remediation status.
- Feed into the [tech-debt register](../engineering/tech-debt.md) and the
  [architecture review board](../architecture/architecture-review-board.md) for
  capacity planning.

### SLO compliance dashboard

Grafana dashboard tracking:
- **Error budget burn rate** per service (linked to the SLA addendum uptime
  targets).
- p50/p95/p99 latency per endpoint vs. the targets in §1.
- WebSocket connection count and fan-out latency.
- Kafka consumer lag (alert: > 30 s).

Dashboard is reviewed in the weekly engineering sync and after every load test run.

### Postmortem linkage

Load or chaos runs that expose real failures follow the standard
[postmortem template](../security/postmortem-template.md) and feed the
[incident postmortem library](../security/incident-program.md).
Chaos-exercise findings also update the relevant runbook's `last validated` date
in the [runbooks index](../runbooks/README.md).
