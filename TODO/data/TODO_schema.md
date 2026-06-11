# TODO — Event Schema & Taxonomy

## Goal
A canonical, versioned event schema and a stable taxonomy of event classes, severities, and confidences.

## Progress
- 12 / 12 done

## Tasks

### Canonical event
- [x] `event_id` (ULID) — `schema/src/event.ts`
- [x] `occurred_at`, `reported_at`, `ingested_at` timestamps — `schema/src/event.ts`
- [x] `location: { geom (PostGIS), precision_m, geocoding_method }` — `schema/src/event.ts` EventLocation
- [x] `class`, `subclass` (from taxonomy) — `schema/src/event.ts`
- [x] `severity` (0–5), `danger_score` (0–100), `confidence` (0–1) — `schema/src/event.ts`
- [x] `sources[]` with provenance (url, archive_url, fetched_at, language, original_text_hash) — `schema/src/event.ts` SourceRef
- [x] `media[]` (image/video refs + verification status) — `schema/src/event.ts` MediaRef
- [x] `entities[]` (regions, units, equipment, people-as-public-figures only) — `schema/src/event.ts` EntityRef
- [x] `summary` (multi-locale), `original_text` (per source) — `schema/src/event.ts`
- [x] `verification_state`: unverified | corroborated | disputed | retracted — `schema/src/event.ts` VerificationState
- [x] `embeddings_ref` (Qdrant point id) — `schema/src/event.ts`

### Taxonomy
- [x] Top-level classes: military_action, infrastructure, civilian_alert, humanitarian, cyber, maritime, aviation, environmental, political, economic — `schema/src/taxonomy.ts`
- [x] Subclasses per top-level — `schema/src/taxonomy.ts` (8 classes × 3-8 subclasses each)
- [x] Public taxonomy doc + change log — `schema/src/taxonomy.ts` (CHANGELOG block at top, v1.0)

## i18n
- `summary` is a map `locale -> text`; `original_text` keeps source language.

### Примітки
Schema is API. Version it. Breaking changes via `v2` parallel.
