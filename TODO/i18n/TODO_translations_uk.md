# TODO — Ukrainian (UK) Translations

## Goal
Full Ukrainian parity with EN — scoped to Phase 1.5 (right after EN MVP).

## Progress
- 2 / 9 done (Sprint 0 — uk scaffold + common.json translated)

## Tasks
- [x] Scaffold `i18n/locales/uk/` mirroring EN namespaces ✓ Sprint 0
- [x] Translate `common.json` ✓ Sprint 0
- [ ] Translate `home.json`
- [ ] Translate `map.json`
- [ ] Translate `dashboard.json`
- [ ] Translate `auth.json`
- [ ] Translate `pricing.json`
- [ ] Translate `errors.json`
- [ ] Translate `email.json`

### Glossary
- [ ] Build domain glossary (UA mil/OSINT terminology) — single canonical translation per term
- [ ] Review with native Ukrainian intel/journalism advisor

### QA
- [ ] Long-string layout audit (UK > EN length)
- [ ] Pluralization (UK has 3 forms)
- [ ] Cyrillic font rendering check (Inter / Geist cover UK)

## i18n
- Until copy lands, fall back to EN automatically — never show raw keys.

### Примітки
Don't auto-translate UI strings with MT — analysts will spot it instantly. Hire a native reviewer.
