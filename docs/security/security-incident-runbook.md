# Security Incident Runbook

> **Scope:** compromised credential, data breach, or active exploit.
> **Goal: triage and containment.**
>
> **Key principle: containment over investigation. You can forensically analyze a
> snapshot later — you cannot un-leak data an attacker is actively exfiltrating.**

| Field | Value |
| --- | --- |
| Owner | Security |
| Service area | Security (cross-cutting) |
| Typical severity | SEV-1 (active breach) / SEV-2 (contained compromise) |
| Related | [IR overview](incident-response-runbook.md) · [Secrets management](secrets-management.md) · [DDoS](ddos-response-runbook.md) · [Postmortem](postmortem-template.md) |

## 1. Initial triage checklist (scope, severity, blast radius)

On first signal (alert, anomaly, disclosure report, or vendor notice):

- [ ] Declare an incident; assign IC + Security TL + Comms + Scribe.
- [ ] **What is compromised?** credential / key / host / service / data store.
- [ ] **What can it reach?** map blast radius (permissions, network, data scope).
- [ ] **Is it active?** ongoing access/exfiltration vs. historical.
- [ ] **What data is in scope?** any personal data of EU/UK residents? any
      source/journalist/activist data? (drives legal + notification clocks).
- [ ] Set SEV per the [IR table](incident-response-runbook.md). Active breach or
      personal-data exposure → SEV-1, notify VP Eng + CEO + legal immediately.

## 2. Token / credential revocation (per provider)

Revoke first, investigate after.

- Revoke the compromised credential at the source provider (cloud IAM, OAuth app,
  API key, DB role, SSH key). Keep a per-provider revocation cheat-sheet in
  [secrets management](secrets-management.md).
- Invalidate active sessions/tokens minted from it (rotate signing keys if
  session tokens are self-signed).
- For a leaked long-lived secret, assume it's already used — rotate, don't just
  monitor.

## 3. Account / host isolation

- Disable or quarantine compromised accounts; force re-auth + MFA reset.
- Network-isolate affected hosts/pods (cordon + network policy) rather than
  terminating them — preserve state for forensics.
- Pull compromised nodes from load balancing; do not delete them yet.

## 4. Forensic snapshotting (before remediation)

- Snapshot disks/volumes, memory where feasible, and relevant logs **before**
  rebuilding or patching.
- Preserve auth logs, audit logs, access logs, and any C2/exfil indicators with
  timestamps and an incident-ID tag; store with restricted access and
  chain-of-custody notes (may be needed for LE/legal).
- Then proceed to eradicate (patch, rebuild from known-good images, rotate).

## 5. Communication: internal / customer / regulator

- **Internal:** incident channel is source of truth; legal + leadership looped in
  for any data exposure.
- **Customer:** use the localized [notification template](#customer-notification-template);
  send when impact is confirmed and legal has reviewed.
- **Regulator:** see §6.

## 6. GDPR 72-hour notification clock

- If personal data of EU/UK residents was (or may have been) accessed by an
  unauthorized party, the **72-hour** controller-notification clock starts at
  **awareness**. Start the clock explicitly in the incident channel with a
  timestamp.
- Legal owns the regulator-notification decision and any data-subject
  notifications; engineering provides scope/impact facts fast. When uncertain
  whether data was accessed, treat as in-scope until proven otherwise.
- Mirror obligations for other regimes as applicable (UK GDPR, sectoral laws).

## 7. Bug-bounty / responsible-disclosure receipt flow ✓

Already in place: `/security` policy (Sprint 1.9) and
`/.well-known/security.txt` per RFC 9116 (Sprint 2.1). Inbound reports route to
the security inbox → triage → this runbook if valid. Acknowledge receipt
promptly and assign a tracking ID.

## 8. Coordinated disclosure timeline

For externally reported vulnerabilities:

- Acknowledge within `[3 business days]`; agree a remediation + disclosure
  timeline with the reporter (default target: fix within `[90 days]`, coordinated
  public disclosure after fix ships).
- Keep the reporter updated; credit them if they wish.
- Request the reporter hold public disclosure until the fix is deployed; escalate
  to leadership/legal if a deadline can't be met or the vuln is actively
  exploited.

## 9. Post-incident: rotate all related secrets

- Rotate **everything in the blast radius**, not just the known-compromised
  secret (assume lateral pivots). Cross-reference [secrets management](secrets-management.md).
- Verify rotation propagated to all services; remove emergency allowlists/bypasses.
- Re-baseline access: revoke any access granted during response that's no longer
  needed.

## 10. Customer notification template

```
Subject: [ACTION REQUIRED] Aegis Lens Security Notification

Dear [NAME],

On [DATE] at [TIME UTC], we detected [BRIEF DESCRIPTION]. We are writing to
inform you that [SPECIFIC IMPACT — what data/accounts, what window].

What we did:
- [Contained by …]
- [Rotated/revoked …]

What you should do:
- [Reset … / No action required]

We take the security of your data seriously. Full details will be shared in our
incident report at [URL]. Questions: [SECURITY CONTACT].

[SIGNATURE]
```

Localize per recipient locale. Legal reviews before send.

## 11. Postmortem with security review board

- Blameless postmortem ([template](postmortem-template.md)) for every security
  incident, reviewed by the security review board.
- Action items: close the entry vector, add detection that would have caught it
  earlier, and add an abuse/attack case to the test/monitoring suite.

## Verification (incident resolved when)

Attacker access confirmed severed; all in-scope secrets rotated; affected
accounts secured; regulator/customer notifications handled per legal; forensic
snapshots preserved; postmortem scheduled with the review board.
