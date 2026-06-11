# Customer Onboarding

> First-week → first-month → first-quarter clarity for every paying customer.
> **Onboarding determines first-renewal probability more than any other surface.**

---

## 1. Onboarding Overview — Tiers & Flows

| Tier | Motion | Goal | Owner |
| --- | --- | --- | --- |
| **Free / Pro** | Self-serve | "Wow" in < 3 min; "activated" in < 15 min | Product (PM) |
| **Team** | Light-touch CSM + checklist | First meaningful use in < 7 days | CS shared pool |
| **Enterprise / Gov** | White-glove implementation | Org fully using in 30–90 days | Named CSM |
| **Beta** | Structured early-access | Feedback gathered, feature validated | PM + CS |

### Common elements (every tier)

- **Per-persona starter workspace**: on signup, the user picks their persona
  (OSINT analyst / humanitarian / journalist / government / finance). The platform
  seeds a dashboard, watchlist, and alerts pre-configured for that persona.
- **Welcome sequence**: in-app + email (see §2 for self-serve; §3 for enterprise).
- **Per-tier success criteria**: "activated" is defined per tier and measured.
- **Per-tier NPS at day 30**: automated survey. Results feed the CS health score
  and the product roadmap.
- **Handoff to CS**: Free/Pro accounts hitting usage thresholds are surfaced to
  the CS pool for proactive outreach (see [customer success](../support/customer-success.md)).

---

## 2. Self-Serve Onboarding (Free / Pro)

*Self-serve onboarding is product, not marketing. Owned by PM, not Growth.*

### "Wow" moment (< 3 minutes from signup)

The "wow" is the first time the user sees something personally relevant in the
platform. Achieved by:

1. **Persona picker** on the registration final step (not a 10-field form —
   one question: "What best describes you?").
2. **Seeded dashboard** based on persona:

| Persona | Seeded watchlist | Pre-configured alert |
| --- | --- | --- |
| OSINT analyst | Top-10 active event regions | First event matching their keyword |
| Humanitarian / NGO | Civilian-impact + displacement layers | Aid-corridor status change |
| Journalist | Verified event feed for top-covered region | Breaking event in their beat |
| Government / defense | Custom-classification layers (empty but configured) | High-confidence event in region of interest |
| Finance / trader | Commodity-impact feed | Energy-infrastructure event |
| Civilian | Safety view for their entered location | Air-raid alert for their region |

3. **First-run AI copilot suggested prompt** auto-fills the copilot based on
   their persona and seeded region — they press one button and get a briefing.

### Email onboarding sequence

| Day | Subject | Purpose |
| --- | --- | --- |
| **Day 0** | Welcome to Aegis Lens — here's your first step | Tour link + persona-specific first action |
| **Day 1** | 3 things most [persona] users do in week 1 | Feature discovery for their persona |
| **Day 3** | Something you might not have tried yet | One non-obvious feature + how-to |
| **Day 7** | Your first week on Aegis Lens | Usage recap (what they did) + next activation milestone |

Rules: every email links to one action, not five. Subject lines name the persona
("3 things most OSINT analysts…"). Localized for UK + EN at minimum.

### In-product tour

- **Skippable at any step** — power users resent forced tours.
- Triggered on first login; also accessible from the help menu.
- 5 steps maximum: map, events feed, alert setup, export, copilot.
- After tour completion: "Set your first alert" — the primary activation milestone.

### Sample saved searches and alerts

Each persona gets 2–3 pre-built saved searches and 1 pre-configured alert on
signup. The user can immediately see results without configuring anything.
Seeing data immediately is more powerful than explaining what could be seen.

### Activation milestones

| Milestone | Definition | Trigger |
| --- | --- | --- |
| "First look" | Saw the map + at least 3 events | Day 1 |
| "Activated" | Created a saved search OR configured an alert | Day 7 target |
| "Core user" | Used the platform on 3+ days in 30 days | Day 30 target |

Milestone tracking is automated. If a user reaches Day 3 without "activated",
they get a targeted nudge email. If Day 7 without "activated" — CS shared pool
is alerted for a proactive email (not a call — respect the self-serve motion).

---

## 3. Enterprise / Government Onboarding

*Enterprise that activates fast → renews. Slow activation → churn risk Day 1.*

### Phase 1 — Kickoff (Week 1)

**Kickoff call agenda** (60 min, CSM + all customer stakeholders):

1. Stakeholder map confirmed: who owns the platform internally (admin, power
   users, execs who receive output).
2. **Success criteria signed**: specific, measurable ("by week 8, all 12 analysts
   are running daily queries + 3 AOIs configured"). Not "the team is comfortable."
3. **Implementation plan agreed**: timeline, milestones, responsible parties on
   both sides.
4. **Technical setup initiated**: SSO / SCIM provisioning, custom layers spec,
   AOI list from the customer, integration targets (Slack / Teams / API).

### Phase 2 — Implementation (Weeks 2–4)

- **Admin training** (2h): platform admin panel, user provisioning, AOI setup,
  custom layer configuration, billing.
- **Per-team user training** (90 min each, per analyst group): workspace setup,
  advanced search, alert configuration, export + API basics.
- **Integration setup**: Slack/Teams alert delivery, API key + webhook, SSO.
- **Test data + workflow validation**: customer runs their intended workflow end-
  to-end and signs off that it works as expected before stabilization.

### Phase 3 — Stabilization (Weeks 4–8)

- **Adoption monitoring**: CSM tracks weekly active users + query volume vs.
  the success criteria.
- **Adoption nudges**: if a team's usage is below target, CSM schedules a
  15-min "office hours" session (not a lecture — answer whatever they're stuck on).
- **Issue resolution SLA**: any implementation blocker raised by the customer
  is resolved within 1 business day (P1-level commitment during stabilization).
- **First QBR scheduled** for the 8-week mark.

### Phase 4 — Handoff to CS

- **Implementation retrospective** (30 min): what went well, what was slow,
  what the CSM should know for ongoing support.
- **CSM ownership transfer** documented in the CRM: implementation notes, known
  issues, key contacts, success criteria status.
- Ongoing relationship follows the [customer success model](../support/customer-success.md).

---

## 4. Beta / Early Access Program

*Beta is qualitative > quantitative. 50 engaged betas > 5000 silent ones.*

### Beta tier structure

- **Closed Alpha**: internal only; no external access; no SLA; may break.
- **Closed Beta**: invited externals; no SLA; structured feedback required;
  no resale or press without explicit approval.
- **Open Beta**: public (any user can enable); basic SLA ("best effort");
  `BETA` badge visible; may proceed to GA.

(These map to the [feature lifecycle states](../engineering/dev-standards.md#7-feature-lifecycle)
— the beta program is the organizational wrapper for Closed Beta and Open Beta.)

### Cohort selection

**Application form** (for Closed Beta): "Why do you want early access? How will
you use this feature? What will you compare it to?" — 3 questions max.

**Acceptance criteria** (defined per cohort):
- Does the applicant represent the target persona for this feature?
- Will they actually use it and provide feedback within the feedback window?
- Is there enough diversity in the cohort (different regions, use cases, orgs)?

Target cohort size: 15–50 participants for most features. More is not better —
more participants = less per-participant depth.

### Per-beta communication channel

Each closed-beta cohort gets a dedicated **Slack or Discord channel** with:
- The PM and the feature's engineering lead as members.
- A weekly digest prompt (Thursday): "What worked this week? What blocked you?
  What would make this 2× more useful?"
- A pinned feedback template (bugs → link to Linear; feature ideas → structured
  form).

### Feedback synthesis

- **Weekly synthesis** by PM: what are the top 3 things we're hearing? What
  changed in the product because of beta feedback? (Closing the loop is what
  keeps betas engaged.)
- **Per-beta exit interview** (15 min, optional for participant): at feature GA
  or beta close. Structured: what would you tell a colleague about this feature?
  What's still missing? Would you recommend it?

### Beta-to-GA promotion criteria

| Criterion | Threshold |
| --- | --- |
| Activation rate in beta cohort | ≥ 70% of invited betas used the feature at least twice |
| Critical bugs | Zero outstanding P0/P1 bugs |
| Documentation | User docs + runbook complete |
| Support readiness | Support team trained; KB article published |
| Monitoring | Alerts configured; SLO defined and > threshold for 2 weeks |

### Beta NDA

Closed Beta participants sign a lightweight NDA (see
[advisor NDA](../legal/nda/advisor-nda.md) as a starting template — shorter,
time-limited, focused on not publishing beta features before GA).

### Feature flag governance

Beta features are gated behind a feature flag with:
- Org-level flag (enabled per invited beta org, not per user).
- A clearly documented kill-switch procedure (if the feature causes harm, it
  can be disabled for all betas in < 15 minutes).
- No beta feature can be enabled for > 20% of production traffic without PM +
  Engineering Lead approval (canary requirement).
