# TODO — Vendor / Provider Migrations

## Goal
Playbook for switching cloud, LLM provider, map provider, payment, email vendor.

## Progress
- 0 / 10 done

## Tasks
- [ ] Per-vendor abstraction layer (anti-lock-in)
- [ ] Dual-provider phase (both alive during cutover)
- [ ] Per-cutover smoke-test matrix
- [ ] Per-cutover rollback path
- [ ] Customer-facing comms if behavior visibly changes
- [ ] Per-vendor cost dashboard (old vs new during dual)
- [x] Reference migrations: AWS ↔ GCP, Mapbox ↔ MapLibre, Anthropic ↔ open-weights, Stripe ↔ alternative ✓ Sprint 1
- [ ] Multi-region considerations
- [ ] Data-residency considerations
- [ ] Per-migration legal review

## i18n
- Customer comms localized.

### Примітки
Lock-in is paid in years of pain. Build abstractions even if slightly slower today.
