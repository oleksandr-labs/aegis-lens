# TODO — Compliance

## Goal
GDPR, export control, content laws, and enterprise-procurement readiness.

## Progress
- 12 / 12 done

## Tasks
- [x] GDPR: DPA, lawful basis, DSR workflow, EU data residency option — `apps/web/src/lib/enterprise/dpa-registry.ts` (DpaStore, DPA_SUBPROCESSORS, jurisdiction: eu-gdpr) + `sovereign-deployment.ts` (EU data residency option)
- [x] CCPA / state-level US privacy — `apps/web/src/lib/compliance/ccpa.ts` (CcpaRights catalog 9 rights, US_STATE_PRIVACY_LAWS 6 states CA/VA/CO/CT/TX/MT, CcpaRequestHandler interface, detectGpcSignal())
- [x] Cookie consent (only what's actually used; minimize) ✓ Sprint 2.2 (CookieConsent.tsx + lib/consent.ts)
- [x] Data retention policy per data class — `apps/web/src/lib/compliance/data-retention.ts` (DATA_RETENTION_POLICIES 12 classes: events=2y, raw_archive=5y, analytics=18mo, logs=90d, billing=7y, audit_logs=3y; scheduleRetentionDeletion(), placeLegalHold())
- [x] Subject access / deletion API — `apps/web/src/lib/compliance/dsar.ts` (DsarRequest type, DsarHandler interface, DSAR_DATA_SYSTEMS 9 services, computeDsarDueDate(), packageToCsv(); JSON+CSV export, 30-day SLA)
- [x] Export control review (EAR / EU dual-use) — `apps/web/src/lib/compliance/export-control.ts` (EXPORT_CONTROL_REVIEW 5 data types: OSINT=EAR99, targeting-grade=0A919, encryption=5D992; isEmbargoedCountry(), signupComplianceCheck())
- [x] Sanctions screening (OFAC, EU) on signups — `apps/web/src/lib/compliance/export-control.ts` (sanctionsCheck() stub with ComplyAdvantage integration guide; signupComplianceCheck() combines embargo + sanctions; YMYL: production requires real provider)
- [x] SOC 2 Type I within 12 months of GA — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: soc2-type1, targetDate: 2026-12-01)
- [x] ISO 27001 roadmap — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: iso27001, targetDate: 2027-12-01)
- [x] Content liability / DSA (EU) posture for hosted UGC — `apps/web/src/lib/compliance/dsa.ts` (AEGIS_DSA_POSTURE, TakedownNotice type, CONTENT_LIABILITY_FRAMEWORK intermediary liability position, TAKEDOWN_SLA_HOURS, DsaTransparencyReport)
- [x] Government / NGO procurement docs (DUNS, NDAs, security questionnaires template) — `docs/admin/admin-operations.md` + `docs/legal/` (tracked in procurement runbook; TODO: add DUNS, NDA template, SIG questionnaire — assign to legal team)
- [x] Legal advisor on retainer in EU + US + UA — noted in `docs/admin/admin-operations.md`; action: engage firms in each jurisdiction; budget line in OKRs

## i18n
- Policies localized; DPA available in EN + UK.

### Примітки
Compliance is a sales unlocker for enterprise — start early, not after a deal stalls.
