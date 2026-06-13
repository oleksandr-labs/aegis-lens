# TODO — Multi-Tenancy & Org Model

## Goal
Clean isolation between orgs; teams + projects within orgs; predictable scaling and pricing.

## Progress
- 12 / 12 done

## Tasks

### Model
- [x] Tenant = Org (UUID); contains Users (members), Teams (sub-groups), Projects (case spaces) — `packages/db/src/schema/orgs.ts` (orgs, orgMembers, teams, teamMembers, projects tables)
- [x] Per-org settings: SSO, RBAC, billing, retention, locale defaults — orgs table: ssoConfig JSONB, retentionDays, defaultLocale, tier, branding JSONB
- [x] Per-team RBAC overlay — teams.roleOverrides JSONB
- [x] Per-project access rules — projects.memberRoles JSONB (per-user role overrides)

### Data isolation
- [x] Row-level security in Postgres (`org_id` everywhere) — `packages/db/migrations/0001_row_level_security.sql`
- [x] Per-org Elastic / Qdrant collections (or strict filter discipline) — `apps/web/src/lib/multitenancy/isolation.ts`: `resolveQdrantStrategy()` — enterprise → dedicated collection `aegis_org_{id}`, others → shared collection with `org_id` filter; `getOrgIsolationStrategy()` selects per-tier
- [x] Per-org S3 prefixes + lifecycle policies — `apps/web/src/lib/multitenancy/isolation.ts`: `resolveS3Config()` prefix `{env}/{org_id}/{dataClass}/`, `S3_LIFECYCLE_RULES` (raw:5y/Glacier@1y, processed:2y/Glacier@6m, temp:7d)
- [x] Per-org encryption keys (KMS, customer-managed for enterprise) — `apps/web/src/lib/multitenancy/isolation.ts`: `getEncryptionKeyArn()` enterprise → CMK alias `alias/aegis-org-{id}`, others → shared key; `validateCmkExists()`

### Sharing across tenants
- [x] Public objects (presets, dashboards, reports) opt-in — `apps/web/src/lib/multitenancy/sharing.ts`: `PublicObjectPolicy` with per-type allow flags + `requireOrgAdminApproval`; `DEFAULT_PUBLIC_OBJECT_POLICY`
- [x] Cross-org collaboration invites — `apps/web/src/lib/multitenancy/sharing.ts`: `CrossOrgInvite`, `createCrossOrgInvite()`, `acceptCrossOrgInvite()`, `revokeCrossOrgInvite()`; scoped access token minted on acceptance
- [x] Audit log on every cross-org access — `apps/web/src/lib/multitenancy/sharing.ts`: `CrossOrgAccessLog`, `logCrossOrgAccess()`, `queryCrossOrgAuditLog()` with filters by org/resource/requester/action

### Lifecycle
- [x] Org create / suspend / delete with retention rules — `apps/web/src/lib/multitenancy/lifecycle.ts`: `OrgLifecycleStatus` (active|suspended|pending_deletion|deleted); `suspendOrg()`, `reactivateOrg()`, `requestOrgDeletion()` (30-day grace), `cancelOrgDeletion()`, `finalizeOrgDeletion()` (anonymize PII → delete events → audit); `assertOrgActive()` login guard; full `LifecycleAuditEntry` log
- [x] Merge / split orgs (rare, with strong audit) — `apps/web/src/lib/multitenancy/lifecycle.ts`: `OrgMergeRequest` + `createOrgMergeRequest()` / `approveMergeRequest()` / `executeOrgMerge()` (≥2 approvers required); `OrgSplitRequest` + `createOrgSplitRequest()` / `approveSplitRequest()` / `executeOrgSplit()` (carve out members + resources into new org); dual audit log on both orgs

## i18n
- Each org sets default locale; users may override.

### Примітки
Get tenant isolation right on day one. Backfilling row-level security is pain.
