/**
 * Saved searches + search analytics.
 * See: services/search/src/ for application-layer types.
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";

// ── Saved searches ────────────────────────────────────────────────────────────

export const savedSearches = pgTable(
  "saved_searches",
  {
    searchId: uuid("search_id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    /** JSON: SearchQuery */
    query: jsonb("query").notNull(),
    isShared: boolean("is_shared").notNull().default(false),
    /** JSON: { intervalHours, nextRunAt } */
    schedule: jsonb("schedule"),
    resultCount: integer("result_count"),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("saved_searches_org_user_idx").on(t.orgId, t.userId),
    index("saved_searches_schedule_idx").on(t.schedule),
  ],
);

// ── Search analytics ──────────────────────────────────────────────────────────

export const searchAnalyticsLog = pgTable(
  "search_analytics_log",
  {
    logId: uuid("log_id").defaultRandom().primaryKey(),
    orgId: text("org_id"),
    userId: text("user_id"),
    query: text("query").notNull(),
    locale: text("locale"),
    hitsReturned: integer("hits_returned").notNull().default(0),
    totalHits: integer("total_hits").notNull().default(0),
    tookMs: integer("took_ms"),
    isZeroResult: boolean("is_zero_result").notNull().default(false),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("search_analytics_ts_idx").on(t.timestamp),
    index("search_analytics_zero_result_idx").on(t.isZeroResult),
    index("search_analytics_org_idx").on(t.orgId),
  ],
);
