# SecOps Runbook

> Day-to-day security operations: alerts, triage, hardening backlog, vendor
> review, training. **SecOps without a backlog is just alerts — always have
> hardening tasks queued.**

## 1. On-call security rotation

Security participates in the standard [on-call rotation](../engineering/on-call.md)
as a **Security service area**:
- Primary: Security Lead (or designated senior security engineer).
- Secondary: cross-trained engineering on-call from the Platform area.
- Pager: high-urgency for P1 security alerts (active breach, data exfil, WAF
  anomaly spike); low-urgency for P2/P3 (failed scan, new CVE, policy violation).
- Security on-call owns the [security incident runbook](security-incident-runbook.md)
  response for any incident in scope.

## 2. SIEM — alert triage

Primary SIEM: **OpenSearch** (log aggregation + correlation rules) + **Wazuh**
(host-based IDS on endpoints / EC2 nodes, rule-based alerting).
Panther as an optional cloud-native alternative evaluated at Tier 3 scale.

### Alert categories and triage SLA

| Category | Examples | Triage SLA | Runbook |
| --- | --- | --- | --- |
| **Active breach indicators** | Lateral movement, C2 traffic, exfil volume spike | Immediate (P1) | [security-incident-runbook](security-incident-runbook.md) |
| **Auth anomalies** | Brute-force login, impossible-travel, admin login at odd hours | 30 min (P2) | Per-alert runbook |
| **WAF / DDoS** | Bot-score spike, rule-hit surge, RPS anomaly | 15 min (P1/P2) | [ddos-response-runbook](ddos-response-runbook.md) |
| **Vulnerability scan** | New CRITICAL/HIGH CVE in a running image | 4 h (P2) | Patch runbook |
| **Policy violation** | Untagged resource, public S3 bucket, open security group | 1 business day (P3) | Remediation checklist |
| **Phishing report** | Employee reports a suspicious email | 1 h (P2) | Phishing triage (§7) |

All alerts are logged in the SIEM + cross-referenced to a Linear ticket when
they require action beyond acknowledgement.

### Alert tuning

- Every alert that fires but requires no action is a **noise ticket** — it's
  reviewed weekly and either tuned (raise threshold), enriched (add context to
  reduce ambiguity), or deleted.
- Target: < 5 non-actionable alerts/day across all categories (same principle
  as the [on-call 2-pages/week target](../engineering/on-call.md#5-sustainable-load--burnout-prevention)).

## 3. EDR on developer endpoints

- **Endpoint Detection & Response** (CrowdStrike Falcon / SentinelOne) deployed
  on all developer laptops and any EC2 instances with direct developer access.
- EDR alerts route to the SIEM; P1 triggers the on-call security rotation.
- Minimum endpoint policy: full disk encryption (FileVault / BitLocker), screen
  lock < 5 min, approved software only, no local admin for daily use.
- New developers: EDR enrolled before credentials are provisioned (gates pre-day-1
  kit — see [onboarding](../engineering/onboarding.md#1-pre-day-1-kit)).

## 4. Per-alert runbook

Every SIEM alert rule links to a runbook (same convention as the
[runbooks index](../runbooks/README.md)):
- `runbook_url` field in the alert definition.
- Coverage audit: quarterly check that every alert has a linked, non-stale runbook.
- New alert rules must include a runbook before they're merged (gate in the
  alert-definition PR checklist).

## 5. Quarterly hardening sprints

A dedicated **hardening sprint** runs once per quarter:
- Input: risk register (§10) + open security scan findings + SIEM noise tickets
  + output of the last pen test or tabletop.
- Output: merged hardening PRs, updated runbooks, reduced CVE backlog.
- Hardening sprint is protected capacity — not pulled into feature work.
  Tracked in Linear under `hardening-sprint-YYYY-QN`.
- Cadence aligns with the [quarterly on-call retro](../engineering/on-call.md#7-quarterly-on-call-retro)
  and [ARB annual audit](../architecture/architecture-review-board.md).

## 6. Vendor security review process

All new vendors (tools, SaaS, subprocessors) go through a **security review**
before credentials are provisioned:

1. Vendor fills a security questionnaire (or provides a SOC 2 / ISO 27001 report).
2. Security reviews: data accessed, network exposure, credential scope, and
   vendor's own security posture.
3. For subprocessors: also the [DPA / GDPR subprocessor due-diligence template](../legal/subprocessor-list.md).
4. Decision: approve / approve with conditions / reject. Logged in the asset
   inventory (§9) and the subprocessor list.
5. Annual re-review (same process as the annual subprocessor security review).

## 7. Phishing simulations

- **Quarterly simulated phishing campaigns** (via KnowBe4 or equivalent):
  random employee subset, realistic lures (fake vendor invoice, fake AWS alert,
  fake login page).
- Results are anonymous at the individual level; team-level click rates are
  shared with EMs.
- High click-rate teams receive targeted training (§8) — not blame.
- Phishing report workflow: employees forward suspicious emails to
  `phishing@aegis-lens.com` → security triage within 1 h.

## 8. Security training cadence

| Training | Audience | Frequency |
| --- | --- | --- |
| Security awareness (phishing, social engineering, OPSEC) | All staff | Annual (+ after any phishing incident) |
| Secure coding (OWASP, injection, auth) | Engineering | Annual + onboarding |
| Incident response tabletop | Eng + Leadership | Quarterly ([incident-program §7](incident-program.md)) |
| Threat modeling workshop | Engineering | Semi-annual |
| Data protection / GDPR basics | All staff with data access | Annual |

Training completion is tracked; non-completion after 30 days = manager alert.

## 9. Asset inventory (assets + owners)

A **live asset inventory** is maintained in the CMDB (or Notion / Linear table):

| Asset class | Source of truth | Owner field |
| --- | --- | --- |
| Cloud resources (EC2, RDS, S3, etc.) | AWS Config → CMDB | Service tag + Team tag |
| Kubernetes workloads | Argo CD + CODEOWNERS | Team per chart |
| External services / SaaS | Vendor list (§6) | Business owner + Tech owner |
| Developer endpoints | EDR console | IT / Security |
| Credentials / secrets | AWS Secrets Manager | Rotation owner |

- Every asset has an **owner**. "Team" is not an owner — a person is.
- Assets without an owner are flagged in the weekly asset-hygiene review.
- Decommissioned assets are removed from the inventory within 48 h of deletion
  to prevent ghost-asset blind spots.

## 10. Risk register

A **risk register** captures security and operational risks:

| Field | Content |
| --- | --- |
| Risk ID | Unique sequential (R-NNN) |
| Description | What could go wrong |
| Likelihood | Low / Medium / High |
| Impact | Low / Medium / High / Critical |
| Risk score | Likelihood × Impact |
| Owner | Named person |
| Mitigation | Current controls + planned actions |
| Status | Open / Mitigated / Accepted / Closed |

- Updated quarterly (hardening sprint input) and after any significant incident
  or architecture change.
- Top-10 open risks reviewed in every ARB annual audit and with leadership
  semi-annually.
- "Accepted" risks require explicit sign-off from the Security Lead + CTO.
