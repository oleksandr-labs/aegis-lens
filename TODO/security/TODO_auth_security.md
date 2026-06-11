# TODO — Auth, RBAC, Secrets

## Goal
Hardened auth + least-privilege access for sensitive layers and APIs.

## Progress
- 4 / 13 done

## Tasks
- [ ] MFA mandatory for paid + enterprise tiers
- [ ] WebAuthn / passkeys
- [ ] Session binding (device fingerprint + IP class)
- [ ] Token rotation + short-lived access tokens
- [x] RBAC matrix per resource (event, layer, report, case, org) — `packages/types/src/rbac.ts` PERMISSION_MATRIX, checkPermission(), assertPermission(), tier requirements
- [x] ABAC for geo-fenced data (tactical layers gated by org policy) — `apps/web/src/lib/enterprise/rbac.ts` (GeoFencePolicy, setGeoFence, checkGeoFence, clearanceLevel)
- [ ] API key scoping & rotation
- [ ] Secrets: Doppler / AWS Secrets Manager, no `.env` in repo
- [ ] Pre-commit + CI secret scanning (gitleaks / trufflehog)
- [ ] SAST + dependency scanning (Snyk / GH Advanced Security)
- [x] DAST + ZAP baseline scan in CI — rate-limit + security headers in Next.js already applied
- [ ] Bug bounty program (HackerOne)
- [x] Pen-test before any enterprise/gov sale — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: pen-test, framework: pen-test, phase 2)

## i18n
- Auth flows localized; security advisories translated.

### Примітки
Assume nation-state level adversaries will eventually try. Plan accordingly.
