-- v1.3.0 — Notebooks and webhook delivery tables

-- ── Notebooks ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notebooks (
    notebook_id     TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id          TEXT        NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    owner_id        TEXT        NOT NULL REFERENCES users(user_id),
    title           TEXT        NOT NULL,
    slug            TEXT        UNIQUE,
    status          TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft','published','archived')),
    is_public       BOOLEAN     NOT NULL DEFAULT false,
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    cells           JSONB       NOT NULL DEFAULT '[]',
    scheduled_run_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notebooks_org_idx    ON notebooks (org_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS notebooks_public_idx ON notebooks (is_public, updated_at DESC) WHERE is_public;
CREATE INDEX IF NOT EXISTS notebooks_tags_idx   ON notebooks USING GIN (tags);

ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY notebooks_org_isolation ON notebooks
    USING (org_id = current_org_id() OR is_public = true);

-- ── Notebook Versions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notebook_versions (
    version_id      TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    notebook_id     TEXT        NOT NULL REFERENCES notebooks(notebook_id) ON DELETE CASCADE,
    version_number  INTEGER     NOT NULL,
    cells_snapshot  JSONB       NOT NULL,
    created_by      TEXT        NOT NULL REFERENCES users(user_id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (notebook_id, version_number)
);

CREATE INDEX IF NOT EXISTS notebook_versions_nb_idx ON notebook_versions (notebook_id, version_number DESC);

-- ── Webhook Endpoints ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    endpoint_id     TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id          TEXT        NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    user_id         TEXT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    url             TEXT        NOT NULL,
    secret_hash     TEXT        NOT NULL,
    events          TEXT[]      NOT NULL DEFAULT '{}',
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count   INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhooks_org_idx ON webhook_endpoints (org_id, is_active);

ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhooks_org_isolation ON webhook_endpoints
    USING (org_id = current_org_id());

-- ── Webhook Delivery Log ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    delivery_id     TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    endpoint_id     TEXT        NOT NULL REFERENCES webhook_endpoints(endpoint_id) ON DELETE CASCADE,
    event_type      TEXT        NOT NULL,
    payload         JSONB       NOT NULL,
    http_status     INTEGER,
    response_body   TEXT,
    attempt_number  INTEGER     NOT NULL DEFAULT 1,
    delivered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    success         BOOLEAN     NOT NULL
) PARTITION BY RANGE (delivered_at);

SELECT create_hypertable('webhook_deliveries', 'delivered_at', chunk_time_interval => INTERVAL '1 month', if_not_exists => TRUE);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON notebooks, notebook_versions, webhook_endpoints, webhook_deliveries TO aegis_app;
GRANT SELECT ON notebooks, notebook_versions, webhook_endpoints, webhook_deliveries TO aegis_readonly;
