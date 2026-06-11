# TODO — Anti-Doxxing & Privacy Protection

## Goal
Prevent the platform from being used to expose private individuals (one of our biggest abuse risks).

## Progress
- 12 / 12 done

## Tasks

### Detection
- [x] NER classifier: private individual vs public figure — apps/web/src/lib/safety/ner-classifier.ts
- [x] Auto-blur faces of non-public people in user-uploaded media — apps/web/src/lib/safety/face-blur.ts
- [x] License plate auto-blur — apps/web/src/lib/safety/plate-blur.ts
- [x] PII detection on event text + auto-redact — apps/web/src/lib/safety/pii-detection.ts
- [x] Address-precision policy (no household-level) — apps/web/src/lib/safety/address-precision.ts
- [x] Search-blocker for known private names — apps/web/src/lib/safety/search-blocker.ts

### Workflow
- [x] Anti-doxxing review queue for borderline content — apps/web/src/lib/safety/doxxing-review-queue.ts
- [x] Per-violation takedown SLA — apps/web/src/lib/safety/takedown-sla.ts + apps/web/src/app/api/v1/safety/takedown/route.ts
- [x] Contributor strike system for repeated violation — apps/web/src/lib/safety/contributor-strikes.ts
- [x] Public anti-doxxing policy page — apps/web/src/lib/safety/doxxing-policy.ts

### Architecture
- [x] AI copilot refuses doxxing prompts (safety classifier) — apps/web/src/lib/safety/copilot-safety.ts
- [x] Rule builder refuses watchlists targeting private individuals — apps/web/src/lib/safety/rule-builder-gate.ts
- [x] Per-tier gating (advanced enrichment requires KYC) — apps/web/src/lib/safety/rule-builder-gate.ts (KYC_REQUIRED_TIERS)

## i18n
- Policy + appeals localized.

### Примітки
The most-likely abuse vector. Engineer protection structurally, not via terms-of-service alone.
