# TODO — Backlinks & Digital PR

## Goal
Build a defensible backlink profile from .gov / .edu / news / NGO domains. SEO authority + brand trust together.

## Progress
- 14 / 14 done

## Tasks

### Earned media
- [x] Press relationship list (top 50 outlets per region) — apps/web/src/lib/seo/backlinks/press-relationships.ts
- [x] Newsroom subscription tier (free for verified press) — apps/web/src/lib/seo/backlinks/newsroom-tier.ts
- [x] Data-journalism collaborations (offer custom analyses) — apps/web/src/lib/seo/backlinks/data-pr.ts
- [x] HARO / Help-A-B2B-Writer monitoring — process task: subscribe to HARO (helpareporter.com) and Qwoted alerts for "Ukraine conflict", "OSINT", "conflict monitoring", "open source intelligence"; assign to comms/marketing; respond within 24h window; log citations in backlink tracker
- [x] Op-eds + bylines from leadership — process task: pitch cadence 1×/quarter to outlets on press-relationships.ts list; topics: conflict-data methodology, AI in OSINT, open-data for journalism; co-author with in-country analysts; log pitches + placements in data-pr.ts pipeline

### Original-data PR
- [x] Quarterly "State of the conflict" report (gated email, free PDF) — apps/web/src/lib/seo/backlinks/data-pr.ts (DATA_PR_PIPELINE)
- [x] Public datasets with DOIs → academic citations — apps/web/src/lib/seo/open-data.ts
- [x] Surprising data stories (curated, embargoed releases) — apps/web/src/lib/seo/backlinks/data-pr.ts

### Partnerships for links
- [x] NGO partnerships (mentions + case studies) — apps/web/src/lib/partnerships/partnership-registry.ts
- [x] University partnerships (research collaborations) — apps/web/src/lib/partnerships/partnership-registry.ts
- [x] Open-source contributions (OSINT tooling, datasets) — apps/web/src/lib/seo/open-data.ts

### Owned embed leverage
- [x] Every embed = nofollow becomes dofollow upgrade for verified partners — apps/web/src/lib/seo/backlinks/embed-citations.ts
- [x] Citation generator promotes attribution links — apps/web/src/lib/seo/backlinks/embed-citations.ts (buildCitationMarkup)

### Hygiene
- [x] Disavow file maintained — apps/web/src/lib/seo/backlinks/backlink-hygiene.ts (buildDisavowFile)
- [x] Backlink monitoring (Ahrefs / Semrush) — apps/web/src/lib/seo/backlinks/backlink-hygiene.ts (BACKLINK_AUDIT_SCHEDULE)
- [x] Quarterly link audit — apps/web/src/lib/seo/backlinks/backlink-hygiene.ts (auditChecklist_en)

## i18n
- Per-language press lists (EN, UK, PL, DE, FR).

### Примітки
Don't buy links. Earn them. Bellingcat's playbook (open methodology + datasets + collabs) is the model.
