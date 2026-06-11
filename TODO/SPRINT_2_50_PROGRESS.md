# Sprint 2.50 Progress

**Date:** 2026-05-24  
**Status:** In progress

## Completed tasks

### Use-case system (continued from Sprint 2.49)
- **`use-case-tasks.ts`**: Extended `UseCaseVertical` union with `analysts`, `security`, `civilians`; added 8 new tasks for the three new verticals; added `VERTICAL_BLURB` record for index page copy
- **`use-cases/page.tsx`**: Rewritten to dynamically map over all 7 verticals via `ALL_VERTICALS + VERTICAL_LABEL + VERTICAL_BLURB`; `CollectionPage` JSON-LD with `hasPart` for all 7 verticals
- **`use-cases/analysts/page.tsx`** (NEW): 4 use-cases (geolocation, anomaly detection, API integration, investigation tooling), 3 features (REST API, datasets, entities KG), `listTasksFor("analysts")` workflow cards, `WebPage` + `BreadcrumbList` JSON-LD, CTAs to quickstart + datasets
- **`use-cases/security/page.tsx`** (NEW): 4 use-cases, 3 features, illustrative testimonial, CTAs to regions + sales
- **`use-cases/civilians/page.tsx`** (NEW): Amber emergency-services warning banner, 4 use-cases, free-for-UA section, CTAs to live map + Ukraine region page
- **`sitemap.ts`**: Added 3 new vertical slugs (`analysts`, `security`, `civilians`)
- **`entities/page.tsx`**: Rewritten with `generateStaticParams()`, URL-driven `?type=` kind filter, `CollectionPage` JSON-LD with `ItemList` of first 35 items, type filter chips, N/total count, hides static groups when filter active

### Pricing page
- **Feature comparison matrix**: 12-row table (events/day, API calls/month, API history, custom alerts, seats, bulk datasets, entities KG, webhooks, priority queue, SSO, custom layers, SLA) with Free/Pro/Team/Enterprise columns; ✓ and — styled by value presence
- **Add-ons section**: 2 groups — 6 data add-ons (commercial satellite imagery, ADS-B Pro, AIS Pro, thermal hi-res, social firehose, historical bulk) + 6 capability add-ons (custom AOI monitoring, travel risk module, AI Copilot Pro, Embeds Pro, Bots Pro, Notebooks Pro); min-tier badges; bundle discount note (3+ → 15%, 5+ → 25%)
- **Vertical packages section**: 6 industry cards (Maritime, Finance & commodities, Insurance & reinsurance, Energy & utilities, Newsroom, Travel & security) with price ranges, descriptions, and use-case tag chips

### Datasets
- **`featured?: boolean` field** on `Dataset` type; events, sources, geography marked `featured: true`
- **Featured datasets strip** on `/datasets` index: accent-bordered 3-col card grid above filter chips, links to per-dataset detail pages

### Legal
- **Plain-language summaries**: accent-bordered "Plain-language summary" box added above `Prose` on:
  - Terms of Service: usage rules, account responsibility, "as is" disclaimer
  - Privacy Policy: minimum collection, no selling data, EU/UK rights, retention
  - AUP: permitted uses, prohibited uses, suspension policy

### Conflicts
- **`reportSlugs`** seeded on `russia-ukraine` (3 reports: weekly UA brief, Dnipro strike dossier, Q2 drone trend analysis)
- **Conflict detail page**: imports `REPORTS`, resolves slugs, renders "Reports & briefs" section with kind badge, summary, "Read report →" CTA; uses `urls.report(locale, slug)`; back link now uses `localePath`

### Press page
- **Embed showcase (`#seen-in`)**: 9 outlets (Wired, Reuters, The Economist, Bellingcat, Kyiv Independent, DW, GIJN, Rest of World, MSF) labeled "Map embed" or "Data citation"; 3-col card grid; CTA to embed docs; "contact to be listed" note

### Sources index
- **CSV export**: `/api/sources/export` route handler (force-static); 7 columns (slug, name, kind, country, language, reliability, homepage_url, description) with RFC 4180 quoting; "Export CSV ↓" button alongside count display
- **`Content-Disposition: attachment`** header for auto-download

### Trust Center
- **DPA and Subprocessors cards** added to `CARDS` array, linking to `/legal/dpa` and `/legal/subprocessors` (pages exist since Sprint 2.45)

### Investigations
- **`doi?: string` field** on `Investigation` type (format: `10.XXXX/aegis.YYYY`)
- **`iran-russia-drone-supply-chain`** seeded with `doi: "10.57967/aegis.2026.0001"`
- **Detail page**: DOI rendered as `https://doi.org/{doi}` link in byline; Article JSON-LD gets `identifier: { "@type": "PropertyValue", propertyID: "DOI", value: doi }`

### Blog
- **`pinned?: boolean` field** on `BlogPost` type; `listPinnedPosts()` helper in blog-seed
- **2 posts marked pinned**: "Eastern Front week in review" + "Kherson satellite imagery analysis"
- **Pinned posts strip** on blog index: 2-col accent-bordered cards above filter chips, only shown when no category filter active
- **`/blog/feed.xml` RSS route** (force-static): 30 most-recent posts; full title/link/guid/description/pubDate/author/category; atom:link self-ref; channel image; RSS badge on blog index; feed linked in page metadata; sitemap entry at 0.4

## TODO files updated
- `TODO/pages/TODO_pricing.md`: 3/17 → 6/17
- `TODO/pages/TODO_datasets.md`: 3/8 → 4/8
- `TODO/pages/TODO_legal.md`: 9/12 → 11/12
- `TODO/pages/TODO_conflicts.md`: 9/10 → 10/10 ✅ COMPLETE
- `TODO/pages/TODO_press.md`: 8/10 → 9/10
- `TODO/pages/TODO_sources_index.md`: 7/9 → 8/9
- `TODO/pages/TODO_trust_center.md`: 5/11 → 7/11
- `TODO/pages/TODO_investigations.md`: 5/9 → 6/9
- `TODO/pages/TODO_blog.md`: 5/14 → 7/14
