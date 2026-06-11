# New-Hire Onboarding

> Day-1 productivity for every new hire. Reduce time-to-first-shipped-PR and
> time-to-first-customer-call. **The first 30 days predict retention — invest
> accordingly.**

EN onboarding is canonical; per-region addenda (legal, payroll, public holidays)
attach as needed. Owners: hiring manager (plan) + People Ops (logistics) + buddy
(day-to-day).

## 1. Pre-day-1 kit (owner: People Ops + IT)

Ready **before** the start date so day 1 isn't spent waiting:

- [ ] Laptop shipped + arrives before day 1; MDM-enrolled.
- [ ] Accounts provisioned via SSO group for the role (email, Slack, GitHub,
      Linear, PagerDuty, Notion, cloud console as appropriate).
- [ ] Hardware extras (monitor, YubiKey/MFA hardware key) shipped.
- [ ] **NDA / employment docs signed** (see [employee NDA](../legal/nda/employee-nda.md))
      — before access is granted.
- [ ] Welcome email: first-day logistics, who their buddy is, the first-week plan
      link, and "you don't need to set anything up yourself — it's waiting for you."

## 2. First-week structured plan (per role)

A pre-built week-1 plan exists per role family (Engineering, Data/Analyst,
GTM/Sales, Ops). Generic spine:

- **Day 1:** welcome, accounts check, buddy intro, environment setup, required
  reading kickoff (§6), team standup.
- **Day 2–3:** role-specific setup; first small task; meet adjacent teams.
- **Day 4–5:** first deliverable in progress; shadow a real activity (customer
  call / incident channel / data review); 30/60/90 plan drafted with manager.

## 3. Engineering: laptop → first commit < day 3

Concrete bar for engineers — **a real (small) PR merged by end of day 3**:

- [ ] Day 1: clone the monorepo, `pnpm install`, run the dev environment and the
      test suite green locally (see repo README / Makefile).
- [ ] Day 1–2: read the [engineering handbook](handbook.md) and the
      [top ADRs](../adr/README.md#new-hire-reading-list).
- [ ] Day 2–3: pick a pre-selected **"good first issue"** (curated backlog of
      small, safe, real changes), open a PR using the
      [PR template](../../.github/PULL_REQUEST_TEMPLATE.md), get it reviewed and
      merged.
- A blocked first commit by day 3 is a setup bug — buddy + manager fix the
  environment friction, don't blame the hire.

## 4. Buddy assignment

- Every hire gets a **buddy** (peer, not manager) for their first 30 days.
- Buddy owns: the daily "any blockers?" check-in (first 2 weeks), pairing on the
  first task, answering the "is this a dumb question?" questions, and being the
  default human to ask.
- Buddies are recognized for the work (it's real work, not a favor).

## 5. Role-specific onboarding checklist

Each role family has its own checklist (in the onboarding tracker) covering tools,
access, domain context, and first deliverables. Examples:

- **Engineering:** local env, CI/deploy flow, on-call shadowing (read-only),
  observability tour, security basics.
- **Data/Analyst:** schema + taxonomy, source landscape, verification
  methodology, query/notebook access.
- **GTM:** product demo cert, ICP + objection handling, CRM, first call shadow.

## 6. Required reading (everyone)

A short, curated, **non-optional** set — this is a mission-driven product and
context matters:

- [ ] Company **vision** ([product vision TODO](../../TODO/product/TODO_vision.md)).
- [ ] **Ethics** + editorial framework ([conflict framework](../editorial/conflict-framework.md),
      [code of conduct](../community/code-of-conduct.md)) — source protection,
      no unlawful-targeting, verification integrity.
- [ ] **Methodology** — how we ingest, verify, and rate confidence.
- [ ] **OSINT 101** — shared baseline so everyone speaks the same language.
- Engineers additionally: handbook + top ADRs + a few instructive
  [postmortems](../security/incident-program.md#8-onboarding-via-the-postmortem-library).

## 7. Customer-call shadow in week 1

- Everyone (not just GTM) shadows at least **one real customer call** in week 1.
- Why: builds empathy for who relies on the platform (humanitarian, defense,
  newsroom users) and grounds the work in real stakes from day one.
- Engineers/data: also lurk the customer-feedback and incident channels.

## 8. 30 / 60 / 90 plan (template)

Drafted with the manager in week 1, reviewed at each milestone:

```
## 30/60/90 — <name> — <role> — start <YYYY-MM-DD>

### 30 days — Learn
- Ramp goals: environment, codebase/domain areas, key relationships.
- Output: first PR(s) shipped / first <role deliverable>.
- Success looks like: <specific, checkable>.

### 60 days — Contribute
- Owning a small feature / workstream end-to-end.
- Output: <deliverable>.
- Success looks like: <specific>.

### 90 days — Own
- Independently owning <area>; on rotation (eng); driving <outcome>.
- Output: <deliverable>.
- Success looks like: <specific>.

### Support needed
- <what the manager/team must provide>
```

## 9. Onboarding satisfaction survey

- Short survey at **day 30** and **day 90**: was the kit ready, was the plan
  clear, did the buddy help, what blocked you, what was missing?
- People Ops reviews results quarterly and fixes the **top friction** each cycle.
  The metric that matters: time-to-first-shipped-PR / time-to-first-customer-call,
  trending down.
