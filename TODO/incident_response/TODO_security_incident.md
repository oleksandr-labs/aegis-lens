# TODO — Security Incident Runbook

## Goal
Compromised credential / data breach / active exploit. Triage and containment.

## Progress
- 11 / 11 done

## Tasks
- [x] Initial triage checklist (scope, severity, blast radius) → §1
- [x] Token revocation procedure (per provider) → §2 (revoke-first, per-provider cheat-sheet)
- [x] Account isolation → §3 (quarantine, force re-auth+MFA, network-isolate hosts not terminate)
- [x] Forensic snapshotting (before remediation) → §4 (disk/memory/logs, chain-of-custody)
- [x] Communication: internal / customer / regulator → §5
- [x] GDPR 72-hour notification clock awareness → §6 (clock starts at awareness, legal owns decision)
- [x] Bug-bounty / responsible-disclosure receipt flow ✓ Sprint 1.9 (/security) · Sprint 2.1 (security.txt RFC 9116) → §7
- [x] Coordinated disclosure timeline → §8 (ack 3d, fix target 90d, coordinated public disclosure)
- [x] Post-incident: rotate all related secrets → §9 (whole blast radius, not just known-compromised)
- [x] Customer notification template → §10 (localized, legal-reviewed)
- [x] Postmortem with security review board → §11

## i18n
- Customer notifications localized.

### Примітки
Containment over investigation. You can forensically analyze a snapshot later.

### Done notes (2026-05-30)
Runbook at [docs/security/security-incident-runbook.md](../../docs/security/security-incident-runbook.md),
linked from the [runbooks index](../../docs/runbooks/README.md). Built on
containment-over-investigation; ties into existing secrets-management doc and the
already-shipped responsible-disclosure flow.
