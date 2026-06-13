# TODO — Localization Workflow

## Goal
Industrial-grade localization pipeline: translators + reviewers + glossary + CI gates.

## Progress
- 8 / 13 done

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
- [x] Pluralization tests (CLDR) — `packages/i18n-tools/src/pluralization.ts`: `checkPluralization()` + `checkAllLocalesPluralization()` + `formatPluralizationResults()`; `CLDR_PLURAL_FORMS` for en/de/pt/gu/pa/bn/ur (2 forms), ro (3), uk/pl (4), cy (6), ar (6); `getCldrPluralCategory()` for unit tests; CI exits 1 on missing required forms
- [x] Native-reviewer sign-off for marketing copy — `packages/i18n-tools/src/rollout-policy.ts`: `LocaleRolloutPolicy.requiresNativeReview` + `nativeReviewApproved`; `evaluateLocaleRollout()` blocks release when review pending

### Operations
- [x] Per-locale rollout policy (no half-translated locales in production) — `packages/i18n-tools/src/rollout-policy.ts`: `evaluateLocaleRollout()` aggregates completeness + keyCheck + pluralization + lengthOverflow + nativeReview + hardBlock gates; `DEFAULT_LOCALE_ROLLOUT_POLICIES` (uk/pl/cy/ro/pt: 95%, pa/gu/bn/ur/ar: hard-blocked pending native review); `formatRolloutReport()` for CI output
- [x] Fallback chain (uk → en) explicit — `packages/i18n-tools/src/rollout-policy.ts`: `LOCALE_FALLBACK_CHAIN` record (uk→en, pl→en, cy→en, ro→en, pt→en, ar→en etc.); `resolveWithFallback()` walks the chain and returns the first locale that has the key
- [ ] Per-locale support team or vendor

## i18n
- This file IS the i18n ops manual; pairs with [../i18n/TODO_i18n.md](../i18n/TODO_i18n.md).

### Примітки
Machine translation may seed; human review must close. Especially in OSINT terminology.
