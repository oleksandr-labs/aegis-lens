# Architecture Decision Records (ADRs)

> Each significant technical decision recorded with context, options, decision,
> and consequences. **ADRs prevent "why did we do this?" archaeology — cheap
> insurance.**

## What is an ADR?

A short, immutable record of one architecturally significant decision: the
context that forced a choice, the options considered, the decision, and its
consequences. ADRs are **append-only history** — you don't rewrite them, you
supersede them.

## When to write one

Write an ADR for decisions that are **costly to reverse** or **shape the
system**: choice of datastore, event schema, auth model, deployment topology,
a major dependency, an API contract, a cross-cutting pattern. Skip it for
routine, easily-reversed choices.

Rule of thumb: if a future engineer would reasonably ask "why on earth did we do
it this way?", it deserves an ADR.

## Conventions

- **Location:** `docs/adr/NNNN-title.md`, zero-padded sequential numbers.
- **Immutable:** never edit the decision of a published ADR. To change course,
  write a **new** ADR and mark the old one `Superseded by ADR-NNNN`.
- **Status lifecycle:** `Proposed → Accepted → (Deprecated | Superseded)`.
- **One decision per ADR.** Keep them short (one page).
- **Link from PRs:** the PR that implements an ADR references it; CI checks the
  link (see below).

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0000](0000-template.md) | Template | — |
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |

_Add a row per ADR. Keep newest at the bottom._

## CI: link ADRs to PRs

A lightweight CI check encourages traceability:

- A PR labeled `architecture` (or touching `docs/adr/**`) must reference an ADR
  number in its description (`ADR-NNNN`).
- The check verifies the referenced ADR file exists. It's a **warning-level**
  nudge, not a hard block, to avoid friction on small changes.

## Quarterly staleness review

Each quarter, scan `Accepted` ADRs for ones overtaken by reality. Don't edit
them — write a superseding ADR and flip the old status to `Superseded by
ADR-NNNN`. This keeps the history honest and the current state discoverable.

## Public ADR mirror

A curated subset of ADRs (those with no sensitive detail, e.g., "why event-sourced
ingest", "why PostGIS") is mirrored publicly as an **engineering-credibility**
signal. Selection is manual; default is internal-only.

## New-hire reading list

The **top ~20 ADRs** form part of onboarding — the fastest way to understand why
the architecture is the way it is. Maintained alongside the
[new-hire path](../../TODO/internal_docs/TODO_new_hire.md).

## Tooling

Plain markdown is the source of truth. Optionally adopt
[`log4brains`](https://github.com/thomvaill/log4brains) (or similar) to render a
searchable ADR site and scaffold new records (`log4brains adr new`) — but the
files must stay readable without the tool.
