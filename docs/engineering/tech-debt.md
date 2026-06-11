# Technical Debt Management

> Track and repay debt deliberately. **No "we'll fix it later" black holes — debt
> that's invisible compounds. Make it visible.**

## 1. The tech-debt register

Debt lives in **one visible place**, not in people's heads:

- A Linear list `Tech Debt` + the issue label `tech-debt`. Anything labeled
  `tech-debt` appears on the register automatically.
- Debt is created from: code review ("ship now, ticket the shortcut"), incident
  postmortem action items, and the annual audit.
- The register is reviewed each sprint and is visible to the whole team.

## 2. What every debt item records

| Field | Why |
| --- | --- |
| **Description** | What the debt is and where (files/service). |
| **Cost** | What it costs us *now* — slows changes, causes pages, blocks a feature, risk of bug. |
| **Risk** | Likelihood × impact if left (e.g., "data corruption risk", "scaling cliff at 2× load"). |
| **Owner** | One named person accountable for tracking it. |
| **Planned remediation** | The intended fix + rough size; or an explicit "accept for now, revisit on <trigger>". |

Cost + risk are what let us prioritize honestly instead of fixing whatever's
loudest.

## 3. Capacity: 20% to debt + tooling

- **20% of engineering capacity** is reserved each cycle for debt paydown and
  developer-tooling improvements. It's planned, not "if there's time" (there's
  never time).
- Per-team this is a **budget envelope** (see §5): each team plans its 20%
  against its own register, owned by the EM.

## 4. Per-quarter debt retro

- Each quarter, every team runs a **debt retro**: what got paid down, what grew,
  what keeps getting deferred, and whether the 20% is actually being spent.
- Recurring debt themes feed planning and cross-reference the
  [incident quarterly review](../security/incident-program.md#6-quarterly-review-of-recurring-themes)
  (a lot of debt surfaces as incidents).

## 5. Per-team debt budget envelope

- Each team gets a debt-paydown envelope (the team's slice of the 20%) and
  decides locally how to spend it against its register.
- Prevents debt work from being centrally starved and gives teams ownership of
  their own quality.

## 6. Critical-debt fast-track

- Debt that poses **imminent risk** (security exposure, data-loss risk, an
  approaching scaling cliff, a repeated incident cause) is tagged
  `tech-debt:critical` and **fast-tracked** — it jumps the 20% budget and is
  scheduled immediately, like a P0 incident action item.
- Critical debt is escalated to the EM/leadership the same way a SEV-2 would be.

## 7. No `TODO` comments without a ticket reference

- A `TODO`/`FIXME`/`HACK` comment in code **must** reference a tracked ticket:
  `// TODO(ABC-123): ...`. A bare `TODO` is invisible debt.
- **Enforced in CI:** a linter rule flags `TODO`/`FIXME`/`HACK` without a
  ticket-ID pattern. Pre-existing bare TODOs are ratcheted down over time (the
  check fails only on *new* ones).

## 8. Annual debt audit

- Once a year, a focused audit sweeps the codebase and register: stale items,
  debt nobody owns, dead code, deprecated dependencies, and areas where small
  debts have compounded.
- Output: refreshed register with re-validated cost/risk/owner, a list of debt to
  formally **write off** (accept permanently, with rationale), and the top
  systemic investments for the year's planning.

## Principles

- **Make it visible.** Invisible debt compounds silently; a register turns it
  into a managed liability.
- **Accept debt consciously, not by accident.** It's fine to take on debt for
  speed — but ticket it, with cost/risk, so it's a decision not a leak.
- **Repay deliberately.** The 20% envelope + critical fast-track means debt gets
  paid on purpose, not only when it explodes into an incident.
