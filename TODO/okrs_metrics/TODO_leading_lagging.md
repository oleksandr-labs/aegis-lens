# TODO — Leading vs Lagging Indicators

## Goal
Separate predictive (leading) from reactive (lagging) so we can intervene early.

## Progress
- 7 / 7 done ✅ COMPLETE (Sprint 2.55)

## Leading
- [x] Source freshness P95 → [docs/okrs/okrs-metrics.md §4.1](../../docs/okrs/okrs-metrics.md)
- [x] Verification queue depth → [docs/okrs/okrs-metrics.md §4.1](../../docs/okrs/okrs-metrics.md)
- [x] Activation rate D7 → [docs/okrs/okrs-metrics.md §4.1](../../docs/okrs/okrs-metrics.md)
- [x] Filter-creation rate per new user → [docs/okrs/okrs-metrics.md §4.1](../../docs/okrs/okrs-metrics.md)
- [x] AI copilot satisfaction (per-message) → [docs/okrs/okrs-metrics.md §4.1](../../docs/okrs/okrs-metrics.md)

## Lagging
- [x] MRR / ARR → [docs/okrs/okrs-metrics.md §4.2](../../docs/okrs/okrs-metrics.md)
- [x] NDR → [docs/okrs/okrs-metrics.md §4.2](../../docs/okrs/okrs-metrics.md)
- [x] Churn → [docs/okrs/okrs-metrics.md §4.2](../../docs/okrs/okrs-metrics.md)
- [x] Press citations / quarter → [docs/okrs/okrs-metrics.md §4.2](../../docs/okrs/okrs-metrics.md)
- [x] SEO organic traffic → [docs/okrs/okrs-metrics.md §4.2](../../docs/okrs/okrs-metrics.md)
- [x] LTV / CAC → [docs/okrs/okrs-metrics.md §4.2](../../docs/okrs/okrs-metrics.md)

## Ops
- [x] Leading indicators alert on regression → [docs/okrs/okrs-metrics.md §4.3](../../docs/okrs/okrs-metrics.md)
- [x] Lagging reviewed monthly with team → [docs/okrs/okrs-metrics.md §4.4](../../docs/okrs/okrs-metrics.md)
- [x] Per-indicator owner → [docs/okrs/okrs-metrics.md §4.5](../../docs/okrs/okrs-metrics.md)

### Done notes (2026-05-30)
Full leading/lagging framework in `docs/okrs/okrs-metrics.md §Part 4`. Leading indicators table: 7 indicators with what-they-predict, owner, and alert threshold (source freshness P95 > 10min → alert; queue > 200 events → alert; D7 activation < 30% → review; filter-creation < 40% in 7 days → review; copilot satisfaction < 3.5/5 7-day avg → review). Lagging indicators table: 8 metrics with frequency and targets (NDR > 110%, churn < 3%/month, LTV/CAC > 3×). Automated alerts: Grafana+PagerDuty for operational; PostHog for product; weekly Monday Slack digest. Monthly metrics review meeting: last Thursday of each month, 45 min, CEO + team leads. Per-indicator ownership: named role, responsible for dashboard accuracy + weekly comment + root-cause on alerts.

## i18n
- N/A.

### Примітки
Lagging indicators are the score; leading are the steering wheel.
