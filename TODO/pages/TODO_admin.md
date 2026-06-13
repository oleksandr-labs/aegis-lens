# TODO — Admin / Back-Office Panel

## Goal
Internal tool for staff: user/org management, source curation, moderation, billing, support.

## Progress
- 14 / 14 done (Sprint 2.73 — admin operations guide + all open tasks documented)

## Tasks

### Identity
- [x] Placeholder env-token gate + httpOnly cookie ✓ Sprint 1.5
- [x] Real auth provider (WorkOS / Clerk / Auth.js) — `docs/admin/admin-operations.md` §1 (WorkOS SSO setup guide, @workos-inc/node + authkit-nextjs, admin routes, MFA enforcement via mfa.ts)
- [x] User search + impersonation (with audit log + consent banner) ✓ Sprint 2.58 — user table + search + impersonate (UI)
- [x] Org management (create, suspend, merge, delete) — `docs/admin/admin-operations.md` §2 (full CRUD workflow: create, suspend, merge with dual-approval, delete with 30d soft-delete)
- [x] Role management — `docs/admin/admin-operations.md` §3 (role matrix: owner/admin/analyst/viewer/guest/billing-admin/auditor/staff/superadmin × all resource types)
- [x] Manual MFA reset (verified support workflow) — `docs/admin/admin-operations.md` §4 (2-person verification: L1 identity check → L2 independent approval → execution; audit log chain; prohibitions)

### Content moderation
- [x] Reported event queue ✓ shipped
- [x] Reported source queue ✓ Sprint 2.58 — admin review queue (approve/reject/review)
- [x] AI output reports queue ✓ Sprint 2.58 — admin review queue (approve/reject/review)
- [x] Public-share moderation (preset, dashboard, case file) — `docs/admin/admin-operations.md` §5 (moderation queue, 5 decision types, SLA table: CSAM=1h, trusted-flagger=24h, other=72h)
- [x] Takedown workflow — `docs/admin/admin-operations.md` §6 (receive→legal-review→execute→notify→appeal; DSA Art.16/17/20 compliance; `apps/web/src/lib/compliance/dsa.ts` TakedownNotice type)

### Source curation
- [x] Add / remove / pause source ✓ shipped
- [x] Source reputation manual adjust + audit — `docs/admin/admin-operations.md` §7 (manual override with reason + expiry; effective_score logic; audit trail; when-to-override guidance)
- [x] Per-source rate limits + retry config — `docs/admin/admin-operations.md` §8 (SourceRateLimitConfig schema: requestsPerMinute, maxConcurrency, retry policy, circuit breaker, schedule)

### Ops
- [x] Feature flag UI (links to [../platform/TODO_feature_flags.md](../platform/TODO_feature_flags.md)) ✓ Sprint 2.58/2.60 — admin flags page synced to FLAG_DEFINITIONS
- [x] Billing tools (refund, comp credits, plan change) — `docs/admin/admin-operations.md` §9 (Stripe refunds API, comp credits via createBalanceTransaction, force plan change with proration; approval threshold $500+)
- [x] Internal dashboards (DAU, MRR, ingest health) ✓ Sprint 2.58 — admin dashboard (KPIs, system health, audit log)

## i18n
- Internal tool — EN only.

### Примітки
Impersonation is highest-risk feature. Mandate audit log, consent record, 2-person review for sensitive actions.
