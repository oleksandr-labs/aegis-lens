-- Core events table with PostGIS + TimescaleDB hypertable
-- Partitioned by occurred_at (monthly chunks).

CREATE TABLE IF NOT EXISTS events (
    event_id        TEXT        NOT NULL,
    source_id       TEXT        NOT NULL,
    external_id     TEXT,
    class           TEXT        NOT NULL,
    subclass        TEXT,

    -- Geometry (PostGIS POINT, SRID 4326)
    geom            GEOMETRY(Point, 4326),
    lat             DOUBLE PRECISION,
    lon             DOUBLE PRECISION,

    country         TEXT,
    region_code     TEXT,       -- ISO 3166-2

    severity        SMALLINT    NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
    confidence      REAL        NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
    danger_score    SMALLINT    GENERATED ALWAYS AS (
                        GREATEST(0, LEAST(100,
                            (severity::numeric / 5.0 * 40 + confidence * 30)::int
                        ))
                    ) STORED,

    -- Verification
    verification_state TEXT     NOT NULL DEFAULT 'unverified'
                                CHECK (verification_state IN ('unverified','in_review','verified','disputed','retracted')),

    -- Timestamps
    occurred_at     TIMESTAMPTZ NOT NULL,
    ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Content
    title_en        TEXT,
    title_uk        TEXT,
    summary_en      TEXT,
    summary_uk      TEXT,
    media_urls      TEXT[],
    source_urls     TEXT[],

    -- Multi-tenancy
    org_id          TEXT        NOT NULL,
    is_public       BOOLEAN     NOT NULL DEFAULT true,

    -- Retraction
    is_retracted    BOOLEAN     NOT NULL DEFAULT false,
    retracted_at    TIMESTAMPTZ,
    retraction_reason TEXT,

    -- Raw ingest payload
    raw_payload     JSONB,

    CONSTRAINT events_pkey PRIMARY KEY (event_id, occurred_at)
) PARTITION BY RANGE (occurred_at);

-- Convert to TimescaleDB hypertable (monthly chunks)
SELECT create_hypertable(
    'events',
    'occurred_at',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS events_geom_idx      ON events USING GIST (geom);
CREATE INDEX IF NOT EXISTS events_class_idx     ON events (class, severity, occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_country_idx   ON events (country, region_code, occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_org_idx       ON events (org_id, is_public, occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_source_idx    ON events (source_id, ingested_at DESC);
CREATE INDEX IF NOT EXISTS events_trgm_en_idx   ON events USING GIN (to_tsvector('english', coalesce(title_en,'') || ' ' || coalesce(summary_en,'')));
CREATE INDEX IF NOT EXISTS events_trgm_uk_idx   ON events USING GIN (to_tsvector('simple',  coalesce(title_uk,'') || ' ' || coalesce(summary_uk,'')));

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_org_isolation ON events
    USING (org_id = current_org_id() OR is_public = true);

GRANT SELECT, INSERT, UPDATE ON events TO aegis_app;
GRANT SELECT ON events TO aegis_readonly;
