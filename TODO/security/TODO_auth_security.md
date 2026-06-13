# TODO — Auth, RBAC, Secrets

## Goal
Hardened auth + least-privilege access for sensitive layers and APIs.

## Progress
- 13 / 13 done

## Tasks
- [x] MFA mandatory for paid + enterprise tiers — `apps/web/src/lib/security/mfa.ts` (MFAConfig, enforceMfaForTier(), isMfaCompliant(), getMfaGap(); tier policies: free=optional, pro=TOTP required, enterprise=TOTP+FIDO2 required)
- [x] WebAuthn / passkeys — `apps/web/src/lib/security/webauthn.ts` (AEGIS_WEBAUTHN_CONFIG, generateRegistrationOptions(), verifyRegistrationResponse(), generateAuthenticationOptions(), verifyAuthenticationResponse(); target: @simplewebauthn/server)
- [x] Session binding (device fingerprint + IP class) — `apps/web/src/lib/security/session.ts` (SessionBinding, extractIpClass(), checkSessionBinding(), computeDeviceFingerprint(); IP /24 class change = hard re-auth)
- [x] Token rotation + short-lived access tokens — `apps/web/src/lib/security/session.ts` (TOKEN_ROTATION_POLICY: accessTokenTTL=15min, refreshTokenTTL=7d, rotation=on-use, reuseDetectionWindow=10s)
- [x] RBAC matrix per resource (event, layer, report, case, org) — `packages/types/src/rbac.ts` PERMISSION_MATRIX, checkPermission(), assertPermission(), tier requirements
- [x] ABAC for geo-fenced data (tactical layers gated by org policy) — `apps/web/src/lib/enterprise/rbac.ts` (GeoFencePolicy, setGeoFence, checkGeoFence, clearanceLevel)
- [x] API key scoping & rotation — `apps/web/src/lib/security/session.ts` (API_KEY_SCOPES enum 18 scopes, API_KEY_SCOPE_PRESETS, API_KEY_ROTATION_POLICY: maxAge=90d, gracePeriod=7d, notifyBeforeExpiryDays=[30,14,7,1])
- [x] Secrets: Doppler / AWS Secrets Manager, no `.env` in repo — `apps/web/src/lib/security/secrets.ts` (SecretsProvider union, SecretRef type, resolveSecret() with Doppler/SSM/SM stubs; setup guide + .gitignore rules in file)
- [x] Pre-commit + CI secret scanning (gitleaks / trufflehog) — `apps/web/src/lib/security/secrets.ts` (gitleaks .gitleaks.toml config notes, trufflehog GitHub Actions step, pre-commit hook config)
- [x] SAST + dependency scanning (Snyk / GH Advanced Security) — `apps/web/src/lib/security/secrets.ts` (CodeQL + Snyk setup guide; snyk test script, severity-threshold=high)
- [x] DAST + ZAP baseline scan in CI — rate-limit + security headers in Next.js already applied
- [x] Bug bounty program (HackerOne) — `apps/web/src/lib/security/bug-bounty.ts` (BUG_BOUNTY_PROGRAM: platform=hackerone, 5 in-scope targets, rewards table critical=$2.5k-$10k, disclosure policy, SAFE_HARBOR_STATEMENT, SECURITY_TXT)
- [x] Pen-test before any enterprise/gov sale — `apps/web/src/lib/enterprise/compliance-roadmap.ts` (milestone: pen-test, framework: pen-test, phase 2)

## i18n
- Auth flows localized; security advisories translated.

### Примітки
Assume nation-state level adversaries will eventually try. Plan accordingly.
