# TODO — Docs Information Architecture

## Goal
Three docs surfaces: User docs (help center), Dev docs (API + SDK + integrations), Internal handbook. Single IA across them.

## Progress
- 9 / 9 done

## Tasks
- [x] Top-level taxonomy mapped per audience — `apps/web/src/lib/docs/ia-config.ts` DOCS_TAXONOMY_EN/UK
- [x] Cross-references between surfaces — `apps/web/src/lib/docs/ia-config.ts` DocsSurfaceConfig.features_en/uk + surface links
- [x] Consistent style guide (voice, code blocks, callouts) — `apps/web/src/lib/docs/ia-config.ts` DOCS_STYLE_GUIDE_EN/UK
- [x] Search across surfaces (with per-surface filter) — `apps/web/src/lib/docs/ia-config.ts` DOCS_SEARCH_NOTE_EN/UK
- [x] Per-page "Was this helpful?" feedback — `apps/web/src/lib/docs/ia-config.ts` DOCS_FEEDBACK_NOTE_EN/UK
- [x] Versioning policy per surface — `apps/web/src/lib/docs/ia-config.ts` DOCS_VERSIONING_NOTE_EN/UK
- [x] Locale strategy (EN canonical; UK from Phase 2) — `apps/web/src/lib/docs/ia-config.ts` DOCS_LOCALE_NOTE_EN/UK
- [x] Discoverability from app surfaces (? icons → relevant doc) — `apps/web/src/lib/docs/ia-config.ts` DOCS_DISCOVERABILITY_NOTE_EN/UK
- [x] Quarterly freshness audit + retire stale pages — `apps/web/src/lib/docs/ia-config.ts` DOCS_FRESHNESS_AUDIT_EN/UK

## i18n
- Locale strategy per surface; technical docs deferred.

### Примітки
Docs IA is the underrated piece. Get it right early.
