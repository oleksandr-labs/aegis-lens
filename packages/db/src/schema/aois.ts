/**
 * Areas of Interest (AOIs) + event match log.
 * See: services/aoi/src/types.ts for the application-layer types.
 *
 * The `geometry` column stores a GeoJSON-compatible JSON object.
 * When PostGIS is enabled, add a generated `geom geometry(Geometry, 4326)` column via migration.
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

export const aois = pgTable(
  "aois",
  {
    aoiId: uuid("aoi_id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    orgId: text("org_id"),
    name: text("name").notNull(),
    tags: jsonb("tags").notNull().default("[]"),
    /** JSON: AOIGeometry */
    geometry: jsonb("geometry").notNull(),
    isPrivate: boolean("is_private").notNull().default(false),
    satelliteCadenceDays: integer("satellite_cadence_days").notNull().default(7),
    alertRuleIds: jsonb("alert_rule_ids").notNull().default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("aois_user_idx").on(t.userId),
    orgIdx: index("aois_org_idx").on(t.orgId),
  }),
);

export type AOIRow = typeof aois.$inferSelect;
export type AOIInsert = typeof aois.$inferInsert;

// ── AOI event matches ─────────────────────────────────────────────────────────

export const aoiEventMatches = pgTable(
  "aoi_event_matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    aoiId: uuid("aoi_id").notNull(),
    eventId: text("event_id").notNull(),
    matchedAt: timestamp("matched_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    aoiIdx: index("aoi_matches_aoi_idx").on(t.aoiId),
    eventIdx: index("aoi_matches_event_idx").on(t.eventId),
    timeIdx: index("aoi_matches_time_idx").on(t.matchedAt.desc()),
  }),
);

export type AOIEventMatchRow = typeof aoiEventMatches.$inferSelect;

// ── AOI change detection jobs ─────────────────────────────────────────────────

export const aoiChangeDetectionJobs = pgTable(
  "aoi_change_detection_jobs",
  {
    jobId: uuid("job_id").defaultRandom().primaryKey(),
    aoiId: uuid("aoi_id").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: text("status").notNull().default("pending"),
    resultUrl: text("result_url"),
    error: text("error"),
  },
  (t) => ({
    aoiIdx: index("aoi_cd_jobs_aoi_idx").on(t.aoiId),
    statusIdx: index("aoi_cd_jobs_status_idx").on(t.status),
  }),
);

export type AOIChangeDetectionJobRow = typeof aoiChangeDetectionJobs.$inferSelect;
