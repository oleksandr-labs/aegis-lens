/**
 * Events table — canonical event store.
 *
 * Sprint 1.4+: pure schema definition. No DB connection wired yet.
 *
 * Location is stored as plain lat/lon `real` columns. When PostGIS is enabled,
 * a generated `geom geometry(Point, 4326)` column will be added via migration.
 * Sources and media remain JSONB blobs for now; they will normalize into
 * `event_sources` / `event_media` relations once the ingest pipeline lands.
 */

import {
  pgTable,
  text,
  timestamp,
  smallint,
  real,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    eventId: text("event_id").primaryKey(), // ULID
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    class: text("class").notNull(),
    subclass: text("subclass"),

    severity: smallint("severity").notNull(), // 0..5
    dangerScore: smallint("danger_score").notNull(), // 0..100
    confidence: real("confidence").notNull(), // 0..1

    verificationState: text("verification_state").notNull().default("unverified"),

    summaryEn: text("summary_en").notNull(),
    summaryUk: text("summary_uk"),

    // Plain lat/lon for now; PostGIS-ready (will be supplanted by geom column).
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    bbox: jsonb("bbox"),

    sources: jsonb("sources").notNull(),
    media: jsonb("media").notNull(),

    originalText: text("original_text"),
  },
  (t) => ({
    occurredAtIdx: index("events_occurred_at_idx").on(t.occurredAt.desc()),
    classIdx: index("events_class_idx").on(t.class),
    dangerScoreIdx: index("events_danger_score_idx").on(t.dangerScore),
  }),
);

export type EventRow = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;
