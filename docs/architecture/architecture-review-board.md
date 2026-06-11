# Architecture Review Board (ARB)

> Cadence, charter, and process for the Architecture Review Board.

## Purpose

The ARB exists to:
- Maintain coherence across the system as the team and codebase grow.
- Review proposed ADRs and RFCs for system-wide impact before they are finalized.
- Identify drift between documented and actual architecture.
- Flag cross-cutting technical debt and security/compliance risks.

The ARB **does not** slow down routine engineering — it gates only significant
architectural changes (same threshold as an [ADR](../adr/README.md) or
[RFC](../rfc/README.md)).

## Membership

| Role | Member | Notes |
| --- | --- | --- |
| Chair | Engineering Lead / CTO | Rotating every 6 months |
| Core | Senior Engineers (one per service area: platform, data, AI, infra) | Permanent seats |
| Security | Security Lead | Permanent seat |
| Guest | RFC/ADR author | Invited per review |

Quorum: Chair + ≥ 3 core members.

## Cadence

| Meeting | Frequency | Duration | Purpose |
| --- | --- | --- | --- |
| **RFC / ADR review** | As needed (triggered by a new RFC/ADR in In-Review state) | 60 min | Review, discuss, and record the decision |
| **Standing architecture sync** | Monthly | 45 min | Drift review, ADR staleness, cross-team signals |
| **Annual architecture audit** | Yearly | Half-day | Full system audit: cost model, security posture, tech-debt, public-safe summary refresh |

## What triggers an ARB review

- Any RFC opened for In-Review.
- Any ADR that introduces a new data store, service, or external dependency.
- Any breaking change to the event schema or a public API.
- Any change to the deployment topology or security architecture.
- Cross-team conflict that needs a tie-breaking decision.

Routine PRs, minor dependency upgrades, and intra-service refactors do **not**
trigger ARB — those are governed by [code review](../engineering/code-review.md).

## Process

1. **Author opens RFC/ADR** → notifies ARB chair.
2. Chair schedules a review within the RFC's `decision-by` window (or next
   monthly sync for ADRs).
3. ARB members read the proposal async before the meeting.
4. **Meeting:** author presents → open discussion → ARB records its decision in
   the RFC/ADR (accept / request changes / reject with reasoning).
5. If rejected/needs-changes: author revises and re-presents.
6. ARB decisions are **binding** on the accepting team but recorded transparently
   so they can be revisited via a new RFC.

## Outputs

- Updated RFC status (`Accepted` / `Rejected`) or ADR annotations.
- Meeting notes summarizing key decisions and open questions (committed to
  `docs/architecture/arb-notes/`).
- Staleness flags on ADRs reviewed in the monthly sync.
- Annual audit output: refreshed cost model, ADR staleness list, security
  posture summary, and public-safe architecture summary update.
