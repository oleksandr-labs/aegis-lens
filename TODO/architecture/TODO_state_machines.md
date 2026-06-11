# TODO — State Machines (Cross-Service)

## Progress
- 5 / 6 machines + docs done

## Machines
- [x] Auth: signup → verify → MFA → active → suspended → deleted — `docs/architecture/state-machines.md`
- [x] Event verification: ingested → enriched → corroborated → verified | disputed | retracted — state-machines.md
- [x] Alert rule: draft → active → throttled → disabled — state-machines.md
- [x] AOI subscription: pending → active → expiring → expired — state-machines.md
- [ ] Investigation: draft → review → published → updated → retracted
- [x] Billing: trial → paid → past-due → suspended → canceled — state-machines.md + Webhook health machine

## Per-machine
- [x] States, transitions, guards documented — `docs/architecture/state-machines.md`
- [x] Diagrams (Mermaid) in repo — Mermaid stateDiagram-v2 for all 6 machines
- [ ] Tests: every transition + invalid-transition rejected
