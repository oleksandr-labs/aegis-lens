# TODO — Localization Workflow

## Goal
Industrial-grade localization pipeline: translators + reviewers + glossary + CI gates.

## Progress
- 3 / 13 done

## Tasks

### TMS
- [ ] Translation management system (Crowdin / Lokalise / Localazy / Tolgee)
- [ ] Source of truth: `i18n/locales/en/*.json`
- [ ] Auto-sync source ↔ TMS via CI
- [ ] Pull-request workflow on translation updates

### Glossary & memory
- [ ] Per-domain glossary (mil / OSINT / civic) — same as [../pages/TODO_glossary.md](../pages/TODO_glossary.md)
- [ ] Translation memory across all locales
- [ ] Brand voice doc per locale

### QA
- [x] Missing-key detection in CI — `packages/i18n-tools/src/missing-key-check.ts`; checkMissingKeys() + checkAllLocales() + formatCheckResults(); reports missing/orphan keys + untranslated strings
- [x] Placeholder integrity checks (`{count}`, `<a>...</a>`) — extractPlaceholders() in missing-key-check.ts; reports missing/extra placeholders per key with diff
- [x] Length overflow detection (UK > EN 30%) — `packages/i18n-tools/src/length-check.ts` checkLengthOverflows(); configurable warn/error thresholds
- [ ] Pluralization tests (CLDR)
- [ ] Native-reviewer sign-off for marketing copy

### Operations
- [ ] Per-locale rollout policy (no half-translated locales in production)
- [ ] Fallback chain (uk → en) explicit
- [ ] Per-locale support team or vendor

## i18n
- This file IS the i18n ops manual; pairs with [../i18n/TODO_i18n.md](../i18n/TODO_i18n.md).

### Примітки
Machine translation may seed; human review must close. Especially in OSINT terminology.
