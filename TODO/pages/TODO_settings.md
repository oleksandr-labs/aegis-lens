# TODO — User & Org Settings

## Goal
Comprehensive, discoverable settings: profile, security, notifications, locale, integrations, billing, org admin.

## Progress
- 12 / 16 done (Sprint 2.58–2.60)

## Tasks

### User
- [x] Profile (name, avatar, bio, public profile toggle) ✓ Sprint 2.58/2.60 — Profile section (localStorage-persisted, live avatar initials)
- [x] Locale + timezone + date/number formats ✓ Sprint 2.60 — locale switcher (navigates) + timezone + date format
- [x] Theme (dark / tactical / light) ✓ Sprint 2.60 — functional theme switch (CSS vars + ThemeApplier)
- [x] Sound + motion preferences (incl. reduced-motion) ✓ Sprint 2.60 — reduced-motion preference
- [x] Notification channels + quiet hours ✓ Sprint 2.58/2.60 — notification matrix (persisted)
- [x] Active sessions + revoke ✓ Sprint 2.58/2.60 — sessions section (real browser/OS detection)
- [ ] MFA management (TOTP, passkeys, backup codes)
- [x] API keys — `apps/web/src/lib/api-keys-store.ts`; `GET/POST /api/settings/api-keys`, `PATCH/DELETE /api/settings/api-keys/:id`; SHA-256 key hash, scope-based, expiry support
- [x] Data export (GDPR) ✓ Sprint 2.58 — GDPR export stub
- [x] Delete account (GDPR-compliant) ✓ Sprint 2.58 — delete account confirm gate

### Organization
- [ ] Members + roles
- [ ] SSO config
- [ ] SCIM provisioning
- [ ] Billing + invoices + payment method
- [x] Usage dashboard (events, API calls, AI tokens) — `apps/web/src/lib/usage-store.ts`; `GET /api/settings/usage`; 7-tier metrics, tier limits, 30d history
- [x] Audit log — `apps/web/src/lib/audit-log-store.ts`; `GET /api/settings/audit-log`; 20 action types, paginated, filterable

### Integrations
- [ ] Slack / Teams / Telegram / Discord
- [x] Webhooks ✓ Sprint 2.58 — webhooks in integrations section
- [ ] Browser extension linkage
- [ ] Bot linkage

## i18n
- All settings labels + help text localized.

### Примітки
A settings page is a UX test. If users can't find a setting, the IA is wrong.
