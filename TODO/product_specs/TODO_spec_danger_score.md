# SPEC — Danger Score

## Status
Draft

## Goal
Per-event severity for civilian-safety and risk-routing decisions.

## Tasks
- [x] Inputs: class, intensity, population in radius, infrastructure impact, time-of-day — `DangerScoreInputs` in `packages/event-schema/src/danger-score.ts`
- [x] Output range: 0–100 with labeled bands (Calm / Elevated / Active / High / Critical) — `DANGER_BANDS` + `getDangerBand()` in v1.ts
- [x] Civilian-facing simplified mapping — `DangerBand` type with EN+UK labels
- [ ] Methodology page (public)
- [ ] Override mechanism (HITL escalation)
- [ ] Eval set built from historical incidents
- [x] Time-decay (active vs historical) — `RECENCY_HALF_LIFE_HOURS` exponential decay in danger-score.ts
- [ ] No targeting / tactical use cases — explicit policy

## i18n
- Band labels localized.

### Примітки
Conservative bias. Don't underestimate risk.
