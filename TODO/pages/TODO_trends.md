# TODO — Trends Hub

## Goal
`/trends` index of trending topics + per-trend pages (programmatic).

## Progress
- 6 / 8 done

## Tasks
- [x] `/trends` index with timeframe filter ✓ Sprint 2.51 — imports `listTrends()` from trends-seed; URL-driven `?horizon=` filter chips; editorial-featured strip; RSS badge; CollectionPage JSON-LD with per-trend page URLs; hreflang via `generateStaticParams`
- [ ] Auto-detected trending topics (via anomaly + social activity layer)
- [x] Editorial-featured trends (curated) ✓ Sprint 2.51 — `featured?: boolean` on `Trend` type; `drone-swarm-activity-q2-2026` and `substation-targeting-frequency` marked featured; accent-bordered 2-col featured strip on index when no filter active
- [x] Per-trend page → see [../programmatic/TODO_template_trend.md](../programmatic/TODO_template_trend.md) ✓ (existed — rich detail page with sparkline, sections, FAQ, analyst commentary, related threats/investigations)
- [x] Cross-link to relevant region / topic / industry pages ✓ (trend detail links to topic, threats, investigations)
- [x] Schema.org `CollectionPage` ✓ Sprint 2.51 — updated to use per-trend page URLs instead of anchor links
- [x] RSS / Atom feed (newsroom-friendly) ✓ Sprint 2.51 — `/trends/feed.xml` force-static route handler; 20 most-recent trends sorted by `updatedAt`; atom:link self-ref; channel image; RSS badge on index; feed in `buildMetadata feeds`; sitemap entry at 0.4
- [x] hreflang per locale ✓ Sprint 2.51 — `generateStaticParams` covers all `ACTIVE_LOCALES`; `buildMetadata pathFor` handles alternate links

## i18n
- Per-locale; trend dynamics may differ by audience.

### Примітки
Trends earn press citations because journalists need angles. Make them findable.
