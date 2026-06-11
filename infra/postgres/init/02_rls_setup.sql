-- Row-Level Security setup for multi-tenancy
-- Applied to all tenant-scoped tables.

-- Helper: get current org ID from session variable (set by app before each query)
CREATE OR REPLACE FUNCTION current_org_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_org_id', true);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: get current user ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_id', true);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Application role (used by the API server — NOT superuser)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aegis_app') THEN
    CREATE ROLE aegis_app LOGIN;
  END IF;
END
$$;

-- Read-only replica role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aegis_readonly') THEN
    CREATE ROLE aegis_readonly LOGIN;
  END IF;
END
$$;

-- Migration role (has full DDL access but is not the superuser)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aegis_migrate') THEN
    CREATE ROLE aegis_migrate LOGIN CREATEROLE;
  END IF;
END
$$;
