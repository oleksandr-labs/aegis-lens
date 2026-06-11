-- v1.2.0 — AOI monitoring and case management tables

-- ── Areas of Interest ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aois (
    aoi_id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id          TEXT        NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    user_id         TEXT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    description     TEXT,
    -- PostGIS polygon geometry (SRID 4326)
    geom            GEOMETRY(Polygon, 4326) NOT NULL,
    -- Alert thresholds
    min_severity    SMALLINT    NOT NULL DEFAULT 1 CHECK (min_severity BETWEEN 1 AND 5),
    alert_classes   TEXT[]      NOT NULL DEFAULT ARRAY['drone','missile','airstrike'],
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    -- Notification settings
    notify_email    BOOLEAN     NOT NULL DEFAULT true,
    notify_telegram BOOLEAN     NOT NULL DEFAULT false,
    notify_slack    BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aois_geom_idx ON aois USING GIST (geom);
CREATE INDEX IF NOT EXISTS aois_org_idx  ON aois (org_id, is_active);

ALTER TABLE aois ENABLE ROW LEVEL SECURITY;
CREATE POLICY aois_org_isolation ON aois
    USING (org_id = current_org_id());

-- ── Cases ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
    case_id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id          TEXT        NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    description     TEXT,
    status          TEXT        NOT NULL DEFAULT 'open'
                                CHECK (status IN ('open','in_progress','resolved','closed','archived')),
    priority        SMALLINT    NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    assigned_to     TEXT        REFERENCES users(user_id),
    event_ids       TEXT[]      NOT NULL DEFAULT '{}',
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    created_by      TEXT        NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS cases_org_idx    ON cases (org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS cases_assign_idx ON cases (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS cases_tags_idx   ON cases USING GIN (tags);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY cases_org_isolation ON cases
    USING (org_id = current_org_id());

-- ── Case Comments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_comments (
    comment_id  TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id     TEXT        NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    user_id     TEXT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    body        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_comments_case_idx ON case_comments (case_id, created_at DESC);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON aois, cases, case_comments TO aegis_app;
GRANT SELECT ON aois, cases, case_comments TO aegis_readonly;
