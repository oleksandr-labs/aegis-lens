# Community Metrics

> **Status:** v1.0 — measurement framework. Review quarterly.

A community is a flywheel or a sinkhole. Measuring the right signals quarterly lets us invest where the community is healthy and intervene before problems compound.

---

## 1. Overview: Core Metric Hierarchy

```
North Star
└── Community Health Score (composite, 0–100)
    ├── Engagement (DAU/WAU/MAU per channel)
    ├── Contribution quality (acceptance rate, time-to-first-contribution)
    ├── Civility (mod actions per 1k posts)
    ├── Sentiment (auto + sampled human)
    └── Growth & retention (cohort curves, geographic distribution)
```

---

## 2. Daily / Weekly / Monthly Active Users (DAU / WAU / MAU)

### Definition

An **active user** in a community channel is a member who:
- **Forum (Discourse):** logs in + reads ≥ 1 post, or posts/replies.
- **Discord:** sends ≥ 1 message OR reacts ≥ 5 times in a 24h window.
- **Telegram:** sends ≥ 1 message in any Aegis Lens channel.

### Tracked dimensions

| Metric | Description | Target (Year 1) |
|---|---|---|
| DAU | Unique actives in a calendar day | 200+ |
| WAU | Unique actives in a rolling 7-day window | 800+ |
| MAU | Unique actives in a rolling 30-day window | 3,000+ |
| DAU/MAU ratio | "stickiness" — higher = more habitual | > 10% |
| WAU/MAU ratio | Weekly retention proxy | > 30% |

### Per-channel breakdown

Report DAU/WAU/MAU **separately** per channel (Forum, Discord, Telegram, GitHub Discussions) to understand where the community's gravity center is and avoid over-indexing on one platform's health.

### Data collection

- Forum (Discourse): Discourse API `/admin/reports` endpoints.
- Discord: Discord Insights (Server Insights for Community servers) + custom bot logging to Postgres.
- Telegram: Telegram Bot API `getChatMembersCount` + message event logging (privacy-preserving: no message content, only metadata).
- **Privacy:** User IDs hashed before storage. No personally identifiable cross-channel linking.

---

## 3. Contribution Rate

**Definition:** `active_contributors / MAU` where an active contributor submitted ≥ 1 accepted contribution in the rolling 30-day window.

| Metric | Description | Target |
|---|---|---|
| Contribution rate | % of MAU who are contributors | > 8% |
| Contributions / active contributor | Depth of engagement | > 3 / month |
| Acceptance rate | Accepted submissions / total submissions | > 70% (quality signal) |
| Contribution type mix | Geolocations / verifications / source tips / methodology | tracked, no fixed target |

**Why it matters:** A community where few members contribute is a consumption-only audience. A contribution rate above 5–10% signals genuine ownership culture.

---

## 4. Time-to-First-Contribution per New User

**Definition:** Median calendar days from account creation to first accepted contribution.

| Milestone | Target |
|---|---|
| Median time-to-first-contribution | < 14 days |
| % of new users with ≥ 1 contribution in 30 days | > 20% |
| % of new users with ≥ 1 contribution in 90 days | > 35% |

**Why it matters:** Long time-to-first-contribution signals friction in onboarding (unclear how to start, confusing submission UX, unclear quality bar). Reducing this is a compounding investment — new contributors who contribute quickly have dramatically higher 90-day retention.

**Segmented by:** source channel (organic / Discord invite / referral / bounty), region, expertise area.

---

## 5. Moderation Actions / 1,000 Posts

**Formula:** `(total_mod_actions_in_period / total_posts_in_period) × 1000`

| Metric | Description | Target |
|---|---|---|
| Mod actions / 1k posts | Overall civility signal | < 5 |
| Spam mod actions / 1k posts | Spam volume | < 2 |
| Escalated cases / 1k posts | Severe violations (doxxing, harassment, CSAM) | < 0.1 |
| Mod response time (median) | From report to action | < 2 hours |
| Appeal success rate | Appealed actions overturned | tracked (< 15% ideal) |

**Types of tracked mod actions:**
- Warning issued
- Post removed
- User temporarily muted (< 24h)
- User suspended (24h–30d)
- User permanently banned
- Content escalated to legal / trust & safety

**Lower is healthier.** A rising mod-actions-per-1k trend is an early warning signal to investigate (bot activity, brigading, external actor campaigns).

---

## 6. Sentiment Analysis

### Automated sentiment

- Run sentiment classification (positive / neutral / negative / hostile) on a **random 10% sample** of public forum posts and Discord messages (not DMs).
- Model: fine-tuned multilingual classifier (UA / EN / RU / PL at launch) — see `services/nlp/`.
- Output: rolling 7-day sentiment index per channel.
- Alert threshold: negative sentiment > 30% for 3 consecutive days triggers ops review.

### Human-sampled sentiment

- Monthly: ops team reviews 50 randomly sampled posts (stratified by channel and language) and labels them on a 5-point sentiment scale.
- Quarterly: 15-minute community pulse survey sent to opt-in members.
  - Questions: net promoter score (0–10), top frustrations, top valued features, open text.
  - Target response rate: > 5% of MAU.

### Sentiment by topic

Track sentiment separately for:
- Platform usability (bugs, UX pain points)
- Data quality (event accuracy, verification trust)
- Community culture (safety, inclusivity, moderation fairness)
- Roadmap / product direction

---

## 7. Geographic Distribution

### Why it matters

Aegis Lens's mission is Ukraine-first but global-scale. Geographic concentration signals both coverage quality and market risks (over-dependence on one community for content quality).

### Tracked dimensions

| Metric | Target (Year 1) |
|---|---|
| % of MAU from Ukraine | > 35% |
| % of MAU from EU (non-UA) | > 25% |
| % of MAU from North America | > 15% |
| Number of countries with ≥ 50 MAU | > 30 |
| Top-10 contributing countries | tracked |

### Collection method

IP-based geolocation at login (coarse — country level only). Stored as ISO 3166-1 alpha-2 code. No sub-national tracking in community metrics.

### Language distribution

Track MAU by primary language (from profile preference, fallback IP-country heuristic):

| Language | Year 1 Target MAU share |
|---|---|
| Ukrainian (UK) | > 30% |
| English (EN) | > 40% |
| Polish (PL) | > 8% |
| German (DE) | > 5% |
| Romanian (RO) | > 3% |
| Other | remainder |

---

## 8. Retention Curves per Cohort

### Definition

A cohort is a group of new members who joined in the same calendar month.

**Retention curve:** % of cohort who are MAU at month 1, 2, 3, 6, 9, 12 after joining.

| Month post-join | Target retention |
|---|---|
| Month 1 | 40% |
| Month 3 | 25% |
| Month 6 | 18% |
| Month 12 | 12% |

### Segmentation

Retention broken out by:
- **Contributor vs. non-contributor** (contributors retain at ~2× rate — validate this)
- **Source channel** (Discord invite, organic signup, referral, bounty participant)
- **Region** (UA, EU, NA, Other)
- **Subscription tier** (Free, Pro, Team — community members may span tiers)

### Churn early-warning

Flag cohorts with retention dropping > 20% below benchmark at month 3. Triggers:
- Survey to churned members (3 questions max, 2-minute read).
- Qualitative review of their last sessions / contributions before churn.
- Product / ops discussion on corrective actions.

---

## 9. Quarterly Community Health Report

Published internally (Slack `#community-ops`) and a summary version posted publicly on the blog.

### Report structure

1. **Executive summary** — 3 bullets: what's healthy, what needs attention, one priority action
2. **DAU / WAU / MAU** — time series, per-channel, vs. prior quarter and year-ago
3. **Contribution rate & quality** — acceptance rate trend, top contribution types
4. **Moderation health** — mod actions trend, escalated cases, response time
5. **Sentiment** — automated index trend + survey NPS + qualitative themes
6. **Geographic distribution** — country / language heatmap vs. prior quarter
7. **Retention cohorts** — latest cohort curves vs. prior quarter cohorts
8. **Top contributors** — opt-in recognition list
9. **Incidents & responses** — any community crises, how resolved
10. **Next quarter priorities** — 3–5 actions with owners and metrics targets

### Report cadence

| Action | Timing |
|---|---|
| Internal draft | 7 days after quarter end |
| Ops team review | 10 days after quarter end |
| Published internally | 14 days after quarter end |
| Public summary | 21 days after quarter end |

---

## Appendix: Metric Collection Stack

| Signal | Source | Storage | Dashboard |
|---|---|---|---|
| Forum DAU/WAU/MAU | Discourse API | Postgres | PostHog / Grafana |
| Discord activity | Discord Bot | Postgres | Grafana |
| Telegram messages | Telegram Bot API | Postgres | Grafana |
| Contribution acceptance | Aegis platform DB | Postgres | PostHog |
| Sentiment (auto) | NLP pipeline | Postgres | Grafana |
| Sentiment (survey) | Typeform | Google Sheets → Postgres | Manual |
| Mod actions | Discourse + Discord mod logs | Postgres | Grafana |
| Geographic distribution | IP-geo at login | Postgres | Grafana |
| Retention cohorts | Postgres (cohort analysis) | — | PostHog / Metabase |
