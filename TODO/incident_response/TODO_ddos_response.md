# TODO — DDoS / Abuse Response

## Goal
Stay online under attack; document patterns for hardening.

## Progress
- 9 / 9 done

## Tasks
- [x] Cloudflare "I'm Under Attack" / DDoS toggle → runbook §3.1
- [x] WAF rules pre-staged for common attack signatures → §4 (L7 flood, cred-stuffing, scraping, known-bad; kept as version-controlled, disabled-by-default rule groups)
- [x] Rate-limit tightening playbook → §3.2 (pre-staged stricter profile, looser bucket for auth/Enterprise)
- [x] Customer comms (status page + email) → §5 (timing, don't-name-the-attack guidance, localized)
- [x] Log capture for forensic analysis → §6 (capture-early, Logpush/origin/WAF logs, incident-ID tagged)
- [x] Identify abuse class: volumetric / L7 / scraping / credential-stuffing → §2 (classification table + levers)
- [x] Coordinate with Cloudflare ops if sustained → §7
- [x] Law-enforcement liaison if criminal → §7 (referral criteria, evidence preservation, no-ransom)
- [x] Postmortem with hardening backlog → §9

## i18n
- Comms localized.

### Примітки
Don't blackhole all traffic. Selectively degrade.

### Done notes (2026-05-30)
Full runbook at [docs/security/ddos-response-runbook.md](../../docs/security/ddos-response-runbook.md).
Built around the "selectively degrade, never global blackhole" rule and around
keeping humanitarian/defense users served under attack. Escalating mitigation
ladder (Under Attack → rate limits → pre-staged WAF → bot challenge → origin
protection → targeted ASN action as last resort), abuse-class table, comms
timing, capture-early forensics, Cloudflare/LE coordination, and a hardening-
backlog loop that promotes ad-hoc rules into the pre-staged set. Roles and
severities tie into the existing incident-response runbook.
