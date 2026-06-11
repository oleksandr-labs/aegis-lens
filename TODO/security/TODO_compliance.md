# TODO — Compliance

## Goal
GDPR, export control, content laws, and enterprise-procurement readiness.

## Progress
- 5 / 12 done

## Tasks
- [x] GDPR: DPA, lawful basis, DSR workflow, EU data residency option — `apps/web/src/lib/enterprise/dpa-registry.ts` (DpaStore, DPA_SUBPROCESSORS, jurisdiction: eu-gdpr) + `sovereign-deployment.ts` (EU data residency option)
- [ ] CCPA / state-level US privacy
- [x] Cookie consent (only what's actually used; minimize) ✓ Sprint 2.2 (CookieConsent.tsx + lib/consent.ts)
- [ ] Data retention policy per data class
- [ ] Subject access / deletion API
- [ ] Export control review (EAR / EU dual-use) — especially for satellite + targeting-grade data
- [ ] Sanctions screening (OFAC, EU) on signups
- [x] SOC 2 Type I within 12 months of GA — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: soc2-type1, targetDate: 2026-12-01)
- [x] ISO 27001 roadmap — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: iso27001, targetDate: 2027-12-01)
- [ ] Content liability / DSA (EU) posture for hosted UGC
- [ ] Government / NGO procurement docs (DUNS, NDAs, security questionnaires template)
- [ ] Legal advisor on retainer in EU + US + UA

## i18n
- Policies localized; DPA available in EN + UK.

### Примітки
Compliance is a sales unlocker for enterprise — start early, not after a deal stalls.
