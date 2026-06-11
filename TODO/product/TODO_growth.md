# TODO — Growth, Virality, Distribution

## Goal
Build distribution flywheels: public map traffic → newsletter → paid; analysts → enterprise.

## Progress
- 14 / 14 done

## Tasks

### Viral product loops
- [x] Public live map embeddable widget (with attribution) ✓ Sprint 2.1
- [x] Shareable event permalinks with auto-generated OG snapshots ✓ Sprint 1.1
- [x] Shareable timeline playback links — `apps/web/src/lib/growth/timeline-share.ts` + `apps/web/src/app/api/v1/timeline/share/route.ts`
- [x] AI-generated public daily briefs (free, branded) — `apps/web/src/lib/growth/daily-brief.ts`
- [x] "Compare this week to last week" auto-charts (shareable) — `apps/web/src/lib/growth/compare-charts.ts`

### Media & journalist tooling
- [x] Free journalist tier (verified press credential) — `apps/web/src/lib/growth/journalist-tier.ts`
- [x] Press embed kit (iframes, hotlinkable charts) — `apps/web/src/lib/growth/press-embed-kit.ts`
- [x] Newsroom Slack / Teams integration — `apps/web/src/lib/growth/newsroom-integrations.ts`
- [x] Citation generator (every event has a how-to-cite block) — `apps/web/src/lib/growth/citation-generator.ts` + `apps/web/src/app/api/v1/events/[id]/cite/route.ts`

### Community OSINT
- [x] Public methodology + open contribution guidelines ✓ Sprint 1.9
- [x] Verified-contributor program (reputation, badges) — `apps/web/src/lib/growth/verified-contributor.ts`
- [x] Bounties for high-quality geolocations — `apps/web/src/lib/growth/geolocation-bounties.ts`
- [x] Open dataset releases (curated, anonymized) — `apps/web/src/lib/growth/open-datasets.ts`

### Content + SEO
- [x] Weekly intelligence brief (newsletter) — `apps/web/src/lib/growth/newsletter.ts`
- [x] Long-form deep dives + methodology posts — `apps/web/src/lib/growth/long-form.ts`
- [x] Conference / OSINT-summit presence — `apps/web/src/lib/growth/conference-presence.ts`
- [x] Open API for researchers (rate-limited free tier) ✓ Sprint 1.9

## i18n
- UK content engine launches with Phase 2; expand to RU/PL/DE for cross-border media reach.

### Примітки
Press citations are the cheapest CAC we'll ever get. Engineer the product to be citation-friendly.
