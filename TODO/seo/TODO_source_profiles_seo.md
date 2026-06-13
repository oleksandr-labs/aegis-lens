# TODO — Source Profile SEO

## Goal
Per-source public profile pages: a unique SEO surface + a transparency artifact.

## Progress
- 9 / 10 done

## Tasks
- [x] `/sources/<slug>` per public source we monitor ✓ Sprint 1.8
- [x] Content: description, type, region, language, freshness, reliability score, total events contributed, last seen → `SourceProfileContent` interface (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Sample events from this source (linked) → `SAMPLE_EVENTS_SCHEMA` interface (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Methodology snippet ("How we use this source") → `methodology` field in `SourceProfileContent` (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Comparable sources block (internal links) → `COMPARABLE_SOURCES_BLOCK` interface (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Schema.org `Organization` (when org) or `WebSite` → `buildSourceProfileJsonLd()` (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Robots policy per source profile (default index; gated for sensitive sources) → `SOURCE_ROBOTS_POLICY` + `effectiveRobotsPolicy()` (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Per-locale variants → `PER_LOCALE_SOURCE_VARIANT` interface (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] User-facing "report this source" link → `REPORT_SOURCE_LINK` const (`apps/web/src/lib/seo/source-profiles.ts`)
- [x] Public methodology link → `PUBLIC_METHODOLOGY_LINK` const (`apps/web/src/lib/seo/source-profiles.ts`)

## i18n
- Source descriptions auto-translated + human-reviewed in tier-1 locales.

### Примітки
Branded queries like "<source-name> reliability" rank well — capture them.
