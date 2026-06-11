# OKRs & Metrics

> **Status:** v1.0 — measurement framework. Review quarterly.
> **Covers:** North-star metric, OKR cadence, Metrics tree, Leading vs. lagging indicators, Dashboards.

---

## Part 1 — North-Star Metric

> "A wrong north-star is worse than no north-star. Choose carefully, change rarely."

### 1.1 North-Star Decision

**Chosen:** ***Time-from-event-to-verified-intelligence*** (TEVI)

**Definition:** The elapsed time (seconds) from when a raw event first enters the ingestion pipeline to when it is marked `verified` (confidence ≥ 0.85 or human-review approved) and is visible to analysts.

**Target:** Median < 90 seconds for Tier-1 event classes (missile/drone/strike/fire). P90 < 5 minutes.

### 1.2 Why TEVI, Not the Alternatives

| Candidate | Pros | Cons | Decision |
|---|---|---|---|
| **TEVI** (time-from-event-to-verified-intel) | Directly captures our core value promise; is hard to game; combines ingest speed + AI quality + verification pipeline | Can be influenced by source quality (slow sources inflate it) | **CHOSEN** |
| Weekly active verified events seen by analysts | Reflects engagement + content quality | Easier to game (lower verification bar inflates it); doesn't capture speed | Tracked as supporting metric, not north-star |
| DAU / MAU | Standard SaaS metric | Does not reflect product quality; an analyst logging in and seeing bad data = bad DAU | Tracked separately in the metrics tree |
| API call volume | Reflects developer adoption | Ignores core intelligence product quality | Tracked in the quality branch |

### 1.3 Decision Rationale

TEVI is chosen because it forces alignment across all teams:
- **Ingest team:** ingestion speed + source coverage affect the numerator
- **NLP/AI team:** classification + confidence scores determine when the event becomes "verified-eligible"
- **Verify team:** human-review queue SLA affects P90
- **Infrastructure:** uptime + pipeline latency affect every event

A product that is fast and wrong fails TEVI. A product that is accurate and slow fails TEVI. Only a product that is both fast and accurate wins.

### 1.4 Per-Tier Sub-Targets

| Event class | Median target | P90 target | Notes |
|---|---|---|---|
| Missile / drone (Tier 1) | < 60s | < 3 min | Highest urgency; life-safety |
| Strike / fire (Tier 1) | < 90s | < 5 min | |
| Power / comms outage (Tier 2) | < 5 min | < 15 min | Often confirmed via multiple sources; worth slight wait |
| Troop movement (Tier 2) | < 10 min | < 30 min | Higher verification bar; fewer real-time sources |
| Maritime / aviation (Tier 3) | < 2 min | < 10 min | ADS-B + AIS data available real-time |
| Social media activity (Tier 3) | < 5 min | < 20 min | Viral signal; context takes time |
| AI prediction (advisory) | N/A (generated, not ingested) | N/A | Latency measured separately |

### 1.5 Visible on Every Internal Dashboard

TEVI is displayed:
- Company TV dashboard (live, rolling 24h median + current P90)
- Every team's OKR dashboard (as a read-only context metric)
- The engineering on-call dashboard (real-time; any regression triggers a PagerDuty alert)
- Weekly all-hands slides (last 7-day trend)

Color coding: Green (< 90s median), Yellow (90–180s), Red (> 180s).

### 1.6 Quarterly Review (Still the Right Metric?)

At each quarterly board meeting, the founder presents:
- TEVI trend (last 90 days)
- Has any product change made TEVI less meaningful or gameable?
- Is there a new metric that better reflects the north-star promise?

**Change bar:** Changing the north-star metric requires CEO + board agreement + a 2-quarter transition period (overlap tracking) so historical comparisons are not lost.

### 1.7 Connected to OKRs at Every Level

Every OKR at company and team level should have a visible connection to TEVI:
- "How does this objective improve TEVI?"
- KRs that do not connect to TEVI require explicit rationale ("this is enabling infrastructure"; "this is a revenue objective that enables resources for TEVI improvement")

---

## Part 2 — OKR Cadence

> "Don't drown in OKRs. 3 objectives max at company level."

### 2.1 Quarterly OKR Ritual

| Step | When | Who | Output |
|---|---|---|---|
| **Planning** | Last 2 weeks of the quarter (before new quarter starts) | All teams | Draft OKRs for next quarter |
| **Alignment review** | Day 1–3 of new quarter | CEO + team leads | Cascade company OKRs → team OKRs; resolve conflicts |
| **Kickoff** | Day 5 of new quarter | All staff | Published OKRs visible to everyone |
| **Mid-quarter check** | Week 6–7 of quarter | All teams | Self-score KRs (0.0–1.0); flag at-risk objectives |
| **End-of-quarter retro** | Last week of quarter | All teams | Final score; retro document; learnings carry forward |

### 2.2 Company-Level OKRs

**Structure:** Maximum 3 Objectives per quarter. Each Objective has maximum 3 Key Results.

**Format:**
```
Objective (qualitative, inspirational): ___
  KR 1 (measurable, time-bound): ___  [target: N] [current: M] [score: 0.0–1.0]
  KR 2: ___
  KR 3: ___
```

**Sample company OKRs (Year 1, Q2):**

**O1: Make Aegis Lens the fastest verified conflict-intelligence platform in the world**
- KR1: TEVI median < 90s for 95% of operational days this quarter
- KR2: Verification confidence model F1 score ≥ 0.82 on evaluation set
- KR3: Source coverage expanded to ≥ 25 active Telegram channels (from current 6)

**O2: Validate product-market fit with 10 paying customers**
- KR1: 10 customers active (paying or committed contract)
- KR2: NPS ≥ 40 from initial customer cohort
- KR3: ≥ 3 customers publish external case studies or citations

**O3: Build the infrastructure to scale to 10,000 events/hour**
- KR1: Pipeline handles 10,000 events/hour in load test without degradation
- KR2: Ingest pipeline P99 latency < 2s
- KR3: On-call incident rate < 2 per week (down from current)

### 2.3 Per-Team OKRs Cascading from Company

Each team has its own OKRs derived from company OKRs:
- Team OKRs must visibly contribute to at least one company-level KR
- Team OKRs are drafted by the team lead + team members together (not top-down mandated)
- Maximum 2 Objectives per team per quarter (avoid OKR sprawl)
- Team OKRs visible to the whole company in the OKR registry

### 2.4 OKR Template

```markdown
## [Team Name] OKRs — Q[N] [YYYY]

**Company OKRs this team contributes to:** O[N], O[N]

### Objective 1: [qualitative statement]
| Key Result | Target | Mid-quarter | End-of-quarter | Score |
|---|---|---|---|---|
| KR 1 | | | | |
| KR 2 | | | | |
| KR 3 | | | | |

**Stretch annotation:** KR[N] is a stretch target (0.7 = excellent)

### Retro (filled at end of quarter)
What we learned: ___
What we'd do differently: ___
Carry-forward for next quarter: ___
```

### 2.5 Scoring Policy (0.6–0.7 = Healthy Stretch)

| Score | Meaning |
|---|---|
| 1.0 | Exceptional; either target was too easy or exceptional execution |
| 0.7–0.9 | Strong; meaningful progress; appropriate ambition |
| **0.6–0.7** | **Target zone — healthy stretch** |
| 0.4–0.6 | Acceptable; some obstacles; learning value |
| < 0.4 | Missed; requires retro and plan change |

**Why 0.6–0.7 is the target:** OKRs are stretch goals. Consistently scoring 1.0 means targets are too easy. Consistently scoring < 0.4 means planning is broken. 0.6–0.7 means the team is stretching appropriately.

### 2.6 No OKR-Tied Compensation

Performance bonuses, salary increases, and promotions are **never** mechanically tied to OKR scores.

**Why:**
- OKR-linked comp causes sandbagging (setting easy targets)
- It discourages teams from taking on risky, high-value objectives
- It creates incentives to manipulate data
- Compensation is driven by role, level, and market rates (see `docs/hr/hr-people.md §Part 1`)

Performance is assessed separately (qualitative manager review + peer feedback) and informs promotion decisions — but OKR scores are one input, not the formula.

### 2.7 OKR Registry (Versioned, Retrospective-Accessible)

All OKRs are stored in a structured registry (Notion, Linear, or equivalent):
- Every quarter's OKRs preserved indefinitely
- Retroactively searchable: "what was our O2 in Q3 2026?"
- Each KR linked to the underlying data dashboard or tracking sheet
- End-of-quarter scores + retro notes recorded before the registry is locked

**Access:** All employees can read all OKRs and scores. Leadership can write. Registry locked 14 days after quarter end (no retroactive score changes).

### 2.8 Stretch-vs-Commit Annotation

Each KR is annotated as:
- **Commit:** We are confident we will hit this. Missing it is a failure.
- **Stretch:** We will try hard, but 0.7 is excellent. Missing it at 0.5 is acceptable.

Annotation is set at OKR planning; cannot be changed mid-quarter. This prevents sandbagging (setting easy "commit" targets) and lets leadership understand which misses are acceptable vs. concerning.

### 2.9 Public-Safe Investor Subset

At the end of each quarter, the founder prepares a "public-safe" OKR summary:
- High-level narrative (no specific product roadmap reveals)
- Scores on customer-facing KRs (NPS, uptime, customer count)
- Omits: specific TEVI targets (competitive information), technical infrastructure details, pipeline specifics

Sent to investors in the monthly memo. Not published publicly.

---

## Part 3 — Metrics Tree

> "Tree shape stays stable; numbers move. Don't redesign quarterly."

### 3.1 Tree Structure (Top-Down from North-Star)

```
NORTH STAR: TEVI (Time-from-Event-to-Verified-Intelligence)
├── SOURCE INPUT
│   ├── Source count (active ingestion)
│   ├── Source freshness (P95 age of most recent event per source)
│   └── Source reliability score (weighted avg verification yield)
│
├── INGEST PIPELINE
│   ├── Ingestion latency (P50, P95, P99 — event arrival → pipeline entry)
│   ├── Dedup rate (% of duplicate events caught)
│   └── PII redaction success rate
│
├── AI / NLP QUALITY
│   ├── Classification accuracy (F1 score on eval set)
│   ├── Confidence calibration (ECE — Expected Calibration Error)
│   ├── Embedding freshness (last model update date)
│   └── Verification queue depth (events waiting for human review)
│
├── VERIFICATION PIPELINE
│   ├── Human review SLA (% reviewed within 5 min)
│   ├── Auto-verification rate (% resolved without human)
│   └── Verification accuracy (retrospective error rate)
│
└── PRODUCT / USER
    ├── ACQUISITION
    │   ├── Signups (organic, referral, press, embed, paid)
    │   ├── Traffic by source (SEO, direct, social, email)
    │   └── Trial starts
    │
    ├── ACTIVATION
    │   ├── Time-to-first-map-interaction (< 2 min = activated)
    │   ├── Time-to-first-alert-created
    │   └── D1 / D7 return rate (activated users who return)
    │
    ├── ENGAGEMENT
    │   ├── DAU / WAU / MAU (and DAU/MAU stickiness ratio)
    │   ├── Sessions per active user / week
    │   ├── Events viewed per session
    │   └── Feature depth (% using map + filter + alert + report)
    │
    ├── REVENUE
    │   ├── MRR / ARR (by tier and segment)
    │   ├── Net Dollar Retention (NDR)
    │   ├── Gross Margin
    │   ├── CAC / LTV (by segment)
    │   └── Churn rate (gross + net MRR)
    │
    └── QUALITY (user-perceived)
        ├── NPS (quarterly survey)
        ├── CSAT (per-session, sampled)
        ├── Support ticket volume per 1,000 MAU
        └── Reported verification errors per 1,000 events
```

### 3.2 Acquisition Branch Detail

| Metric | Tracked | Target (Year 1) |
|---|---|---|
| Organic signups | Weekly | 50+ / week |
| Press-referred signups | Per event | Tracked via UTM |
| Embed-referred signups | Weekly | Growing |
| Referral signups | Weekly | > 15% of total |
| Trial-to-paid conversion | Monthly | > 8% within 30 days |

### 3.3 Activation Branch Detail

**Activation event:** A user is "activated" when they:
1. View the map (not just the landing page)
2. Filter events by at least one parameter
3. Return to the product within 7 days of signup

**Activation rate target (D7):** > 35% of signups

### 3.4 Revenue Branch Detail

| Metric | Frequency | Owner |
|---|---|---|
| MRR | Monthly | Finance + CEO |
| NDR | Monthly | CEO + CS |
| CAC by segment | Quarterly | Marketing + Sales |
| LTV by segment | Quarterly | Finance |
| ARR per headcount | Quarterly | CEO |

### 3.5 Quality Branch Detail

| Metric | Frequency | Owner |
|---|---|---|
| Verification yield | Weekly | Verify team |
| Source freshness P95 | Daily | Ingest team |
| Classification F1 | Weekly (eval run) | NLP team |
| Verification error rate (user-reported) | Weekly | Verify team + QA |

### 3.6 Per-Metric Owner + Dashboard URL

Every metric in the tree has:
- A named owner (role, not just team)
- A Grafana / PostHog / Metabase dashboard URL
- A Slack channel where it's discussed weekly

Documented in the OKR registry. Ownership reviewed quarterly; reassigned on team changes.

### 3.7 Quarterly Tree Review

At Q4 each year:
- Is the tree still capturing what matters?
- Did any branch drift out of relevance?
- Are any new metrics needed (new features, new revenue streams)?
- Are there metrics nobody is looking at? (Remove them — dead metrics add noise)

Changes approved by CEO + data team. No branch-level restructuring during the quarter — only at quarterly review.

---

## Part 4 — Leading vs. Lagging Indicators

> "Lagging indicators are the score; leading are the steering wheel."

### 4.1 Leading Indicators (Act Early)

These predict future outcomes. Regressions here trigger intervention **before** lagging metrics are affected.

| Leading indicator | What it predicts | Owner | Alert threshold |
|---|---|---|---|
| **Source freshness P95** | TEVI degradation; stale intelligence | Ingest | P95 > 10 min → alert |
| **Verification queue depth** | Human-review SLA breach; TEVI degradation | Verify | Queue > 200 events → alert |
| **D7 activation rate** | Future MAU retention | Product | < 30% → review |
| **Filter-creation rate per new user** | Engagement depth; churn risk (low filter creation = low stickiness) | Product | < 40% of users create a filter within 7 days → review |
| **AI Copilot satisfaction (per-message)** | Copilot engagement + NPS prediction | AI team | Satisfaction < 3.5/5 (7-day avg) → review |
| **Support ticket volume / MAU** | Product quality degradation | CS | > 5 tickets / 1k MAU → review |
| **Trial activation rate** | Future conversion rate | Product | < 25% → review |

### 4.2 Lagging Indicators (Measure Outcomes)

These confirm results. Low scores = something was wrong weeks ago.

| Lagging indicator | Frequency | Target |
|---|---|---|
| **MRR / ARR** | Monthly | Growth per plan |
| **NDR (Net Dollar Retention)** | Monthly | > 110% |
| **Churn rate (gross MRR)** | Monthly | < 3% / month |
| **Press citations / quarter** | Quarterly | > 20 |
| **SEO organic traffic (GA4)** | Monthly | Growing |
| **LTV / CAC ratio** | Quarterly | > 3× |
| **NPS** | Quarterly | > 40 |
| **TEVI median (trailing 30 days)** | Monthly | < 90s |

### 4.3 Leading Indicators Alert on Regression

All leading indicators have automated alerts:
- Grafana alert rules + PagerDuty for operational metrics (source freshness, queue depth)
- PostHog alerts for product metrics (activation rate, filter creation)
- Weekly Slack digest every Monday at 09:00 UTC: "Leading indicators this week" summary

**Alert routing:**
- Operational (source freshness, queue depth): on-call engineer + team lead
- Product metrics: product lead + CEO
- Business metrics: CEO + investor email (if monthly memo is due)

### 4.4 Lagging Indicators Reviewed Monthly with Team

**Monthly metrics review meeting** (last Thursday of each month, 45 min):
- Attendees: CEO, team leads, data analyst
- Agenda: walk the lagging indicators tree; any surprises vs. leading indicators; action items
- Output: brief summary posted in `#metrics` Slack channel within 24h

### 4.5 Per-Indicator Owner

All indicators (leading + lagging) are owned by a specific named role. Owner is responsible for:
- Dashboard accuracy (correct data, no stale queries)
- Weekly comment in `#metrics` if the indicator is moving notably
- Root-cause investigation if an alert fires
- Recommending changes to the indicator if it becomes obsolete

---

## Part 5 — Internal Metric Dashboards

> "A dashboard nobody looks at is decoration. Tie each one to a recurring meeting."

### 5.1 Company TV Dashboard (North-Star + Top KRs)

Displayed on a visible screen in any physical office / team space. For remote team: pinned in the `#metrics` Slack channel.

**Content:**
- TEVI: live rolling 24-hour median + P90 (color: green / yellow / red)
- Active sources: count + freshness P95
- Current quarter OKR scores (updated weekly)
- MRR: current month vs. last month
- DAU: current day vs. 7-day avg
- On-call incident status (green / red)

**Update frequency:** Real-time for operational metrics; hourly for product + business metrics.

**Stack:** Grafana (operational) + PostHog (product) + Metabase (business) → combined on a Grafana dashboard or simple iframe dashboard.

### 5.2 Per-Team Dashboards (Auto-Generated from OKR Registry)

Each team's OKR registry entry links to their team dashboard. Standard sections:
1. Team KR scores (vs. target)
2. Team-specific leading indicators
3. Lagging indicators this team contributes to
4. On-call/incident summary (for engineering teams)

Teams own their dashboards; the data team maintains the infrastructure.

### 5.3 Investor Monthly Dashboard (Sanitized)

Sent on the 5th of each month, covering the prior month:

| Metric | Why investors see it |
|---|---|
| MRR + growth % | Primary business health |
| Burn rate + runway | Financial stewardship |
| Headcount | Team growth |
| New customers | GTM velocity |
| Churn | Retention health |
| NPS (if survey ran) | Product love |
| Top TEVI metric (narrative) | Product differentiation |
| TEVI actual numbers | **Not shared** — competitive |
| Source count / pipeline details | **Not shared** — competitive |

Distributed via DocSend (tracked reads) or directly in the monthly investor email.

### 5.4 AI Quality Dashboard

**Owner:** AI / NLP team lead

**Content:**
- Classification F1 by event class (weekly eval run results)
- Confidence calibration curve (ECE metric, last 30 days)
- Model version + last deployment date
- Copilot satisfaction (7-day average, per-message thumb up/down)
- Human-review queue stats: queue depth, SLA compliance (% reviewed in < 5 min), reversal rate (% of AI decisions overturned by human)
- A/B test results for model changes (active tests only)

**Cadence:** Reviewed weekly by AI team; presented at monthly metrics meeting when any metric is off-target.

### 5.5 Cost / Unit-Economics Dashboard

**Owner:** Finance + Engineering (infra costs)

**Content:**
- Monthly cloud spend (AWS/GCP/Cloudflare) vs. budget
- Cost per 1,000 events processed
- Cost per API call
- Cost per verified event
- LTV / CAC ratio (company-level and per segment)
- Gross margin (updated monthly)

**Cadence:** Reviewed monthly; quarterly deep-dive by CEO + Finance + Infra lead.

### 5.6 Per-Customer Health Dashboard (for CSMs)

**Owner:** Customer Success

**Content per customer:**
- Usage: DAU, sessions/week, features used
- Health score (0–100): composite of usage, NPS, support tickets, renewal risk
- Next renewal date + ARR at risk
- Open support tickets
- Last customer interaction date
- NPS / CSAT history

**Health score thresholds:**
- Green (80–100): healthy; standard renewal process
- Yellow (50–79): at risk; CSM proactive outreach triggered
- Red (< 50): high churn risk; founder + CSM escalation within 72h

**Cadence:** CSM reviews weekly; account health report to CEO monthly.

### 5.7 Metric Regression Alerts

All dashboard metrics have automated alert rules:

| Alert type | Channel | Responder |
|---|---|---|
| TEVI > 180s (median, 1h) | PagerDuty + Slack #alerts | On-call engineer |
| Source freshness P95 > 10 min | Slack #ingest-alerts | Ingest team lead |
| Verification queue > 200 | Slack #verify-alerts | Verify team lead |
| DAU drop > 20% day-on-day | Slack #metrics | Product lead |
| MRR churn event (any customer cancels) | Slack #revenue | CEO + CSM |
| AI classification F1 < 0.75 | Slack #ai-quality | AI team lead |
| Customer health score drops to Red | Slack #cs-alerts | CSM + Account owner |

### 5.8 Single Source of Truth (BI Layer)

All metrics feed into a single BI layer:
- **Raw data:** Postgres (primary) + ClickHouse (analytical replica for heavy queries)
- **Transformation:** dbt models (see `docs/data/workflow-orchestration.md`)
- **BI tool:** Metabase (self-hosted) for business metrics; Grafana for operational metrics; PostHog for product metrics

**No metric reported verbally without a dashboard source.** If a metric exists only in someone's spreadsheet, it does not count as a company metric.

All dashboard SQL / Metabase question definitions version-controlled in `packages/analytics/`.
