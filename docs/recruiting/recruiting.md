# Recruiting Playbook

> **Status:** v1.0 — hiring strategy + per-role interview specs. Review at each phase transition.
> **Covers:** Hiring strategy, Software Engineer, AI/ML, Product Designer, OSINT Analyst, Sales/CS, Ops/Security.

---

## Part 1 — Hiring Strategy

> "The best hires come from referrals. Build a referral culture from day 1."

### 1.1 Per-Phase Hiring Plan

| Phase | Stage | Priority hires | Trigger |
|---|---|---|---|
| **Phase 0** (pre-seed) | Founders only | — | — |
| **Phase 1** (seed) | 8–15 people | Backend engineer × 2, frontend engineer × 1, OSINT analyst × 1, DevOps × 1, designer × 1 | Seed close |
| **Phase 2** (Series A) | 15–40 people | AI/ML engineer × 2, senior engineers × 3, product manager × 1, sales/CS × 2, security engineer × 1, GRC manager × 1 | Series A close |
| **Phase 3** (Series B) | 40–100 people | Build per-segment sales team, L&D, senior management layer, expand engineering | Series B close |

**Hire ahead of need by 1 quarter.** If Phase 2 hires are needed in Q3, start the process in Q2.

### 1.2 Per-Role Rubrics

Each role has a written scorecard (see per-role specs in Parts 2–7). Scorecards are mandatory — no offer without a completed scorecard from every interviewer.

**Scorecard format:**
```
Candidate: ___ | Role: ___ | Interviewer: ___ | Date: ___

Signals evaluated (rate 1–5, 5 = exceptional):
  Technical skill:       ___
  Communication:         ___
  Mission alignment:     ___
  Culture + values:      ___
  Domain knowledge:      ___
  [Role-specific signal]: ___

Overall: [ ] Strong hire  [ ] Hire  [ ] Leaning no  [ ] No hire
Top 3 strengths: ___
Top 2 concerns: ___
```

### 1.3 Sourcing Channels (Priority Order)

1. **Referrals (first):** Every new hire is asked for 5 referrals within their first 30 days. Referral bonus: $2,000 cash (paid after referral passes 90-day probation) or 3-month Pro subscription for non-employees.
2. **Community outreach:** Post to OSINT community channels (Bellingcat Slack, GIJN list, relevant Discord servers), security forums (DEF CON Discord), GitHub.
3. **Events:** Every conference we attend, active recruiting conversations. Collect candidate contacts at every OSINT event.
4. **LinkedIn outbound:** Targeted InMail campaigns for senior/specialist roles. Personalized — not templated.
5. **ATS / job board:** Wellfound (for startup-minded engineers), LinkedIn Jobs, Seek/Indeed for ops/compliance roles. Not the primary channel.
6. **Recruiters (last resort):** External recruiters for C-suite or senior engineering hires where internal sourcing fails. Cap: 15% fee, shared candidates must be exclusive for 30 days.

### 1.4 Diversity Pipeline Targets

**Year 1 targets (Phase 1):**
- Gender: ≥ 40% women / non-binary across the total team
- Geographic: ≥ 3 nationalities represented (company is international by nature)
- Language: ≥ 2 native Ukrainian speakers on the core team from day 1

**Structural practices:**
- Job descriptions reviewed for gender-coded language before posting (use Textio or manual review)
- Interview panels: minimum 2 interviewers, different backgrounds where possible
- Salary bands: not negotiated individually — posted ranges reduce pay gap
- Blind resume screening for junior roles (name + university redacted)
- Track pipeline diversity quarterly; report to board annually

### 1.5 Compensation Philosophy

**Principle:** 60th–80th percentile of market compensation + meaningful equity. We cannot compete with FAANG on salary; we compete on mission + equity + impact.

**Structure:**
- Base salary: benchmarked using Levels.fyi, Radford, and regional equivalents (UA / EU / US-remote)
- Equity: options (ISO in US entities; EMI or CSOP in UK), 4-year vesting, 1-year cliff, 10-year exercise window
- Performance bonuses: not standard — prefer transparent base + equity over bonus complexity
- Benefits: health insurance (or stipend), home office setup budget ($1,000 one-time), learning budget ($1,500/year), remote-work flexibility

**Posted salary ranges:** All job postings include compensation ranges (enforced in CA, CO, NY, and voluntarily elsewhere for fairness).

### 1.6 Time-to-Hire Targets

| Role level | Target (from JD-open to offer-accepted) |
|---|---|
| Junior / mid engineer | 4 weeks |
| Senior engineer | 5 weeks |
| Staff / principal | 6–7 weeks |
| OSINT analyst | 4 weeks |
| Sales / CS | 3 weeks |
| Executive (C-suite) | 8–12 weeks |

If a process exceeds target by > 2 weeks, it requires a review: is the bar too high for the market? Is the process too slow? Are we the bottleneck?

### 1.7 Interview Process (Structured, Scorecards)

**Standard process for most roles:**

```
1. Application review (hiring manager, 2 days)
2. Recruiter / founder screen (30 min video, qualification + interest check)
3. Technical / domain challenge (async take-home OR 60-min live session — never both)
4. System design or portfolio review (60 min with 2 interviewers)
5. Values + culture interview (45 min with a founder or senior team member)
6. References (2 professional references, called within 24h of final interview)
7. Offer (within 48h of reference check — see §1.8)
```

**Mandatory:**
- No more than 7 rounds total (this process is already 5 substantive steps — be strict)
- Every interviewer completes a scorecard before the debrief
- Debrief: 30 min synchronous; majority-agrees-to-hire basis; dissent documented

### 1.8 No-Bait-and-Switch Promise

Every candidate is told at the start of the process:
- The exact role they are being considered for
- The reporting structure
- The team size and current stage
- The equity range (as a $ value based on current 409A, not just % — % is misleading)

If anything material changes between the offer and the start date (role scope, team, reporting line), the candidate has the right to withdraw without penalty, and their offer is extended by 30 days while they decide.

### 1.9 Hire-Decision Template

Used by the hiring manager after the debrief:

```
Candidate: ___
Role: ___
Decision: [ ] Offer  [ ] Hold (pending reference)  [ ] No hire
Unanimous? [ ] Yes  [ ] No (dissenting view: ___)

Offer details (if applicable):
  Base: $___
  Equity: ___ options (current 409A value: $___/option)
  Start date target: ___
  Special terms: ___

Reference check summary (2 references):
  Ref 1 (name, role): ___
  Ref 2 (name, role): ___

Communication plan:
  Verbal offer call: [who] [when]
  Written offer letter: within 24h of verbal acceptance
  Background check: [if applicable]
```

---

## Part 2 — Software Engineer Interview Spec

> "The best engineers want to ship; not 7-round circuses. Tight loop = better hires."

### 2.1 Take-Home Challenge (async, 4–6h max, paid)

- **Compensation:** $150 honorarium (gift card or bank transfer) — signals respect for time; filters casual applicants.
- **Scope:** A small but realistic task from our actual stack (TypeScript, Next.js, Postgres/PostGIS, or the relevant discipline).
- **Examples:**
  - Frontend: Build a small event-list component with a filter + virtualization (given mock data)
  - Backend: Design + implement an API endpoint with pagination and cache-control headers (given a schema)
  - Data: Write a SQL query pipeline over a synthetic PostGIS dataset
- **Evaluation criteria:** Code quality, correctness, TypeScript safety, edge-case handling, a short README explaining decisions
- **Alternative (live coding):** 60-min pair programming on a similar task with a senior engineer. Candidate chooses format.

### 2.2 System-Design Interview (60 min)

Two engineers present (1 lead, 1 observer).

**Format:**
1. Problem statement given (e.g., "Design the ingest pipeline for real-time event data from 20 Telegram channels")
2. Candidate drives the discussion; interviewers ask clarifying questions
3. Focus areas: scalability, fault tolerance, data model choices, tradeoffs

**Scoring dimensions:**
- Ability to identify the right constraints before designing
- Data modeling (schema design, indexing, PostGIS awareness if relevant)
- Distributed systems patterns (queues, idempotency, rate limiting)
- Communication (clear, structured, open to feedback)

### 2.3 Values Interview (45 min, with founder)

Questions (sample):
- Tell me about a project where you had to make an ethical decision about what to build or not build.
- Describe a time you disagreed with a technical decision and how you handled it.
- What does "done" mean to you when shipping a feature that will be used in a crisis situation?
- What draws you to working on conflict intelligence specifically? What gives you pause about it?

**Red flags:** Dismissal of ethical considerations. "It's just code." Preference for complexity over simplicity. "I do whatever the PM asks."

### 2.4 Bar-Raiser per Loop

For every senior/staff hire, a bar-raiser (a senior engineer not on the immediate team) reviews all scorecards and can block a hire. The bar-raiser is not trying to fail candidates — they're ensuring standards don't drift per-team.

### 2.5 Scorecard Rubric

| Signal | Weight | What to look for |
|---|---|---|
| Technical depth | 30% | Does the candidate understand the stack deeply enough to reason about tradeoffs? |
| Code quality | 20% | Is the code readable, typed, tested? |
| System thinking | 20% | Can they reason about distributed systems at scale? |
| Communication | 15% | Can they explain decisions clearly? Do they listen? |
| Mission alignment | 15% | Do they care why this platform exists? |

### 2.6 Reference Checks (2+)

One reference from a direct manager; one from a peer or collaborator. Questions:
- "If you could hire them again, would you, and for what kind of role?"
- "What kinds of problems do they solve best? Where do they need support?"
- "How do they handle ambiguity and disagreement?"
- "Anything I should know that wasn't covered in their interview performance?"

### 2.7 Offer Process

Verbal offer within 48h of reference check. Written offer within 24h of verbal acceptance. No exploding offers — candidates have 7 business days to sign.

---

## Part 3 — AI / ML Engineer & Researcher Interview Spec

> "PhD optional. Practical eval discipline mandatory."

### 3.1 JD Profiles

**Applied AI/ML Engineer:**
- Ships models to production; eval-driven development
- Experience: RAG systems, embedding pipelines, fine-tuning, LLM APIs (Anthropic Claude, OpenAI)
- Stack: Python, Pydantic, Postgres (pgvector), Redis, Qdrant
- Must have: built an eval harness for at least one model

**Senior Research Engineer:**
- Fine-tunes models for specialized domains (multilingual NER, classification, geospatial)
- Experience: Hugging Face ecosystem, training runs (GPU cluster), evaluation methodology
- Must have: published or practical deployment of a domain-adapted model

### 3.2 Take-Home: Small RAG + Eval Task (4–6h, paid $150)

- **Task:** Given a small corpus of synthetic conflict-event reports (provided as text files), build a RAG pipeline that can answer factual questions about events with citations.
- **Requirements:** Use any open embedding model; use any vector store; write a simple eval (at least 5 test Q&A pairs with expected answers).
- **Evaluation:** Correctness of retrieval, quality of the eval harness (can they measure what matters?), code quality, documentation.

### 3.3 System Design — Per-Feature AI Architecture (60 min)

Sample problem: "Design the NLP pipeline for classifying and verifying Telegram messages at 10,000 messages/hour, with multilingual support (UK/EN/RU)."

Expected depth: latency budget, batch vs. streaming path, confidence calibration, human-review queue trigger, model update / rollback strategy.

### 3.4 Ethics + Safety Interview

Questions:
- A model we deploy starts confidently misclassifying events in a way that could mislead journalists. How do you detect it? How do you respond?
- A government client asks us to run a search identifying individuals mentioned in a specific set of documents. What do you do?
- How do you think about the tradeoff between model capability and the risk of enabling OSINT misuse?

**Red flags:** "The model is a black box; we can't really know." No thought given to misuse vectors. Dismissal of dual-use risk.

### 3.5 Domain Alignment

We are not a general-purpose AI research lab. We need people who find the conflict-intelligence domain genuinely interesting. Questions:
- What OSINT or conflict-intelligence resources do you follow?
- What's a specific AI application in this space you think is underexplored?
- What concerns do you have about AI-generated intelligence content?

### 3.6 Scorecard

| Signal | Weight |
|---|---|
| RAG + retrieval competency | 25% |
| Eval discipline (can they measure model quality?) | 25% |
| Multilingual + low-resource model awareness | 20% |
| Ethics + safety reasoning | 20% |
| Domain interest + alignment | 10% |

---

## Part 4 — Product Designer Interview Spec

> "Look for FT / NYT graphics, Bloomberg / Palantir, ATC tooling backgrounds."

### 4.1 JD Profile

**Senior Product Designer (Workspace + Map UX):**
- 5+ years in product design; 2+ years on data-dense or tooling products
- Portfolio must show: complex information architecture, not just marketing pages or consumer apps
- Skills: Figma, interaction design, data visualization principles, accessibility (WCAG AA minimum)
- Bonus: map UI experience, dashboard design, conflict-zone or humanitarian context

### 4.2 Portfolio Bar

Evaluate before inviting to interview:

| Criterion | Pass | Fail |
|---|---|---|
| Complexity | Shipped a tool used by professionals making decisions | Only consumer apps or landing pages |
| Density | Designs handle high information density gracefully | Everything is simple and clean — no hard problems |
| Craft | Typography, spacing, iconography: careful and consistent | Generic, template-heavy |
| Process | Portfolio explains decisions and iterations, not just final screens | Only deliverables, no thinking shown |

### 4.3 Design Challenge (Paid, 4–6h, $150)

**Task:** Given a set of 50 conflict events (mock data with class, severity, location, confidence score), design:
1. A table view that lets an analyst quickly triage events
2. A detail panel for a single event

**Constraints:** Dark color palette; accessibility in mind; information density over minimalism.

**Evaluation:** Information hierarchy, density vs. clarity tradeoff, color usage, accessibility thinking, how they explain their choices.

### 4.4 Design Crit Interview (60 min)

Candidate presents their portfolio piece + the challenge solution. Two interviewers (designer + engineer or PM). Format: "walk us through a decision that was hard." Interviewers push back — how do they handle critique?

**Scoring:**
- Clarity of reasoning (can they articulate why, not just what)
- Openness to critique
- Depth of design thinking (did they consider edge cases, loading states, accessibility)
- Domain curiosity

### 4.5 Values + Collaboration Interview (30 min)

- How do you work with engineers who push back on designs?
- Tell me about a design you were proud of that users or data proved wrong.
- What does designing for trust look like in an intelligence product?

### 4.6 Offer with Equity Weighted

For exceptional designers, weight equity above market norm (fewer candidates; high leverage; hard to replace). Target: 0.5–1.0% for a founding-era designer, with 4-year vest.

---

## Part 5 — OSINT Analyst Interview Spec

> "Avoid hiring analysts who treat OSINT as advocacy. Neutrality is a skill."

### 5.1 Practical: Live Geolocation Challenge (45 min)

Candidate receives a set of 3 images or video clips (synthetic or licensed) and must geolocate as many as possible.

**Scoring:**
- Correct answer: 10 points
- Partially correct (right region, wrong precise location): 5 points
- Methodology explained: +3 bonus points per challenge (we care about the reasoning, not just the answer)
- Time management: finishing all 3 scores better than 1 perfect answer

**Tools allowed:** any open-source tools (Google Maps, Sentinel Hub viewer, Yandex Maps, SunCalc, GeoGuessr — per their terms)

### 5.2 Practical: Verification Challenge (30 min)

Candidate receives 5 pieces of media (image/video clips) — a mix of genuine, altered, and synthetic. Must:
1. Classify each as: genuine / suspect / likely synthetic
2. Provide the open-source signals used to make each judgment
3. State confidence level (low / medium / high) with rationale

**Red flags:** Over-confidence on synthetic media. No use of metadata. Judgment made on content alone without source provenance.

### 5.3 Methodology Interview (45 min)

Structured discussion on:
- Walk me through how you'd investigate [specific claim] (e.g., "A video claiming to show a specific strike — how do you verify it?")
- What are the biggest failure modes in open-source verification?
- How do you handle conflicting evidence from sources with different reliability profiles?
- What's your approach to verification when the original source has been deleted?

### 5.4 Ethics Interview

This is a pass/fail gate. Red flags = immediate no hire.

Questions:
- You identify a person from a viral video. What do you do with that information?
- A journalist asks you to find the home address of a person of interest. How do you respond?
- You're 80% confident about an event but publication deadline is in 2 hours. What do you recommend?
- Do you have a personal view on the conflict you'd be covering? How do you manage that in your work?

**Red flags:** Willingness to doxx individuals. Advocacy bias masquerading as analysis. "The truth justifies any method." Certainty without evidence.

### 5.5 Mission Alignment

- Why Aegis Lens specifically? (Can they articulate what we do and why it matters?)
- What OSINT resources/publications do they follow?
- What's a recent verification they found impressive or instructive — and why?

### 5.6 Per-Language Coverage Planning

When hiring, map the candidate to the language coverage matrix:

| Language | Priority | Proficiency required |
|---|---|---|
| Ukrainian (UK) | Tier 1 | Native or near-native (reading + writing + listening) |
| English (EN) | Tier 1 | Professional working proficiency |
| Russian (RU) | Tier 1 | Reading + listening (for monitoring hostile-state media) |
| Polish (PL) | Tier 2 | Professional working |
| German (DE) | Tier 2 | Professional working |
| Romanian (RO) | Tier 3 | Reading preferred |

At Phase 1, hire 1 UA-native analyst + 1 EN-native analyst. Phase 2: add RU reader + expand.

### 5.7 Operational Security Training upon Hire

Before the analyst touches real data sources:
- **Day 1:** OpSec overview (VPN, OPSEC practices, source protection)
- **Week 1:** Data handling + PII policy (`docs/data/data-governance.md`)
- **Week 2:** Platform-specific training (Aegis Lens internal tools)
- **Month 1:** Peer review of first 5 published geolocations / verifications

---

## Part 6 — Sales, CS, Solutions Interview Spec

> "First sales hire is decisive. Pick a founder-stage believer, not a Salesforce-corporate veteran."

### 6.1 Phase Sequence

| Phase | Hire | Trigger |
|---|---|---|
| **Phase 1** | Founder-led sales (no sales hire yet) | Pre-product-market fit |
| **Phase 2** | 1st SDR + 1st AE + 1st CSM | $300K ARR; repeatable sales motion proven |
| **Phase 3** | Per-segment AEs + SE + CS team | $2M ARR; segment differentiation needed |

**First sales hire criteria:** Has sold a data or intelligence product before. Has sold to journalists, NGOs, or government. Comfortable with a 3–6 month sales cycle. Believes in the mission, not just the commission.

### 6.2 Per-Role Expectations

**SDR (Sales Development Representative):**
- Outbound prospecting (LinkedIn, cold email, community outreach)
- Lead qualification (BANT: Budget, Authority, Need, Timeline)
- 20 qualified meetings booked per month (Year 1 target)
- Domain experience in journalism or gov procurement a strong plus

**AE (Account Executive, full-cycle, mid-market + enterprise):**
- Owns deals from demo to close
- Manages multi-stakeholder enterprise sales (5+ contacts per account)
- Target: $500K–$2M ARR quota (Phase 3)
- Experience with compliance-heavy buyers (gov, NGO, media) preferred

**SE (Solutions Engineer, technical pre-sales):**
- Runs technical demos and custom integrations for gov / enterprise deals
- Writes SOWs and integration specs
- Bridges sales and engineering for complex deployments

**CSM (Customer Success Manager):**
- Owns post-sale relationship for top 50 accounts
- Monthly check-ins; QBRs for accounts > $20K ARR
- Churn prevention: monitors usage health score; triggers interventions
- Expansion: identifies upsell opportunities (more seats, add-ons, tier upgrades)

### 6.3 Hiring Interview: Sales-Specific

**1st round screen (30 min):**
- "Tell me about the most complex sale you've closed. Walk me through the buyer journey."
- "Who is the buyer at a major NGO for an intelligence-data subscription? How do you get to them?"
- "What do you know about the OSINT / conflict-intelligence market? Name 3 players."

**2nd round — mock discovery call (45 min):**
Candidate runs a mock discovery call with a founder playing a prospect (Kyiv-based journalist lead). Evaluate: listening vs. talking ratio, question quality, ability to surface pain without pitching.

**3rd round — reference check:**
One from a direct manager; one from a customer who bought from them.

Key reference question: "Would you buy from them again?"

### 6.4 Mission Alignment Screened

Ask explicitly: "What part of what we do gives you pause?" A good sales hire has thought about the ethics of selling intelligence data. A bad one hasn't. The product touches real conflicts and real casualties — the rep needs to be able to navigate that with customers honestly.

---

## Part 7 — Ops, Security, Compliance Hiring Spec

> "Security + compliance unlock enterprise revenue. Don't under-hire here."

### 7.1 Phase-Based Hiring Sequence

| Role | Phase | Type |
|---|---|---|
| **DevOps / Platform Engineer** | Phase 1 | Full-time |
| **Security Engineer** | Phase 1 | Part-time / fractional → full-time Phase 2 |
| **Finance + Ops Generalist** | Phase 1 | Fractional (20h/week) → full-time at Series A |
| **Legal Counsel** | Phase 1 | Fractional (outside counsel) → in-house Phase 3 |
| **GRC / Compliance Manager** | Phase 2 | Full-time; triggers: SOC 2 audit, EU enterprise deals |
| **DPO (Data Protection Officer)** | Phase 2 | Full-time or fractional; triggers: > 1,000 EU users or B2B EU contracts |
| **SRE (Site Reliability Engineer)** | Phase 2 | Full-time; triggers: 99.9% SLO required by enterprise customers |
| **CISO** | Phase 3 | Full-time; triggers: government contracts, Series B |

### 7.2 Role-Specific Interview Criteria

**DevOps / Platform Engineer:**
- Deep Kubernetes experience (cluster design, multi-region)
- IaC: Terraform or Pulumi
- CI/CD: GitHub Actions or similar
- Observability: Prometheus, Grafana, OpenTelemetry
- Challenge: "Design the CI/CD pipeline for a 5-service monorepo with staging + production environments"

**Security Engineer:**
- Cloud security (AWS / GCP / Azure): IAM, VPC, secrets management
- Vulnerability management lifecycle
- Threat modeling experience (STRIDE or equivalent)
- Incident response: has been on-call for a security incident
- Bonus: cleared or familiar with government security requirements (NIST, ISO 27001)

**GRC / Compliance Manager:**
- Led or significantly contributed to a SOC 2 Type II audit
- GDPR practical implementation (ROPA, DPIA, breach notification)
- Experience with government or enterprise security questionnaires
- Bonus: CIPP/E or CISSP certified

**DPO:**
- Formal DPO certification or equivalent legal/compliance background
- GDPR Articles 37–39 practical experience
- Experience advising on cross-border data transfer mechanisms (SCCs, BCRs)
- Can communicate privacy requirements to engineering teams in plain language

**CISO:**
- 10+ years in security; 3+ years in leadership
- Has built a security program from scratch in a scaling startup or SME
- Familiar with dual-use tech / intelligence product security constraints
- Board communication experience: can present the risk register to non-technical directors

### 7.3 References for Security Roles

For Security Engineer and CISO: minimum 3 references including:
- 1 reference who has worked alongside them during an active security incident
- 1 reference who is a current or former customer/stakeholder (someone they protected, not just a manager)
