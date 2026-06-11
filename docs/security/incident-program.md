# Incident Program: Action Items, Tabletops & Communications

> The connective tissue around the per-scenario runbooks: how action items get
> owned and tracked, how we practice, how we communicate externally, and how the
> learning loop closes.
>
> **Practice before you need to. The first real incident exposes every weak
> runbook.**

Companion to the [Incident Response overview](incident-response-runbook.md) and
the [runbooks index](../runbooks/README.md). Severities, roles, and step-flow
live there; this doc covers the program around them.

## 1. PagerDuty ↔ Slack `#incidents` bridge

- A PagerDuty trigger on a SEV-1/SEV-2 **auto-creates** the Slack incident
  channel `#incident-YYYY-MM-DD-<slug>` and posts the alert, severity, and
  current on-call.
- The channel is the **single source of truth** for the incident: timeline,
  decisions, and comms drafts all live there; the Scribe curates it.
- Bridge actions available in-channel: page secondary/IC, set severity, link the
  runbook, open the status-page incident, and (on resolve) spawn the postmortem
  doc pre-filled with the timeline.
- Every pageable alert carries a `runbook_url` so the bridge links the right
  runbook automatically (see [runbooks index](../runbooks/README.md#alert--runbook-linking)).

## 2. Action-item tracking & ownership

The most common postmortem failure is action items that are never done.

- **Every action item** from an incident or postmortem is filed as a tracked
  issue (Linear), tagged `incident-action`, **linked back to the postmortem**,
  with a single named **owner** and a **due date**. No "team" owners, no
  open-ended dates.
- Action items are classified **P0 (prevents recurrence — must do)** /
  **P1 (meaningfully reduces risk)** / **P2 (nice to have)**. P0s are scheduled
  in the next sprint, not someday.
- A standing **incident-action review** (biweekly) walks open `incident-action`
  items; overdue P0/P1s are surfaced to the EM. The board lives in Linear and is
  visible to the whole team.
- A postmortem is not "closed" until its P0 action items ship.

## 3. Blameless culture (explicit)

This is policy, not a vibe — also recorded in the
[engineering handbook](../engineering/handbook.md):

- Postmortems focus on **systems and contributing factors, not individuals**. We
  assume everyone acted reasonably with the information they had.
- No blame, no punishment for honest mistakes surfaced in a postmortem. The
  failure is in the system that let a human error become an incident.
- "Right to escalate / ask for help" is never held against anyone (see
  [on-call §5](../engineering/on-call.md)).
- We reward surfacing near-misses. A near-miss writeup is as valued as an
  incident postmortem.

## 4. When a postmortem is required

- **Mandatory:** every SEV-1 and SEV-2.
- **Mandatory:** any **per-area SLO regression** that breaches its error budget,
  even without a customer-visible incident (the budget breach *is* the trigger).
- **Mandatory:** any source outage > 24h ([source-outage runbook](source-outage-runbook.md)).
- **Optional but encouraged:** SEV-3 with a systemic cause, and near-misses.

## 5. Internal postmortem repository

- All postmortems live in one searchable repo (Notion/Linear database), tagged by
  area, severity, root-cause class, and affected service.
- Each entry links its action items (§2) and any runbooks/ADRs it changed.
- The repo is the **canonical learning library** — see §7 and §8.

## 6. Quarterly review of recurring themes

- Once per quarter, review the postmortem repo for **patterns**: recurring
  root-cause classes, repeat-offender services, action items that keep reopening.
- Output: a short list of systemic investments (tooling, reliability work, debt
  paydown) fed into planning and the [tech-debt register](../engineering/tech-debt.md).

## 7. Tabletop exercises (quarterly)

- Each quarter, run at least one **tabletop**: a facilitated walk-through of a
  realistic scenario (e.g., "credential leaked + active exfil", "primary source
  silent for 36h", "model regression shipping wrong geolocations") using the
  actual runbooks.
- Goals: validate the runbook is followable, find gaps, and give the team reps so
  the first *real* incident isn't the first time.
- Each tabletop updates the drilled runbooks' `last validated` date
  ([runbooks index](../runbooks/README.md#practiced-vs-stale)) and **feeds new
  scenarios into the postmortem/scenario library** so we accumulate institutional
  memory.
- Schedule aligns with the [runbook drill schedule](../runbooks/README.md#quarterly-runbook-drill-schedule).

## 8. Onboarding via the postmortem library

- New engineers read a curated set of the most instructive postmortems as part of
  onboarding — the fastest way to absorb how the system actually fails and how we
  respond.
- The curated set is maintained alongside the [new-hire onboarding](../../TODO/internal_docs/TODO_new_hire.md)
  path and refreshed in the quarterly review (§6).

## 9. External communications policy

Governs anything that leaves the company during/after an incident.

- **Single approver:** the Comms Lead drafts; legal + IC approve before anything
  external (status page, customer email, social, press) goes out.
- **What we say:** factual, specific, no speculation, no blame, no premature
  attribution (don't name "DDoS" or "nation-state" until confirmed and approved —
  see [DDoS runbook §5](ddos-response-runbook.md)).
- **Channels & timing:** status page first for availability incidents; direct
  customer notice for data/security impact per support tier and legal review;
  press/social only via the approved spokesperson.
- **Localization:** customer-facing incident comms are published in **EN + UK**
  (and any locale where affected data was published), per the localized-comms
  requirement across the runbooks.
- **Public postmortems:** customer-impacting **SEV-1s get a public postmortem**
  (localized), published after the internal review and action-item triage. Be
  honest about root cause and what's changing.
- **Holding statements:** keep pre-approved holding statements ready so the first
  external update isn't blocked on drafting under pressure.

## Coverage map (which runbook for which incident)

| Incident class | Runbook |
| --- | --- |
| Anything SEV-1/2 (flow, roles, SEV table) | [IR overview](incident-response-runbook.md) |
| Data corruption / loss / wrong data | [Data incident](data-incident-runbook.md) |
| Credential / breach / exploit | [Security incident](security-incident-runbook.md) |
| Source goes silent | [Source outage](source-outage-runbook.md) |
| Model deploy worsens outputs | [AI regression](ai-regression-runbook.md) |
| DDoS / abuse | [DDoS response](ddos-response-runbook.md) |
| Writing it up | [Postmortem template](postmortem-template.md) |
