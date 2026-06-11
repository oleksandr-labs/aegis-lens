# Events & Conferences

> **Status:** v1.0 — operational playbook. Review annually + 60 days before each event.
> **Covers:** Conferences calendar, webinar program, own events strategy.

---

## Part 1 — Conferences & Industry Events Calendar

> "Events matter for credibility. Choose 3–5 per year intentionally, don't spray."

### 1.1 Target Events

#### OSINT & Investigative Journalism

| Event | Typical timing | Format | Priority | Our role |
|---|---|---|---|---|
| **Bellingcat Open Source Investigations Summit** | Nov–Dec | In-person, Amsterdam area | ★★★★★ | Talk + networking; critical for credibility |
| **OSINT Summit** (various) | Multiple | Mixed | ★★★★ | Speaking; tool-showcase opportunities |
| **GIJN (Global Investigative Journalism Network)** | Biennial | Large in-person conference | ★★★★★ | Booth + talk; journalist persona outreach |
| **ONA (Online News Association)** | Annual, US | In-person | ★★★★ | Newsroom persona; data journalism community |
| **IRE (Investigative Reporters & Editors)** | Annual, US | In-person | ★★★ | CAR / data journalism track |

#### Security & Cybersecurity

| Event | Priority | Our role |
|---|---|---|
| **RSA Conference** | ★★★★ | Cyber threat-intel track; enterprise / gov visibility |
| **DEF CON / Black Hat** | ★★★ | OSINT village; researcher community; recruit |
| **CYBERUK** (NCSC, UK) | ★★★ | UK gov + cyber community |

#### Defense, Policy & Geopolitics

| Event | Priority | Our role |
|---|---|---|
| **DGAP / SWP Events** (Germany) | ★★★ | EU policy researcher community; DE market entry |
| **Eurosatory** (biennial, Paris) | ★★ | Defense prime audience; caution — political optics risk |
| **Shangri-La Dialogue** (Singapore, APAC) | ★ (Phase 4) | Long-term APAC positioning |

#### Ukraine & Regional

| Event | Priority | Our role |
|---|---|---|
| **DeepStateMAP / UA-OSINT community events** | ★★★★★ | Home community; product feedback; source outreach |
| **Kyiv Security Forum** (if resumed) | ★★★★ | Ukrainian policy + security audience |
| **Warsaw Security Forum** | ★★★ | Eastern European policy community |

### 1.2 Per-Event ROI Tracking

For every event we attend, track:

| Metric | Description |
|---|---|
| Qualified leads generated | Companies / individuals who requested a demo or trial |
| Press mentions | Articles or posts referencing Aegis Lens at / after the event |
| Hires sourced | Candidates identified or hired through event contacts |
| Partnerships initiated | New partnership discussions opened |
| Community signups | New community members acquired |
| Analyst contacts | Relationships built with OSINT analysts / researchers |

**Tracking tool:** HubSpot CRM; UTM-tagged links on all collateral.

**Post-event report:** Due within 7 days. Includes: leads list, press mentions, key conversations, ROI vs. cost.

**Annual review:** Q4 — rank all attended events by ROI. Cut lowest-ROI; double down on top 2.

### 1.3 Per-Event Budget Cap

| Event tier | Budget envelope | Includes |
|---|---|---|
| **Tier 1 (must-attend)** | $8,000–$15,000 | Travel × 2 team members + accommodation + sponsorship/booth (if applicable) + collateral print run |
| **Tier 2 (high-value)** | $3,000–$8,000 | Travel × 1–2 + accommodation; speaking only (no booth) |
| **Tier 3 (community)** | < $3,000 | 1 team member; speaking or networking only |
| **Virtual only** | < $500 | Registration fee; no travel |

Budget approved by CEO per event. No event spending without pre-approval.

### 1.4 Per-Event Plan (Speakers, Booth, Collateral)

**8 weeks before:**
- Abstract / proposal submitted (if speaking) or registration confirmed
- Budget approved
- Team member(s) assigned

**4 weeks before:**
- Talk slides drafted + reviewed
- Print collateral ordered (one-pagers, sticker packs, QR codes to trial signup)
- Outreach list prepared: who at this conference do we want to meet? (targeted, ≤ 20 contacts)

**2 weeks before:**
- Outreach emails sent to target contacts
- Logistics confirmed (travel, hotel, badge)
- Social posts scheduled (announcing attendance)

**At the event:**
- Lead capture: business card scan → HubSpot + follow-up task created same day
- Demo ready on laptop + mobile (offline-capable for flaky conference wifi)
- Daily 15-min team debrief on leads + conversations

**Post-event:**
- Follow-up emails within 48h of meeting each contact
- Post-event recap published on blog + LinkedIn (builds SEO + credibility)
- Leads imported to CRM + assigned to follow-up sequence
- ROI report filed within 7 days

---

## Part 2 — Webinar Program

> "A great recorded webinar = SEO + lead-gen asset for years."

### 2.1 Cadence

| Type | Frequency | Format | Audience |
|---|---|---|---|
| **Free public webinar** | 1 / month | 45–60 min live + Q&A; recorded for async | Anyone; primary lead-gen |
| **Paid masterclass** | 1 / quarter | 90 min; deeper methodology; certificate of attendance | Journalists, analysts, NGO professionals |
| **Customer roundtable** | 1 / quarter | 60 min; customer-only; product feedback focus | Current paying customers |

### 2.2 Topic Mix

Rotate across four categories:

| Category | Examples | Cadence |
|---|---|---|
| **Methodology** | "How to geolocate a video in 20 minutes", "Verification workflow from raw footage to published claim" | 1 per quarter |
| **Breaking-news analysis** | Live debrief on a major OSINT story (ex: drone swarm pattern analysis) | Reactive; 1–2 per quarter when events warrant |
| **Tool walkthrough** | "Aegis Lens map layer deep-dive", "API quickstart for journalists" | 1 per quarter |
| **Industry briefing** | "State of OSINT 2026", "AI in conflict intelligence: risks and opportunities" | 1 per quarter |

### 2.3 Guest Speakers

- **Partners:** Bellingcat analyst, NATO StratCom fellow, ACLED researcher
- **Customers:** A journalist or NGO professional (with consent) sharing how they use Aegis Lens
- **Advisors / external experts:** per-topic relevance
- **Speaker brief:** sent 3 weeks before event; includes audience profile, format, time slot, social copy for promotion
- **Speaker compensation:** free Enterprise access for 6 months (no cash — avoids complications)

### 2.4 Platform

| Platform | Use case | Notes |
|---|---|---|
| **Streamyard** (primary) | Live webinars with guests; multi-platform stream | Streams to YouTube + LinkedIn simultaneously; easy guest management |
| **Zoom Webinar** | Backup; large formal events | Less branding control |
| **Aegis Lens own platform** (Phase 3) | Embedded on website; full-funnel tracking | Build after 12+ successful external webinars |

Recording automatically published to YouTube + embedded on `/blog` within 24h.

### 2.5 Registration + Reminder Flow

```
Registration page (Webflow / Next.js)
  → Confirmation email (immediate)
  → Reminder 7 days before
  → Reminder 24h before
  → Reminder 1h before (with join link)
  → Post-event email (recording link + CTA to trial)
```

All registration data: imported to HubSpot with source tag `webinar-{slug}`.

Gating: free webinars require name + email + job title. Paid masterclasses require payment (Stripe) + profile.

### 2.6 Live + Recorded Distribution

| Channel | Live | Recorded |
|---|---|---|
| **YouTube** (Aegis Lens channel) | Live stream | Published within 24h; SEO-optimized title + description + chapters |
| **LinkedIn** | Live stream | Short clip (90s highlight) + link to full recording within 48h |
| **Twitter / X** | Live thread with key quotes | Link to recording |
| **Blog post** | — | Dedicated post with summary, key quotes, transcript (AI-generated + human-edited), and recording embed |
| **Email list** | Registered attendees get join link | All subscribers get recording link + summary |

### 2.7 Post-Event Email + Lead Nurture

**For attendees (live or recorded):**

```
Email 1 (day after): Thanks for attending. Here's the recording + key resources.
Email 2 (3 days after): Related reading (blog post, relevant guide, case study).
Email 3 (7 days after): "Ready to try Aegis Lens?" — Free trial CTA.
```

**For no-shows (registered but didn't attend):**
```
Email 1 (day after): "You missed it — here's the recording."
Email 2 (3 days after): Recording reminder + 2-sentence summary.
```

All nurture sequences in HubSpot workflows. Tag: `webinar-attended` or `webinar-noshow`.

### 2.8 Per-Webinar Conversion Tracking

| Metric | Target |
|---|---|
| Registrants | > 200 (free webinar) / > 50 (paid masterclass) |
| Attendee rate | > 40% of registrants |
| Watch-through rate (recorded) | > 50% average view duration |
| Free trial signups within 7 days | > 5% of attendees |
| Paid conversions within 30 days | > 0.5% of registrants |
| YouTube views (30 days post-publish) | > 1,000 |

Reported in monthly metrics deck + quarterly board packet.

### 2.9 Year-End "Best of" Compilation

Every December, compile a 20-minute highlight reel:
- Top 5 moments from the year's webinars
- Published as a standalone YouTube video + blog post
- Promoted across all channels

Purpose: year-round SEO asset, community retrospective, new audience discovery.

---

## Part 3 — Our Own Events

> "Owning an event = owning the narrative. Phase 2 when ready."

### 3.1 Annual Contributor Summit

Already spec'd in `docs/community/contributor-program.md §10`. Key details:
- Phase 2+ (after contributor community reaches > 500 Level 2+ members)
- Q4 annually; hybrid format
- Agenda: methodology workshops, awards, product preview, networking
- Budget: per-attendee cost $300–$500 in-person; $50 remote

### 3.2 Annual Public Year-in-Review Launch Event

**Format:** Hybrid (in-person anchor city + livestream)
**Timing:** January of each year (recapping prior year)
**Length:** 2 hours
**Agenda:**
1. Year-in-review data highlights (visual, data-driven — the Aegis Lens annual report)
2. State of conflict intelligence keynote (founder or senior analyst)
3. Guest panel (journalist + OSINT researcher + NGO representative)
4. Preview of upcoming year's roadmap
5. Q&A

**Goal:** Establish Aegis Lens as the annual OSINT-for-conflict reference point. Press invites mandatory; record and distribute widely.

### 3.3 Quarterly Customer Roundtables (per Segment)

**Format:** 90-minute virtual roundtable; 10–15 customers per segment
**Segments:** Journalists, NGOs, Analysts, Enterprise/Gov
**Agenda:**
1. Product update (15 min — what shipped)
2. Customer spotlight (15 min — one customer shares a use case)
3. Open discussion: what's working, what's frustrating (45 min)
4. Roadmap preview + voting (15 min)

**Value exchange:** Customers get early access to roadmap; team gets qualitative feedback that quantitative metrics miss.

### 3.4 OSINT Challenges / Capture the Flag

**Format:** Community-facing; online + optionally in-person
**Frequency:** 2 per year (mid-year + year-end)
**Challenge types:**
- Geolocation challenge (given a photo/video clip, find the location)
- Timeline reconstruction (given a set of events, reconstruct the sequence)
- Source verification (identify reliable from unreliable sources in a simulated event)
- Detection challenge (spot synthetic / AI-generated media)

**Prizes:** Cash ($500 first place, $250 second, $100 third) + Pro subscriptions + community recognition.

**Logistics:** Hosted on a dedicated subdomain `/challenge`; powered by CTFd (open-source CTF platform); results auto-graded + community-verified for top finishers.

### 3.5 City Meetups (Ambassador-Led)

As defined in `docs/community/ambassador-program.md §7`. Target cities by Phase:
- **Phase 2:** Kyiv, Warsaw, Berlin
- **Phase 3:** London, Washington DC, The Hague
- **Phase 4:** Singapore, Nairobi (expansion)

Budget: $500 per event (covered by ambassador budget); Aegis Lens ships printed materials + sponsor the venue if needed.

### 3.6 Per-Event Sponsorship + Sponsor-Tier Menu

For own events that grow large enough to attract sponsors (Phase 3+):

| Tier | Price | Benefits |
|---|---|---|
| **Title sponsor** | $10,000 | Logo on all materials, 5-minute opening slot, 2 VIP passes |
| **Gold sponsor** | $5,000 | Logo on materials, booth table, 2 passes |
| **Silver sponsor** | $2,500 | Logo on materials, 1 pass |
| **Data partner** | in-kind | Data/API access in exchange for attribution + promotional content |

**Sponsor criteria:** Mission-compatible organizations only. Defense primes: case-by-case ethics review. No surveillance-tech sponsors.

### 3.7 Per-Event Content Package

Every major event produces a permanent content package:

| Asset | Description | Destination |
|---|---|---|
| **Full recording** | Edited, with chapters | YouTube + /events/[slug] page |
| **Session highlights** | 90-second clips per session | LinkedIn + Twitter |
| **Written recap** | 800-word blog post + key quotes | Blog + email digest |
| **Photos** | 20–40 curated photos | Social media + press kit |
| **Slide decks** | Speaker-approved versions | Shared publicly on SlideShare / Canva |

All content tagged with the event slug and archived in the DAM (see `TODO/brand/TODO_dam.md`).

### 3.8 Per-Event Lead Tracking

At every own event:
- Attendee list collected at registration (name + email + org + role)
- Lead quality scored at event: Hot (requested demo / trial) / Warm (interested, needs follow-up) / Cold (general attendance)
- Hot leads: personal follow-up from sales within 24h
- Warm leads: automated email sequence (3 emails over 14 days)
- All attendees: added to newsletter list (with consent checkbox at registration)

### 3.9 Annual Events Budget Envelope

| Item | Phase 1–2 | Phase 3 |
|---|---|---|
| External conference attendance (team) | $30,000/year | $60,000/year |
| Webinar program (platform + production) | $5,000/year | $15,000/year |
| Own events (contributor summit + roundtables) | $20,000/year | $50,000/year |
| City meetups (ambassador reimbursements) | $12,000/year | $30,000/year |
| Emergency / reactive (breaking news events) | $5,000/year | $10,000/year |
| **Total** | **~$72,000/year** | **~$165,000/year** |

Budget reviewed quarterly; unspent can roll into next quarter with board approval.
