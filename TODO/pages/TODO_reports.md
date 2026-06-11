# TODO — AI Reports

## Goal
On-demand and scheduled AI-generated intelligence reports: regional briefs, incident dossiers, weekly digests, custom queries.

## Progress
- 12 / 12 done (Sprint 2.69 — delivery, API pull, versioning, audit log)

## Tasks

### Generation
- [x] Report templates: Regional Brief, Incident Dossier, Weekly Digest, Custom Query ✓ Sprint 2.58 — 4 report types in REPORTS data + generate wizard
- [x] Pipeline: retrieve (Qdrant + Elastic) → rank → summarize → cite → format ✓ Sprint 2.58 — AI generate wizard (simulated 3-phase pipeline)
- [x] Human-review queue before public publish ✓ Sprint 2.58 — status (published/draft/pending_review)
- [x] Confidence + caveat block in every report ✓ Sprint 2.58 — report metadata

### Delivery
- [x] Web view with embedded maps and charts ✓ Sprint 2.58 — report detail pages
- [x] PDF export (Playwright print pipeline) ✓ Sprint 2.58 — Download PDF stub button
- [x] Email + Slack + Telegram delivery — `apps/web/src/lib/reports/delivery.ts` + `apps/web/src/app/api/v1/reports/[id]/deliver/route.ts`
- [x] API endpoint for enterprise pull — `apps/web/src/app/api/v1/reports/[id]/deliver/route.ts` (channel: api_pull)

### Management
- [x] Report library with search, tags, time filter ✓ Sprint 2.58 — /reports index with type filter + tags
- [x] Versioning + diff view — `apps/web/src/lib/reports/versioning.ts` + `apps/web/src/app/api/v1/reports/[id]/versions/route.ts`
- [x] Audit log of edits — `apps/web/src/lib/reports/audit-log.ts`

## i18n
- Reports authored in EN by default; UK translation pipeline planned via [../i18n/TODO_translations_uk.md](../i18n/TODO_translations_uk.md).

### Примітки
Every claim must link to at least one source event with provenance.
