# Event Schema Migration Guide

**Last updated:** 2026-06-13  
**Audience:** Platform engineers, API integrators, ingest pipeline owners  
**Scope:** Evolving AegisEventV1 to future versions without breaking consumers

---

## 1. Guiding principles

1. **The schema is the API.** Changing it is a deployment, not a refactor.
2. **Consumers are always right.** If a change breaks a valid consumer, it's a breaking change, even if the field was "unused".
3. **Parallel write before cutover.** Write both old and new fields simultaneously for the full deprecation window.
4. **Six-month grace period.** Deprecated fields must be supported for at least 6 months after the deprecation date.
5. **Conservative bias.** When in doubt, add a field rather than rename one.

---

## 2. Breaking vs non-breaking changes

### Non-breaking (safe to ship without version bump)

| Change | Notes |
|---|---|
| Add an optional field | Consumers ignore unknown fields (JSON) or skip unknown field numbers (Protobuf) |
| Add a new enum value | If consumers switch-exhaust, they must handle unknown values gracefully |
| Widen a numeric range | e.g. severity extending to 6; existing 1–5 still valid |
| Add a new array element type | Consumers iterate; new types are skipped |

### Breaking (requires major version bump to v2)

| Change | Notes |
|---|---|
| Remove a field | Even "unused" fields may be depended on by read paths |
| Rename a field | Treat as remove + add = two breaking changes |
| Change a field's type | string → number, optional → required |
| Change a field's semantic meaning | e.g. redefining what `confidence` measures |
| Remove an enum value | Existing stored events carry the old value |
| Change a required field to be computed-only | e.g. disallowing `dangerScore` on ingest |

---

## 3. Deprecation process

### Step 1 — Announce deprecation

Open a GitHub Issue tagged `schema-deprecation` with:
- Field name(s) being deprecated
- Deprecation date (today)
- Removal target date (6 months out)
- Replacement field(s), if any
- Migration example

### Step 2 — Add deprecation marker in code

```typescript
// In v1.ts:
/**
 * @deprecated since 2026-06-13. Use `regionCode` (ISO 3166-2) instead.
 * Will be removed after 2026-12-13.
 */
legacyRegion?: string;
```

```protobuf
// In event.proto:
// Deprecated: use region_code (ISO 3166-2) instead.
// Will be removed after 2026-12-13.
string legacy_region = 50 [deprecated = true];
```

### Step 3 — Parallel write

During the deprecation window, write **both** old and new fields:

```typescript
// ingest layer — write both for 6-month window
{
  legacyRegion: extractLegacyRegion(raw),    // deprecated, written for consumer compat
  regionCode: normalizeIso3166_2(raw),        // new canonical field
}
```

### Step 4 — Migrate read paths

Update all read paths to prefer the new field with fallback:

```typescript
const region = event.regionCode ?? event.legacyRegion ?? undefined;
```

### Step 5 — Monitor consumer usage

Use the deprecation-notifier middleware (`apps/web/src/lib/deprecation-notifier.ts`) to log
when deprecated fields are read via the API. Set alerts if deprecated-field reads are
non-zero after the removal date.

### Step 6 — Remove at deadline

After 6 months:
1. Remove the field from `v1.ts` and `event.proto`
2. Bump the patch version in `EVENT_SCHEMA_VERSION`
3. Remove parallel write from the ingest layer
4. Archive the deprecation GitHub Issue

---

## 4. v1 → v2 parallel writing strategy

When a full major version (v2) is required:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Ingest     │────▶│  Dual writer │────▶│  v1 store (DB)  │
│  (raw data) │     │              │────▶│  v2 store (DB)  │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                 │
                          ┌─────────────────────┐│
                          │ Read paths           ││
                          │  v2-first, v1 fallback│
                          └─────────────────────┘
```

**Phases:**

| Phase | Duration | Action |
|---|---|---|
| Alpha | 0–4 weeks | v2 schema finalized, dual-write begins, v2 read path gated on feature flag |
| Beta  | 4–12 weeks | v2 read path default for internal consumers; v1 fallback retained |
| GA    | 12+ weeks | v2 is the only write path; v1 reads served from translation layer |
| Sunset| 6 months after GA | v1 translation layer removed; v1 endpoints return 410 Gone |

**Translation layer** (v1 → v2 at read time):

```typescript
// apps/web/src/lib/events/v1-to-v2-adapter.ts
export function adaptV1ToV2(v1: AegisEventV1): AegisEventV2 {
  return {
    ...v1,
    // renamed fields
    id: v1.eventId,
    // new required fields with defaults
    taxonomy: { primary: v1.class, sub: v1.subclass },
    // dropped fields mapped to v2 equivalents
  };
}
```

---

## 5. External API versioning

REST API endpoints mirror schema versions:

```
GET /api/v1/events          → AegisEventV1 JSON
GET /api/v2/events          → AegisEventV2 JSON (once GA)
GET /api/events             → Latest stable (v1 today; v2 after cutover)
```

- v1 endpoints are supported for 12 months after v2 GA.
- Accept header negotiation: `Accept: application/json; schema-version=1` forces v1.

---

## 6. SDK compatibility matrix

| SDK | v1 | v2 (planned) |
|---|---|---|
| `@aegis-lens/sdk-ts` | ✅ | 🔄 dual-mode after alpha |
| `aegis-lens` (Python) | ✅ | 🔄 |
| Go SDK | ✅ | 🔄 |

---

## 7. Checklist for schema changes

Before merging any schema change:

- [ ] Is this breaking? If yes, has v2 planning started?
- [ ] Is this a deprecation? Has the GitHub Issue been opened?
- [ ] Updated `v1.ts` with `@deprecated` JSDoc
- [ ] Updated `event.proto` with `[deprecated = true]`
- [ ] Updated `EVENT_SCHEMA_CHANGELOG` in `apps/web/src/lib/docs/event-schema-page.ts`
- [ ] Updated public docs page at `/docs/schema/events`
- [ ] Notified data consumers via Slack `#platform-schema`
- [ ] Set calendar reminder for removal date
