# TODO — Cookie Consent Management

## Tasks
- [x] Consent management platform (Cookiebot / Osano / custom) ✓ Sprint 2.2 (custom — CookieConsent.tsx + lib/consent.ts)
- [x] Per-category opt-in (necessary / functional / analytics / marketing) ✓ Sprint 2.2 (essential / analytics only)
- [x] Geo-aware default (EU strict; US strict for CCPA states) — apps/web/src/lib/compliance/cookie-consent-policy.ts (GEO_CONSENT_DEFAULTS)
- [x] No pre-checked boxes ✓ Sprint 2.2
- [x] Reject-all easy as accept-all ✓ Sprint 2.2 ("Essential only" parallel to "Accept all")
- [x] Per-locale UI — apps/web/src/lib/compliance/cookie-consent-policy.ts (CONSENT_LOCALE_UI)
- [x] Consent audit log — apps/web/src/lib/compliance/cookie-consent-policy.ts (ConsentAuditRecord, CONSENT_AUDIT_LOG_RETENTION_EN)
- [x] Annual cookie inventory audit — apps/web/src/lib/compliance/cookie-consent-policy.ts (COOKIE_INVENTORY_AUDIT)
