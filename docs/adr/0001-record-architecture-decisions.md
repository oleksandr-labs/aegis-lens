# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-05-30
- **Deciders:** Engineering
- **Implementing PR(s):** _this docs change_

## Context

As Aegis Lens grows, significant technical decisions (datastore choices, event
schema, ingest/verify pipeline design, deployment topology) accumulate. Without a
record, the rationale is lost to turnover and time, leading to "why did we do
this?" archaeology, accidental reversals of deliberate choices, and slow
onboarding. We need a lightweight, durable way to capture the *why*, not just the
*what* (which lives in code).

## Options considered

1. **Nothing formal** — rely on code, commit messages, and tribal knowledge.
   Cheap now, expensive later; rationale evaporates.
2. **A single growing "decisions" doc** — easy to start, but becomes an
   unsearchable, edit-warred blob with no immutability.
3. **Numbered, immutable ADR files in-repo** (Michael Nygard style) — one file
   per decision, append-only history, supersede rather than rewrite. Standard,
   tool-agnostic, diffable, lives next to the code.

## Decision

We will record architecturally significant decisions as **numbered, immutable
ADRs** under `docs/adr/NNNN-title.md`, following the template in
[`0000-template.md`](0000-template.md) and the conventions in
[`README.md`](README.md). Decisions are append-only; to change course we write a
new ADR that supersedes the old one.

## Consequences

- **Easier:** understanding why the architecture is the way it is; onboarding
  (top-20 reading list); avoiding silent reversal of deliberate trade-offs.
- **Harder / cost:** a small discipline tax — engineers must write an ADR for
  significant choices and link it from the implementing PR. Mitigated by keeping
  ADRs short (one page) and the CI link-check at warning level.
- **Risk watched:** ADRs going stale. Addressed by the quarterly staleness review
  (supersede, don't edit).

## Notes

- Template: [`0000-template.md`](0000-template.md). Conventions, CI link-check,
  public-mirror, and staleness review: [`README.md`](README.md).
- Inspired by Michael Nygard, "Documenting Architecture Decisions."
