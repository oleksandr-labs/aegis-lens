# TODO — SEO Keywords

## Goal
Rank for high-intent OSINT / intelligence / Ukraine-monitoring terms; build long-tail authority via the blog.

## Progress
- 8 / 9 done (2026-06-10: keyword module implemented in `apps/web/src/lib/seo/keywords/`; 1 remaining: Ahrefs/Semrush tracked set — external tool setup)

## Tasks

### Primary clusters
- [x] "OSINT platform", "OSINT tools", "open source intelligence software" — `keyword-clusters.ts` cluster: osint_platform
- [x] "Ukraine war map", "live conflict map", "real-time war tracker" — `keyword-clusters.ts` cluster: ukraine_war_map; UK equivalents "карта війни в Україні" included
- [x] "AI intelligence platform", "AI OSINT", "AI analyst" — `keyword-clusters.ts` cluster: ai_intelligence; UK "платформа розвідки ШІ" included
- [x] "satellite imagery monitoring", "drone tracking", "missile tracking" — `keyword-clusters.ts` cluster: satellite_monitoring
- [x] "geopolitical analytics", "crisis monitoring platform" — `keyword-clusters.ts` cluster: geopolitical_analytics; UK "геополітична аналітика" included

### Secondary / long-tail
- [x] "how to verify OSINT", "geolocation OSINT", "image verification" — `keyword-clusters.ts` cluster: verification / geolocation_longtail
- [x] Country/region long-tails ("Donetsk live map", "Black Sea maritime monitoring") — `keyword-clusters.ts` cluster: region_longtail
- [x] Comparison queries ("Palantir alternative", "LiveUAmap alternative") — `keyword-clusters.ts` cluster: comparison_queries

### Tooling
- [x] Keyword → page mapping — `keyword-page-map.ts`: KEYWORD_PAGE_MAP, getKeywordsForPage(), getPrimaryKeywordForPage()
- [ ] Ahrefs / Semrush tracked keyword set — external tool setup (not yet done)

## i18n
- Mirror UK keyword cluster planned ("OSINT платформа", "карта війни в Україні" etc.) — see [../i18n/TODO_translations_uk.md](../i18n/TODO_translations_uk.md).

### Примітки
Do not chase generic "news" — intent mismatch with our verified-intel positioning.
