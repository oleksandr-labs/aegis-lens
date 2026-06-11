# Entity Relationship Diagram — Aegis Lens

Diagrams as code (Mermaid). Render at https://mermaid.live or in any Mermaid-compatible viewer.

## Core Platform ERD

```mermaid
erDiagram
    ORGS {
        text org_id PK
        text name
        text tier
        text plan_id
        text customer_id
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        text user_id PK
        text email UK
        text name
        text avatar_url
        text locale
        text timezone
        text persona
        boolean mfa_enabled
        timestamptz created_at
        timestamptz updated_at
    }

    ORG_MEMBERS {
        text org_id FK
        text user_id FK
        text role
        timestamptz joined_at
    }

    SOURCES {
        text source_id PK
        text name
        text type
        text country
        text language
        real reliability
        boolean is_active
        timestamptz last_fetched_at
    }

    EVENTS {
        text event_id PK
        timestamptz occurred_at PK
        text source_id FK
        text class
        text subclass
        geometry geom
        float lat
        float lon
        text country
        text region_code
        smallint severity
        real confidence
        smallint danger_score
        text verification_state
        text title_en
        text title_uk
        text summary_en
        text summary_uk
        text org_id FK
        boolean is_public
        boolean is_retracted
        jsonb raw_payload
    }

    API_KEYS {
        text key_id PK
        text user_id FK
        text org_id FK
        text name
        text key_hash UK
        text key_suffix
        text[] scopes
        boolean is_active
        timestamptz expires_at
    }

    AOIS {
        text aoi_id PK
        text org_id FK
        text user_id FK
        text name
        geometry geom
        smallint min_severity
        text[] alert_classes
        boolean is_active
    }

    CASES {
        text case_id PK
        text org_id FK
        text title
        text status
        smallint priority
        text assigned_to FK
        text[] event_ids
        text[] tags
        text created_by FK
        timestamptz created_at
    }

    ALERTS {
        text alert_id PK
        text org_id FK
        text user_id FK
        text name
        text rule_type
        jsonb rule_config
        boolean is_active
    }

    NOTEBOOKS {
        text notebook_id PK
        text org_id FK
        text owner_id FK
        text title
        text slug UK
        text status
        boolean is_public
        jsonb cells
    }

    WEBHOOK_ENDPOINTS {
        text endpoint_id PK
        text org_id FK
        text user_id FK
        text name
        text url
        text secret_hash
        text[] events
        boolean is_active
    }

    WEBHOOK_DELIVERIES {
        text delivery_id PK
        text endpoint_id FK
        text event_type
        jsonb payload
        integer http_status
        boolean success
        timestamptz delivered_at
    }

    PRESETS {
        text preset_id PK
        text org_id FK
        text owner_id FK
        text name
        jsonb filters
        jsonb map_view
        text[] active_layers
        boolean is_public
        text share_token
    }

    AUDIT_LOG {
        text entry_id PK
        text org_id FK
        text actor_id FK
        text action
        text target_type
        text target_id
        jsonb metadata
        text ip_address
        timestamptz created_at
    }

    ORGS ||--o{ ORG_MEMBERS : "has"
    USERS ||--o{ ORG_MEMBERS : "belongs to"
    ORGS ||--o{ API_KEYS : "owns"
    USERS ||--o{ API_KEYS : "owns"
    ORGS ||--o{ AOIS : "owns"
    USERS ||--o{ AOIS : "owns"
    ORGS ||--o{ CASES : "owns"
    ORGS ||--o{ ALERTS : "owns"
    ORGS ||--o{ NOTEBOOKS : "owns"
    ORGS ||--o{ WEBHOOK_ENDPOINTS : "owns"
    WEBHOOK_ENDPOINTS ||--o{ WEBHOOK_DELIVERIES : "delivers via"
    ORGS ||--o{ PRESETS : "owns"
    ORGS ||--o{ AUDIT_LOG : "generates"
    SOURCES ||--o{ EVENTS : "produces"
    ORGS ||--o{ EVENTS : "sees (RLS)"
```

## Knowledge Graph Extension (Phase 2)

```mermaid
erDiagram
    KG_ENTITIES {
        text entity_id PK
        text entity_class
        text canonical_name
        text[] aliases
        text wikidata_id
        text country_code
        jsonb attributes
        float confidence
        timestamptz first_seen_at
    }

    KG_RELATIONS {
        text relation_id PK
        text from_entity FK
        text to_entity FK
        text relation_type
        float confidence
        text[] source_event_ids
    }

    EVENT_ENTITY_MENTIONS {
        text event_id FK
        timestamptz occurred_at FK
        text entity_id FK
        text surface_form
        integer char_start
        integer char_end
        float confidence
    }

    KG_ENTITIES ||--o{ KG_RELATIONS : "has outgoing"
    KG_ENTITIES ||--o{ KG_RELATIONS : "has incoming"
    KG_ENTITIES ||--o{ EVENT_ENTITY_MENTIONS : "mentioned in"
    EVENTS ||--o{ EVENT_ENTITY_MENTIONS : "contains"
```
