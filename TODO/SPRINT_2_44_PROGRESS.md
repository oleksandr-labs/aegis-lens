# Sprint 2.44 — Progress

**Theme:** Press page expansion, Contact segmented forms + tip line, Status source-health + badge + subscribe, Glossary enrichment.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Press — press releases, embargo policy, verified press tier, attribution guidelines
- [x] `PRESS_RELEASES: PressRelease[]` — 4 releases across Product/Data/Partnership/Community categories with color-coded category badges.
- [x] `RELEASE_CATEGORY_STYLES` — color map for badge styles.
- [x] **Press releases section** (`#press-releases`): sorted list with category badge, date, headline, summary.
- [x] **Schema.org `NewsArticle`** per press release in `@graph` JSON-LD alongside `Organization` + `CollectionPage`.
- [x] **Embargo policy** (`#embargo-policy`): terms, lift time policy (UTC, breach = removal), access requirements.
- [x] **Verified press tier** (`#verified-press`): 5 perks (free Pro access, embargo briefings, dedicated contact, HD maps, quarterly briefings), apply via press@aegislens.io.
- [x] **Attribution guidelines** (`#attribution`): monospace citation snippet, broadcast contact.
- [x] Closes press TODOs: press release archive, embargo policy, verified press tier.

### Contact — enterprise inquiry form, OSINT tip line, legal entity info
- [x] **Enterprise & government section** (`#enterprise`): extended form — name, org, work email, team size (dropdown), use-case selector (6 options), requirements textarea; posts to `/api/contact/enterprise`.
- [x] **OSINT tip line** (`#tip-line`): tips@aegislens.io with PGP fingerprint + key file link, SecureDrop + Signal note, IP-logging disclosure, high-risk warning banner.
- [x] **Legal entity block** (`#legal`): legal name, registered country/year, offices (Kyiv/Warsaw/Remote), general email.
- [x] Closes contact TODOs: enterprise form, tip line, office/legal entity info.

### Status — source-health dashboard, scheduled maintenance, badge embed, subscribe
- [x] `SOURCE_HEALTH: SourceHealth[]` — 8 data sources: Sentinel-1, NASA FIRMS, OSM Overpass, ISW, DeepState UA (Lagging), Telegram aggregator, RFE, UNHCR (Silent). Fields: `status`, `lagMinutes?`, `lastSeenAt`, `note`.
- [x] `SCHEDULED_MAINTENANCE: ScheduledMaintenance[]` — shown as amber-bordered card when upcoming events exist.
- [x] **Source health table** (`#sources`): name, type, status dot + label (with lag minutes), last seen, notes.
- [x] **Status badge** (`#badge`): HTML `<img>` snippet + Markdown badge code in `<pre>` blocks.
- [x] **Subscribe section** (`#subscribe`): RSS feed link, email digest (status-subscribe@aegislens.io), Telegram channel.
- [x] `statusDot` / `statusText` extended to handle `"Lagging"` and `"Silent"` statuses.
- [x] Closes status TODOs: source-health dashboard, scheduled maintenance, badge embed, subscribe.

### Glossary — enriched type + 9 terms + enhanced per-term page
- [x] `GlossarySeed` type: added `examples?: string[]`, `relatedSlugs?: string[]`, `sources?: { label, url }[]`.
- [x] 9 terms enriched with examples, related slugs, and sources: `osint`, `geolocation`, `confidence-score`, `chronolocation`, `reverse-image-search`, `socmint`, `kinetic-action`, `drone-swarm`, `electronic-warfare`.
- [x] `apps/web/src/app/[locale]/glossary/[slug]/page.tsx`: now renders Examples (numbered list), Related terms (chip links to other terms), Sources & further reading (external links), back link.
- [x] Schema.org `@graph` with `DefinedTerm` + `BreadcrumbList` + `citation` array from `sources[]`.
- [x] Closes glossary TODO: "Each term: definition, examples, related terms, see-also, sources cited".

---

## Files touched

Edited:
- `apps/web/src/app/[locale]/press/page.tsx` — press releases, embargo policy, verified press tier, attribution guidelines + `@graph` JSON-LD
- `apps/web/src/app/[locale]/contact/page.tsx` — enterprise form, tip line, legal entity block
- `apps/web/src/app/[locale]/status/page.tsx` — `SourceHealth`, `ScheduledMaintenance` types + data; source-health table, badge, subscribe sections
- `apps/web/src/app/[locale]/glossary/[slug]/page.tsx` — examples, related terms, sources, breadcrumb JSON-LD, back link
- `apps/web/src/lib/seed-data.ts` — `GlossarySeed` type extended; 9 terms enriched
- `TODO/pages/TODO_press.md` — Progress 0→5/10; 4 tasks closed
- `TODO/pages/TODO_contact.md` — Progress 0→4/9; 4 tasks closed
- `TODO/pages/TODO_status.md` — Progress 0→6/9 (+ Sprint 2.0 credit); 4 tasks closed
- `TODO/pages/TODO_glossary.md` — Progress 0→5/10; 2 tasks closed
- `TODO/SPRINT_2_44_PROGRESS.md` (NEW)

---

## TODO bookkeeping
- `TODO/pages/TODO_press.md` — Progress: 1→5/10
- `TODO/pages/TODO_contact.md` — Progress: 0→4/9
- `TODO/pages/TODO_status.md` — Progress: 2→6/9
- `TODO/pages/TODO_glossary.md` — Progress: 4→5/10

## Open follow-ups
- [ ] Press: RSS feed for press releases
- [ ] Press: press contact form (dedicated form, not just email link)
- [ ] Contact: security.txt + VDP form
- [ ] Contact: hCaptcha + server-side rate limiting
- [ ] Status: auto-create incidents from observability alerts
- [ ] Glossary: remaining terms enriched (counter-battery-fire, etc.)
- [ ] Glossary: in-app term tooltips
