# RFC-0001: Adopt a lightweight RFC process

- **Status:** Accepted
- **Author:** Engineering
- **Reviewers:** Eng leads
- **Created:** 2026-05-30
- **Decision-by:** 2026-05-30 (process bootstrap — meta-RFC)
- **Implementing PRs / ADRs:** _this docs change_

## Problem

We already record decisions after the fact via [ADRs](../adr/README.md), but
larger changes — a new service, a major migration, a cross-team or product/process
shift — need **alignment before code**, not just a record after. Without a
forward-looking proposal step, big changes first surface in code review, where
it's expensive and late to relitigate the approach ("wait, what?").

## Context

The team is distributed across timezones; synchronous design debate doesn't scale
and excludes async reviewers. ADRs cover the "decision record" need but are
immutable and point-in-time — wrong shape for an open proposal under debate. We
want the lightest process that still forces big changes to writing and gives
everyone a window to weigh in.

## Proposed solution

Adopt a numbered RFC process (`docs/rfc/NNNN-title.md`) with a fixed template,
a **minimum 1-week (5 business day) review window**, async-by-default decisions
with a decision meeting only when contentious, and implementation PRs linking
back to the RFC. Accepted RFCs may spawn ADRs for their concrete decisions.
Full mechanics in [`README.md`](README.md).

## Alternatives considered

1. **ADRs only** — too late (records, doesn't propose) and immutable (can't
   evolve during debate). Rejected.
2. **Design docs in a wiki** — unversioned, not diffable, drift from code,
   no enforced review window. Rejected.
3. **Heavyweight RFC with mandatory meetings** — doesn't fit a distributed team
   and adds friction that kills adoption. Rejected in favor of async-default.

## Impact

- **Blast radius:** all of engineering (process); zero runtime impact.
- **Cost:** a modest discipline tax on *large* changes only — small changes still
  go straight to PR (+ ADR if significant).
- **Backward compat:** the handbook's prior `docs/rfcs/` reference is reconciled
  to this canonical `docs/rfc/` location.

## Migration plan

1. Land the `docs/rfc/` directory (README + template + this RFC).
2. Update the [engineering handbook](../engineering/handbook.md) RFC pointer to
   `docs/rfc/`.
3. Use RFC-0002+ for the next real proposal.

## Open questions

- None blocking. Whether to require an RFC for product/process (not just
  architecture) changes will be tuned at the first annual RFC retro.
