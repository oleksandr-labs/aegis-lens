# TODO — Multi-Tenancy & Org Model

## Goal
Clean isolation between orgs; teams + projects within orgs; predictable scaling and pricing.

## Progress
- 5 / 12 done

## Tasks

### Model
- [x] Tenant = Org (UUID); contains Users (members), Teams (sub-groups), Projects (case spaces) — `packages/db/src/schema/orgs.ts` (orgs, orgMembers, teams, teamMembers, projects tables)
- [x] Per-org settings: SSO, RBAC, billing, retention, locale defaults — orgs table: ssoConfig JSONB, retentionDays, defaultLocale, tier, branding JSONB
- [x] Per-team RBAC overlay — teams.roleOverrides JSONB
- [x] Per-project access rules — projects.memberRoles JSONB (per-user role overrides)

### Data isolation
- [x] Row-level security in Postgres (`org_id` everywhere) — `packages/db/migrations/0001_row_level_security.sql`
- [ ] Per-org Elastic / Qdrant collections (or strict filter discipline)
- [ ] Per-org S3 prefixes + lifecycle policies
- [ ] Per-org encryption keys (KMS, customer-managed for enterprise)

### Sharing across tenants
- [ ] Public objects (presets, dashboards, reports) opt-in
- [ ] Cross-org collaboration invites
- [ ] Audit log on every cross-org access

### Lifecycle
- [ ] Org create / suspend / delete with retention rules
- [ ] Merge / split orgs (rare, with strong audit)

## i18n
- Each org sets default locale; users may override.

### Примітки
Get tenant isolation right on day one. Backfilling row-level security is pain.
