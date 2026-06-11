# TODO — Embargo / Early-Access Tier

## Goal
Premium-priced early window on time-sensitive intelligence (verified events, analytic deltas, narrative-cluster detections) before public release. Aligns with how financial wires sell speed.

## Progress
- 10 / 10 done

## Models
- [x] **5-min embargo** — Pro+ gets event 5 min before Free (15-min delay) — apps/web/src/lib/access/embargo.ts
- [x] **Verified-first feed** — Business+ gets verified events immediately; Pro waits for additional corroboration — apps/web/src/lib/access/embargo.ts
- [x] **Analyst-edited brief embargo** — paying subscribers receive the daily brief 4h before public posting — apps/web/src/lib/access/embargo.ts
- [x] **Report embargo** — paid subscribers get a flagship report 1 week before open publication — apps/web/src/lib/access/embargo.ts

## Ethics constraints
- [x] **Safety-critical info NEVER embargoed** — sirens, evacuation, casualty risks must be free + instant always — apps/web/src/lib/access/embargo.ts
- [x] Embargo policy published transparently on Trust Center → [../pages/TODO_trust_center.md](../pages/TODO_trust_center.md) — apps/web/src/lib/access/embargo.ts
- [x] Audit log of embargo decisions — apps/web/src/lib/access/embargo.ts

## Mechanics
- [x] Embargo flag on every event/report; respected at API + UI level — apps/web/src/lib/access/embargo.ts
- [x] Separate feature flag from `min_tier` — embargo is a freshness modifier — apps/web/src/lib/access/embargo.ts
- [x] Telemetry to detect leakage from paying tiers — apps/web/src/lib/access/embargo.ts

## Linked files
- [TODO_analytics_gating.md](TODO_analytics_gating.md) (freshness axis)
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)

### Примітки
Embargo на critical-safety-data = повна repuation-destruction. Чітко перерахувати винятки.
