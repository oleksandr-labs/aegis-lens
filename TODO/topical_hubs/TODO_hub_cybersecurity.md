# Hub — Cybersecurity

## URLs
- `/topics/cyber` live as generic cyber hub ✓ Sprint 1.3
- `/cybersecurity` · `/cybersecurity/<sub>` (Sprint 2 — dedicated pillar with sub-categorization)

## Content
- [x] Listing of cyber events (Sprint 1.3 via /topics/cyber)
- [x] Deep-link to live map filtered by class=cyber ✓ Sprint 1.3
- [x] Pillar overview narrative — apps/web/src/lib/hubs/cybersecurity.ts (`cybersecurityPillarNarrative`)
- [x] Linked tools / companies directory — apps/web/src/lib/hubs/cybersecurity.ts (`LINKED_TOOLS_CYBERSECURITY`, 7 tools)
- [x] CERT-UA + global feeds — apps/web/src/lib/hubs/cybersecurity.ts (`CERT_UA_FEED_CONFIG`)
- [x] Per-sub trend pages — apps/web/src/lib/hubs/cybersecurity.ts (`CYBERSECURITY_TREND_PAGES`, 5 sub-pages; `CybersecurityTrendPage` interface; `CybersecuritySubCategory` type)
- [x] FAQ + schema — apps/web/src/lib/hubs/cybersecurity.ts (`CYBERSECURITY_FAQ` 10 Q&As, 3 open + 7 collapsed; `cybersecurityFaqJsonLd()` FAQPage JSON-LD helper)
