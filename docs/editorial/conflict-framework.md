# Per-Conflict Editorial Framework (Master)

How Aegis Lens covers *any* conflict consistently. Every conflict we monitor
must have a completed instance of this spec before launch.

> "Neutrality is a skill, not a default. Without this framework, we drift."

---

## Required Spec (per conflict)

Each conflict gets a YAML instance at `data/conflicts/<slug>.yaml` answering:

### 1. Scope
- **Geographic:** bounding box + named regions in scope
- **Temporal:** start date; ongoing or end date
- **Parties:** named belligerents + non-state actors

### 2. Status
One of: `active` | `frozen` | `resolved`. Drives UI prominence + ingest cadence.

### 3. Source allow-list
- Per-side sources (with the side labeled, never hidden)
- Neutral / third-party sources
- Each source carries a base reliability score (see verify service)

### 4. Source reputation overrides
Per-conflict adjustments — a source reliable on conflict A may be unreliable on
conflict B. Overrides are explicit and audited.

### 5. Disputed-territory display policy
- How contested borders are rendered (dashed line, neutral label)
- Which place-name forms are canonical (see toponym policy)
- No de-facto recognition implied by map styling

### 6. Toponym & name-form policy
- Canonical spellings (e.g. **Kyiv** not Kiev, **Kharkiv** not Kharkov)
- Transliteration standard per language
- Endonym vs exonym rules

### 7. Per-side actor taxonomy
- Each side's units/orgs catalogued without false equivalence
- Aggressor / defender framing where factually established and sourced
- No "both sides" framing that obscures documented facts

### 8. Civilian-safety considerations
- What location precision is safe to publish (see tactical-uplift guardrails)
- Delay policy for sensitive event types
- Air-raid / shelter info prioritised for civilian persona

### 9. Sensitive-content rules
- Gore / casualty imagery: blurred by default, click-to-reveal with warning
- Minor faces: always blurred
- No publication of POW identification without consent (Geneva Convention)

### 10. Editorial review board
- Named reviewers with regional/linguistic expertise
- Two-reviewer rule for high-impact public events
- Escalation path for contested calls

### 11. Launch criteria
A conflict goes live only when:
- [ ] ≥3 vetted sources per side + neutral
- [ ] ≥2 reviewers with relevant expertise onboarded
- [ ] Tier-1 locale(s) ready
- [ ] Toponym + disputed-territory policy signed off
- [ ] Guardrails tuned for the conflict's tactical-sensitivity profile

### 12. Kill / pause criteria
Coverage pauses when:
- Source pool degrades below launch threshold
- Reviewer coverage lost
- Misuse spike flagged by exporters
- Legal / safety counsel advises pause

---

## i18n
Per-conflict locale priorities declared in the instance (`locale_priority`).

## Governance
- New conflicts require sign-off from the editorial review board
- This master framework is versioned; conflict instances reference its version
