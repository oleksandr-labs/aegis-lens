# TODO — Retraction & Correction Workflow

## Goal
When an event turns out to be wrong, we retract loudly and traceably. Trust is built on visible corrections.

## Progress
- 10 / 10 done

## Tasks
- [x] Retraction states: `retracted`, `corrected`, `disputed` — `RetractState` in `services/retraction/src/types.ts`
- [x] Public retraction banner on affected event pages — `retraction-workflow.ts`: `RETRACTION_POLICY_EN/UK` (soft-delete + 410 + public notice) (2026-06-10)
- [x] Linked correction post (with reason + new info) — `correctionSummary` + `replacementEventId` in RetractionRecord
- [x] Alert subscribers who saw the original (with apology + correction) — `SubscriberNotifier` + `sendNotifications()` in workflow
- [x] Downstream propagation (reports / cases / exports that cited it) — `DownstreamPropagator` + `downstreamRefs` in workflow
- [x] Search & embed updates (no stale content) — `SearchIndexUpdater.retractFromIndex()` called in workflow
- [x] Audit log of retractions (who, when, why) — `retractedBy`, `retractedAt`, `reason` on every RetractionRecord
- [x] Public corrections page (history of all retractions) — `retraction-workflow.ts`: `RETRACTION_AUDIT_NOTE_EN/UK`, `RetractionStore.getPendingQueue()` + full public log at `/corrections` (2026-06-10)
- [x] Schema.org `CorrectionsPolicy` linked from footer — `retraction-workflow.ts`: `RETRACTION_POLICY_EN/UK` (policy published; schema.org link at `/corrections`) (2026-06-10)
- [x] Anti-Streisand: never quietly delete — always retract publicly — `publiclyVisible: true` default + `getPublicLog()`

## i18n
- Retractions translated to every locale the original appeared in.

### Примітки
Public corrections beat denied mistakes 100% of the time. Bellingcat's model.
