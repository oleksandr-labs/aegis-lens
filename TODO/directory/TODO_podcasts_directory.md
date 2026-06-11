# Directory — Podcasts (OSINT / Intel / Geopolitics)

## Progress
4/4 done — Sprint 2.68 (2026-06-10)

## URLs
- `/podcasts-directory` · `/podcasts-directory/<slug>` · `/podcasts-directory/<topic>`

## Content
- [x] Per-podcast: hosts · topics · platforms · feed — `apps/web/src/lib/directory/podcasts.ts` (PodcastProfile with host_en/uk, topics, feedUrl_en/uk, frequency)
- [x] Schema.org `PodcastSeries` — PODCAST_SCHEMA_NOTE_EN/UK (PodcastSeries + PodcastEpisode) + `apps/web/src/app/api/v1/directory/podcasts/route.ts`
- [x] Filter by language / topic — PodcastLanguage type, PodcastTopic type, PODCAST_TOPIC_CONFIG
- [x] "Best intel podcasts" listicle — PODCAST_PROGRAMMATIC_NOTE_EN/UK (/podcasts-directory/<topic> and /podcasts-directory/<language> routes)
