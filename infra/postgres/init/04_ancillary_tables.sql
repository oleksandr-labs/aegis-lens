-- Ancillary tables: orgs, users, memberships, sources

-- ── Organisations ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orgs (
    org_id      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL,
    tier        TEXT NOT NULL DEFAULT 'free'
                CHECK (tier IN ('free','pro','enterprise','public')),
    plan_id     TEXT,                    -- Stripe price ID
    customer_id TEXT,                    -- Stripe customer ID
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    avatar_url  TEXT,
    locale      TEXT NOT NULL DEFAULT 'en',
    timezone    TEXT NOT NULL DEFAULT 'Europe/Kyiv',
    persona     TEXT,
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Org Memberships ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_members (
    org_id      TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('owner','admin','editor','analyst','viewer','guest')),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (org_id, user_id)
);

-- ── Sources ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sources (
    source_id       TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,   -- telegram_channel, rss, api, scraper
    country         TEXT,
    language        TEXT,
    reliability     REAL DEFAULT 0.7 CHECK (reliability BETWEEN 0 AND 1),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_fetched_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── API Keys ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
    key_id      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    org_id      TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    key_hash    TEXT NOT NULL UNIQUE,
    key_suffix  TEXT NOT NULL,
    scopes      TEXT[] NOT NULL DEFAULT ARRAY['events:read'],
    is_active   BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys (user_id);
CREATE INDEX IF NOT EXISTS api_keys_hash_idx ON api_keys (key_hash) WHERE is_active;

-- RLS on user tables
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members_isolation ON org_members
    USING (org_id = current_org_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON orgs, users, org_members, sources, api_keys TO aegis_app;
GRANT SELECT ON orgs, users, org_members, sources, api_keys TO aegis_readonly;
