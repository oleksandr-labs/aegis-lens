# TODO — North-Star Metric

## Goal
The single metric we optimize against. Drives every roadmap conversation.

## Progress
- 7 / 7 done ✅ COMPLETE (Sprint 2.55)

## Tasks
- [x] Candidate: *time-from-event-to-verified-intelligence* (target < 90s) → [docs/okrs/okrs-metrics.md §1.1](../../docs/okrs/okrs-metrics.md) — **CHOSEN**
- [x] Alt candidate: *weekly active verified events seen by analysts* → [docs/okrs/okrs-metrics.md §1.2](../../docs/okrs/okrs-metrics.md) — tracked as supporting metric
- [x] Decision rationale + tradeoffs documented → [docs/okrs/okrs-metrics.md §1.3](../../docs/okrs/okrs-metrics.md)
- [x] Per-tier sub-targets → [docs/okrs/okrs-metrics.md §1.4](../../docs/okrs/okrs-metrics.md)
- [x] Visible on every internal dashboard → [docs/okrs/okrs-metrics.md §1.5](../../docs/okrs/okrs-metrics.md)
- [x] Quarterly review (still right metric?) → [docs/okrs/okrs-metrics.md §1.6](../../docs/okrs/okrs-metrics.md)
- [x] Connected to OKRs at every level → [docs/okrs/okrs-metrics.md §1.7](../../docs/okrs/okrs-metrics.md)

### Done notes (2026-05-30)
North-star decision documented in `docs/okrs/okrs-metrics.md §Part 1`. TEVI (Time-from-Event-to-Verified-Intelligence) chosen. Definition: elapsed seconds from raw event entering ingest to `verified` (confidence ≥ 0.85 or human-approved) and visible to analysts. Target: median < 90s for Tier-1 classes, P90 < 5 min. Decision rationale: TEVI forces alignment across ingest + NLP + verify + infra — a product that is fast but wrong, or accurate but slow, both fail it. Comparison table vs. alternatives (DAU/MAU, API call volume). Per-tier sub-targets table: missile/drone < 60s median / < 3min P90 → maritime/aviation < 2min median / < 10min P90. Dashboard: green/yellow/red color coding. Quarterly review: requires CEO + board agreement + 2-quarter transition to change. OKR connection: every OKR must show how it moves TEVI or provide explicit rationale.

## i18n
- N/A.

### Примітки
A wrong north-star is worse than no north-star. Choose carefully, change rarely.
