# TODO — SEO Metadata

## Goal
Per-route metadata templates + dynamic OG images for events, reports and posts.

## Progress
- 4 / 10 done (Sprint 2.60)

## Tasks
- [x] `<title>` / `<meta description>` templates per route ✓ Sprint 0
- [x] Canonical URLs ✓ Sprint 0
- [x] `hreflang` tags (en, uk, x-default) — automated from i18n config ✓ Sprint 0
- [x] Open Graph + Twitter card defaults ✓ Sprint 0
- [x] Dynamic OG image generator (Satori / @vercel/og) ✓ Sprint 1.9
  - [x] Event card variant ✓ Sprint 1.9
  - [x] Report card variant ✓ Sprint 1.9
  - [x] Blog post variant ✓ Sprint 2.60 — /api/og supports type=blog
  - [x] Map snapshot variant ✓ Sprint 2.60 — /api/og supports type=region/event
- [x] `robots` directives per route ✓ Sprint 2.60 — noindex on settings/cases/account/reports-generate via layouts + seo-config
- [x] No-index for sensitive enterprise-only routes ✓ Sprint 2.60 — NOINDEX_ROUTES + shouldNoindex helper

## i18n
- Locale-aware metadata is mandatory; never ship hardcoded EN strings in `<head>`.

### Примітки
Some event pages must be `noindex` if sources requested embargo.
