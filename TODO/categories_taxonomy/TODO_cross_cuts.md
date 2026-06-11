# TODO — Cross-Cut Combinations (Programmatic SEO Multipliers)

## Goal
Combine 2–3 dimensions per page → multiply landing pages safely (with threshold gates).

## Multipliers
- [x] category × region (`/topics/<class>/in/<country>`) ✓ Sprint 2.16 — only emitted where ≥1 event qualifies
- [ ] category × city (`/drones/kharkiv`) — deferred; would need per-city event counts at finer resolution
- [x] category × industry — covered via `/x-for/<industry>` (cybersecurity/ai/osint/intelligence/monitoring × industry) ✓ Sprint 2.10
- [x] category × year (`/topics/<class>/year/<year>`) ✓ Sprint 2.16
- [x] industry × region — covered via `/companies/region/<region>` ✓ Sprint 2.11
- [x] industry × city (`/industries/<industry>/<city>`) ✓ Sprint 2.12
- [x] persona × task (`/use-cases/<vertical>/<task>`) ✓ Sprint 2.11
- [x] persona × task × region (3D) (`/use-cases/<vertical>/<task>/in/<country>`) ✓ Sprint 2.17
- [x] tool × category — covered via `/top-tools-for/<industry>` ✓ Sprint 2.9 and `/best-tools-for/<audience>` ✓ Sprint 2.10
- [x] tool × industry — covered by the same `/top-tools-for/<industry>` ✓ Sprint 2.9
- [x] equipment × operator (`/equipment/<slug>/operated-by/<operator>`) ✓ Sprint 2.17 (operator slug derived from EquipmentSeed.origin via `primaryOperator()`)
- [x] source × region (`/sources/<slug>/in/<country>`) ✓ Sprint 2.17 (uses PUBLIC_SOURCES.country, only emits for sources whose country has a region brief)
- [x] threat × region (`/threats/<slug>/in/<country>`) ✓ Sprint 2.16

## Gates
- [x] Min data threshold per page ✓ Sprint 2.16 (every cross-cut emits ONLY where ≥1 event/threat qualifies; sitemap mirrors the same filter)
- [x] No tag-stuffed dupes ✓ Sprint 2.16 (each URL is canonical for one specific intersection; no ?param variants)
- [x] Canonical strategy per cut ✓ Sprint 2.16 (each page exposes a single canonical pathFor in buildMetadata; hreflang covers locale variants only)

### Примітки
Cross-cuts × locales = millions of pages. Guard rigorously.
