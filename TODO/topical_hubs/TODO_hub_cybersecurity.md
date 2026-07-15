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

## Gap flagged 2026-07-12 (round 5 content-gap pass — weak/dispersed, same treatment as round 4's ICS/SCADA note)
- [ ] Ransomware/cybercrime-for-profit (RaaS) coverage is real but dispersed: "Malware & APT Campaigns" sub-page + a wiper-vs-ransomware FAQ answer + placeholder taxonomy leaf `cyber-ransomware` (`exampleSlugs: ["lockbit-ransomware-tracking", "conti-group-analysis"]`, never wired). No dedicated RaaS-group-as-entity / victim-count / ransom-payment tracker exists, distinct from the state-actor/APT focus of this hub and `TODO_hub_cyber_warfare.md`. Repackage into a proper per-group tracker once a data source (ransomware-tracking feed, e.g. Ransomlooker/NCC-style) is scoped — do not treat as an isolated content sprint.
