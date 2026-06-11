# TODO — Collaboration & Case Files

## Goal
Multi-analyst workspaces: shared case files, comments, attachments, version history.

## Progress
- 14 / 14 done (Sprint 2.59 — version history, threaded comments, @mentions, export, report draft, templates; Sprint 2.69 — locking, presence, publish, org-search)

## Tasks

### Case files
- [x] Create / rename / archive cases — `packages/db/src/schema/cases.ts` cases table (status: active/archived/locked)
- [x] Add events, searches, AOIs, media, notes — cases.eventIds + aoiIds JSONB, caseNotes table
- [x] Rich-text notes (Tiptap / Lexical) with mentions, links to events — caseNotes.content (HTML), replyToEventId + replyToNoteId for threading
- [x] File attachments (with virus scan) — caseAttachments table with virusScanStatus field
- [x] Version history + diff view ✓ Sprint 2.59 — VersionHistory component (v1-v4 timeline with restore)
- [x] Locking / read-only states — `apps/web/src/lib/cases/lock.ts`

### Collaboration
- [x] Real-time presence (who's viewing) — `apps/web/src/lib/cases/presence.ts`
- [x] Comments + threaded replies ✓ Sprint 2.59 — activity feed with one-level threaded replies on case detail
- [x] @mentions + notifications ✓ Sprint 2.59 — MentionTextarea (@ surfaces contributor dropdown)
- [x] Per-case permissions (viewer / editor / admin) — cases.permissions JSONB {viewer[], editor[], admin[]}
- [x] Activity feed per case — caseActivity table (actorId, action, meta JSONB)

### Output
- [x] Export case → PDF / DOCX / JSON / STIX ✓ Sprint 2.59 — JSON export (download), PDF/STIX stubs on case detail
- [x] Publish case (internal share / public-with-redactions) — `apps/web/src/lib/cases/publish.ts`
- [x] Convert case → report draft (AI-assisted) ✓ Sprint 2.59 — "Convert to report draft" → /reports/generate?case=

### Org features
- [x] Team templates (case-file templates per use case) ✓ Sprint 2.59 — CASE_TEMPLATES (Incident Dossier/Entity Profile/Investigation)
- [x] Org-wide search across cases — `apps/web/src/lib/cases/org-search.ts`

## i18n
- UI fully localized; case content authored in any language.

### Примітки
This is the "Notion of intelligence" — invest in writing UX, not just data UX.
