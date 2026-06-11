# Customer Success

> Drive activation, expansion, and retention for paying customers.
> **Net dollar retention beats new-logo acquisition once we hit 200 paid customers.**
> CSMs paired with customers' locale where possible.

## 1. Health scoring per account

Each account carries a **composite health score** (updated weekly, visible to
CSM and leadership):

| Signal | Weight | Data source |
| --- | --- | --- |
| **DAU/MAU ratio** (activation) | 30% | Product analytics |
| **Core feature adoption** (≥ 3 of the key features used) | 25% | Feature flags / analytics |
| **Support sentiment** (CSAT + unresolved P1/P2 count) | 20% | Support tool |
| **Renewal intent** (survey / CSM gut) | 15% | CRM |
| **Billing health** (no overdue) | 10% | Billing system |

Score → **Green** (safe) / **Yellow** (watch) / **Red** (at-risk). Automated
weekly digest to CSM; Red triggers a CSM outreach within 48h.

## 2. Quarterly business reviews (top-50)

The **top 50 accounts by ACV** (refreshed quarterly) get a formal QBR:
- Agenda: platform ROI since last QBR → usage trends → open tickets / known
  issues → roadmap preview → expansion opportunities → renewal outlook.
- Run by the CSM; engineering or product joins if there's an open technical topic.
- QBR deck is standardized (templated from CRM); output is logged in the account
  escalation history ([escalation-sla.md §5](escalation-sla.md#5-per-customer-escalation-history)).
- Below top-50: lighter-touch check-in email quarterly + data dashboard shared.

## 3. Onboarding success path per persona

Activation in week 1 is the strongest predictor of retention. Each persona has
a tailored path:

| Persona | Week-1 success milestone | Key onboarding action |
| --- | --- | --- |
| **OSINT analyst** | First custom AOI created + alert configured | Guided setup + sample event walkthrough |
| **Humanitarian / NGO** | First report exported | Pre-built template + KB article |
| **Government / defense** | API key created + first query | API quickstart + rate-limit guidance |
| **Journalist** | First embed published | Embed guide + attribution check |
| **Finance / trader** | First monitoring dashboard live | Data feed setup + feed health walkthrough |

CSM sends a **day-7 check-in** for Pro+; Enterprise CSM does a live onboarding
call in week 1.

## 4. Expansion playbook (usage-threshold trigger)

Expansion is triggered by usage signals, not cold outreach:

| Signal | Trigger threshold | Action |
| --- | --- | --- |
| Seat utilization | > 80% for 2 consecutive weeks | CSM outreach — offer team-tier or seat expansion |
| API call volume | > 85% of quota for 2 consecutive billing cycles | CSM proactive — quota upgrade options |
| AOI count | Near AOI limit (> 90%) | In-app nudge + CSM note |
| Multi-team usage | 3+ departments using account | Offer enterprise consolidation |

Expansion offers are framed as capability unlocks, not upsells ("you're hitting
your alert limit — here's how to cover all your AOIs").

## 5. Churn-risk early warning

Red health score (§1) + any of these compounds the risk:
- Usage declining for `[3 consecutive weeks]`
- Open P2+ unresolved > `[10 business days]`
- No logins from primary contacts in `[14 days]`
- Renewal conversation not started `[60 days]` before renewal

On a compound signal, CSM escalates to CS lead for a **save play**: direct
outreach, executive sponsor engagement if needed, and a root-cause conversation
before the renewal clock runs out.

## 6. Renewal motion (90 days out)

Standard renewal cadence:

| Days before renewal | Action |
| --- | --- |
| 90 | CSM sends renewal preview + usage recap |
| 60 | Formal renewal proposal (pricing, scope, any expansion) |
| 45 | If no response → CS lead escalation |
| 30 | Legal/Finance engaged if non-standard terms requested |
| 14 | Final follow-up; at-risk flag to leadership |
| 0 | Auto-renew fires (or lapse per Order Form) |

Multi-year deals (locked pricing) are preferred for Enterprise at this stage —
offer a discount for 2-year commitment; reduces churn and revenue uncertainty.

## 7. Reference & case study program

- Any **Green health** account 6+ months old is eligible for a reference request.
- CSM tracks reference willingness in the CRM.
- Case studies prioritized by: vertical (humanitarian, defense, newsroom — highest
  credibility), geography, and deal size.
- Case study process: interview → draft → customer approval → publish (anonymized
  if requested). All published with explicit customer approval.

## 8. Champion identification & nurture

- A **champion** is the internal advocate who pushed for Aegis Lens and whose
  credibility is tied to its success.
- CSM identifies the champion at account setup and maintains a direct relationship
  beyond the main procurement contact.
- Champion nurture: early access to features, invitations to advisory calls,
  direct line to product, recognition (e.g., quoted in case studies if willing).
- **Job change alerts:** champion leaving is a churn-risk flag (CRM automation);
  CSM starts a new-contact relationship immediately.

## 9. Per-segment lifecycle calendar

| Segment | Jan | Apr | Jul | Oct |
| --- | --- | --- | --- | --- |
| Enterprise (top-50) | QBR + renewal preview (for Oct renewals) | QBR | QBR + renewal preview (for Oct) | QBR |
| Team | Usage digest + check-in email | | Usage digest | |
| Pro | Automated health digest | | | |
| All | Product roadmap newsletter (quarterly) | | | |

CSM capacity governs the top-50 threshold — if CSMs are overloaded, raise the
ACV threshold and move mid-market to digital/automated CS until headcount catches
up.
