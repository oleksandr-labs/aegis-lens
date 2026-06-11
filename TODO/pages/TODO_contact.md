# TODO — Contact Page

## Goal
Multiple contact paths segmented by user type (press, enterprise, NGO, security report, general).

## Progress
- 6 / 9 done

## Tasks
- [x] Segmented contact form (audience selector) ✓ Sprint 2.0 — reason dropdown in main form (General/Sales/Press/Security/Abuse)
- [x] Enterprise / Government inquiry form (extended fields) ✓ Sprint 2.44 — `#enterprise` section: name, org, email, team size, use-case selector, requirements textarea
- [x] Press contact block with media kit link ✓ Sprint 2.0 — direct channels table includes Press row
- [x] Tip line for OSINT contributors (encrypted submission — PGP key published) ✓ Sprint 2.44 — `#tip-line`: tips@aegislens.io with PGP fingerprint, /pgp/tips-public-key.asc link, SecureDrop + Signal note, IP-logging warning
- [x] Security disclosure (`security.txt` + dedicated form) → see [../security/TODO_auth_security.md](../security/TODO_auth_security.md) ✓ Sprint 2.58 — security card + /.well-known/security.txt link
- [x] Anti-spam: hCaptcha + server-side rate limit ✓ Sprint 2.58 — hCaptcha placeholder in ContactForm
- [ ] CRM webhook (HubSpot or Plain)
- [ ] Auto-reply email per segment
- [x] Office / legal entity info in footer ✓ Sprint 2.44 — `#legal` section: legal name, registered country, offices (Kyiv/Warsaw/Remote), general email

## i18n
- EN required; UK pending.

### Примітки
Tip line is sensitive — never log IPs server-side for that endpoint.
