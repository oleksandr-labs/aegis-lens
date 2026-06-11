# TODO — Threat Modeling

## Goal
Per-major-feature STRIDE-style threat models. Find security flaws at design time.

## Progress
- 7 / 7 done

## Tasks
- [x] Threat-model template (STRIDE / LINDDUN for privacy) → [threat-modeling.md §1](../../docs/security/threat-modeling.md) (full template: DFD + STRIDE table + LINDDUN table + accepted risks + open questions)
- [x] Mandatory threat-model on any feature touching auth, PII, or external data ingestion → §2 (trigger list: auth / PII / external ingestion / trust boundary / new AI capability)
- [x] Review by security lead before code starts → §3 (PR-gated; 3 business day SLA; must-ship mitigations block production)
- [x] Adversary models documented (nation-state, insider, scraper, abuser) → §4 (4 adversary profiles with capabilities + design implications per each)
- [x] Track mitigations to backlog tickets → §5 (security:threat-model:<id> label; CI gate: must-ship threats need Done ticket status before prod)
- [x] Re-review on significant arch changes → §6 (append dated Re-review section; don't overwrite history)
- [x] Library of past threat models → §7 (docs/security/threat-models/NNNN-<feature>.md; linked from runbooks index + risk register; top-5 in security onboarding)

## i18n
- N/A.

### Примітки
Threat modeling at design is 10× cheaper than after.

### Done notes (2026-05-30)
[docs/security/threat-modeling.md](../../docs/security/threat-modeling.md). Nation-state adversary model
is Aegis-Lens-specific (APT targeting conflict-intelligence platforms to de-anonymize sources or inject
false data). LINDDUN privacy analysis is mandatory for PII-touching features.
