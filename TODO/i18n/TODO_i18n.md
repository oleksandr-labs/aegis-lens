# TODO — i18n Framework & Strategy

## Goal
Internationalization built in from day one. EN ships at launch; UK follows; framework supports unlimited locales without refactor.

## Progress
- 6 / 14 done (Sprint 0)

## Tasks

### Framework
- [x] In-house server-only translator (next-intl-shaped API) ✓ Sprint 0
- [x] Locale routing: `/` = EN default, `/uk` for Ukrainian ✓ Sprint 0
- [x] Server-side locale negotiation (`Accept-Language`, cookie hint) ✓ Sprint 0
- [x] Locale switcher in nav ✓ Sprint 0
- [x] `hreflang` auto-generation in metadata ✓ Sprint 0
- [ ] RTL readiness (logical CSS props)

### Content layers
- [x] UI strings → `apps/web/src/messages/<lc>/<namespace>.json` ✓ Sprint 0
- [ ] CMS content (blog, reports) → per-locale documents + fallback chain
- [ ] Data content (event summaries) → multilingual fields populated by NLP/translation pipeline
- [ ] Map labels → use `name:<lc>` with EN fallback

### Tooling
- [ ] Missing-key detection in CI (warn at dev only currently)
- [ ] String extraction script
- [ ] Pluralization rules (CLDR)
- [ ] Long-string layout audit (UK strings often 30–50% longer)

### Locales roadmap
| Locale | Status | Phase |
| --- | --- | --- |
| en | active, default | Phase 1 |
| uk | scaffolded, content pending | Phase 1.5 |
| ru | planned | Phase 2 |
| pl | planned | Phase 2 |
| de | planned | Phase 2 |
| ro | planned | Phase 3 |
| es | planned | Phase 3 |
| fr | planned | Phase 3 |

### Примітки
**Rule:** every user-facing string goes through `t('key')` from day one, even while only `en` exists. Hardcoded strings are a regression and must fail CI.
