# TODO — SLO Definitions

## Per-service targets
- [ ] API gateway: 99.95% availability, p95 < 200ms
- [ ] Map workspace: 99.9% availability, p95 < 1s for typical
- [ ] Ingest: < 60s lag from source to `events.normalized`
- [ ] Verify: < 5min P95 from normalized → verified
- [ ] Alert: < 5s P95 from match → in-app notification
- [ ] AI copilot: TTFT < 1s, full response < 8s
- [ ] Tile serving: 99.95% availability, p95 < 100ms
- [ ] Search: p95 < 250ms

## Ops
- [ ] Error budgets per service
- [ ] Burn-rate alerts
- [ ] Quarterly SLO review
