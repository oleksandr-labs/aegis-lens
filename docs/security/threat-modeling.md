# Threat Modeling

> Per-major-feature STRIDE-style threat models. Find security flaws at design
> time. **Threat modeling at design is 10× cheaper than after.**

## 1. Threat model template (STRIDE + LINDDUN)

```markdown
# Threat Model: <Feature / Component>

**Author:** <name>  
**Date:** YYYY-MM-DD  
**Status:** Draft | Reviewed | Approved  
**Reviewer (Security Lead):** <name>  
**Review date:** YYYY-MM-DD  
**Scope:** <what is in scope and what is explicitly out of scope>  

## System description
Brief description + data-flow diagram (DFD) or C4 diagram showing:
- Actors (users, external systems, services)
- Data flows (arrows with data types + trust levels)
- Trust boundaries (where privilege changes)

## Adversary models (§4) considered
- [ ] Nation-state / advanced persistent threat
- [ ] Insider (malicious or negligent)
- [ ] Web scraper / data harvester
- [ ] Abuser (misuse within terms, e.g., bulk queries)
- [ ] Other: ___

## STRIDE analysis

| Threat | Component | Description | Likelihood | Impact | Mitigation | Ticket |
|--------|-----------|-------------|------------|--------|------------|--------|
| **S**poofing | | | | | | |
| **T**ampering | | | | | | |
| **R**epudiation | | | | | | |
| **I**nformation Disclosure | | | | | | |
| **D**enial of Service | | | | | | |
| **E**levation of Privilege | | | | | | |

## LINDDUN analysis (privacy threats — for features handling personal data)

| Threat | Data flow | Description | Mitigation | Ticket |
|--------|-----------|-------------|------------|--------|
| **L**inkability | | | | |
| **I**dentifiability | | | | |
| **N**on-repudiation | | | | |
| **D**etectability | | | | |
| **D**isclosure of information | | | | |
| **U**nawareness | | | | |
| **N**on-compliance | | | | |

## Accepted risks
Risks explicitly accepted with rationale and sign-off.

## Open questions
Items requiring further investigation before the model is complete.

## Implementing PR / ADR
Link(s) to where this feature is implemented.
```

## 2. When a threat model is mandatory

A threat model is **required before code starts** for any feature that:
- Touches **authentication or authorization** (new auth flow, new role, token format change).
- Processes **PII or personal data** (new data collection, new data sharing, new
  retention policy).
- Involves **external data ingestion** (new source adapter, new webhook, new API
  integration).
- Changes the **trust boundary** (new public endpoint, new cross-service call,
  new partner integration).
- Introduces a **new AI capability** that affects content or decisions (new model,
  new prompt template with user input, new auto-action).

The feature RFC or design doc includes a section "Threat model: required / not
required — rationale." Engineering lead + Security Lead confirm.

## 3. Review process

1. **Author drafts** the threat model (DFD + STRIDE table + LINDDUN if PII).
2. Author opens a PR adding `docs/security/threat-models/NNNN-<feature>.md`.
3. **Security Lead reviews** before any code is merged for the feature. Review
   SLA: 3 business days (or sooner if the sprint demands it — Security Lead is
   always contactable).
4. Approved threat model is linked from the implementing RFC and/or ADR.
5. If threats are identified, **mitigation tickets** are created in Linear and
   tagged `security` with priority derived from `Likelihood × Impact`:
   - Critical (5×5): must ship with the feature.
   - High (4+): must ship within 2 sprints.
   - Medium: tracked; prioritized in the next hardening sprint.
   - Low: logged in the risk register.

## 4. Adversary models

These are the threat actors we design against for Aegis Lens specifically:

### Nation-state / APT

**Motivation:** disrupt conflict-intelligence capability, de-anonymize sources,
inject false data, or exfiltrate source networks.  
**Capabilities:** zero-days, supply-chain compromise, social engineering at scale,
long-term persistence.  
**Design implications:** defense-in-depth architecture; zero-trust; supply-chain
controls; no single-point-of-compromise for source data; air-gapped source
registry; audit logs with offsite backup.

### Insider (malicious or negligent)

**Motivation:** sell data, sabotage, accidental mis-config.  
**Capabilities:** legitimate credentials, knowledge of the system.  
**Design implications:** least-privilege IAM; RLS at DB layer (even a rogue service
can't cross tenant boundaries); immutable audit log; 4-eyes on source-identity
access; DLP on bulk exports.

### Web scraper / data harvester

**Motivation:** build a competing dataset; sell the data; undermine our competitive
advantage.  
**Capabilities:** rotating IPs, headless browsers, credential abuse.  
**Design implications:** Cloudflare Bot Management; API rate limiting per key +
per IP; fingerprinting; progressive friction for unusual access patterns.

### Abuser (within-terms misuse)

**Motivation:** extract maximum data for free; run mass-alert triggers; probe the
model for harmful content.  
**Capabilities:** legitimate account; creative query patterns.  
**Design implications:** per-account query budget; anomaly detection on usage;
safety guardrails on AI outputs; metering tied to enforcement.

## 5. Track mitigations to backlog tickets

Every identified threat in a threat model that needs a mitigation links to a
Linear ticket:
- `security:threat-model:<model-id>` label on the ticket.
- Ticket links back to the threat model document.
- Unresolved "must-ship" mitigations block the feature from going to production
  (CI gate: check that all `must-ship` threats in the threat model have a
  `Done` ticket status).

## 6. Re-review on significant architecture changes

A threat model is **re-reviewed** when:
- A new RFC is accepted that materially changes the scoped feature.
- A significant vulnerability is discovered that suggests the original model
  missed an attack vector.
- The adversary model changes (e.g., a known APT group begins targeting
  conflict-intelligence platforms).

Re-reviews create a new version of the threat model document (append a dated
`## Re-review YYYY-MM-DD` section; don't overwrite history).

## 7. Threat model library

All threat models live in `docs/security/threat-models/NNNN-<feature>.md`:
- Searchable by feature, adversary type, and threat category.
- Linked from the [runbooks index](../runbooks/README.md) and the
  [secops runbook risk register](secops-runbook.md#10-risk-register).
- **Onboarding reading:** the top 5 most instructive threat models are part of
  the security-track [onboarding path](../engineering/onboarding.md#6-required-reading-everyone).
- Annual review: the ARB annual audit identifies threat models that are stale
  (feature has changed significantly since the model was written).
