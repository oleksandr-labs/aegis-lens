# C4 Architecture Diagrams — Aegis Lens

Diagrams use Mermaid (C4 context + container levels).
Render at https://mermaid.live or in any C4-compatible tool.

## Level 1 — System Context

```mermaid
C4Context
    title Aegis Lens — System Context

    Person(analyst, "Intelligence Analyst", "Monitors conflict events, creates reports and alerts")
    Person(journalist, "Journalist / Researcher", "Verifies media, geolocates events, embeds in articles")
    Person(civilian, "Civilian", "Receives air raid alerts, checks power outage status")
    Person(government, "Government Official", "Situation awareness, humanitarian coordination")
    Person(admin, "Platform Admin", "Manages sources, moderates content, handles billing")

    System(aegis, "Aegis Lens Platform", "AI-native OSINT platform for conflict intelligence monitoring")

    System_Ext(telegram, "Telegram Channels", "Primary source feed for UA conflict events")
    System_Ext(twitter, "Twitter / X", "Open-source intelligence, first-person reports")
    System_Ext(nasa_firms, "NASA FIRMS", "Thermal anomaly / fire data (satellite)")
    System_Ext(sentinel, "Sentinel Hub", "Sentinel-1 SAR + Sentinel-2 optical imagery")
    System_Ext(adsb, "OpenSky ADS-B", "Aviation tracking data")
    System_Ext(anthropic, "Anthropic Claude API", "AI inference for copilot, summarization, classification")
    System_Ext(stripe, "Stripe", "Billing + subscriptions")
    System_Ext(cloudflare, "Cloudflare", "CDN, DDoS protection, edge workers")

    Rel(analyst, aegis, "Uses", "HTTPS")
    Rel(journalist, aegis, "Uses", "HTTPS / Browser Extension")
    Rel(civilian, aegis, "Uses", "HTTPS / Telegram Bot")
    Rel(government, aegis, "Uses", "HTTPS / Embed")
    Rel(admin, aegis, "Manages", "HTTPS")

    Rel(aegis, telegram, "Ingests from", "Bot API / MTProto")
    Rel(aegis, twitter, "Ingests from", "Filtered Stream API")
    Rel(aegis, nasa_firms, "Ingests from", "HTTPS API")
    Rel(aegis, sentinel, "Ingests from", "Sentinel Hub OGC API")
    Rel(aegis, adsb, "Ingests from", "OpenSky REST API")
    Rel(aegis, anthropic, "Calls", "HTTPS API")
    Rel(aegis, stripe, "Bills via", "HTTPS API + Webhooks")
    Rel(aegis, cloudflare, "Fronted by", "DNS / CDN")
```

## Level 2 — Container Diagram

```mermaid
C4Container
    title Aegis Lens — Container Diagram

    Person(user, "User (Any Persona)")

    Container(web_app, "Web Application", "Next.js 15 / App Router", "Main user interface: map, dashboards, reports, settings")
    Container(ext, "Browser Extension", "MV3 / Chrome+Firefox", "OSINT capture, source badge, coordinate detection")
    Container(api, "API Gateway", "Next.js API Routes", "Auth (JWT/API key), rate limiting, quota, tracing")

    ContainerDb(postgres, "PostgreSQL + PostGIS + TimescaleDB", "Database", "Events (hypertable), orgs, users, alerts, cases, notebooks, audit log")
    ContainerDb(qdrant, "Qdrant", "Vector DB", "Event embeddings for semantic search + RAG")
    ContainerDb(elastic, "Elasticsearch", "Search Engine", "Full-text search with locale-aware analyzers")
    ContainerDb(redis, "Redis", "Cache", "Rate limit counters, hot key cache, session store")
    ContainerDb(s3, "S3", "Object Store", "Raw archive, media, Parquet cold archive, tile cache")

    Container(kafka, "Apache Kafka", "Message Broker", "events.raw → events.enriched → events.verified pipeline")
    Container(ingest, "Ingest Service", "TypeScript", "Source adapters, dedup, normalise, PII redact, archive")
    Container(nlp, "NLP Service", "TypeScript", "Lang detect, translation, NER, classify, sentiment, embed")
    Container(geo_svc, "Geo Service", "TypeScript", "Geocoding, reverse-geocoding, coord parsing, AOI lookup")
    Container(anomaly_svc, "Anomaly Service", "TypeScript", "Z-score, EWMA, DBSCAN, source burst, alert generation")
    Container(search_svc, "Search Service", "TypeScript", "Hybrid BM25+dense+geo, spell correction, facets")
    Container(alerts_svc, "Alert Service", "TypeScript", "Rule matching, fan-out, retry/DLQ, throttle")
    Container(reports_svc, "Reports Service", "TypeScript", "LLM generation, PDF rendering, versioning")
    Container(tile_svc, "Tile Service", "TypeScript", "MVT generation, CDN integration, snapshots")
    Container(tg_bot, "Telegram Bot", "TypeScript", "Civilian alerts, daily briefs, command interface")

    Rel(user, web_app, "Uses", "HTTPS")
    Rel(user, ext, "Uses", "Browser")
    Rel(web_app, api, "Calls", "HTTP")
    Rel(ext, api, "Calls", "HTTPS")
    Rel(api, postgres, "Reads/Writes", "pgbouncer → TCP")
    Rel(api, qdrant, "Queries", "HTTP")
    Rel(api, elastic, "Queries", "HTTP")
    Rel(api, redis, "Caches", "TCP")
    Rel(ingest, kafka, "Publishes to", "TCP")
    Rel(kafka, nlp, "Consumed by", "TCP")
    Rel(kafka, geo_svc, "Consumed by", "TCP")
    Rel(kafka, anomaly_svc, "Consumed by", "TCP")
    Rel(nlp, postgres, "Writes", "TCP")
    Rel(nlp, qdrant, "Writes vectors", "HTTP")
    Rel(alerts_svc, kafka, "Consumes", "TCP")
    Rel(alerts_svc, tg_bot, "Triggers", "HTTP")
    Rel(ingest, s3, "Archives to", "HTTPS")
    Rel(tile_svc, s3, "Caches to", "HTTPS")
    Rel(reports_svc, postgres, "Reads events", "TCP")
```

## Level 3 — Ingest Service Components

```mermaid
C4Component
    title Ingest Service — Component Diagram

    Container_Boundary(ingest, "Ingest Service") {
        Component(adapter, "Adapter Registry", "TypeScript", "Per-source adapters: Telegram, Twitter, NASA FIRMS, ADS-B, AIS, Sentinel, RSS")
        Component(webhook_recv, "Webhook Receiver", "TypeScript", "Push source receiver: HMAC verify, Telegram/Twitter/GitHub")
        Component(rate_limiter, "Rate Limiter", "TypeScript", "Token bucket per source; respects API limits")
        Component(dedup, "Dedup Engine", "TypeScript", "content_hash + source_id idempotency; Redis/in-memory")
        Component(media_dl, "Media Downloader", "TypeScript", "Size limit, MIME check, magic bytes, SHA-256 dedup")
        Component(pii, "PII Redactor", "TypeScript", "Phone, email, passport, GPS coords stripped")
        Component(pipeline, "Ingest Pipeline", "TypeScript", "Orchestrates: adapt → rate → dedup → media → pii → archive → emit")
        Component(archive, "Raw Archiver", "TypeScript", "S3 immutable write; gzip compress")
        Component(dlq, "Dead Letter Queue", "TypeScript", "Failed events; replay tooling; admin API")
        Component(checkpoint, "Checkpoint Store", "TypeScript", "Cursor persistence per source for incremental pull")
    }

    ComponentDb(s3_db, "S3", "Object Store", "Raw event archive")
    ComponentDb(kafka_db, "Kafka", "events.raw topic")
    ComponentDb(redis_db, "Redis", "Dedup + rate limit state")

    Rel(adapter, rate_limiter, "Throttled by")
    Rel(adapter, dedup, "Deduped by")
    Rel(adapter, pipeline, "Passes to")
    Rel(webhook_recv, pipeline, "Passes to")
    Rel(pipeline, pii, "Strips PII via")
    Rel(pipeline, media_dl, "Downloads media via")
    Rel(pipeline, archive, "Archives via")
    Rel(pipeline, kafka_db, "Emits to")
    Rel(pipeline, dlq, "On failure →")
    Rel(archive, s3_db, "Writes to")
    Rel(dedup, redis_db, "Checks/sets")
    Rel(checkpoint, redis_db, "Persists in")
```
