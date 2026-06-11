# TODO — Admin / Back-Office Panel

## Goal
Internal tool for staff: user/org management, source curation, moderation, billing, support.

## Progress
- 6 / 14 done (Sprint 2.58 — admin UI: user table, review queues, flags, dashboards)

## Tasks

### Identity
- [x] Placeholder env-token gate + httpOnly cookie ✓ Sprint 1.5
- [ ] Real auth provider (WorkOS / Clerk / Auth.js)
- [x] User search + impersonation (with audit log + consent banner) ✓ Sprint 2.58 — user table + search + impersonate (UI)
- [ ] Org management (create, suspend, merge, delete)
- [ ] Role management
- [ ] Manual MFA reset (verified support workflow)

### Content moderation
- [x] Reported event queue ✓ shipped
- [x] Reported source queue ✓ Sprint 2.58 — admin review queue (approve/reject/review)
- [x] AI output reports queue ✓ Sprint 2.58 — admin review queue (approve/reject/review)
- [ ] Public-share moderation (preset, dashboard, case file)
- [ ] Takedown workflow

### Source curation
- [x] Add / remove / pause source ✓ shipped
- [ ] Source reputation manual adjust + audit
- [ ] Per-source rate limits + retry config

### Ops
- [x] Feature flag UI (links to [../platform/TODO_feature_flags.md](../platform/TODO_feature_flags.md)) ✓ Sprint 2.58/2.60 — admin flags page synced to FLAG_DEFINITIONS
- [ ] Billing tools (refund, comp credits, plan change)
- [x] Internal dashboards (DAU, MRR, ingest health) ✓ Sprint 2.58 — admin dashboard (KPIs, system health, audit log)

## i18n
- Internal tool — EN only.

### Примітки
Impersonation is highest-risk feature. Mandate audit log, consent record, 2-person review for sensitive actions.
