# RFC — Per-Conflict Editorial Framework (Master)

## Goal
Define how we cover *any* conflict consistently: scope, sources, neutrality posture, disputed-area policy, taxonomy.

## Progress
- 12 / 12 done (master framework + Ukraine instance)

## Per-conflict required spec
- [x] Scope (geographic + temporal + parties) — `docs/editorial/conflict-framework.md` §1 + `data/conflicts/ukraine.yaml` scope block
- [x] Active vs frozen vs resolved status — §2; Ukraine = `active`
- [x] Source allow-list (per side + neutral) — §3; Ukraine sources block (UA-side / RU-side / neutral, each labeled)
- [x] Source reputation overrides per conflict — §4; Ukraine `reputation_overrides` (RU MoD casualty/territorial claims downweighted)
- [x] Disputed-territory display policy — §5; Ukraine `disputed_territory` (hatched overlay, dashed neutral borders, no de-facto recognition)
- [x] Toponym + name-form policy (e.g. Kyiv not Kiev) — §6; Ukraine `toponyms` (Kyiv/Kharkiv/Odesa/Lviv/Zaporizhzhia canonical)
- [x] Per-side actor taxonomy (no false equivalence) — §7; aggressor/defender framing, false-equivalence prohibited
- [x] Civilian-safety considerations — §8; aggregated launch points, air-raid priority
- [x] Sensitive-content rules (gore / casualty / minor faces) — §9; blur defaults, POW consent rule
- [x] Per-conflict editorial review board — §10; two-reviewer rule for high-impact event types
- [x] Per-conflict launch criteria (sources + reviewers + locale ready) — §11; Ukraine `launch` block (all met)
- [x] Per-conflict kill criteria (when to pause coverage) — §12; Ukraine `kill_criteria` list

## i18n
- Per-conflict locale priorities defined.

### Примітки
Neutrality is a skill, not a default. Without this framework, we drift.
