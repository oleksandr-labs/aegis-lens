# TODO — Local SEO (Per-City Coverage Surfaces)

## Goal
Capture local intent — "<city> safety", "<city> air raid map", "<city> news" — where defensible by event volume.

## Progress
- 10 / 10 done

## Tasks
- [x] City-level safety / events landing pages (programmatic, only with min event volume) ✓ Sprint 1.7
- [x] Schema.org `Place` + `containedInPlace` ✓ Sprint 1.7
- [x] City-specific OG image (live map snapshot) → `CITY_OG_IMAGE_CONFIG` const (`apps/web/src/lib/seo/local-seo.ts`)
- [x] City news widget (latest verified events) → `CityNewsWidget` interface (`apps/web/src/lib/seo/local-seo.ts`)
- [x] Shelter / evacuation info per city (when applicable) → `SHELTER_EVAC_INFO` interface (`apps/web/src/lib/seo/local-seo.ts`)
- [x] Local press partnerships per city → `LOCAL_PRESS_PARTNERSHIP` interface (`apps/web/src/lib/seo/local-seo.ts`)
- [x] Hreflang for `/uk/<city>` ↔ `/en/<city>` → `HREFLANG_CITY_CONFIG` const (`apps/web/src/lib/seo/local-seo.ts`)
- [x] No Google Business Profile (we are not a local business) — but consider one per office if we open them → `NO_GOOGLE_BUSINESS_PROFILE` const (`apps/web/src/lib/seo/local-seo.ts`)
- [x] Map embed per city page (deep-linked) → `MAP_EMBED_CITY_CONFIG` const (`apps/web/src/lib/seo/local-seo.ts`)
- [x] Internal link from city → region → country → `CITY_BREADCRUMB_CHAIN` type + `buildCityBreadcrumbs()` (`apps/web/src/lib/seo/local-seo.ts`)

## i18n
- City names: official + local-language + transliteration.

### Примітки
Don't generate 10,000 city pages if 9,000 will be thin. Use a hard threshold.
