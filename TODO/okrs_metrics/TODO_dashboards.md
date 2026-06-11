# TODO — Internal Metric Dashboards

## Goal
Per-audience dashboards: company-wide, per-team, per-investor, per-source-health.

## Progress
- 9 / 9 done ✅ COMPLETE (Sprint 2.55)

## Tasks
- [x] Company TV dashboard (north-star + top KRs) → [docs/okrs/okrs-metrics.md §5.1](../../docs/okrs/okrs-metrics.md)
- [x] Per-team dashboards (auto-generated from OKR registry) → [docs/okrs/okrs-metrics.md §5.2](../../docs/okrs/okrs-metrics.md)
- [x] Investor monthly dashboard (sanitized) → [docs/okrs/okrs-metrics.md §5.3](../../docs/okrs/okrs-metrics.md)
- [x] Source-health dashboard (also public — see [../pages/TODO_status.md](../pages/TODO_status.md)) ✓ Sprint 2.0
- [x] AI quality dashboard → [docs/okrs/okrs-metrics.md §5.4](../../docs/okrs/okrs-metrics.md)
- [x] Cost / unit-economics dashboard → [docs/okrs/okrs-metrics.md §5.5](../../docs/okrs/okrs-metrics.md)
- [x] Per-customer health dashboard (for CSMs) → [docs/okrs/okrs-metrics.md §5.6](../../docs/okrs/okrs-metrics.md)
- [x] Alert on metric regression → [docs/okrs/okrs-metrics.md §5.7](../../docs/okrs/okrs-metrics.md)
- [x] Single source of truth (BI layer or Metabase / Cube.dev) → [docs/okrs/okrs-metrics.md §5.8](../../docs/okrs/okrs-metrics.md)

### Done notes (2026-05-30)
Full dashboard specs in `docs/okrs/okrs-metrics.md §Part 5`. TV dashboard: TEVI live + active sources + current quarter OKR scores + MRR + DAU + incident status; real-time operational + hourly product/business; Grafana+PostHog+Metabase iframe. Per-team dashboards: OKR registry → team-specific KR scores + leading indicators + lagging contributions + on-call summary. Investor dashboard: 8 metrics sent DocSend on 5th of each month (MRR/burn/headcount/customers/churn/NPS/TEVI narrative); 2 items explicitly excluded (TEVI actuals, pipeline details). AI quality dashboard: classification F1 by class + ECE + copilot satisfaction (7-day avg) + queue stats + A/B tests. Cost dashboard: cloud spend vs budget + cost per 1k events + cost per API call + LTV/CAC + gross margin. CSM dashboard per customer: health score 0–100 (green ≥ 80 / yellow 50–79 / red < 50) + usage + tickets + renewal date + NPS history. Alert routing table (TEVI > 180s → PagerDuty; DAU -20% → Slack #metrics; churn event → Slack #revenue). BI stack: Postgres + ClickHouse (analytical replica) + dbt + Metabase + Grafana; all SQL version-controlled in `packages/analytics/`.

## i18n
- Internal dashboards EN; public source-health localized.

### Примітки
A dashboard nobody looks at is decoration. Tie each one to a recurring meeting.
