# TODO — Press / Newsroom Page

## Goal
A single hub journalists trust and link to. Press kit, embargo policy, executive bios, asset library.

## Progress
- 10 / 10 done ✅ COMPLETE

## Tasks
- [x] `/press` newsroom hub ✓ Sprint 2.0
- [x] Press kit (logos, brand colors, screenshots, demo videos) — downloadable ZIP ✓ Sprint 2.0 — brand assets table with download links
- [x] Executive bios + headshots ✓ Sprint 2.0 — spokespeople section with avatar + bio; linked to /team profiles Sprint 2.43
- [x] Coverage archive (with logos of outlets that cited us) ✓ Sprint 2.0 — 5 coverage items
- [x] Press contact form (direct to PR lead) ✓ Sprint 2.48 — `#press-contact` section with two mailto cards (press@aegislens.io + data@aegislens.io) with category labels and response SLA note
- [x] Embargo policy ✓ Sprint 2.44 — embargo terms, lift time policy, access requirements in `#embargo-policy` section
- [x] Embed showcase ("seen in") ✓ Sprint 2.50 — `#seen-in` section with 9 outlets (Wired, Reuters, The Economist, Bellingcat, Kyiv Independent, DW, GIJN, Rest of World, MSF) labeled Map embed / Data citation; 3-col card grid; link to embed docs; CTA to contact for listing
- [x] Press release archive (with schema.org `NewsArticle`) ✓ Sprint 2.44 — 4 press releases (Product/Data/Partnership/Community) with `NewsArticle` JSON-LD in `@graph`; extracted to `press-seed.ts`
- [x] Verified press tier application ✓ Sprint 2.44 — 5 perks listed, apply via press@aegislens.io in `#verified-press` section
- [x] RSS feed for press releases ✓ Sprint 2.48 — `/press/feed.xml` route handler (`force-static`), sorted by date, includes atom:link self-reference, managingEditor, channel image; RSS badge added to press releases section header; `PRESS_RELEASES` extracted to shared `lib/press-seed.ts`

## i18n
- EN + UK + DE + FR.

### Примітки
A clean press page is often the first thing a journalist Googles after a tip. Make it loadable in 1s.
