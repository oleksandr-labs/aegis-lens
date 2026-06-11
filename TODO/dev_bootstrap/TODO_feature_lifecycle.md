# TODO — Feature Lifecycle (Alpha / Beta / GA / Deprecated)

## Goal
Every feature has a known state. Customers see badges. Engineering knows expectations.

## Progress
- 10 / 10 done

## States
- [x] Alpha — internal only, no SLA, may break → [dev-standards.md §7](../../docs/engineering/dev-standards.md)
- [x] Closed Beta — invited customers, no SLA, feedback collected → §7
- [x] Open Beta — public, basic SLA, "beta" badge → §7
- [x] GA — full SLA, in roadmap, regular maintenance → §7
- [x] Deprecated — sunset announced, replacement available → §7
- [x] Sunset — removed → §7

## Tasks
- [x] Per-feature state badge in UI + docs → §7 (badge column in states table)
- [x] Per-state SLA expectations → §7
- [x] Per-state CHANGELOG annotation → §7 (`[beta]`, `[deprecated]`, `[removed]`)
- [x] Per-state customer-comms requirement → §7
- [x] Deprecation: 6-month minimum (12 for enterprise / API) → §7
- [x] Per-feature lifecycle tracked in feature registry → §7 (Linear feature-flags project)
- [x] Default-on vs feature-flagged per state → §7 (feature flags > long-lived branches)
- [x] Per-state experiment eligibility → §7

## i18n
- State badges localized.

### Done notes (2026-05-30)
→ [docs/engineering/dev-standards.md §7](../../docs/engineering/dev-standards.md).
States table with SLA, badge, CHANGELOG annotation per state. Transition rules with approval gates.
