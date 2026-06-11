# GDELT / NewsAPI / MediaCloud — Compliance

## Data sources and license

### GDELT (Global Knowledge Graph v2)
- **License**: CC0 1.0 Universal — fully free, no restrictions
- **API key**: Not required
- **Rate limit**: Recommended ~1 query/min; enforced in client
- **Data**: Derived metadata from news articles (themes, locations, tone, persons, orgs)
  — not full article text; document URLs retained as source references

### NewsAPI.org
- **License**: Commercial use requires paid plan (Developer/Business tier)
- **API key**: Required — set `NEWSAPI_KEY` environment variable
- **Free tier**: 100 req/day; content truncated to 200 chars per article
- **Rate limit**: 250ms between requests (free tier); enforced in client
- **Production note**: Commercial license required before deployment; PENDING legal review

### MediaCloud
- **License**: Academic/research license — https://mediacloud.org/
- **API key**: Required — set `MEDIACLOUD_API_KEY` environment variable
- **Rate limit**: 1 req/sec; enforced in client
- **Production note**: Academic license; commercial use prohibited without separate agreement

## Data classification
- Aggregated news metadata: `PUBLIC_NEWS`
- Article URLs retained as source evidence references
- No full article text stored (respects copyright)
- Author bylines stored where returned by API (public data)

## Retention policy
- 30 days rolling; indexed for conflict-event corroboration
- Not redistributed or republished

## Legal review status
- GDELT: APPROVED (CC0)
- NewsAPI: PENDING commercial license for production deployment
- MediaCloud: PENDING academic use confirmation

## Compliance changelog
- 2026-06-10 — Initial record: GDELT CC0 approved, NewsAPI/MediaCloud pending license review.
