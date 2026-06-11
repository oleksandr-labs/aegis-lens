/**
 * Ingest pipeline run log. One row per fetch/parse attempt per source.
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const ingestLog = pgTable("ingest_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  status: text("status").notNull(), // ok | error | partial | skipped
  errorMessage: text("error_message"),
  eventCount: integer("event_count").notNull().default(0),
});

export type IngestLogRow = typeof ingestLog.$inferSelect;
export type IngestLogInsert = typeof ingestLog.$inferInsert;
