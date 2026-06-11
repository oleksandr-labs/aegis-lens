# Ethics Governance

> External + independent bodies advising on ethically charged decisions and
> business strategy. **An independent Ethics Board is the strongest signal of
> editorial integrity to enterprise, press, and NGO customers.**

---

## 1. Ethics Board Charter

### Mandate

The Aegis Lens Ethics Board is an **independent advisory body** that reviews
ethically significant decisions — including but not limited to: content policies,
source relationships, customer and market eligibility, AI model deployment, and
methodology standards. It advises; it does not hold veto power over commercial
decisions, but its advice is publicly documented and material departures from it
are explained.

### Scope of authority

| In scope (Ethics Board advises) | Out of scope |
| --- | --- |
| Content and editorial policies | Day-to-day editorial decisions |
| Customer / market eligibility (e.g., arms-manufacturer customer?) | Individual customer contracts |
| AI model deployment ethics (safety, bias, dual-use) | Engineering implementation |
| Source-protection standards | Individual source relationships |
| Methodology standards (verification confidence, classification) | Specific event classifications |
| Use-of-product ethical concerns raised by stakeholders | Pricing and revenue decisions |
| Emergency ethics convening (crisis with ethical dimension) | — |

### Composition (5–7 members)

Representation targets: journalist / press-freedom organization + NGO / humanitarian
+ academic (conflict studies or ethics) + legal / human rights + practising OSINT
analyst + regional expert (Ukrainian or Eastern European context) + AI-ethics scholar.

Members serve **3-year staggered terms**. Renomination possible (once) with board
approval. The board nominates its own successors; Aegis Lens leadership confirms.
No current Aegis Lens employees or investors may serve.

### Independence

- Members are **compensated** (flat annual fee — no equity, no profit-share).
  Uncompensated advisory boards are capture-prone.
- Members may not hold equity or financial interests in Aegis Lens.
- No member may be employed by a direct competitor or an active customer.
- **Recusal protocol**: a member discloses any conflict of interest at the start
  of any meeting where it is relevant; they abstain from that agenda item.

### Meeting cadence

- **Quarterly meetings** (90 minutes, video or hybrid).
- **Emergency convening** within 72 hours when: a SEV-1 crisis with an ethical
  dimension arises (e.g., AI output causing harm, data involving civilians, source
  safety threat).
- Between meetings: members may request a written briefing on any in-scope matter.

### Agenda process

1. Aegis Lens submits standing agenda items 2 weeks before each meeting.
2. Board members propose additional items at any time.
3. A pre-meeting memo is circulated with relevant context.
4. Decisions are recorded; Aegis Lens's response to each recommendation is
   documented (acted upon / noted / departed from with reason).

### Confidentiality

- Meetings are confidential to members + Aegis Lens leadership.
- An **annual report subset is published** publicly: summary of topics reviewed,
  recommendations made, and Aegis Lens's response (without sensitive operational
  detail).
- Members may not publicly disclose deliberations without board approval.

### Public list

All current members are listed publicly on the `/ethics` page with their
affiliation. This is a credibility signal — do not name members unless they
have publicly consented.

---

## 2. Strategic Advisory Board

*Separate from the Ethics Board — different role: business, market, and
technical strategy.*

### Composition (4–6 advisors)

Target expertise areas: defense / security sector + media / journalism + OSINT
community + AI / machine learning + fundraising / VC + EU policy / institutional.

### Terms and compensation

- **Equity grant**: standard advisor cliff (6 months) with 2-year vesting.
  Amount per advisor equity schedule (set by Finance + legal).
- **Light cash retainer** (optional, for advisors who decline equity):
  `[$X/quarter]`.
- **Commitment**: minimum 1 focused hour/month (async or sync) + availability
  for ad-hoc intros and references.

### Engagement model

| Cadence | Format | Purpose |
| --- | --- | --- |
| Monthly | Async written update from CEO (1 page) | Keep advisors current without meetings |
| Quarterly | Group call (60 min) | Strategy update, open Q&A |
| Ad hoc | Direct contact per advisor | Introductions, references, deal support |

### Per-advisor goal

Every advisor has a named role and expected contribution:
- "Opens doors in [sector/geography]."
- "Provides credibility and references for [government / media / enterprise] deals."
- "Advises on [AI safety / fundraising / EU regulatory] specifically."
- "Challenges strategy from the [practitioner / investor / institutional] lens."

Advisors without a specific use case are not added. Review annually: did this
advisor deliver against the goal? Renew or rotate.

### Conflict-of-interest disclosure

All advisors disclose financial interests in competitors or customers. Advisors
with material conflicts on a specific topic recuse themselves from that discussion.
Disclosures are filed with legal at onboarding and updated annually.

### Public listing

Advisors are listed publicly (where consented) on the `/about/advisors` page.
Advisors who prefer not to be public may remain unlisted.

---

## 3. External Audit Cadence

*Beyond SOC 2: editorial, AI safety, methodology, and privacy audits —
externally validated and publicly reported.*
**External audits unlock enterprise + gov sales. They cost money. Treat them as investment.**

### Annual audit calendar

| Audit type | Scope | Auditor selection | Public output |
| --- | --- | --- | --- |
| **Editorial audit** | Bias, sourcing standards, editorial independence, source protection practices | Independent press-freedom org (e.g., RSF, CPJ associate) | Public summary + action items |
| **AI safety / responsible-AI audit** | Model bias, hallucination rate, safety guardrails, dual-use risk, human oversight | Third-party AI-safety firm (e.g., academic lab or specialist consultancy) | Public summary |
| **Methodology audit** | Verification process, confidence calibration, classification consistency | Academic or OSINT-community body (e.g., university conflict-studies programme) | Public report |
| **Penetration test** | External + internal network, API, auth, social engineering | Rotate auditor every 2 years to avoid familiarity | No public output; executive summary to Ethics Board |
| **Privacy / GDPR audit** | DPA compliance, data-subject rights processes, subprocessor management, PII controls | External DPO / privacy consultancy | No public output; executive summary to legal |

### Auditor procurement policy

- **No captive auditors**: we do not use an auditor who has a financial or advisory
  relationship with Aegis Lens for that audit category.
- **Rotation**: pen-test auditor rotated every 2 years; other auditors reviewed
  for conflict of interest annually.
- **Scope agreement in writing** before engagement: what is and is not in scope,
  what access is granted, what the deliverable is.
- **Per-audit budget envelope** approved by Finance before RFP.

### Action-item tracking

Every audit produces a findings report → action items logged in Linear tagged
`external-audit-YYYY` with owners and due dates. The follow-up status of every
audit's action items is reviewed at the first Ethics Board meeting after the
audit is complete.

### Localization

Audit public summaries are published in **EN + UK** (conflict-region relevance)
and in the language of any major regulator or customer jurisdiction where the
audit is particularly relevant (e.g., German-language version for EU GDPR audit
summary if DE is a major market).
