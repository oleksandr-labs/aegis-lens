# TODO — Admin CLI

## Goal
Single `ax` CLI for operators: tenant admin, source ops, content moderation, billing.

## Progress
- 0 / 10 done

## Tasks
- [ ] Single binary (Go) with sub-commands
- [ ] Auth: short-lived staff tokens with MFA
- [ ] Tenant ops: create / suspend / impersonate (audited)
- [ ] Source ops: pause / resume / replay / backfill
- [ ] Event ops: retract / verify / re-enrich
- [ ] Billing ops: refund / credit / plan change
- [ ] Feature-flag ops (read + flip with audit)
- [ ] Per-command confirmation for destructive actions
- [ ] CLI changelog
- [ ] CI tests against staging

## i18n
- N/A (internal).

### Примітки
A CLI beats a half-built admin UI for non-frequent ops. Build it Phase 1.
