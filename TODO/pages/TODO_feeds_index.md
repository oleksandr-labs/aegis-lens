# TODO — Feeds Index Page

## Goal
Single discoverable `/feeds` page listing all available RSS/Atom feeds (blog, news, newsletter, per-conflict, per-region) — individual feeds exist (e.g. `/blog/feed.xml`) but there is no index surfacing them to users or crawlers.

## Progress
- 0 / 3 done

## URLs
- `/feeds` (index only — no sub-pages)

## Tasks
- [ ] `/feeds` page: table of all feed endpoints (blog, news, per-conflict live-blog, newsletter, changelog) with description + `<link rel="alternate">` autodiscovery tags in `<head>` site-wide
- [ ] Ensure every feed listed is also referenced in `robots.ts` / sitemap where applicable (cross-check `seo/TODO_sitemap_strategy.md`)
- [ ] Link from footer + `/help` (discoverability for power users / journalists who consume via feed readers)

## Notes
- Trivial page, meaningful for the journalist/OSINT-analyst persona who prefers feed readers over polling the site.

## i18n
- Per-locale feed variants should be listed separately if EN/UK content diverges.
