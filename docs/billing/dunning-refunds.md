# Dunning, Refunds & Credits

> Recover failed payments politely; handle refunds and credits cleanly.
> **A polite dunning email recovers 30%+ of failed cards.**

## 1. Dunning email sequence

Automated sequence triggered on the first payment failure. All emails are
**localized** (EN + UK at minimum; DE + FR for EU customers):

| Day | Event | Message |
| --- | --- | --- |
| **D−3** (pre-renewal) | Reminder before renewal attempt | "Your subscription renews in 3 days — please verify your card is up to date." |
| **D** (failure day) | First failed charge | "We couldn't process your payment. Update your payment method to avoid interruption." |
| **D+3** | Second attempt (Smart Retry) | "We tried again — please update your card to keep access." |
| **D+7** | Final notice | "Your subscription will be paused in 24 hours unless payment is resolved." |
| **D+8** | Service degradation | Subscription enters grace/read-only mode; comms explain this clearly. |

Each email contains a **direct link to the payment-update page** (no login
friction). Tone: factual, not shame-inducing. "Your card on file has expired"
is more effective than "Your payment failed."

## 2. In-app billing prompts

- A **persistent billing banner** appears in the product UI from D to D+7:
  "Your payment is past due — update your card to restore full access."
- Banner links directly to the billing portal.
- On D+8: in-app read-only mode notice with upgrade path.
- Enterprise accounts: suppress the generic banner; notify the CSM instead (who
  handles it via Slack Connect — billing issues shouldn't embarrass a named
  customer publicly in the app).

## 3. Smart Retries (Stripe)

- **Stripe Radar + Smart Retries** is enabled to automatically retry failed
  charges at the statistically optimal times (after D).
- Retry schedule: D+3 (default next retry), then one more if needed before D+7.
- Smart Retries use Stripe's ML model to avoid retrying at times likely to fail
  again (e.g., if a card is over-limit, not just expired).
- Configure the retry window in the Stripe dashboard to match the dunning timeline
  above.

## 4. Grace period before service degradation

- **Grace period: 7 days** from first failure (D to D+7) — full service.
- **D+8+**: subscription moves to a grace/read-only mode: existing data is
  visible but new alerts, reports, and API calls are paused.
- **Data is not deleted** during grace — a re-activated subscription restores
  full access immediately.
- After `[30 days]` of non-payment, subscription is cancelled and data-deletion
  / export is offered per the terms.

## 5. Refund workflow (with approval matrix)

| Scenario | Approval | Timeline |
| --- | --- | --- |
| Failed delivery / product bug (verified) | Support lead | Immediate (no escalation) |
| Customer dissatisfied, ≤ `[30 days]` from charge | CS lead | Same day |
| Pro-rata on cancellation mid-term | CS lead | Same day |
| > `[30 days]` from charge, or > `[$500]` | VP Revenue | Within 2 business days |
| Enterprise special case | Finance + VP Revenue | Within 5 business days |

Process: support/CSM opens a refund request in the billing tool → approval as
above → Finance executes in Stripe → **Stripe credit note issued** (§6) →
customer notification.

All refunds are logged in the billing register with the reason code (system /
commercial / relationship / SLA breach / chargeback-prevention). Reason codes
feed the monthly finance report.

## 6. Credit notes (Stripe credit notes)

- **Stripe credit notes** are issued for:
  - Approved refunds (full or partial)
  - SLA-breach service credits (per [SLA addendum](../legal/msa/sla-addendum.md) + [escalation-sla.md §8](../support/escalation-sla.md#8-service-credits-for-sla-breach))
  - Goodwill gestures (approved by CS lead)
- Credit notes are applied to the next invoice automatically by Stripe.
- Credit notes are part of the 7-year archival (same as invoices —
  [invoicing.md §8](invoicing.md#8-receipts-archived-7-years-compliance)).

## 7. Chargeback dispute handling

- **Stripe Radar** flags potential chargebacks early; Finance monitors daily.
- On a chargeback: immediately pull the full evidence package from Stripe
  (invoice, account creation, usage logs, IP records, email comms).
- Submit the dispute within Stripe's evidence window (typically 7–10 days).
- Evidence must include: proof of delivery / access, customer communications,
  and any prior refund attempts.
- If the dispute is legitimate: accept it, issue a refund, and close the account
  if fraudulent use is suspected.
- Log all chargebacks and their outcomes; `[3+ chargebacks]` from a single
  account triggers a fraud review.

## 8. Per-customer billing notes in admin

- The admin panel maintains a **free-text billing notes field** per customer
  (visible to Finance, support lead, CSM).
- Use for: custom payment arrangements, known issues (e.g., "requires wire
  payment," "annual invoice in advance on [DATE]"), refund history, PO
  requirements, or "do not apply standard dunning" flags for at-risk Enterprise
  accounts being managed by CSM.
- Notes are timestamped and attributed to the user who wrote them.
