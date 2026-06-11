# SPEC — Event Schema v1

## Status
Draft

## Goal
Canonical event representation across services, languages, exports.

## Tasks
- [x] Document field-by-field — `packages/event-schema/src/v1.ts` (AegisEventV1)
- [x] Versioning policy (v1 → v2 parallel) — `EVENT_SCHEMA_VERSION` const + schema version field
- [x] Backward compatibility guarantees — documented in v1.ts header
- [ ] Serialization formats (JSON + Protobuf)
- [x] Reference validators in TS + Python — `validateEventV1()` + `isValidEvent()` in v1.ts
- [ ] Public schema page (SEO + docs)
- [ ] Migration guide template
- [ ] Anti-patterns documented

## i18n
- `summary` is locale-keyed map; `original_text` preserved per source.

### Примітки
The schema is the API. Don't break it.
