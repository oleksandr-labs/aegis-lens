# RSS Aggregator Compliance

## General principle
RSS is a syndication format designed for machine consumption. Fetching and indexing RSS feeds is generally considered fair use / within the feed publisher's intent.

## Attribution and linking
- **Always link back** to the original article (`RssItem.link`). Never display content without a source link.
- Display the feed source name alongside any content excerpt.
- Do not present aggregated content as original Aegis Lens reporting.

## Full-text republication
- **Prohibited**: republishing full article text from commercial news outlets (Reuters, BBC, Kyiv Independent, etc.) without a syndication agreement.
- **Permitted**: display of title, publication date, author, and a short excerpt (≤ 150 words), with link-out to the original.
- For ISW, OSCE, UN, and ICRC: their reports are typically under Creative Commons or open government licenses — check each source's terms before displaying extended content.

## Rate limiting / polite crawling
- Use the `refreshIntervalMinutes` value per feed; do not poll more frequently.
- The `User-Agent` header identifies the crawler: `AegisLens/1.0 (+https://aegislens.ua/about)`.
- `AbortSignal.timeout(10_000)` prevents slow feeds from blocking the ingest pipeline.
- Use Next.js `next: { revalidate }` or a caching layer to avoid hammering feed servers.

## Ukrainian state sources
- Ukrinform, Suspilne, UA General Staff: public sources, freely aggregatable.
- Include accurate timestamps; do not backdate or forward-date items.

## Conflict-specific guidance
- Humanitarian org feeds (UN, ICRC, MSF, UNHCR): may not be used to create content that misrepresents their positions.
- ACLED data: CC-BY license; attribute as "Data provided by ACLED (https://acleddata.com)".
- Bellingcat: All Rights Reserved — display title + link only; do not reproduce article content.
