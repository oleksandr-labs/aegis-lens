-- Migration: Row-Level Security for multi-tenancy
-- Run after initial schema is created.
-- Enforces org_id isolation on all tenant-scoped tables.

-- Enable RLS
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_delivery_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aois ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- App role (used by application connections)
DO $$ BEGIN
  CREATE ROLE app_user;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS policies: app_user can only see rows for their current org
-- The app sets the tenant via: SET LOCAL app.current_org_id = '<uuid>';

-- Orgs: users can see their own org
CREATE POLICY org_isolation ON orgs
  FOR ALL TO app_user
  USING (org_id::text = current_setting('app.current_org_id', true));

-- Org members
CREATE POLICY org_member_isolation ON org_members
  FOR ALL TO app_user
  USING (org_id::text = current_setting('app.current_org_id', true));

-- Teams
CREATE POLICY team_isolation ON teams
  FOR ALL TO app_user
  USING (org_id::text = current_setting('app.current_org_id', true));

-- Team members
CREATE POLICY team_member_isolation ON team_members
  FOR ALL TO app_user
  USING (team_id IN (
    SELECT team_id FROM teams
    WHERE org_id::text = current_setting('app.current_org_id', true)
  ));

-- Projects
CREATE POLICY project_isolation ON projects
  FOR ALL TO app_user
  USING (org_id::text = current_setting('app.current_org_id', true));

-- Alert rules
CREATE POLICY alert_rule_isolation ON alert_rules
  FOR ALL TO app_user
  USING (
    org_id::text = current_setting('app.current_org_id', true)
    OR org_id IS NULL AND user_id = current_setting('app.current_user_id', true)
  );

-- Alert delivery log (inherits from alert_rules)
CREATE POLICY alert_delivery_isolation ON alert_delivery_log
  FOR ALL TO app_user
  USING (rule_id IN (
    SELECT rule_id FROM alert_rules
    WHERE org_id::text = current_setting('app.current_org_id', true)
  ));

-- AOIs
CREATE POLICY aoi_isolation ON aois
  FOR ALL TO app_user
  USING (
    org_id::text = current_setting('app.current_org_id', true)
    OR (org_id IS NULL AND user_id = current_setting('app.current_user_id', true))
  );

-- Cases
CREATE POLICY case_isolation ON cases
  FOR ALL TO app_user
  USING (
    org_id::text = current_setting('app.current_org_id', true)
    OR (org_id IS NULL AND created_by = current_setting('app.current_user_id', true))
  );

-- Saved searches
CREATE POLICY saved_search_isolation ON saved_searches
  FOR ALL TO app_user
  USING (
    org_id = current_setting('app.current_org_id', true)
    AND (user_id = current_setting('app.current_user_id', true) OR is_shared = true)
  );

-- Webhook endpoints
CREATE POLICY webhook_endpoint_isolation ON webhook_endpoints
  FOR ALL TO app_user
  USING (org_id = current_setting('app.current_org_id', true));

-- Webhook deliveries (via endpoint)
CREATE POLICY webhook_delivery_isolation ON webhook_deliveries
  FOR ALL TO app_user
  USING (endpoint_id IN (
    SELECT endpoint_id FROM webhook_endpoints
    WHERE org_id = current_setting('app.current_org_id', true)
  ));

-- Service role bypasses RLS (for migrations and internal services)
DO $$ BEGIN
  CREATE ROLE service_role BYPASSRLS;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
