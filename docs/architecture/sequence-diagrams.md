# Sequence Diagrams — Aegis Lens

Key cross-service sequences for onboarding and debugging.

## 1. Event Ingest → Published on Map

```mermaid
sequenceDiagram
    participant SRC as External Source
    participant ING as Ingest Service
    participant S3 as S3 Raw Archive
    participant KF as Kafka: events.raw
    participant NLP as NLP Service
    participant GEO as Geo Service
    participant TAG as Auto-Tagger
    participant VER as Verify Service
    participant PG as PostgreSQL
    participant QD as Qdrant
    participant SSE as SSE Stream
    participant MAP as Web Map

    SRC->>ING: Telegram message / API payload
    ING->>S3: Archive raw payload
    ING->>ING: Normalise (detect lang, dedup, PII redact)
    ING->>KF: Publish events.raw message
    par Enrichment
        KF->>NLP: Consume event
        NLP-->>KF: Publish events.enriched (lang, class, NER, embedding)
    and
        KF->>GEO: Consume event
        GEO-->>KF: Publish geocoded result
    and
        KF->>TAG: Consume event
        TAG-->>KF: Publish tags
    end
    KF->>VER: Consume events.enriched
    VER->>VER: Corroboration score (multi-source check)
    VER->>KF: Publish events.verified
    KF->>PG: Upsert into events table (RLS org_id)
    KF->>QD: Upsert embedding vector
    PG-->>SSE: LISTEN/NOTIFY (or Debezium CDC)
    SSE-->>MAP: data: {event} (Server-Sent Event)
    MAP-->>MAP: Render point on map
```

## 2. User Creates AOI → First Alert Delivered

```mermaid
sequenceDiagram
    participant U as User (Web)
    participant API as API Gateway
    participant PG as PostgreSQL
    participant AE as Alert Engine
    participant KF as Kafka
    participant WH as Webhook Dispatcher
    participant TG as Telegram Bot
    participant EM as Email Service

    U->>API: POST /api/aois { name, geom, minSeverity, alertClasses }
    API->>PG: INSERT into aois (RLS-scoped to org)
    PG-->>API: aoi_id
    API-->>U: 201 Created { aoi_id }

    Note over KF,AE: Later — when a new event is verified
    KF->>AE: events.verified message
    AE->>PG: SELECT aois WHERE ST_Intersects(geom, event.geom) AND ...
    PG-->>AE: [{ aoi_id, user_id, notify_* }]
    AE->>PG: INSERT notification record
    par Delivery
        AE->>WH: dispatch(notification) if notify_slack/webhook
        AE->>TG: sendMessage(chat_id, alert_text) if notify_telegram
        AE->>EM: sendEmail(to, subject, body) if notify_email
    end
    WH-->>U: POST /user-webhook-url (HMAC-signed)
    TG-->>U: Telegram message
    EM-->>U: Email notification
```

## 3. Verification: Low-Confidence Event → Review Queue → Publish

```mermaid
sequenceDiagram
    participant ING as Ingest
    participant VER as Verify Service
    participant RQ as Review Queue (DB)
    participant REV as Human Reviewer
    participant PG as PostgreSQL
    participant KF as Kafka

    ING->>VER: events.enriched (confidence: 0.3)
    VER->>VER: Confidence below threshold (< 0.5)
    VER->>RQ: INSERT review_queue (event_id, confidence, flagReason)
    VER->>KF: Publish events.in_review (verificationState: "in_review")
    KF->>PG: Upsert event (is_public: false, verificationState: in_review)

    REV->>RQ: GET next review item
    RQ-->>REV: { event, sources, mediaUrls }
    REV->>REV: Checks sources, media, location consistency
    alt Verified
        REV->>RQ: PATCH { verdict: verified, notes }
        RQ->>KF: Publish events.verified
        KF->>PG: UPDATE event SET verificationState=verified, is_public=true
    else Disputed
        REV->>RQ: PATCH { verdict: disputed, reason }
        RQ->>KF: Publish events.disputed
        KF->>PG: UPDATE event SET verificationState=disputed
    else Retracted
        REV->>RQ: PATCH { verdict: retracted, retractionReason }
        RQ->>PG: UPDATE event SET is_retracted=true, retracted_at=now()
    end
```

## 4. Plugin Install → First Data Render

```mermaid
sequenceDiagram
    participant U as User
    participant MKT as Plugin Marketplace
    participant API as API Gateway
    participant PG as PostgreSQL
    participant PLG as Plugin iframe
    participant BRG as PluginBridge

    U->>MKT: Browse + click "Install" on plugin
    MKT->>API: POST /api/plugins/install { manifestUrl }
    API->>API: Validate manifest (semver compat, scopes check)
    API->>PG: INSERT plugin_install (org_id, plugin_id, grantedScopes)
    API-->>MKT: 201 { installId, grantedScopes }
    MKT-->>U: Plugin installed, reload workspace

    U->>PLG: Workspace loads plugin panel (iframe)
    PLG->>BRG: window.parent.postMessage { type: "aegis:ready" }
    BRG->>PLG: postMessage { type: "context", data: { orgId, user, mapView } }
    PLG->>BRG: postMessage { type: "query:events", params: { ... } }
    BRG->>API: GET /api/events (with plugin API key)
    API-->>BRG: { data: events[] }
    BRG->>PLG: postMessage { type: "query:events:result", data: events }
    PLG-->>U: Render data in plugin panel
```

## 5. Source Goes Silent → Degrade + Alert

```mermaid
sequenceDiagram
    participant MON as Source Monitor
    participant PG as PostgreSQL
    participant ALERT as Alert Engine
    participant TG as Telegram (ops)

    Note over MON: Runs every 15 minutes
    MON->>PG: SELECT sources WHERE last_fetched_at < now() - interval '2h'
    PG-->>MON: [{ source_id: "tg_ukraine_air_force", ... }]
    MON->>MON: Classify: warning (2–6h) | critical (>6h)
    MON->>PG: UPDATE sources SET health_status = 'warning'
    MON->>ALERT: fire SilentSourceAlert { source_id, silentSince }
    ALERT->>TG: Post to #ops-alerts: "⚠️ Source tg_ukraine_air_force silent 2h+"
    Note over PG: Events from this source get lower confidence
    Note over PG: If silent > 24h: is_active = false
```
