# Sprint 2.72 — Content Architecture & Topical Authority (2026-06-13)

**Cluster:** URL/Slug infrastructure hardening + 10 Topical Hub specs + SEO trust signals.
**Tasks closed:** ~99 across 17 TODO files.
**Method:** 5 parallel package-scoped agents, additive-only, EN+UK, no shared-file edits, UTF-8 (mojibake gate = 0), brace-balance verified. No local typecheck (CI on GitHub Actions).

---

## Deliverables

### URLs & Slugs — 28 tasks → `packages/url-builder/src/`

**`slug-extensions.ts`** (new)
- `STOP_WORDS` set (EN+UK ~60 entries) + `removeStopWords(slug)` helper applied to all builders
- Entity slug builders: `threatSlug`, `trendSlug`, `unitSlug`, `personSlug`, `serviceSlug`, `guideSlug`, `investigationSlug`
- `collisionSlug(base, index)` — appends `-2`, `-3` (not random hash)

**`canonical.ts`** (new)
- `canonicalForPagination(base, page)` — page 1 = base, others = `base?page=N`
- `canonicalForFacet(base)` — returns base (facet variants → noindex by caller)
- `stripTrackingParams(url)` — strips utm_*, gclid, fbclid, msclkid, mc_eid, yclid
- `enforceNoTrailingSlash`, `enforceHttps`, `enforceNonWww` — deterministic URL normalizers
- `similarityThreshold = 0.85` — programmatic page dedup guard constant
- `BuildCanonicalCI` interface for CI fixtures

**`locale-url.ts`** (new)
- `TranslatedSlugSpec` interface (`entityId`, `locale`, `slug`, `reviewedBy`)
- `detectSlugCollision(slugMap)` — returns collision records
- `HreflangCiFixture` — round-trip hreflang CI test structure
- `missingLocaleRedirect(path, visitedLocale, canonicalLocale)` → `{ from, to, noindex: true }`
- `localeSwitcherPreservesPath = true`, `neverAutoRedirectByIp = true` — SEO policy flags
- `BannerSuggestLocale` interface

**`index.ts`** — 3 additive `export *` lines appended

Files updated: `TODO_url_strategy` (14/16), `TODO_slug_rules` (25/25 ✅), `TODO_url_localization` (10/12), `TODO_canonical_strategy` (11/12).

---

### Topical Hubs — 47 tasks → `apps/web/src/lib/hubs/` (new directory)

All 10 hub modules created. Each contains: pillar URLs, EN+UK narratives, typed data structures, feed configs, FAQ (10 Q&As: 3 open + 7 collapsed), FAQPage JSON-LD helper.

| File | Key exports | Tasks |
|---|---|---|
| `cybersecurity.ts` | `CYBERSECURITY_HUB_URLS`, `CybersecuritySubCategory`, `LINKED_TOOLS_CYBERSECURITY` (7), `CERT_UA_FEED_CONFIG`, `CYBERSECURITY_TREND_PAGES` (5), `cybersecurityFaqJsonLd()` | 5/5 ✅ |
| `disinformation.ts` | `DETECTION_METHODOLOGY` (7-step), `TRACKED_NARRATIVE_CLUSTERS` (6), `COUNTER_NARRATIVE_RESOURCES` (5), `disinformationFaqJsonLd()` | 5/5 ✅ |
| `drones.ts` | `DroneSubCategory` (6), `DRONE_EQUIPMENT_PAGES` (6 models), `DRONE_THREAT_TRENDS`, `COUNTER_UAV_ECOSYSTEM` (5), `CIVILIAN_SAFETY_GUIDANCE` (EN+UK) | 5/5 ✅ |
| `elections.ts` | `ElectionRecord` interface, `TRACKED_ELECTIONS` (6: UA/US/DE/PL/RO/FR), `ELECTION_EDITORIAL_POLICY` (5 principles + 5 prohibitions) | 5/5 ✅ |
| `energy-security.ts` | `GridAttackTimelineEntry`, `RegionOutageStats`, `UKRENERGO_FEED_CONFIG`, `CIVILIAN_ENERGY_SAFETY_GUIDANCE` (5 categories, EN+UK) | 5/5 ✅ |
| `humanitarian.ts` | `OCHA_RELIEF_WEB_FEED_CONFIG`, `TRACKED_HUMANITARIAN_CRISES` (4), `NGO_UN_PERSONA_SURFACES` (5), `HUMANITARIAN_EMBED_KIT` | 4/4 ✅ |
| `maritime.ts` | `AIS_SAR_DEMO_CONFIG` (6 MMSIs), `MARITIME_REGIONAL_FOCUSES` (4 regions), `MARITIME_VESSEL_TYPE_PAGES` (6 types), `SANCTIONS_CROSS_LINK` | 4/4 ✅ |
| `satellite.ts` | `SATELLITE_METHODOLOGY` (4-step), `SATELLITE_PROVIDER_PROFILES` (4: Sentinel/Planet/BlackSky/Capella), `SATELLITE_DEMO_GALLERY` (5 sites), `LINKED_TOOLS_SATELLITE` (5) | 5/5 ✅ |
| `sanctions.ts` | `SanctionsJurisdiction` (5), `JURISDICTIONS_STATUS`, `SanctionedEntity` interface, `COMPLIANCE_USE_CASES` (4), `SANCTIONS_UPDATES_FEED` | 5/5 ✅ |
| `cyber-warfare.ts` | `AptProfile` interface, `TRACKED_APTS` (5: Sandworm/APT28/Gamaredon/UAC-0056/InvisiMole), `CERT_UA_MISP_CONFIG`, `ATTRIBUTION_METHODOLOGY` (4 tiers) | 4/4 ✅ |

---

### SEO Trust Signals — 24 tasks → `apps/web/src/lib/seo/`

**`eeat.ts`** (new) — `TODO/seo/TODO_eeat_authors.md` → 12/12 ✅
- `BylineSchema` interface + `BylineReviewer` (roles: fact-checker/editor/senior-reviewer)
- `renderBylineJsonLd()` — Article JSON-LD fragment with author + dateModified
- `EEAT_TRUST_SIGNALS` (6 typed entries: about-methodology, ethics-policy, advisory-board, corrections-page, source-transparency, awards-press)
- `GuestExpert` interface + `GUEST_EXPERTS` seed list
- `METHODOLOGY_PEER_REVIEW_PROGRAM` const (quarterly, 3 external reviewers)
- `EEAT_ORG_SIGNALS` const — all org-level trust flags

**`source-profiles.ts`** (new) — `TODO/seo/TODO_source_profiles_seo.md` → 9/10
- `SourceProfileContent` interface (full content + SEO payload)
- `buildSourceProfileJsonLd()` — `Organization` or `WebSite` schema with AggregateRating
- `effectiveRobotsPolicy()` — gated noindex for sensitive sources
- `PER_LOCALE_SOURCE_VARIANT`, `COMPARABLE_SOURCES_BLOCK`, `SAMPLE_EVENTS_SCHEMA` interfaces
- `REPORT_SOURCE_LINK` (EN+UK), `PUBLIC_METHODOLOGY_LINK` consts

**`local-seo.ts`** (new) — `TODO/seo/TODO_local_seo.md` → 10/10 ✅
- `MIN_EVENT_THRESHOLD = 100` — thin-page guard
- `CITY_OG_IMAGE_CONFIG` — live-map-snapshot strategy
- `CityNewsWidget`, `SHELTER_EVAC_INFO`, `LOCAL_PRESS_PARTNERSHIP` interfaces
- `HREFLANG_CITY_CONFIG` — `/uk/<city>` ↔ `/en/<city>`
- `MAP_EMBED_CITY_CONFIG` — deep-link + auto-open layers
- `CITY_BREADCRUMB_CHAIN` type + `buildCityBreadcrumbs()` → BreadcrumbList JSON-LD

---

## File count

| Package | New files |
|---|---|
| `packages/url-builder/src/` | +3 |
| `apps/web/src/lib/hubs/` | +10 (new dir) |
| `apps/web/src/lib/seo/` | +3 |
| **Total** | **16 new files** |

---

## Verification
- Mojibake gate: 0 hits across all new files.
- Additive only: no existing code deleted or modified (only `index.ts` had 3 export lines appended).
- Shared files untouched: `layers/src/registry.ts`, `apps/web/src/lib/map-style.ts` — not touched.
- Per [[deploy_workflow]] + [[feedback_autonomy]]: work done locally + verified; NOT committed/deployed (awaiting approval).
