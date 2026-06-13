# Event Schema Anti-patterns

**Last updated:** 2026-06-13  
**Audience:** Ingest engineers, API consumers, data pipeline authors

This document lists known anti-patterns that cause silent data corruption,
privacy violations, or analytical errors. Each pattern includes a detection
heuristic and the correct approach.

---

## AP-1 — Embedding PII in the event body

### What it looks like

```json
{
  "eventId": "...",
  "originalText": "Reported by Ivan Petrenko, +380 67 123 4567, living at vul. Shevchenka 12",
  "title": { "en": "Civilian injured near Kharkiv" },
  "rawPayload": { "reporterEmail": "ivan@example.com" }
}
```

### Why it's dangerous

- Events are stored in the core events table which has broader read access than PII stores.
- `isPublic: true` events are served via the public API — PII leaks to anyone with an API key.
- GDPR / Ukrainian personal data law applies; unlawful exposure creates legal risk.
- `rawPayload` is an escape hatch for ingest pipelines, not a PII dump.

### Detection

```bash
# Grep for common PII patterns in serialized events (CI check)
grep -E '(\+380|\+44|\+1)[0-9 ]{9,}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}' events_export.jsonl
```

### Correct approach

- Strip PII at the ingest boundary before the event enters the schema.
- If reporter identity must be tracked, store it in a separate `reporter_contacts` table with strict access controls, linked by `eventId`.
- `originalText` should contain only the source text, not reporter metadata.
- `rawPayload` is removed before the event leaves the ingest service; never rely on it persisting.

---

## AP-2 — Mutable event IDs

### What it looks like

```typescript
// Regenerating eventId on each upsert
const event = {
  eventId: uuid(),   // ← new UUID every time this runs
  ...fields,
};
await db.upsert(event);
```

### Why it's dangerous

- `eventId` is a foreign key in citations, links, alert matches, report footnotes, and user bookmarks.
- Regenerating it on every write silently breaks all references.
- Downstream Qdrant embeddings are keyed on `eventId`; orphaned vectors accumulate.
- API consumers cache event IDs for deduplication; reused UUIDs corrupt their state.

### Detection

```sql
-- Find events with the same (occurredAt, country, class) but different eventIds
SELECT occurred_at, country, class, COUNT(DISTINCT event_id) AS id_count
FROM events
GROUP BY occurred_at, country, class
HAVING COUNT(DISTINCT event_id) > 1;
```

### Correct approach

- Generate `eventId` exactly once, at first ingest. Use UUIDv7 for time-ordering.
- For idempotent upserts, use a deterministic ID derived from content hash + source:

```typescript
import { createHash } from "crypto";
function deterministicEventId(sourceId: string, occurredAt: string, rawText: string): string {
  const hash = createHash("sha256")
    .update(`${sourceId}::${occurredAt}::${rawText.slice(0, 256)}`)
    .digest("hex")
    .slice(0, 32);
  // Format as UUID-like for compatibility
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-7${hash.slice(13,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
}
```

- Never update `eventId` after creation. If an event was wrong, retract it (`isRetracted: true`) and create a new event.

---

## AP-3 — Geography without PostGIS geometry

### What it looks like

```typescript
// Storing only decimal strings, not a typed geometry
{
  location: undefined,
  // ... and then querying like this:
  "WHERE lat_text::float BETWEEN 49.5 AND 50.5 AND lon_text::float BETWEEN 35.9 AND 36.9"
}
```

Or worse:

```json
{
  "location": { "lat": 0, "lon": 0 }  // placeholder — not actually Atlantic Ocean
}
```

### Why it's dangerous

- Casting text to float at query time is slow and skips indexes.
- 0,0 is a valid coordinate (Gulf of Guinea) — placeholder zeros pollute geo queries with false positives.
- Radius queries (`ST_DWithin`) require a proper PostGIS `geometry` column; text lat/lon makes them impossible without a full-table scan.
- Spatial clustering (HDBSCAN) in `services/anomaly` requires real coordinates; fake zeros distort cluster centroids.

### Detection

```sql
-- Events with 0,0 location (likely placeholders)
SELECT event_id, occurred_at FROM events
WHERE (location->>'lat')::float = 0 AND (location->>'lon')::float = 0;

-- Events missing location entirely but with a country set
SELECT event_id FROM events WHERE location IS NULL AND country IS NOT NULL;
```

### Correct approach

- If location is unknown, set `location: undefined` (omit the field). Never use 0,0.
- Store location in a PostGIS `GEOMETRY(Point, 4326)` column in addition to the JSON blob:

```sql
ALTER TABLE events ADD COLUMN geom GEOMETRY(Point, 4326)
  GENERATED ALWAYS AS (
    CASE WHEN location IS NOT NULL
      THEN ST_SetSRID(ST_MakePoint(
        (location->>'lon')::float,
        (location->>'lat')::float
      ), 4326)
    END
  ) STORED;

CREATE INDEX idx_events_geom ON events USING GIST(geom);
```

- Use `uncertaintyM` to record geolocation precision; use it in the confidence score.
- For radius queries: `WHERE ST_DWithin(geom, ST_MakePoint($lon,$lat)::geography, $radiusM)`.

---

## AP-4 — confidence > 1.0

### What it looks like

```typescript
// Additive combination without clamping
const confidence = baseConfidence + mediaBonus + geoBonus;
// → can produce 1.05, 1.2, etc.

// Or: treating confidence as a percentage
const confidence = 78; // should be 0.78
```

### Why it's dangerous

- `confidence` is defined as a 0–1 float. Values > 1.0 fail schema validation.
- The `getConfidenceLabel()` thresholds (low/medium/high/verified) assume the 0–1 range.
- Danger score formula uses `confidence * 30`; a confidence of 1.5 would give 45 out of 30 — overflowing the component.
- Downstream Bayesian updates use log-odds on `confidence`; values ≥ 1.0 produce `log(∞)` = NaN.
- A confidence of 78 (integer) evaluates to `"verified"` when it should be `"low"`.

### Detection

```typescript
// In validateEventV1 (already enforced):
if (typeof e.confidence !== "number" || e.confidence < 0 || e.confidence > 1)
  errors.push({ field: "confidence", message: "Must be 0–1" });
```

```sql
-- Find stored events with out-of-range confidence
SELECT event_id, confidence FROM events WHERE confidence > 1 OR confidence < 0;
```

### Correct approach

- Always clamp after computation:

```typescript
const confidence = Math.min(0.99, Math.max(0.01, rawScore));
```

- Use the Bayesian log-odds model in `computeConfidenceScore()` — it is designed to accumulate evidence without overflowing the 0–1 range.
- Never add bonuses directly to a probability; add them to log-odds, then convert back.
- The theoretical maximum is 0.99, not 1.0, because absolute certainty is not epistemically defensible.

```typescript
// Correct: log-odds accumulation
let lo = logOdds(prior);      // e.g. prior = 0.3 → lo = -0.847
lo += mediaBonus;              // log-odds delta
lo += geoBonus;                // log-odds delta
const confidence = fromLogOdds(lo);  // always 0–1
```

---

## AP-5 — Using verificationState as a quality gate at ingest

### What it looks like

```typescript
// Blocking ingest until an event is "verified"
if (event.verificationState !== "verified") {
  return { accepted: false, reason: "Not yet verified" };
}
```

### Why it's dangerous

- Events enter as `unverified`; requiring verification at ingest means no events enter the system.
- Real-time utility depends on ingesting unverified events and displaying them with appropriate confidence indicators.
- The HITL queue backs up if ingest is blocked on review.

### Correct approach

- Accept all events at ingest regardless of `verificationState`.
- Gate **display prominence** on `verificationState`, not ingestion.
- Gate **public API exposure** on `isPublic: true && verificationState !== "retracted"`.
- Gate **alert firing** on `confidence >= 0.5` or analyst override.

---

## See also

- [`docs/engineering/event-schema-migration-guide.md`](event-schema-migration-guide.md) — safe schema evolution
- [`packages/event-schema/src/v1.ts`](../../packages/event-schema/src/v1.ts) — canonical types and validators
- [`packages/event-schema/src/serialization.ts`](../../packages/event-schema/src/serialization.ts) — JSON/Protobuf serialization
