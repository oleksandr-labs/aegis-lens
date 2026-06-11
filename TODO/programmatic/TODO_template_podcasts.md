# Template — Podcasts (if we podcast)

## URLs
- `/podcast` ✓ Sprint 2.18 (PodcastSeries — "Aegis Lens — Field Notes")
- `/podcast/<episode-slug>` ✓ Sprint 2.18 (3 seed episodes covering OSINT definition, Shahed launch network, deadline verification)

## Progress
- 3 / 4 done

## Content
- [x] Per-episode page (embed + transcript + guests + chapters) ✓ Sprint 2.18 (player embed is a placeholder until hosting; transcript / guests / chapter markers all present)
- [x] Schema.org `PodcastEpisode` + `PodcastSeries` ✓ Sprint 2.18 (PodcastEpisode partOfSeries → PodcastSeries; BreadcrumbList on detail)
- [ ] RSS / Atom feed — deferred (will mirror /news/feed.xml pattern when hosting is real)
- [x] Quality gate: transcript required ✓ Sprint 2.18 (every seed episode ships with a transcript)
