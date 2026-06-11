# TODO — Email Lifecycle & Marketing

## Goal
Email as a primary growth + retention channel: transactional, lifecycle, newsletter, briefs.

## Progress
- 8 / 14 done

## Tasks

### Transactional
- [x] Auth: verification, magic link, password reset, MFA recovery — apps/web/src/lib/email/lifecycle/transactional-templates.ts
- [x] Billing: receipts, invoices, dunning — apps/web/src/lib/email/lifecycle/transactional-templates.ts (invoice-paid, subscription-*)
- [ ] Security: new device, password change, suspicious activity
- [x] Alert delivery: critical, daily digest, weekly digest — apps/web/src/lib/email/lifecycle/transactional-templates.ts + lifecycle-types.ts

### Lifecycle
- [x] Welcome series (per persona, 3–5 emails over 14 days) — apps/web/src/lib/email/lifecycle/onboarding-sequence.ts
- [x] Activation nudges (filter not created, alert not configured, watchlist empty) — apps/web/src/lib/email/lifecycle/lifecycle-types.ts (triggers)
- [x] Re-engagement (14d, 30d, 60d inactive) — apps/web/src/lib/email/lifecycle/lifecycle-types.ts (inactive triggers)
- [x] Trial → paid conversion sequence — apps/web/src/lib/email/lifecycle/transactional-templates.ts (trial-starting/ending) + onboarding-sequence.ts (day-14 upgrade)
- [ ] Pro → enterprise expansion sequence (usage-triggered)
- [ ] Churn risk early-warning sequence

### Editorial
- [x] Weekly intelligence brief (Mondays) — apps/web/src/lib/email/lifecycle/editorial-digest.ts (EDITORIAL_DIGEST_CONFIG, Tuesday 10:00 UTC)
- [x] Monthly deep dive — apps/web/src/lib/email/lifecycle/editorial-digest.ts (MONTHLY_DEEP_DIVE_CONFIG)
- [x] Region briefs (opt-in per region) — apps/web/src/lib/email/lifecycle/editorial-digest.ts (buildRegionBriefConfig, 6 regions)
- [ ] Press briefing (separate list)

### Infra
- [ ] Resend / Postmark for transactional
- [ ] Customer.io / Loops for lifecycle
- [ ] DMARC / DKIM / SPF + BIMI
- [ ] Bounce / complaint handling
- [ ] One-click unsubscribe (RFC 8058)
- [ ] Per-locale templates

## i18n
- All email localized; subject + preview text + body.

### Примітки
Email = the most under-rated growth channel for this audience. Brief subscribers convert.
