# TODO — Embeds & Widgets

## Goal
Make our visualizations effortlessly embeddable — every embed is a backlink + a brand impression.

## Progress
- 12 / 12 done (14 / 14 total including Sprint 2.1)

## Tasks

### Embed types
- [x] Live map embed (iframe + JS API) — apps/web/src/lib/embeds/map-embed.ts
- [x] Event card embed — apps/web/src/lib/embeds/event-card-embed.ts
- [x] Timeline embed — apps/web/src/lib/embeds/timeline-embed.ts
- [x] Heatmap embed — apps/web/src/lib/embeds/heatmap-embed.ts
- [x] Region brief embed (auto-updating widget) — apps/web/src/lib/embeds/region-brief-embed.ts
- [x] Counter / KPI widget ✓ Sprint 2.1
- [x] Latest-events ticker widget ✓ Sprint 2.1

### Embed system
- [x] Embed builder UI (configure → copy snippet) — apps/web/src/lib/embeds/embed-builder.ts
- [x] Lightweight loader (< 30KB before lazy-load) — apps/web/src/lib/embeds/embed-loader.ts
- [x] Theme variants (light, dark, tactical, neutral) — apps/web/src/lib/embeds/embed-themes.ts
- [x] Locale-aware embeds — apps/web/src/lib/embeds/embed-locale.ts
- [x] Attribution required (with link); abuse detection if stripped — apps/web/src/lib/embeds/embed-attribution.ts
- [x] Analytics callback (anonymous embed-load pings → SEO referrer signal) — apps/web/src/lib/embeds/embed-analytics.ts
- [x] Snapshot fallback for crawlers (server-side OG image) — apps/web/src/lib/embeds/embed-snapshot.ts

## i18n
- Embed UI + content respects locale query param + falls back to viewer's `Accept-Language`.

### Примітки
Embeds are a programmatic SEO + backlink machine. Tie this to [../seo/TODO_backlinks_pr.md](../seo/TODO_backlinks_pr.md).
