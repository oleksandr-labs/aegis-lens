# Sales Playbook

> **Status:** v1.0 — go-to-market operations. Review quarterly.
> **Covers:** Master playbook (ICP, value props, objections, MEDDICC), SDR/outbound, Enterprise motion, Government motion, Newsroom motion, Collateral library.

---

## Part 1 — Master Sales Playbook

> "A repeatable motion is what makes scale possible. Pick a framework + stick."

### 1.1 Ideal Customer Profile (ICP) per Segment

**Primary ICP: Professional who needs verified conflict intelligence faster than they can gather it manually.**

| Segment | ICP characteristics | Buying signal |
|---|---|---|
| **Newsroom** | 5–500 person news org; data editor, OSINT lead, or senior correspondent; covers Ukraine, security, conflict; currently using LiveUAmap or Twitter manually | Asking "how do I cite a source?"; covering a breaking conflict story; frustrated with unverified social media |
| **NGO / Humanitarian** | Mid-to-large INGO (>100 staff); safety & security officer, field coordinator, or protection lead; operating in or near conflict zones | Ask about "safety of staff" / "real-time situation awareness"; participating in UN OCHA coordination |
| **OSINT / Security Firms** | Commercial intelligence or OSINT consultancy; 5–200 staff; selling intel-as-a-service; analyst-heavy | Evaluating tools for their team; need API access; have budget for data subscriptions |
| **Enterprise (Finance / Insurance / Shipping)** | Mid-large company with material Ukraine / Black Sea / Eastern Europe exposure; risk manager, geopolitical analyst, or supply-chain lead | Board-level geopolitical risk conversation; active Ukraine exposure; recent Black Sea shipping incident |
| **Government** | Allied government (EU, NATO member, US) department or agency; defense analyst, policy advisor, or procurement officer | Cited Aegis Lens in a public document or conference; procuring conflict-intelligence tools; participating in OSINT-capacity-building programs |

### 1.2 Per-Segment Value Propositions

| Segment | Core value prop (one sentence) | Proof points |
|---|---|---|
| **Newsroom** | "Publish verified conflict reports faster than any wire service — with citations that hold up." | TEVI median < 90s; source tracing; SEO reach of verified events |
| **NGO / Humanitarian** | "Know the situation before your field team does — so you can keep them safe." | Real-time civilian alert layer; air-raid integration; field-ready mobile PWA |
| **OSINT / Security Firm** | "Replace 3 tools with one platform — and get the API to build your own products on top." | REST API; Python SDK; white-label; custom data layers |
| **Enterprise** | "Turn conflict risk into a boardroom-ready intelligence briefing — automatically." | AI-generated risk report; PDF export; supply-chain overlay; financial exposure view |
| **Government** | "Allied-grade OSINT coverage — deployable on your infrastructure if required." | Sovereign deployment option; SOC 2; EU data residency; SBOM available |

### 1.3 Per-Segment Objection Handlers

| Objection | Segment | Handler |
|---|---|---|
| "We already use LiveUAmap / Twitter." | All | "LiveUAmap is great for visualization; we add verification, sourcing, and exportable intelligence. Twitter is raw signal; we turn it into trusted data. Think of us as the intelligence layer on top." |
| "We can't afford this." | NGO, small newsroom | "We have a free press tier and a grants program for NGOs and journalists. Let's check if you qualify. The only cost is registration." |
| "How do we know the data is accurate?" | Gov, enterprise | "Every event has a source chain and a confidence score. We publish our methodology and verification error rate publicly. You can audit any event." |
| "Our legal / procurement process is slow." | Gov, enterprise | "We have a pre-filled security questionnaire, SOC 2 report, and DPA ready. We've done it before — send us the questionnaire and we'll turn it around within 48h." |
| "We build our own tools internally." | Security firm, enterprise | "We offer API access and a Python SDK. Use us as the data layer; own the front end. You get 18 months of our data-pipeline investment for the cost of a subscription." |
| "We're concerned about data security." | Gov, enterprise | "We're SOC 2 Type II (in process). We offer EU-Frankfurt data residency. For government, we offer sovereign deployment on your infrastructure." |
| "What if you shut down?" | Gov, enterprise | "We offer a data escrow option — periodic bulk exports deposited in your cloud storage. You're never dependent solely on our uptime." |
| "We need Ukrainian language support." | NGO, gov UA | "Ukrainian is a Tier-1 locale — our platform, help center, and AI outputs support UK natively. Our analytics team is partially Ukraine-based." |

### 1.4 Demo Script

**Demo flow (30 min):**

1. **Hook (3 min):** Start with a real recent event from the prospect's region of interest. "Let me show you how Aegis Lens processed this event 47 seconds after it was first reported on Telegram."

2. **Map workspace (8 min):**
   - Live map with recent events (demo environment with real data from last 48h)
   - Filter by event class, confidence, time range
   - Click an event → detail panel (source chain, confidence score, related events)
   - Zoom to region → region KPI strip

3. **AI Copilot (5 min):**
   - Type: "Summarize drone activity in Kharkiv Oblast in the last 24 hours"
   - Show cited response with event IDs
   - "Generate a risk summary for shipping routes through the Black Sea"

4. **Alerts (4 min):**
   - Create a live alert rule: "Missile events + confidence > 0.7 + Kyiv region"
   - Show how it would trigger in Telegram or email

5. **Export / API (4 min):**
   - For newsroom: "Here's the attribution-ready format for your article."
   - For enterprise: "Here's the PDF risk report your board can read on Monday morning."
   - For technical: "Here's the API response for the same query."

6. **Q&A + next step (6 min):** Never leave without a specific next step (trial, POC agreement, procurement intro, etc.)

**Demo recording:** 5-minute recorded highlight available for async prospects who won't take a live call.

### 1.5 Discovery Questions per Segment

Ask 3–5 of these per call. Listen more than talk.

**Universal:**
- "What does your current process look like for tracking conflict events in your region of interest?"
- "How much time does your team spend today gathering and verifying intelligence from open sources?"
- "What would you do with the time or confidence if verification were automated?"

**Newsroom:**
- "What happened the last time you published a story based on social media and had to correct it?"
- "How long from a breaking event to your first published report?"
- "What are your editors' standards for citing OSINT sources?"

**NGO / Humanitarian:**
- "How do you currently ensure your field team has advance notice before moving through a high-risk area?"
- "Who is your safety & security officer, and what tools do they use today?"
- "Have you ever had a close call that better real-time intelligence could have prevented?"

**Enterprise:**
- "How does geopolitical risk get surfaced to your board or risk committee today?"
- "What's your exposure to Ukraine — supply chain, investments, operations?"
- "Who currently owns the geopolitical risk function, and what do they read?"

**Government:**
- "What classification level does your team work at, and can you use commercial SaaS at that level?"
- "Are you looking for a tool for your team, or are you evaluating for a broader deployment?"
- "What's your procurement vehicle — direct purchase, GSA schedule, NATO catalog?"

### 1.6 Pricing + Negotiation Guardrails

| Tier | Standard price | Discount authority | Notes |
|---|---|---|---|
| Pro | $49/month | None — self-serve | No discount on Pro; it's already a good deal |
| Team | $299/month | AE: up to 15% | Annual commitment required for discount |
| Enterprise | Custom | AE: up to 20%; CEO: up to 30% | Never below floor without CEO sign-off |
| Gov | Custom | CEO only | 18+ month cycles; patience |
| White-label | Custom | CEO only | Requires 12-month minimum |

**Never negotiate below floor without CEO sign-off.** If a prospect cannot afford the floor, offer the free press tier, NGO grant, or academic program instead — do not discount into unsustainable deals.

**Annual commitment discount:** 15% off (2 months free equivalent). Default offer for all Team+ deals.

**Multi-year discount:** 25% off for 3-year commitments (CEO approval; rare).

### 1.7 MEDDICC Qualification Framework

We use **MEDDICC** for all Team+ deals:

| Letter | Element | Key question |
|---|---|---|
| **M** | Metrics | "What does success look like in numbers?" |
| **E** | Economic Buyer | "Who approves the budget?" (Must be identified before demo) |
| **D** | Decision Criteria | "What does a winning vendor need to have?" |
| **D** | Decision Process | "Walk me through how you make a purchase decision." |
| **I** | Identify Pain | "What happens if this problem isn't solved in 6 months?" |
| **C** | Champion | "Who internally is excited about this and will fight for it?" |
| **C** | Competition | "What else are you evaluating? Why are we still in the conversation?" |

Every opportunity in the CRM has MEDDICC fields. **No deal advances to "Proposal" stage without a named Champion and Economic Buyer.**

### 1.8 Per-Stage CRM Hygiene Rules

| Stage | Required fields | Action |
|---|---|---|
| **Lead** | Source, segment, contact name, org | Respond within 24h |
| **Qualified** | MEDDICC: Pain + Champion identified | Discovery call scheduled |
| **Demo** | MEDDICC: Decision criteria documented | Demo complete; next step committed |
| **Proposal** | MEDDICC: Economic Buyer confirmed; proposed price | Proposal sent |
| **Negotiation** | Discount level, approval status | Legal review if needed |
| **Closed Won** | Contract signed, start date, MRR | Handoff to CS within 48h |
| **Closed Lost** | Loss reason (1 of 6: budget/champion/timing/competition/no pain/poor fit) | Win/loss interview scheduled |

No deal stays in the same stage for > 30 days without a "stuck deal" flag and manager review.

### 1.9 Win/Loss Interview Process

For every closed deal (won OR lost):
- **Won:** Customer interview 60 days after contract sign. "What made you choose us?"
- **Lost:** Interview within 7 days of loss. "What would have made you choose us?"

Interview questions:
1. What problem were you trying to solve?
2. What other options did you evaluate?
3. What was the deciding factor in your choice?
4. Was pricing a factor?
5. What could we have done better?

Results: logged in CRM + summarized quarterly in playbook review.

### 1.10 Quarterly Playbook Update

Every quarter, the sales lead reviews:
- Win/loss interview themes from the quarter
- Top 3 objections and whether existing handlers worked
- Value proposition updates (new features, new case studies)
- Pricing changes or new tiers
- Updated ICP signals based on who actually bought

Playbook updated in writing before next quarter's kickoff. Changes announced in `#sales` Slack channel.

---

## Part 2 — SDR / Outbound Motion

> "Outbound to defense + gov requires patience. 6-touch sequences minimum."

### 2.1 ICP Lists per Segment

**Tooling:** Apollo (primary), ZoomInfo (enterprise gov data), hand-curated lists for high-value targets.

| Segment | List source | Enrichment |
|---|---|---|
| Newsrooms | GIJN member directory + ONA attendee list + Muck Rack journalist search | Apollo enrich with contact + recent coverage |
| NGOs | OCHA FTS partner directory + EU ECHO partner list | Hand-curated |
| OSINT / security firms | Hand-curated from OSINT Twitter, DEF CON attendees, conference speakers | LinkedIn + Apollo |
| Enterprise | Refinitiv / S&P data on companies with Ukraine exposure | Apollo + ZoomInfo |
| Government | SAM.gov + GovWin (US); PPN / TED (EU); hand-curated for allied ministries | Hand-curated; no mass-scrape of gov contacts |

List hygiene: reviewed quarterly. Contacts with 2+ bounced emails removed. Priority contacts refreshed monthly.

### 2.2 Sequence Templates per Segment

**Newsroom sequence (7 touches over 21 days):**
1. Email: "How [Publication] can verify Ukraine events in < 2 minutes" (personalized to their beat)
2. LinkedIn connection request (no message yet — wait for acceptance)
3. Email: follow-up with a specific story they published + how Aegis Lens data would have helped
4. LinkedIn message (if connected): short version of the same
5. Email: "Our methodology doc — we think transparency about how we verify matters for journalists"
6. Email: "Free press tier — no strings, just access"
7. Breakup email: "Happy to connect if timing is right in the future"

**Government sequence (9 touches over 45 days):**
1. Email: warm intro (reference a relevant conference, a published policy paper, or a mutual contact)
2. Email: one-pager attached (specific to their agency's mission)
3. LinkedIn connection (if public profile available)
4. Email: case study from a peer government or alliance partner
5. Phone call attempt (if number available via authorized source)
6. Email: invite to a relevant webinar or event we're hosting
7. LinkedIn message: "Sharing a methodology brief — relevant to [specific policy area]"
8. Email: "Sovereign deployment option — does that change the conversation?"
9. Breakup email: "Will reach out when timing is right"

### 2.3 Per-Rep Cadence Target

| Activity | Daily target | Weekly target |
|---|---|---|
| New sequences started | 5 new prospects | 20 |
| Follow-up touches (in sequence) | 20 | 100 |
| Personalized emails (custom, not template) | 3 | 15 |
| LinkedIn outreach | 5 connection requests | 25 |
| Qualified meetings booked | — | 4–5 |

**No spray-and-pray.** A generic template with no personalization is a brand negative. Every touch must reference something specific about the prospect (their recent article, their organization's public mission, a shared conference).

### 2.4 Personalization Standards

Every sequence touch must include at least **3 observable facts** about the prospect:
1. Something about their organization (recent article, project, mission)
2. Something about their role (their specific coverage area, their function)
3. Something connecting their context to our product (a specific use case relevant to them)

Personalization is reviewed randomly by the sales lead monthly. Templates without personalization signals are removed.

### 2.5 Per-Sequence A/B Testing

Each quarter, 1 A/B test per major segment:
- Variable: subject line OR opening sentence OR CTA
- Minimum: 50 sends per variant before declaring a winner
- Winning variant adopted as default; losing variant archived

Tracked in Apollo / HubSpot sequence analytics.

### 2.6 Lead → AE Handoff SLA + Criteria

A lead is **qualified and handed to an AE** when:
- Prospect has responded positively (interested in learning more) AND
- Segment is identified AND
- At least one MEDDICC element (Pain or Champion) is confirmed

**Handoff SLA:** SDR hands off within 4 hours of qualification. AE picks up and schedules discovery within 24 hours.

**Warm handoff format:**
```
Prospect: [Name, Title, Organization]
Segment: [Newsroom / NGO / Enterprise / Gov]
Contact source: [Cold outbound / Inbound / Referral]
MEDDICC so far: Pain: ___ Champion: ___ Economic Buyer: ___
Relevant context: [what they care about, what they said]
Recommended opening: [AE-specific suggestion]
```

### 2.7 CRM Hygiene

- Every call, email, and LinkedIn touch logged in HubSpot within 24h
- Contact records updated after every interaction (new info on decision process, budget, timeline)
- SDR responsible for their own contact hygiene; audited weekly by sales lead
- No activity logged as "touched" without documented content of the touch

### 2.8 Per-Rep Activity + Outcome Metrics

| Metric | Frequency | Target |
|---|---|---|
| Sequences started | Weekly | 20 per week |
| Open rate | Weekly | > 35% |
| Reply rate | Weekly | > 8% |
| Positive reply rate | Weekly | > 3% |
| Qualified meetings booked | Weekly | 4–5 |
| Meeting → Demo conversion | Monthly | > 70% |

Reviewed in weekly 1-on-1 between SDR and sales lead. No stack ranking — reviewed for coaching, not competition.

---

## Part 3 — Enterprise Sales Motion

> "Enterprise is patient. Be ready before they ask. Pre-fill compliance pack."

### 3.1 Multi-Threading per Account

Enterprise deals die when the champion leaves or the budget is cut. Multi-thread from day 1:

| Stakeholder | Role in deal | Engagement strategy |
|---|---|---|
| **Champion** | Internal advocate who wants the product | Demo → regular check-ins; share early access features; co-create success criteria |
| **Economic Buyer** | Budget owner (often VP or C-level) | Brief executive deck; ROI model; social proof from peer organizations |
| **Technical Evaluator** | Engineer or IT security who runs the POC | Technical deep-dive; sandbox environment; security questionnaire; architecture docs |
| **Procurement** | Vendor registration, legal review, PO issuance | Early vendor setup; standard contract template; fast legal turnaround |
| **Legal / Compliance** | DPA, data residency, sub-processor review | Pre-signed DPA template; SOC 2 report; sub-processor list; SBOM |

**Rule:** Any deal in negotiation without contact at the Economic Buyer level is at risk. Flag and escalate.

### 3.2 Mutual Close Plan Template

Shared with the prospect at the end of the demo stage:

```markdown
# Mutual Close Plan — [Company Name] × Aegis Lens

**Goal:** [Company Name] team live on Aegis Lens by [Target Date]

| Milestone | Owner | Due Date | Status |
|---|---|---|---|
| POC scope agreed | [Champion Name] + AE | [Date] | |
| POC environment access | Aegis Lens | [Date] | |
| Technical review complete | [Evaluator Name] | [Date] | |
| Security questionnaire returned | [Security contact] | [Date] | |
| Executive briefing | [EB Name] + AE | [Date] | |
| Legal / DPA review | Legal + Aegis Lens | [Date] | |
| Contract signed | [EB] | [Date] | |
| Onboarding start | CSM | [Date] | |
```

Reviewed together at each call. Slipping milestones are a buying-intent signal.

### 3.3 POC Structure (Scoped, Time-Boxed, Success Criteria)

**Default POC: 30 days**

Before POC starts:
1. Written success criteria signed by champion (and economic buyer if possible)
2. Named technical contact on prospect side
3. Data access scoped (what regions, what event classes, what API volume)
4. Clear "go / no-go" milestone at day 14 (mid-POC check)

**POC structure:**
- Week 1: Onboarding, data familiarization, initial filter setup
- Week 2: Primary use-case testing; mid-POC check meeting
- Week 3: Secondary use-case, edge-case testing, team feedback
- Week 4: POC wrap-up, success criteria review, decision meeting

**POC should not be "free forever."** Set a hard end date; if success criteria are met, move to contract within 7 days. If not met, do a 10-minute retrospective and either improve or part ways.

### 3.4 Security Questionnaire Pre-Filled

Maintained in the Trust Center and updated quarterly. Covers:
- CAIQ (Cloud Security Alliance Questionnaire) — standard
- Shared Assessment SIG Lite
- Custom questionnaires from specific enterprise/gov customers (archived for reuse)

**SLA:** Return any security questionnaire within 48 business hours. Assign to the security team lead; AE and SE support.

### 3.5 Per-Deal Cross-Functional Review (SE + Legal + Finance)

For any deal > $25K ACV:
- **SE:** Has reviewed the technical architecture and confirmed we can meet the customer's requirements
- **Legal:** Has reviewed any non-standard contract terms
- **Finance:** Has confirmed revenue recognition implications (multi-year deals, milestone-based)

Review happens before the proposal is sent. 48-hour turnaround; escalate to CEO if blocked.

### 3.6 ROI Calculator per Use-Case

Available as a web tool at `/roi` and a Google Sheets version for offline demos.

**Inputs:**
- Current number of analysts spending time on manual OSINT verification
- Estimated hours/week per analyst on verification tasks
- Analyst fully-loaded cost per hour
- Number of verification errors leading to corrections per month (cost of corrections)
- Subscription tier price

**Outputs:**
- Time savings / week (hours)
- Annual analyst cost savings
- Reduction in correction costs
- Net ROI (savings minus subscription cost)
- ROI as a multiple of subscription cost

Pre-filled examples available per persona (newsroom 5-person team, enterprise risk team, NGO field team).

### 3.7 Reference-Customer Call Program

**Objective:** Peer-to-peer endorsement from a trusted customer.

**Program mechanics:**
- Identify 3–5 customers per segment willing to take reference calls
- Brief them before any call (what the prospect's concerns are; what to emphasize)
- Never surprise a reference customer with a new topic
- Reference customer receives: extended enterprise access renewal, priority access to new features, co-marketing opportunity (their choice)

**Reference library:** Customer case studies + reference contacts documented in a private Notion database (sales-team access only). Updated as customers agree/disagree to participate.

### 3.8 Procurement Pack Ready

Pre-assembled pack available within 24h of request:
- DUNS / D-U-N-S number (company registration)
- SAM.gov registration (for US government deals)
- SOC 2 Type II report (NDA required for sharing)
- SBOM (Software Bill of Materials) — generated from production manifest
- Standard vendor questionnaire pre-filled (ISA CAIQ Lite)
- Insurance certificate (general liability + cyber)
- Aegis Lens standard DPA
- Sub-processor list

**Owner:** Legal + Sales Ops. Updated quarterly. Stored in the Trust Center (internal view) + available to send within 24h.

### 3.9 Renewal Motion (Start at Month 9 of 12)

- **Month 9:** CSM reviews account health score + usage. If green, sends a "renewal preview" email (we value you; here's your renewal rate + any new features since signing).
- **Month 10:** Renewal call. Identify any expansion opportunities (more seats, add-ons, tier upgrade). Address any concerns.
- **Month 11:** Renewal proposal sent. Standard rate unless negotiated.
- **Month 12:** Contract signed or exit confirmed. No auto-renew without explicit renewal signature for enterprise deals.

### 3.10 Multi-Year Discount Structure

| Commitment | Discount | Notes |
|---|---|---|
| 1 year | 15% vs. monthly rate | Standard annual offer |
| 2 years | 20% vs. monthly rate | AE authority |
| 3 years | 25% vs. monthly rate | CEO approval required |

Multi-year deals: payment upfront or quarterly (annual payment preferred — better cash flow).

---

## Part 4 — Government Sales Motion

> "Gov pipeline is real but slow. Don't bet runway on it."

### 4.1 Sovereign-Deployment Story

For governments that cannot use a shared cloud SaaS product:
- **Option A:** EU-Frankfurt dedicated tenant (data residency + logical isolation) — available on Enterprise plan
- **Option B:** Customer-managed deployment (deploy our Docker images on their own cloud / on-prem) — available as add-on; requires a 12-month commitment + professional services engagement
- **SOC 2 Type II** (in progress) as baseline security assurance
- **SBOM** available on request — allows their security team to audit dependencies

The sovereign-deployment story must be understood by the AE before engaging any government customer. It is a differentiator vs. competitors who cannot offer it.

### 4.2 Per-Country Compliance Map

Before engaging any government:

| Country | Key compliance requirements | Notes |
|---|---|---|
| United States (Federal) | FedRAMP (future), ITAR/EAR posture, Section 889 compliance | Start with non-ITAR-controlled data; document export control stance |
| European Union / Member States | GDPR, NIS2, EU AI Act (for AI features) | DPA mandatory; EU data residency available |
| United Kingdom | UK GDPR, Cyber Essentials Plus (future) | Brexit-separate DPA; UK data residency (Enterprise) |
| Ukraine | UA data protection law; UA entity may be needed | Consult local counsel; sovereignty is a positive |
| NATO member (non-EU/US) | NATO procurement rules, national security review | Vary by country; work with local partner or prime |

### 4.3 Procurement Pack (Gov-Specific)

In addition to the standard procurement pack (§3.8), government customers require:
- ITAR / EAR classification statement (signed by legal)
- Foreign ownership disclosure (if applicable)
- Section 889 compliance letter (for US federal customers)
- SAM.gov registration + CAGE code (for US prime contracts)
- National Industrial Security Clearance status (if relevant — likely N/A at this stage)

Maintained by Legal + Sales Ops. New government markets require 2-week prep before outreach to ensure compliance pack is ready.

### 4.4 FedRAMP / IL2–5 Evaluation

**Decision deferred to Phase 3.** FedRAMP Moderate authorization takes 12–18 months and $500K–$2M. Not appropriate before $5M ARR.

**Current stance:**
- FedRAMP Low self-assessment documented (for awareness only, not authorization)
- IL2 path evaluated at Series B

Communicate this honestly to US government prospects: "We are not currently FedRAMP authorized. We are suitable for unclassified use at the agency level. We are evaluating the FedRAMP path as we scale."

### 4.5 Per-Government Reference Projects

Build references by starting with:
1. Allied government public programs (EU transparency-related agencies, NATO communication bodies) where procurement is lighter
2. NGO / multilateral partnerships (UN OCHA, ICRC) as trusted references for government customers
3. UA government digital-first bodies (Diya, National Security Council adjacent programs — with careful due diligence on partnership ethics)

Target: 3 government or quasi-government reference customers before pursuing bilateral national-security procurement.

### 4.6 Channel: Prime Contractor Partnerships (Phase 3)

Large government contracts are won through prime contractors (SAIC, Leidos, Palantir, Booz Allen, BAE Systems Applied Intelligence in EU). Phase 3 strategy:
- Identify 2–3 prime contractors where Aegis Lens can be a subcontractor or data partner
- "Technology partner" agreements negotiated before any specific bid
- Avoid primes that are also direct competitors

### 4.7 Lobbying Boundaries Policy

**We do not engage in lobbying.** Specifically:
- No PAC contributions or political donations under any corporate entity
- No registered lobbying activities
- No engagement with defense-policy advocacy in a way that could influence intelligence product regulation in our favor

**Why:** Mission credibility. We serve multiple allied governments. Any perception of political influence would compromise neutrality.

### 4.8 No-Political-Endorsement Policy (Explicit)

Aegis Lens does not publicly endorse any political party, candidate, or policy position.

The company may:
- Comment on the importance of press freedom, humanitarian protection, and OSINT standards (mission-adjacent)
- Cite factual data (event counts, verified intelligence) in public discourse
- Participate in policy discussions on open data, AI in intelligence, and media freedom

The company will not:
- Endorse or condemn specific governments, politicians, or military decisions
- Express a view on the political outcome of the Ukraine conflict
- Allow our data to be used in political advertising

### 4.9 Country-by-Country Deal Authorization

Every new country market for a government deal requires:
- CEO authorization before any outreach
- Legal review of applicable export control, ITAR/EAR, and sanctions risk
- Conflict-of-interest check: does this government have a documented record of using intelligence tools against journalists or civilians?

Countries on a reviewed "proceed-with-caution" list require board awareness.

### 4.10 Multi-Year Contract Templates

Government-specific contract templates (maintained by legal, separate from commercial templates):
- 12-month base term + 2 × 1-year options (standard government structure)
- Annual price escalation cap: CPI + 3%
- Termination for convenience: 90-day notice
- Termination for cause: 30-day cure period
- Data return: 60-day data export window upon termination
- Sovereign deployment amendment available

### 4.11 Per-Deal Ethics Review

Before any government deal closes:
- CEO + security advisor review: "Could this deal enable targeting of civilians, journalists, or humanitarian workers?"
- If yes or uncertain: declined or paused pending third-party ethics review (see `docs/ethics-board/ethics-governance.md`)
- All government customers sign the enhanced AUP (acceptable use policy with government-specific prohibitions)

### 4.12 Conferences (Caution on Defense-Specific Events)

| Conference | Approach | Notes |
|---|---|---|
| CYBERUK | Active — speaking + networking | UK cyber + policy; aligned with our mission |
| DGAP / SWP events (Germany) | Active — policy community | EU think-tank audience; credibility building |
| AUSA (US Army) | Observer only | Not exhibiting; intelligence gathering on market |
| Eurosatory (France, biennial) | Very cautious — observer only if we attend | Defense industry; optics risk if misaligned |
| IDEX (Abu Dhabi) | Not attending | Geographic + political risk |

---

## Part 5 — Newsroom Sales Motion

> "Newsroom won — citation-stream begins. Free press tier is acquisition."

### 5.1 Verified-Press Tier as Funnel

The free verified-press tier is our primary newsroom acquisition channel:
1. Journalist registers with a verified press credential (`@newsroom.org` email or press card)
2. Immediate access to the Free tier; extended access to Pro features for 30 days (trial)
3. After 30 days: prompt to upgrade or stay on limited free tier
4. Onboarding sequence: "Here's how to cite Aegis Lens in your article" (citation format + methodology link)

**Goal:** Journalists who publish 1+ stories citing Aegis Lens become brand ambassadors. Their citations = SEO + credibility + social proof.

### 5.2 Per-Newsroom Champion Identification

The champion is the person who will fight for the subscription internally:
- **Data editor** (The Guardian, NYT, AP have dedicated data desks)
- **OSINT lead** (Bellingcat-style specialist within a newsroom)
- **Senior correspondent** (conflict/security beat)

Not the sales contact (might be the business development team who doesn't use the product).

**Finding the champion:** Monitor bylines of OSINT-adjacent articles. Look at LinkedIn for "data journalism," "open source investigation" titles at target newsrooms. Reference past conference attendees (GIJN, ONA, IJF).

### 5.3 Demo with Relevant Breaking Story

Never demo a generic map. Always open with a story relevant to the prospect's beat:
- If they cover Ukraine: a recent verified drone event in their area of focus
- If they cover Black Sea shipping: a recent AIS anomaly + our maritime layer
- If they cover disinformation: a recent synthetic-media detection case

"Let me show you how Aegis Lens tracked [specific story they covered] — here's what you would have had access to while you were still reporting it."

### 5.4 Citation-Friendly Features Highlighted

For newsrooms, emphasize:
- **Citation format generator:** "One-click: 'According to Aegis Lens data (verified [date], confidence [%], source: [source chain])'."
- **Methodology link:** Every event has a public methodology URL for the journalist to link to
- **Export to CSV/PDF:** For fact-checking workflows and editors who need audit trails
- **Source tracing:** "Your readers can click through to the primary source — we don't ask them to trust us, we show our work"

### 5.5 Embed Kit Pitch

For newsrooms with digital editions:
- Map embed (100 lines of JavaScript) that shows live verified events in their region of coverage
- Customizable to their brand colors
- Attribution required: "Powered by Aegis Lens" with link
- Revenue share: newsroom earns 15% of any trial conversions from their embed traffic

Pitch: "Your readers see verified real-time intelligence on your site — and they can click through to sign up. You get a data-journalism feature and a revenue stream."

### 5.6 Renewal Aligned with Budget Cycles

Newsrooms have annual budget cycles (usually December–January decision for the following year):
- **January–February:** Budget decisions made; best time for initial conversations
- **October–November:** Budget proposals submitted; time to be in the conversation
- **Renewals:** Notify 60 days before renewal; offer multi-year discount if aligned with their January budget decision

Avoid "let's talk in the summer" — most newsroom budgets are decided in Q4/Q1.

### 5.7 Newsroom Case Studies

For each major newsroom win:
- Offer a co-created case study (we write, they approve)
- Format: "How [Publication] reported [story] using Aegis Lens verified data"
- Distribution: Aegis Lens blog + LinkedIn + direct outreach to peer publications
- Revenue-risk balance: anonymous case studies available for any customer; named case studies require explicit written consent

### 5.8 Conference Presence (Newsroom-Focused)

| Conference | Role | Priority |
|---|---|---|
| GIJN (Global Investigative Journalism Network) | Talk + booth if budget allows | ★★★★★ |
| ONA (Online News Association) | Talk + networking | ★★★★ |
| IJF (International Journalism Festival, Perugia) | Talk | ★★★ |
| SXSW (media / tech track) | Speaking if invited | ★★ |
| Local journalism festivals (UA, PL, DE) | Ambassador-led | ★★★ |

### 5.9 Per-Region Anchor Newsrooms

Target one anchor newsroom per region for Year 1 — a signed, public reference customer:

| Region | Target anchor |
|---|---|
| Ukraine | Kyiv Independent, Texty.org.ua, Babel |
| Poland | OKO.press, Gazeta Wyborcza (data desk) |
| Germany | Der Spiegel (data journalism), DW (Ukrainian service) |
| United Kingdom | The Guardian (investigations), BBC Verify |
| United States | The New York Times (data desk), BuzzFeed News alt (The Markup-adjacent) |

Anchor newsrooms: offered discounted rates + co-marketing in exchange for a public case study and reference availability.

---

## Part 6 — Sales Collateral Library

> "A great sales process can't compensate for bad collateral. Invest equally."

### 6.1 Master Sales Deck (Modular)

Structure: 25 slides total, with 5 "audience swaps" marked per slide for customization.

**Slide order:**
1. Cover (customizable: logo, prospect name, date)
2. The problem (manual OSINT is slow, unverified, and siloed)
3. The cost of wrong intelligence
4. Aegis Lens: what it is (one sentence)
5. How it works (ingest → AI → verify → analyst)
6. Live map demo screenshot
7. AI Copilot screenshot
8. Alert system screenshot
9. API / export screenshot
10. TEVI: our north-star metric
11. Data sources (20+ sources, visible provenance)
12. Verification methodology (public, auditable)
13. [Audience swap: Newsroom] How journalists use Aegis Lens
13. [Audience swap: NGO] How field teams use Aegis Lens
13. [Audience swap: Enterprise] How risk teams use Aegis Lens
14. Case study (anonymized v1; named v2 when available)
15. Security + compliance (SOC 2, data residency, DPA)
16. Pricing overview (tiers)
17. Free press / NGO / academic programs
18. Technical architecture (for SE conversations)
19. Next step + CTA
20–25. Appendix (detailed methodology, source list, FAQ)

### 6.2 Per-Persona One-Pagers (8 Personas)

One A4/Letter page per persona:
1. OSINT Analyst
2. Investigative Journalist
3. NGO Field Coordinator
4. NGO Safety & Security Officer
5. Enterprise Risk Manager
6. Government Defense Analyst
7. Maritime / Shipping Risk Analyst
8. Finance / Commodities Trader

Each one-pager: problem (1 sentence), our solution (2 sentences), 3 features relevant to this persona, one data point or quote, QR code to trial.

### 6.3 Per-Vertical Pitch (6 Verticals)

2-page narrative document per vertical:
- Cybersecurity
- Finance & commodities
- NGO & humanitarian
- Government & defense
- Press / journalism
- Maritime & shipping

### 6.4 Per-Region Pitch (4 Regions)

Custom 2-page document with region-specific:
- Local sources we cover
- Regional partner logos (if any)
- Pricing in local currency
- Local language support note

Regions: Ukraine (UK + EN), EU (EN + regional language), United States (EN), APAC (EN).

### 6.5 Per-Tier ROI Calculator

Web version at `/roi` + downloadable Google Sheets:
- Inputs: analyst headcount, hours on manual OSINT, cost/hour, correction-related costs, subscription tier
- Output: time savings, cost savings, net ROI multiple
- Pre-filled examples per persona

### 6.6 Demo Videos Library

| Format | Length | Audience | Host |
|---|---|---|---|
| Teaser (brand) | 90 sec | Everyone | Loom / YouTube |
| Product walkthrough | 5 min | Qualified prospect | YouTube (unlisted) |
| Per-persona demos | 3 min each × 5 personas | Persona-specific | YouTube (unlisted) |
| API quickstart | 4 min | Technical | YouTube |
| Customer testimonial | 2 min each | All | YouTube / website |

### 6.7 Case Studies

- **Anonymized:** "A major European newsroom" — available immediately for any customer
- **Named (with consent):** Available when the customer signs a co-marketing agreement
- Format: 400-word case study (problem / solution / result / quote)
- Hosted on `/customers/[slug]`

### 6.8 Technical Architecture Overview

2-page technical brief for SE conversations:
- High-level architecture diagram (ingest → pipeline → verify → API → map)
- Technology stack summary (Next.js, Postgres/PostGIS, Kafka, Kubernetes)
- Security architecture summary (SOC 2 controls, data residency options, encryption at rest + in transit)
- API capabilities and rate limits overview
- Uptime SLO (99.9% target) and incident response summary

### 6.9 Security Questionnaire Pre-Filled

As described in §3.4 (Enterprise motion). Available within 24h of request.

### 6.10 Versioning + Locale-Awareness

All collateral:
- Version-controlled in a shared drive (Google Drive or Notion with version history)
- Locale variants: EN (primary), UK (Ukrainian), DE and PL when headcount in region justifies
- Each file named: `[type]-[audience]-[locale]-v[N]-[YYYY-MM].pdf`
- Quarterly review: outdated pricing or features flagged and updated before next quarter
- Owner: Sales Ops / Marketing (with AE input for accuracy)
