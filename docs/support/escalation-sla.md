# Escalation & SLA Management

> Clear escalation paths, measured SLAs, no dropped balls.
> **Service credits are cheaper than losing the customer — honor them.**

## 1. SLA definitions per tier

| Tier | P1 First response | P2 First response | P3 First response | Resolution target |
| --- | --- | --- | --- | --- |
| Free | N/A (self-serve) | N/A | N/A | N/A |
| Pro | 1 business day | 1 business day | 2 business days | Best effort |
| Team | 4 business hours | 8 business hours | 2 business days | Best effort |
| Enterprise | **1 hour, 24×7** | 4 business hours | 1 business day | Per Order Form |

**Priority definitions:**
- **P1** — Production down / no workaround; security incident; data loss suspected.
- **P2** — Major feature impaired; workaround exists but painful.
- **P3** — Minor issue; cosmetic; question; feature request.

Business hours (unless Enterprise 24×7): **09:00–18:00 customer's local timezone**,
Mon–Fri, excluding public holidays. SLA clock pauses when waiting on the customer.

## 2. Escalation matrix

```
Customer reports →  Support agent  (P3/P2: handle; P1: immediate escalation)
                        │
         SLA risk or unresolved P2/P1
                        ↓
                   Senior support / Support lead
                        │
           Engineering involvement needed
                        ↓
               Relevant service team (Linear ticket)
                        │
              Production impact / no ETA
                        ↓
                  Engineering on-call  [docs/engineering/on-call.md]
                        │
              SEV-1 / data breach / LE involved
                        ↓
             Engineering leadership + Legal
```

**Rules:**
- A P1 from any tier bypasses the queue and is worked immediately.
- Enterprise P1 must have a named IC (incident commander) within 15 minutes.
- Any ticket idle at `[80%]` of its SLA window auto-surfaces to the support lead.
- Security-related tickets are handled **confidentially** — don't update the
  customer in a public forum thread; use private email or Slack Connect.

## 3. Auto-escalate on SLA risk

Support tooling triggers:
- **`[30 min]` before P1 SLA breach:** alert to support lead + CSM (if Enterprise).
- **At SLA breach:** alert to support lead + flag in the SLA dashboard.
- **`[24h]` of no customer response:** ticket auto-closes with a re-open invite.
- **Repeated escalation of same issue:** tag `chronic-issue` → product feedback
  pipeline (see [support-strategy.md §6](support-strategy.md#6-ticket--product-feedback-pipeline)).

## 4. Enterprise dedicated CSM

Every Enterprise account has a **named Customer Success Manager**:
- First call in any escalation (support agent pages CSM before escalating to Eng).
- Owns the account health score and QBR cadence.
- Maintains per-customer escalation history (§5) so no context is lost on
  handover.
- For P1: CSM + IC joint owner until resolution; CSM owns customer comms.

## 5. Per-customer escalation history

The support tool holds a **per-account escalation log** (linked from the CRM):
- Every escalation to Eng or leadership, with date, issue, resolution, and RCA.
- Reviewed by the CSM before every QBR and before renewal.
- Patterns (e.g., the same data-quality issue three times) become a proactive
  remediation item — surfaced to product before the customer asks again.

## 6. SLA reporting dashboard

Live dashboard (support tool + Grafana) tracking:
- **SLA attainment %** per tier and priority (target: 95%+)
- Median first response vs. SLA target
- Breach count and breach reasons
- Ticket volume by priority, tier, and topic
- Resolution time distribution

Reviewed in the weekly support sync and the monthly leadership summary.

## 7. Quarterly SLA review with key customers

For the **top-50 accounts by ACV** (updated quarterly):
- Include SLA attainment data in the Quarterly Business Review (QBR) deck.
- Proactively surface any SLA misses, what caused them, and what changed.
- Get explicit customer confirmation of satisfaction with response quality, not
  just time-to-first-response.

## 8. Service credits for SLA breach

Credits apply to **Enterprise** accounts (per the [SLA addendum](../legal/msa/sla-addendum.md))
and may be extended to Team tier as a goodwill gesture for egregious misses:

- Enterprise P1 breach: issue a service credit proactively (don't wait for
  the customer to ask).
- Credit calculation and caps: per [SLA addendum §3](../legal/msa/sla-addendum.md#3-service-credits).
- Credits are applied to the next invoice. Track all issued credits in the billing
  system and the escalation log.
- **3 consecutive months** below Enterprise uptime target → customer termination
  right per the SLA addendum.

## 9. Internal de-escalation training

- Support agents and CSMs complete de-escalation training at onboarding and
  refreshed annually.
- Core module: recognizing stress signals (a frustrated humanitarian worker is
  different from an angry enterprise procurement contact), staying factual, and
  knowing when to escalate vs. when to solve.
- Tone guide lives in the macro library ([support-strategy.md §3](support-strategy.md#3-macro-library--tone-guide)).
