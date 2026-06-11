# RFC Process

> Bigger architectural / product / process changes deserve a written proposal +
> review + decision **before** code. **RFCs prevent "wait, what?" surprises in
> code review.**

## RFC vs. ADR — which do I write?

| | **RFC** | **ADR** |
| --- | --- | --- |
| Purpose | Propose & debate a change *before* deciding | Record a decision *after* it's made |
| Timing | Forward-looking, opens a review window | Point-in-time, immutable record |
| Size | New service, major migration, cross-team or product/process change | One architecturally significant decision |
| Outcome | May *result in* one or more ADRs | The durable record |

Rule of thumb: if you need to **get alignment** before building → RFC. If you've
**decided** and want to record why → [ADR](../adr/README.md). A large RFC often
ends by spawning the ADRs that capture its concrete decisions.

## Conventions

- **Location:** `docs/rfc/NNNN-title.md`, zero-padded sequential numbers.
- **Versioned, not immutable:** unlike ADRs, an RFC is a living document *during*
  its review window — edit freely in response to feedback. Once `Accepted` or
  `Rejected`, freeze it (further changes → a new RFC).
- **Status lifecycle:** `Draft → In Review → (Accepted | Rejected | Withdrawn) →
  (Superseded by RFC-NNNN)`.
- **One owner, named reviewers, a decision-by date** in the header.

## The process

1. **Draft.** Author copies [`0000-template.md`](0000-template.md) to the next
   number, fills it, opens a PR adding the file with status `Draft`.
2. **In Review.** Author sets status `In Review` and announces it. The
   **minimum review window is 1 week (5 business days)** so async, cross-team,
   and timezone-separated reviewers can weigh in. Discussion happens inline on
   the PR.
3. **Decide.** If consensus emerges async → reviewers approve and status →
   `Accepted`. If it's contentious or high-stakes → hold a **decision meeting**
   (the owner runs it, the named decider decides, the Scribe records the
   rationale back into the RFC).
4. **Record & implement.** On `Accepted`, the RFC is merged. Implementation PRs
   **link back** to `RFC-NNNN`; spawned decisions get [ADRs](../adr/README.md).
5. **Rejected/Withdrawn** RFCs are still merged (with that status) — a recorded
   "we considered this and didn't do it" is valuable.

## Linking implementation back to the RFC

- Implementation PRs reference `RFC-NNNN` in the description (same mechanism as
  the [ADR link-check](../adr/README.md#ci-link-adrs-to-prs)).
- The RFC's header keeps a list of implementing PRs/ADRs so the trail is
  bidirectional.

## Annual RFC retro

Once a year, review accepted RFCs against reality: **which aged well, which
didn't, and why?** This sharpens future proposals (e.g., "we consistently
underestimate migration cost") and flags RFCs that should be superseded.

## Public-safe RFC mirror

A curated subset of RFCs with no sensitive detail is mirrored publicly as an
**engineering-credibility** signal (like the ADR mirror). Selection is manual;
default is internal-only. Never mirror anything touching source protection,
security internals, or customer specifics.

## Index

| RFC | Title | Status |
| --- | --- | --- |
| [0000](0000-template.md) | Template | — |
| [0001](0001-rfc-process.md) | Adopt a lightweight RFC process | Accepted |

_Add a row per RFC; newest at the bottom._
