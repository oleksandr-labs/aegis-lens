# TODO — Metrics Tree

## Goal
Full hierarchical decomposition of north-star → input metrics. Everyone knows what they're moving.

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.55)

## Tasks
- [x] Tree built top-down from north-star → [docs/okrs/okrs-metrics.md §3.1](../../docs/okrs/okrs-metrics.md)
- [x] Acquisition branch (organic, embed, referral, press, paid) → [docs/okrs/okrs-metrics.md §3.2](../../docs/okrs/okrs-metrics.md)
- [x] Activation branch (first map interaction, first filter, first alert) → [docs/okrs/okrs-metrics.md §3.3](../../docs/okrs/okrs-metrics.md)
- [x] Engagement branch (DAU, sessions, depth, return) → [docs/okrs/okrs-metrics.md §3.1 §3.4](../../docs/okrs/okrs-metrics.md)
- [x] Revenue branch (conversion, expansion, NDR, churn) → [docs/okrs/okrs-metrics.md §3.4](../../docs/okrs/okrs-metrics.md)
- [x] Quality branch (verification yield, latency, source freshness) → [docs/okrs/okrs-metrics.md §3.5](../../docs/okrs/okrs-metrics.md)
- [x] Per-metric owner + dashboard URL → [docs/okrs/okrs-metrics.md §3.6](../../docs/okrs/okrs-metrics.md)
- [x] Quarterly tree review → [docs/okrs/okrs-metrics.md §3.7](../../docs/okrs/okrs-metrics.md)

### Done notes (2026-05-30)
Full metrics tree in `docs/okrs/okrs-metrics.md §Part 3`. ASCII tree from TEVI → Source Input (count / freshness P95 / reliability score) → Ingest Pipeline (latency / dedup / PII) → AI/NLP Quality (F1 / ECE / queue depth) → Verification Pipeline (SLA / auto-verification rate / error rate) → Product/User (Acquisition / Activation / Engagement / Revenue / Quality branches). Acquisition: organic signups target 50+/week, trial-to-paid > 8%. Activation event defined (view map + filter + return in 7 days), D7 target > 35%. Revenue: MRR/ARR + NDR > 110% + gross churn < 3%/month + LTV/CAC > 3×. Quality: verification yield / source freshness P95 / classification F1 / user-reported error rate. Per-metric owner: named role + Grafana/PostHog/Metabase URL + Slack channel. Tree review Q4 annually with question: "any metric nobody looks at?" (remove).

## i18n
- N/A.

### Примітки
Tree shape stays stable; numbers move. Don't redesign quarterly.
