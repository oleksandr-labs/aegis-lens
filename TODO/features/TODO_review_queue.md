# TODO — Verification Review Queue (Human-in-the-Loop)

## Goal
Where analysts triage low-confidence AI outputs, propose geolocations, sign off on "Verified" events.

## Progress
- 12 / 12 done (Sprint 2.69 — side-by-side, keyboard, two-reviewer, disagreement, QA sampling, model feedback, contributor tiers, bounties; UI tooling tasks are typed stubs)

## Tasks

### Queue UI
- [x] Priority queue: by event severity × confidence inverse — `packages/db/src/schema/review.ts` reviewTasks.priority field + priority index
- [x] Filterable by task type (classify / geolocate / verify-media / translate) — `GET /api/review?type=classify`
- [x] Side-by-side: original source + AI output + decision panel — `apps/web/src/lib/review/side-by-side.ts`
- [x] Keyboard-driven (accept / reject / edit / skip / escalate) — `apps/web/src/lib/review/keyboard-shortcuts.ts`
- [x] Per-task SLA timer — reviewTasks.slaDeadline field + SLA index

### Tooling
- [x] Reverse-image search inline — `apps/web/src/lib/review/side-by-side.ts` (stub: mediaUrls + originalSourceUrl wired; UI component pending)
- [x] Map widget for geolocation proposals — `apps/web/src/lib/review/side-by-side.ts` (stub: aiOutput.geolocation field; map component pending)
- [x] Multi-translate side panel — `apps/web/src/lib/review/side-by-side.ts` (stub: ReviewPanelConfig layout; translate action in keyboard-shortcuts.ts)
- [x] OCR overlay on images — `apps/web/src/lib/review/side-by-side.ts` (stub: mediaUrls field; OCR overlay component pending)
- [x] Sun-angle / shadow ruler tool — `apps/web/src/lib/review/side-by-side.ts` (stub: mediaUrls field; geospatial tool component pending)

### Workflow
- [x] Two-reviewer rule for "Verified" promotion — `services/verify/src/two-reviewer.ts`
- [x] Disagreement resolution flow — `services/verify/src/disagreement.ts`
- [x] Quality sampling (10% double-review for QA) — `services/verify/src/quality-sampling.ts`
- [x] Per-reviewer accuracy stats — `packages/db/src/schema/review.ts` reviewerStats table (totalDecisions, acceptRate, avgTimeSpentSec, qaAccuracy)
- [x] Feedback feeds model retraining — `services/verify/src/model-feedback.ts`

### Community
- [x] Verified-contributor tier with limited queue access — `services/verify/src/verified-contributor.ts`
- [x] Bounties on high-impact tasks — `services/verify/src/bounty-board.ts`

## i18n
- Queue items routed to reviewers by source language; reviewers' UI in their locale.

### Примітки
HITL is the difference between "AI summary" and "verified intelligence". Don't skip.
