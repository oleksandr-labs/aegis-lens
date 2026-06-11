# TODO — URL Localization

## Goal
Locale-specific URLs that rank in each market and signal language clearly to search engines.

## Progress
- 3 / 12 done (Sprint 0 — locale prefix + hreflang)

## Tasks

### Strategy
- [x] Locale prefix at root: `/uk/...`, `/pl/...`, `/de/...`; EN default at `/` (or explicit `/en/` — decide + lock) ✓ Sprint 0 (EN at root, UK /uk/; pl/de scaffolded)
- [ ] Translated slugs per locale (not slug duplication)
  - `/en/companies/cybersecurity/london` ↔ `/de/unternehmen/cybersicherheit/london` ↔ `/uk/kompanii/kiberbezpeka/kyiv`
- [ ] Slug translation review by native reviewer (no MT-only)
- [ ] Slug-collision detection across locales (no two locales' slugs collide on the same canonical entity ID)

### Hreflang
- [x] Auto-emit `<link rel=alternate hreflang>` for every locale variant of every page ✓ Sprint 0 (buildMetadata helper)
- [x] `x-default` → EN canonical ✓ Sprint 0
- [ ] CI test: round-trip hreflang (every locale references every other)

### Migration
- [ ] When locale slug changes (improvement / glossary update) → 301 redirect old → new
- [ ] Backfill audit per locale

### Fallback
- [ ] Missing-locale page redirects to EN canonical with `noindex` for the visited locale
- [ ] User-side: locale switcher preserves current page's locale variant

### Geo-detection vs locale
- [ ] Never auto-redirect by IP for SEO pages (Googlebot ≠ user)
- [ ] Banner-suggest locale switch (user clicks; we don't force)

## i18n
- This file IS the URL-i18n contract.

### Примітки
Translated slugs > duplicated EN slugs. Worth the editorial cost.
