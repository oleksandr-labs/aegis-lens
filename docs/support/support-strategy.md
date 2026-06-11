# Customer Support Strategy

> Tiered support: self-service first, async for paid, SLA for enterprise.
> **A great support experience converts customers into evangelists** — especially
> critical for a mission-driven platform where users may be under real-world stress.

## 1. Tier matrix

| Tier | Channels | Response target | Notes |
| --- | --- | --- | --- |
| **Free** | Knowledge base only | Async / community | No ticket SLA; self-serve + community forum |
| **Pro** | Email | **1 business day** | Ticketing via support tool; email-first |
| **Team** | Email + chat | **4 business hours** | Shared Slack/chat channel; priority queue |
| **Enterprise** | 24/7 dedicated CSM + Slack Connect | **Per [SLA addendum](../legal/msa/sla-addendum.md)** | Named CSM, P1 = 1h 24×7 |

Upgrade path: any tier can open an urgent ticket; it's processed at the tier SLA
unless escalated (see [escalation-sla.md](escalation-sla.md)).

## 2. Tooling stack

Recommended modern support stack (choose one primary):

| Tool | Fit | Notes |
| --- | --- | --- |
| **Plain** | Early stage, Slack-native | Great for developer/enterprise audiences; Slack Connect built-in |
| **Pylon** | B2B-focused, Slack + intercom | CSM workflows; per-account context |
| **Front** | Omnichannel, async | Strong for multi-channel (email + chat + social) at scale |

Selection criteria: Slack Connect support (enterprise), per-account context,
macro library, i18n, CSAT automation, and the ability to pipe to Linear/product.
The current recommended default: **Plain** at launch (low overhead, Slack-native)
→ evaluate Pylon as the first Enterprise cohort grows.

### Slack Connect channels (Enterprise)

Every Enterprise customer gets a dedicated **Slack Connect channel**:
- Named: `#ae-<customer-slug>`
- Members: customer's Ops/Security contacts + their CSM + on-call backup
- Used for: proactive updates, P1/P2 incident comms, QBR follow-ups
- **Not** for: informal requests that bypass ticketing (intake ticket via the
  channel's workflow trigger so SLAs are measured)

## 3. Macro library + tone guide

### Tone

Warm, precise, honest. This is a platform people use during a conflict — they
may be under real stress. No corporate deflection; no false certainty. Examples:

- ❌ "We apologize for any inconvenience." → ✅ "We're sorry this is blocking you — here's what we know and what we're doing."
- ❌ "That's working as designed." → ✅ "Here's why it works this way and what we can do."
- ❌ "I'll escalate this." (without timeline) → ✅ "I'm escalating to our data team — you'll hear back by [TIME]."

### Macro library (starter set)

| Macro | When |
| --- | --- |
| `ack-investigating` | First response while investigating |
| `request-more-info` | Reproducible steps / account details needed |
| `escalating-to-eng` | Handing off to engineering |
| `source-delay` | A data source is delayed (link to status page) |
| `billing-refund-approved` | Refund confirmed |
| `feature-logged` | Feedback logged, linked to Linear |
| `resolved-check-in` | Closing ticket, did this resolve it? |

Macros live in the support tool and are versioned / reviewed quarterly.

## 4. Sentiment + topic auto-tagging

Incoming tickets are auto-tagged on:
- **Sentiment:** positive / neutral / frustrated / urgent — drives SLA prioritization
  and CSM alert (frustrated + Enterprise = immediate heads-up to CSM)
- **Topic:** `data-quality` / `source-outage` / `billing` / `account-access` /
  `feature-request` / `bug` / `security` — routes to the right queue and feeds
  the product-feedback pipeline (§6)

Tags are reviewed for accuracy in the quarterly retro; models are tuned on drift.

## 5. Customer-success contact for top-50 accounts

- The **top 50 accounts by ACV** (updated quarterly) each have a named CSM.
- CSM monitors health score (see [customer-success.md](customer-success.md)),
  runs quarterly business reviews, and is the first call in any Enterprise
  escalation.
- Below the top 50: a shared CS pool until headcount scales.

## 6. Ticket → product feedback pipeline

- Every ticket tagged `feature-request` or `bug` creates a **Linear issue** (or
  upvotes an existing one) automatically.
- Weekly: support lead reviews the top-10 by vote/volume and surfaces them to
  product with context ("3 Enterprise customers hitting this" > a bare issue).
- This is the primary input to the **voice-of-customer** signal for roadmap.

## 7. Per-tier SLA monitoring

- SLA timers run in the support tool; breach risk triggers an internal alert
  `[30 minutes]` before breach.
- **Dashboard:** per-tier median response time vs. target, SLA attainment %, and
  volume/team-load — reviewed in the weekly support sync.
- See [escalation-sla.md](escalation-sla.md) for breach consequences and credits.

## 8. CSAT survey post-resolution

- Automated CSAT (1–5 + optional comment) sent `[24 hours]` after ticket close
  for Pro/Team/Enterprise.
- Target: ≥ 4.2 / 5 overall; Enterprise ≥ 4.5. Any Enterprise CSAT < 3 triggers
  a CSM follow-up within 24h.
- Monthly CSAT report surfaced to leadership; quarterly trend review feeds the
  support retro.

## 9. Knowledge-base authorship from ticket patterns

- **Rule:** if the same question is answered in tickets `[3+ times]`, it becomes
  a KB article — the agent who answered it drafts it, the support lead reviews.
- KB articles are structured: symptom / cause / fix / prevention. Tagged with
  the same topic taxonomy (§4).
- Quarterly KB audit: flag articles with zero views (may be mislabeled) and high-
  traffic articles over 6 months old (may be stale).
- A good KB reduces Free-tier noise and lets Pro agents handle complex work.

## i18n

Multi-locale support starting **EN + UK** (the two largest user populations).
KB articles published in EN first; UK versions at parity within 2 weeks for
high-traffic articles. CSM pairings by locale where headcount allows.
