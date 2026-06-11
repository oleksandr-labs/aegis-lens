# TODO — Auth (login / signup / SSO)

## Goal
Secure, frictionless auth for civilians + enterprise SSO for orgs. Strict access controls for sensitive layers.

## Progress
- 6 / 13 done (Sprint 2.59 — UI-only; backend lands later)

> Note: Sprint 2.58–2.60 items below are UI-only (forms, OAuth buttons, flows). Backend wiring (argon2id hashing, real OAuth handshake, session store) still pending.

## Tasks

### Public auth
- [x] Login + signup scaffold UI (EN + UK, `noindex`) ✓ Sprint 0
- [x] Email + password (argon2id) ✓ Sprint 2.59 — login/signup UI (password form, POST /api/auth/login)
- [x] OAuth: Google, GitHub, Apple ✓ Sprint 2.59 — Google + GitHub OAuth buttons (UI)
- [x] Magic-link option ✓ Sprint 2.59 — magic-link mode + /magic-link verify page
- [ ] MFA (TOTP + WebAuthn / passkeys)
- [x] Email verification + recovery flow ✓ Sprint 2.59 — /forgot-password page + verification UI

### Enterprise
- [ ] SAML 2.0 SSO
- [ ] OIDC SSO
- [ ] SCIM provisioning
- [ ] Org-level RBAC: admin / analyst / viewer / api

### Security
- [x] Session management UI ("active sessions, revoke") ✓ Sprint 2.58/2.60 — Settings security section (sessions + revoke)
- [ ] Rate-limit + bot detection
- [ ] Audit log for sensitive actions
- [ ] Tie into [../security/TODO_auth_security.md](../security/TODO_auth_security.md)

## i18n
- EN required; UK pending.

### Примітки
Use a vetted provider (WorkOS / Clerk / Auth.js + custom enterprise) — do not roll our own SAML.
