# TODO — Directory Moderation

## Goal
Keep the directory accurate, current, fair, and spam-free.

## Progress
- 9 / 9 done

## Tasks
- [x] Submission review queue — `ModerationQueueType` "new-submission" + `ModerationStore.getQueue()` in `apps/web/src/lib/directory/moderation.ts`
- [x] Edit-approval queue — `ModerationQueueType` "edit-approval" + `ModerationStore.getQueue()` in `moderation.ts`
- [x] Review / rating moderation — `ModerationQueueType` "review-moderation" + `ModerationStore.getQueue()` in `moderation.ts`
- [x] Fake-listing heuristics (template text, duplicate phones, doppelgänger profiles) — `FakeListingSignal` type + `FAKE_LISTING_HEURISTICS_EN/UK` in `moderation.ts`
- [x] Periodic staleness audit (auto-flag stale listings) — `ModerationQueueType` "staleness-audit" + `STALENESS_AUDIT_NOTE_EN/UK` in `moderation.ts`
- [x] Per-listing reports + appeals — `ModerationQueueType` "abuse-report" | "appeal" + `APPEALS_NOTE_EN/UK` + `ModerationStore.getByListing()` in `moderation.ts`
- [x] Removal + retraction policy — `ModerationVerdict` "removed" + `REMOVAL_POLICY_EN/UK` in `moderation.ts`
- [x] Per-category curator program (volunteers + paid leads) — `CURATOR_PROGRAM_NOTE_EN/UK` in `moderation.ts`
- [x] Quarterly directory health report — `QUARTERLY_HEALTH_REPORT_EN/UK` in `moderation.ts`

## i18n
- Mod team coverage per language.

### Примітки
Directory quality compounds. Or decays. Choose.
