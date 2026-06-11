# TODO — AI Red Teaming & Safety

## Goal
Adversarially probe the system before adversaries do. Find misuse paths, jailbreaks, harmful outputs.

## Progress
- 1 / 12 done

## Tasks

### Scopes
- [x] Copilot jailbreaks (refuse: doxxing, targeting, weapons construction, real-time tactical uplift) — 14 adversarial test cases in `services/safety/src/red-team-cases.ts` covering all 7 guardrail categories in EN/UK; includes pass cases to prevent over-blocking
- [ ] Rule builder abuse (alerts crafted to surveil private individuals)
- [ ] Verification bypass (synthetic media that beats our detectors)
- [ ] Source poisoning (adversary becomes a trusted source, then injects)
- [ ] Anomaly-detector evasion (low-and-slow campaigns)
- [ ] Geolocation spoofing
- [ ] Prompt injection via ingested content
- [ ] PII extraction attempts

### Cadence
- [ ] Internal red-team monthly
- [ ] External red-team annually
- [ ] Pre-launch red-team for major features
- [ ] Bug bounty for safety (separate from infra bounty)

### Reporting
- [ ] Findings tracked in a triage system with severity SLAs
- [ ] Public safety report (annual, redacted)

## i18n
- Red-team in tier-1 source languages (EN / UK / RU) at minimum.

### Примітки
Red-teaming is a continuous practice, not a one-off check.
