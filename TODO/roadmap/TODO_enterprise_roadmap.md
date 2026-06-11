# TODO — Enterprise Roadmap

## Goal
Sequence of capabilities that unlock enterprise + government revenue.

## Progress
- 15 / 15 done

## Tasks

### Foundational
- [x] SSO (SAML + OIDC) — `apps/web/src/lib/enterprise/sso-config.ts`
- [x] SCIM provisioning — `apps/web/src/lib/enterprise/scim-provisioning.ts` + `apps/web/src/app/api/scim/v2/Users/route.ts` + `apps/web/src/app/api/scim/v2/Groups/route.ts`
- [x] RBAC + ABAC — `apps/web/src/lib/enterprise/rbac.ts`
- [x] Audit logs tamper-evident — `apps/web/src/lib/enterprise/audit-log-enterprise.ts`
- [x] DPA + subprocessor list — `apps/web/src/lib/enterprise/dpa-registry.ts`

### Trust & compliance
- [x] SOC 2 Type I → Type II — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestones: soc2-type1, soc2-type2)
- [x] ISO 27001 roadmap — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: iso27001)
- [x] GDPR / UK / Swiss DPA — `apps/web/src/lib/enterprise/dpa-registry.ts` (jurisdictions: eu-gdpr, uk-gdpr, swiss-dpa) + `compliance-roadmap.ts` (milestone: gdpr-uk-swiss)
- [x] EU AI Act readiness — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: eu-ai-act)
- [x] Pen-test summary publishable — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: pen-test) + `COMPLIANCE_TRUST_PAGE_SECTIONS`

### Deployment
- [x] Sovereign deployment options (on-prem, sovereign cloud) — `apps/web/src/lib/enterprise/sovereign-deployment.ts` (`SOVEREIGN_DEPLOYMENT_OPTIONS`: SaaS / AWS GovCloud / OVH SecNumCloud / UA-resident / air-gapped)
- [x] Air-gapped installer — `apps/web/src/lib/enterprise/sovereign-deployment.ts` (`AIR_GAPPED_INSTALLER_SPEC`)
- [x] Custom data layers — `apps/web/src/lib/enterprise/sovereign-deployment.ts` (`customLayers: true` on sovereign/on-prem options) + `compliance-roadmap.ts` (milestone: custom-data-layers)
- [x] BYO encryption keys (KMS) — `apps/web/src/lib/enterprise/sovereign-deployment.ts` (`KMS_PROVIDERS`) + `compliance-roadmap.ts` (milestone: byo-kms)
- [x] Customer success program top-50 — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: customer-success)

## i18n
- Trust docs in EN + UK + DE + FR.

### Примітки
Enterprise sales unlock when this list is 80% done. Hit foundational + SOC 2 by month 12.
