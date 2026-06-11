# TODO — Escalation & SLA Management

## Goal
Clear escalation paths, measured SLAs, no dropped balls.

## Progress
- 9 / 9 done

## Tasks
- [x] SLA definitions per tier (response + resolution targets) → [escalation-sla.md §1](../../docs/support/escalation-sla.md) (P1/P2/P3 per Free/Pro/Team/Enterprise)
- [x] Escalation matrix: support → engineering → on-call → leadership → §2 (flow diagram + rules)
- [x] Auto-escalate on SLA risk → §3 (30-min pre-breach alert; D+24h no-response auto-close)
- [x] Enterprise dedicated CSM → §4
- [x] Per-customer escalation history → §5 (in support tool + CRM; reviewed at QBR + renewal)
- [x] SLA reporting dashboard → §6 (Grafana; attainment %, median vs. target, breach reasons)
- [x] Quarterly SLA review with key customers → §7 (top-50 QBR; explicit quality confirmation)
- [x] Service credits for SLA breach → §8 (proactive for Enterprise P1; per SLA addendum; 3-month clause)
- [x] Internal training on de-escalation → §9 (onboarding + annual refresh; tone guide cross-link)

## i18n
- SLA docs in customer's language for top-50 accounts.

### Примітки
Service credits are cheaper than losing the customer. Honor them.

### Done notes (2026-05-30)
[docs/support/escalation-sla.md](../../docs/support/escalation-sla.md).
Escalation flow diagram; auto-alert at 80% of SLA window; proactive Enterprise P1 credits.
