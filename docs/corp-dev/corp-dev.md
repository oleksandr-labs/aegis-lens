# Corporate Development

> **Status:** v1.0 — strategy & governance. Review annually + before each fundraise.
> **Covers:** Strategy, M&A playbook, board materials, governance structure, exit awareness.

---

## Part 1 — Corporate Development Strategy

> "Most acquisitions destroy value. Justify ruthlessly."

### 1.1 Buy / Partner / Build Framework

For every major capability gap, evaluate three paths before committing:

| Path | Choose when | Key risks |
|---|---|---|
| **Build** | Core differentiation; we have the team; < 18-month timeline | Underestimation of scope; distraction from core |
| **Partner** | Speed to market; non-core; partner quality is high; reversible | Dependency risk; quality mismatch; revenue share leakage |
| **Buy** | Unique team or tech; would take 2+ years to build; market window closing; price justified by ROI | Integration failure; cultural mismatch; overpayment |

**Decision gate:** Before any Buy or major Partnership decision, produce a 1-page thesis (template in §2.1) reviewed by founder + board.

**Default bias:** Build when in doubt. We are a software + data company; our competitive advantage lives in what we ship.

### 1.2 Strategic Priorities (3 per Year Max)

Corp-dev focus areas are set annually at the first board meeting of the year. Maximum 3 active priorities. Priorities cascade from the product roadmap — corp dev is a means, not an end.

**Year 1 priorities (illustrative):**
1. Build the core intelligence pipeline (no distraction from M&A).
2. Establish 2–3 strategic data partnerships (NASA FIRMS tier-up, Sentinel Hub, commercial SAR provider).
3. Evaluate a potential acqui-hire for a 3-person geospatial AI team.

**Review cadence:** Priorities reviewed quarterly at board meeting; can be updated with board approval only.

### 1.3 Acquisition Criteria

We will not pursue an acquisition that fails any of the following:

| Criterion | Minimum threshold |
|---|---|
| **Team quality** | At least 2 engineers / researchers we would hire independently |
| **Cultural alignment** | Mission-driven, OSINT ethics adherence, no political bias |
| **Technology** | Proprietary tech or data we cannot build in < 18 months |
| **Revenue (if any)** | MRR growing or clear path to integration with existing revenue |
| **IP cleanliness** | No third-party IP conflicts, no pending litigation |
| **Price** | < 4× ARR for product companies; < 8× for data/IP assets |

Any acquisition failing a criterion requires explicit board waiver with documented rationale.

### 1.4 Build-vs-Buy ROI Template

For each "Buy vs. Build" decision, complete the following:

```
Capability: ___
Current state: ___
Target state in 18 months: ___

Build path:
  - Engineering cost: ___ eng-months × avg cost = $___
  - Timeline: ___ months to MVP; ___ months to parity
  - Opportunity cost: ___ (what we don't build instead)
  - Risk: ___

Buy path:
  - Acquisition price: $___
  - Integration cost estimate: $___
  - Runway impact: ___
  - Time to value: ___ months
  - Dependency / lock-in risk: ___

Partner path:
  - Revenue share / cost: $___/year
  - Time to deploy: ___
  - Exit clause: ___

Recommendation: [ ] Build  [ ] Buy  [ ] Partner
Rationale: ___
Decision maker: ___ + Board (if Buy)
```

### 1.5 Quarterly Corp-Dev Review

At each quarterly board meeting, the founder presents a 5-minute corp-dev update:
1. Strategic priority status (red / amber / green per priority).
2. Inbound acquisition interest received (if any, even if rejected).
3. Partnership pipeline status.
4. Build-vs-buy decisions made in the quarter.
5. Next quarter corp-dev focus.

### 1.6 Founder + Board Alignment

**Rules:**
- Any acquisition > $500K requires full board approval (not just majority).
- Any partnership with exclusivity clauses requires board sign-off.
- Founder cannot execute a material transaction during a fundraising process without board knowledge.
- No LOI (Letter of Intent) signed without board awareness (even if non-binding).

### 1.7 No M&A in First 24 Months

The default is **no acquisitions** in the first 24 months from incorporation.

**Why:** Pre-Series A, the company cannot absorb the integration cost (time, attention, culture) of an acquisition without killing product momentum. The only exception: an acqui-hire of 2–4 people who immediately join as employees (treated as a hiring transaction, not a strategic acquisition).

If a compelling opportunity arises before 24 months, it requires: (a) unanimous founder agreement, (b) board approval, (c) a written thesis explaining why it cannot wait.

### 1.8 External Advisor on Retainer

Before any acquisition > $2M, engage an M&A advisor with relevant domain experience (defense-tech, data, media). The advisor:
- Reviews the deal thesis independently.
- Sources comparable transactions for valuation benchmarking.
- Does not receive success fees (avoid incentive misalignment) — fixed retainer only.

---

## Part 2 — M&A Playbook

> "Buy teams, then check tech. Bad team kills the deal regardless of code quality."

### 2.1 Deal-Thesis Template

Complete before any LOI:

```markdown
# Deal Thesis — [Target Company Name]
Date: YYYY-MM-DD | Prepared by: [Founder]

## Why this?
Primary thesis (1 sentence): ___
Value drivers (check all that apply):
  [ ] Unique team (names + why they matter)
  [ ] Proprietary technology (specific capability, not buildable in < 18mo)
  [ ] Proprietary data (exclusive or hard-to-replicate)
  [ ] Customer relationships (NNN customers, NNN ARR)
  [ ] Market position / brand
  [ ] Speed (time-to-market value > acquisition cost)

## Why now?
What changes if we wait 12 months? ___
Is there competitive pressure to act? ___

## Risks
Top 3 risks + mitigation: ___

## Financial summary
Ask price: $___  |  Our estimate of fair value: $___
Rationale for any premium: ___
Projected ROI at 18 months / 36 months: ___
Runway impact: ___

## Integration assumption
100-day goal: ___
1-year goal: ___
Team retention critical path: ___
```

### 2.2 Diligence Checklist

#### Legal
- [ ] Corporate structure clean (no pending litigation, clean cap table)
- [ ] IP assignment complete (all founders + contractors signed IP assignment)
- [ ] No third-party IP in product
- [ ] Employment agreements reviewed (no non-competes blocking integration)
- [ ] Material contracts reviewed (customer agreements, data licenses)
- [ ] Export control / sanctions compliance verified

#### Technical
- [ ] Code quality audit (2-engineer review, 1 internal + 1 external)
- [ ] Security audit (penetration test or review of last audit)
- [ ] Infrastructure dependencies documented (no single points of failure)
- [ ] Data handling compliance reviewed (GDPR, data residency)
- [ ] Tech debt estimate (time + cost to modernize)
- [ ] Integration path to Aegis Lens stack validated

#### Financial
- [ ] 24 months of financial statements reviewed
- [ ] Revenue quality: recurring vs. one-time, customer concentration
- [ ] Burn rate and runway
- [ ] Cap table + option pool: dilution impact modeled
- [ ] Tax structure reviewed with counsel

#### Cultural
- [ ] Founder + key team interviews (values, mission alignment)
- [ ] Reference checks: prior investors + employers
- [ ] How was the team built? (hiring bar, remote vs. in-person)
- [ ] Existing team: who stays, who goes, who is flight risk

### 2.3 Cultural-Fit Interview Process

Conducted by founder + 1 senior team member before LOI:

1. **Mission interview (30 min):** Why do they care about this problem? Have they followed the conflict-intelligence space? What's their read on the ethics of OSINT? (Red flags: advocacy bias, doxxing history, contempt for verification.)
2. **Work-style interview (30 min):** How do they make decisions? How do they handle disagreement? Remote-work norms.
3. **Values scenarios (15 min):** Present 2 ethically ambiguous OSINT scenarios (fabricated); evaluate reasoning, not conclusion.
4. **Questions they ask us (15 min):** Quality of questions reveals genuine interest vs. exit-play.

Scoring: each interviewer completes a 5-criterion scorecard (1–5 scale). No hire if average < 3.5 on mission alignment.

### 2.4 Tech / Security Due Diligence Checklist

- Architecture diagram reviewed by senior engineer
- Dependency audit: `npm audit` / `safety check` / `trivy` run on codebase
- Secrets management review (no secrets in code)
- Authentication + authorization review
- Data encryption at rest + in transit confirmed
- Incident history: any breaches in last 24 months?
- Data retention + deletion policies vs. our obligations
- Cloud infrastructure: cost model, vendor lock-in risk

### 2.5 Integration Plan Template

#### 100-Day Plan

| Week | Focus |
|---|---|
| 1–2 | Announce, welcome, preserve team momentum |
| 3–4 | System access granted; introductions to key stakeholders |
| 5–8 | Tech integration scoping; retention packages signed |
| 9–12 | First integrated product milestone shipped |
| 13 | 100-day review: progress vs. thesis |

#### 1-Year Plan

- Product integration complete (team working as one unit)
- Brand decision executed (kill / preserve / merge per §2.7)
- Customer migration complete (if applicable)
- Revenue attribution clear
- Integration postmortem documented

### 2.6 Retention Package per Critical Employee

- Identify critical employees (those whose departure would materially harm the acquisition value) in diligence.
- Retention packages: additional equity (cliff-reset to 4-year with 1-year cliff) + cash bonus (25–50% annual comp) paid at 12-month milestone.
- Signed before close.
- Flight-risk early-warning: monthly 1-1 with founder for first 6 months.

### 2.7 Customer-Comms Plan for Acquired-Side

- Joint announcement email from both CEOs on Day 1 of close.
- FAQ document prepared in advance.
- Key accounts contacted personally by Aegis Lens founder within 48h of announcement.
- No feature deprecations in first 90 days (stability commitment).
- Dedicated customer-success point of contact assigned.

### 2.8 Brand-Decision Matrix

| Scenario | Decision |
|---|---|
| Target has strong brand equity in a different market | **Preserve** (operate as sub-brand) |
| Target's brand is weak or mission-misaligned | **Kill** (migrate to Aegis Lens) |
| Target has overlapping audience + complementary brand | **Merge** (co-brand for 12 months, then transition) |

Decision made pre-close, announced Day 1 of close. No ambiguity.

### 2.9 Per-Acquisition Postmortem

**1-year review:** Has the acquisition thesis held? Team retention, product integration, revenue impact.

**2-year review:** Full ROI analysis vs. the build-vs-buy alternative. Lessons for future acquisitions.

Template:
```
Acquisition: [Name] | Close date: ___
Original thesis: ___
Actual outcome (team, product, revenue): ___
What we got right: ___
What we got wrong: ___
Net ROI vs. "build" alternative: ___
Lessons for next acquisition: ___
```

### 2.10 Failed-Integration Learnings Library

A running `docs/corp-dev/integration-learnings.md` file (private, board-visible) documenting:
- What warning signs appeared in diligence that we underweighted
- Culture failures and their root causes
- Tech integration traps
- Comms failures (internal + external)

Reviewed before every subsequent acquisition.

### 2.11 Be-Acquired-Readiness (Clean Foundations)

Even if we never sell, maintaining acquirer-readiness is good hygiene:
- Cap table clean, option pool documented, 409A current
- IP assignment signed by all employees + contractors (no exceptions)
- No conflicting licenses in the codebase
- Revenue attribution clear in accounting
- All material contracts assigned (not founder-name personal agreements)
- Customer data: can be transferred under our DPA with consent

---

## Part 3 — Board Materials & Cadence

> "Useful, honest, signal-rich board updates. Not theater."

### 3.1 Board Meeting Cadence

| Meeting type | Frequency | Format |
|---|---|---|
| **Board meeting** | Quarterly | 3h in-person or video; structured agenda |
| **Monthly memo** | Monthly (non-board months) | 2-page written update; async read, async comments |
| **Ad-hoc consult** | As needed | 30-min call; for time-sensitive decisions only |
| **Annual strategy session** | Annually (Q1) | Half-day; product + fundraising + team strategy |

### 3.2 Pre-Read Template

Sent **5 days before** each board meeting. Board members expected to have read it before the meeting — no reading-aloud in the room.

```markdown
# Board Pre-Read — Q[N] [YYYY]
Sent: [5 days before meeting date]

## 1. Since Last Meeting (1 page max)
- Product: what shipped, what slipped, why
- Revenue / ARR: current vs. plan
- Team: hires, departures, key changes
- Ops: anything material

## 2. This Quarter's Metrics Packet (see §3.3)

## 3. Strategic Questions for Discussion (≤ 3)
(Not for approval — for discussion. Board's opinion sought.)
- Q1: ___
- Q2: ___
- Q3: ___

## 4. Risks + Asks
- Risk: ___ | Mitigation: ___
- Ask: ___ (specific help needed from board)

## 5. Financials (last closed month + YTD + 12-month projection)
```

### 3.3 Metrics Packet (Consistent Across Quarters)

| Metric | Reported as |
|---|---|
| ARR | Current + MoM growth |
| MRR | Current + cohort waterfall |
| Trial conversions | % of trials converting to paid |
| Churn rate | Monthly gross + net |
| CAC / LTV | By segment |
| Runway | Months at current burn |
| Headcount | By department |
| NPS / CSAT | Latest score + trend |
| Core product KPI | Time-from-event-to-verified-intel (p50, p90) |
| Uptime / SLO | Rolling 90-day |
| Top 10 customers | ARR, health score, key notes |

Same metrics, same format, every quarter — enables trend analysis.

### 3.4 Risk + Ask Sections

**Risks section format:**

```
Risk: [One-sentence description]
Likelihood: High / Medium / Low
Impact: High / Medium / Low
Mitigation in place: ___
Board action needed: Yes / No
```

**Asks section:**
Specific, actionable requests. Examples: "Intro to [specific person] for a partnership conversation." "Feedback on the enterprise pricing model." "Your read on [competitor] move."

Not vague: "General guidance on GTM" is not an ask.

### 3.5 Strategic Questions Section

3 questions maximum, framed for genuine discussion (not approval). Examples:
- "Should we prioritize UK or Germany for the first EU office?"
- "The $X acqui-hire opportunity — is the thesis compelling enough to move forward?"
- "We're considering adding a free tier. What are the board's concerns?"

Meeting dynamics: founder presents the question + their lean. Board discusses. Founder listens, synthesizes, decides after. Board does not vote on operational decisions.

### 3.6 Executive Session

At the end of every board meeting: 15-minute executive session (board members only, no founders, no observers).

Purpose:
- Board alignment without founder present
- Sensitive topics (founder compensation, leadership feedback)
- No formal minutes; chair may share synthesis with founder as appropriate

### 3.7 Board Observer Policy

Observers (major investors below board-seat threshold, advisors) may attend board meetings at board's discretion.

Rules:
- Observers receive pre-reads and can submit written comments.
- Observers do not speak during meeting unless invited.
- Observers exit for executive session.
- Observer access can be revoked by board majority vote.
- Max 2 observers per meeting.

### 3.8 Board Portal

All board materials managed in a secure portal (Diligent, Aprio, or lightweight equivalent such as a Google Drive + Notion combo for early-stage).

Required documents in portal:
- Board meeting minutes (finalized within 14 days of meeting)
- All pre-reads (permanently archived)
- Cap table + option pool (current)
- Key legal documents (articles, bylaws, investor agreements)
- Financial statements (last 24 months)

Access: board members + authorized executives only. No email attachment distribution of sensitive board materials.

### 3.9 Annual Board Self-Evaluation

Administered by the board chair (or independent director if chair = founder) in Q4:
- Anonymous survey: 10 questions on board effectiveness, meeting quality, strategic value
- Individual feedback: chair collects 1-1 from each director
- Aggregate results shared with full board
- Action items documented + revisited 6 months later

---

## Part 4 — Governance Structure

> "Governance hygiene is invisible until it isn't. Invest early."

### 4.1 Articles + Bylaws

- Incorporated in Delaware (C-Corp) — standard for VC-backed companies.
- Articles and bylaws reviewed by qualified corporate counsel at incorporation + at each major financing.
- Key provisions: drag-along rights, information rights, pro-rata rights — all clearly defined.
- Bylaws current and filed. Any amendment requires board majority or supermajority (as specified).

### 4.2 Board Composition Policy

**Phase 1 (seed):** 3 seats — 2 founders + 1 lead investor.

**Phase 2 (Series A):** 5 seats — 2 founders + 2 investors + 1 independent director (targeted expertise: security / media / defense / govtech).

**Phase 3 (Series B+):** 7 seats — diversified across founders, investors, and 2+ independent directors. Majority independent by IPO.

**Independent director criteria:**
- No material relationship with any shareholder > 5%
- Domain expertise: geopolitical intelligence, media law, cybersecurity, or enterprise software
- Network value: can open doors to government / enterprise customers

### 4.3 Committees (Phase 3+)

| Committee | Trigger | Members |
|---|---|---|
| **Audit Committee** | SOC 2 readiness / pre-IPO | 3 independent directors; chair has financial expertise |
| **Compensation Committee** | > 50 employees | Independent directors only |
| **Nomination & Governance** | Series B | Independent directors majority |

Each committee has a written charter (see §4.4).

### 4.4 Charter per Committee

**Audit Committee Charter (template):**
- Meets quarterly
- Oversees financial reporting, internal controls, external auditor relationship
- Reviews cybersecurity + data privacy incident disclosures
- Annual review of risk register

**Compensation Committee Charter (template):**
- Sets executive compensation (CEO + C-suite)
- Reviews equity grants > defined threshold
- Annual compensation benchmarking survey

**Nomination & Governance Charter (template):**
- Board candidate sourcing + evaluation
- Annual board self-evaluation (§3.9)
- Board diversity targets

### 4.5 Conflict-of-Interest Policy + Disclosure Register

All directors, officers, and key employees must:
- Annually disclose material interests that could conflict with the company
- Disclose any new conflicts within 30 days of arising
- Recuse from board/management decisions where a conflict exists

Disclosure register maintained by the company secretary / general counsel. Reviewed at each annual board meeting.

**Common conflicts to disclose:**
- Investment in a competitor
- Customer / supplier relationship
- Family member employed by a significant partner or customer
- Advisory role with a competing company

### 4.6 Related-Party Transactions Policy

Any transaction between the company and a related party (director, officer, significant shareholder, or their affiliates) requires:
1. Disclosure to the board
2. Approval by disinterested board members only
3. Terms at arm's length (documented with market comparison)
4. Recorded in board minutes

**Examples:** founder using company IP for a personal project, board member's firm selling services to Aegis Lens, investor's portfolio company acquiring Aegis Lens data at below-market rates.

### 4.7 Whistleblower Policy + Channel

- Any employee or contractor may report concerns about financial misconduct, fraud, data misuse, or ethics violations.
- Reporting channel: anonymous reporting via a third-party platform (Ethena, EthicsPoint, or similar) + email to general counsel / board chair.
- Protection: no retaliation for good-faith reports. Any retaliation is grounds for termination.
- Investigation: all reports reviewed by a disinterested director within 14 days. Material issues escalated to full board.
- Reports archived and reviewed annually for patterns.

### 4.8 Annual Governance Review with Counsel

Each year (Q4), the company conducts a governance health check with qualified corporate counsel:
- Are articles + bylaws current for the company's stage?
- Are all equity grants properly documented?
- Are information rights being fulfilled?
- Are there pending governance issues from investor agreements?
- Any regulatory changes (GDPR, export control, sector regulation) requiring bylaw updates?

Output: a short governance memo filed in the board portal.

### 4.9 D&O Insurance

Directors + Officers liability insurance secured before the first external board member joins. Key terms:
- Coverage: $5M minimum (scale with fundraise)
- Entity coverage included
- Employment Practices Liability (EPLI) added at > 10 employees
- Renewal reviewed annually; coverage benchmarked to peer companies of similar stage

---

## Part 5 — Exit Options Awareness

> "Optionality > destination. Don't make exit the goal; make it possible."

*This section is awareness-oriented, not goal-oriented. We are building a durable company. But closing off exit paths through poor hygiene is a mistake.*

### 5.1 IPO-Readiness Checklist (Long-Term)

Requirements typically needed 2–3 years before IPO:
- SOC 2 Type II certified
- Audited financial statements (2 full years pre-IPO)
- Revenue recognition under ASC 606 / IFRS 15
- Clean cap table with no unusual liquidation preferences
- SOX-lite internal controls (documentation + testing)
- Independent audit committee + compensation committee
- Legal entity structure clean and defensible

**Current actions:** maintain clean books from day 1, engage a Big-4 or Tier-2 audit firm at Series A.

### 5.2 Strategic Acquirer Landscape

Categories of potential strategic acquirers (awareness only — not a target list):

| Category | Examples | What they want |
|---|---|---|
| **Defense & intelligence primes** | Palantir, BAE Systems, SAIC, Leidos | OSINT data, AI pipeline, cleared personnel potential |
| **Media / information services** | Reuters, Dow Jones / News Corp, Bloomberg | Real-time intelligence data, journalist tooling |
| **Geospatial / mapping** | Esri, Maxar, Planet | Data layers, alert system, UA-specific expertise |
| **Cloud & cybersecurity** | Microsoft (Azure), Google Cloud, CrowdStrike | AI pipeline, threat-intel data, geopolitical risk models |
| **NGO / humanitarian platforms** | UN systems, large INGOs (unlikely buyers but relevant partners) | Humanitarian data |

**Acquirer alignment filter:** Any acquirer must pass a mission-alignment review — no acquisition to a party that would weaponize our data or personnel against civilian populations.

### 5.3 PE Landscape Awareness

Private equity can be a liquidity option for founders / early investors without a full sale:
- Growth PE: takes minority stake, adds capital + operational expertise
- Buyout: full acquisition (rare at our stage; more relevant at $30M+ ARR)
- Risks: short-term optimization vs. mission; investor timeline pressure

PE is appropriate only if: (a) founders want partial liquidity, (b) strategic acquirers are not the right fit, (c) PE partner has mission-aligned track record (e.g., govtech-focused funds).

### 5.4 Anti-Dilution Discipline

- Standard anti-dilution: weighted-average broad-based (preferred to full ratchet)
- Avoid giving any investor full ratchet anti-dilution — it creates perverse incentives in down-rounds
- Option pool increases managed carefully to minimize founder dilution
- Secondary sales: founders may participate in secondary transactions at board discretion (liquidity without exit)

### 5.5 Clean IP

- All employees + contractors sign an IP assignment agreement before any work begins (no exceptions)
- Open-source code used in the product is tracked in `docs/legal/open-source-licenses.md` with license compatibility review
- No founder personally holds IP that belongs to the company
- Domain names, trademarks, GitHub repos: all owned by the corporate entity, not individuals
- Annual IP audit: review assignments, identify gaps

### 5.6 Mission-Aligned Acquirer Criteria

Any acquisition or merger must satisfy:
- Acquirer does not have a documented history of enabling mass-surveillance, authoritarian repression, or targeting of civilians
- Data use post-acquisition must comply with our existing DPA obligations
- Personnel (especially analysts) are not forced into roles conflicting with their OSINT ethics commitments
- Brand integrity: Aegis Lens cannot be used as a legitimizing front for a bad-actor acquirer

Board maintains a written "do not acquire to" list (private, updated annually). Breach of this policy by any controlling party triggers staff right-to-resign with full vesting acceleration.

### 5.7 Board Alignment on Exit Philosophy

At the first board meeting after each Series close, the board formally discusses and records (in minutes) the shared exit philosophy:

- **Build long:** no target exit date; grow to a standalone durable business.
- **Sell when right:** open to a strategic acquisition if the price + mission fit + timing are all correct.
- **Hybrid:** founder-led primary business with periodic secondary liquidity for early shareholders.

Recording the philosophy in board minutes creates accountability and prevents later misalignment between founders and investors when a live offer arrives.
