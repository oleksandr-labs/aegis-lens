/**
 * Legacy tables preserved from the original monolithic `schema.ts`.
 *
 * These were drafted in an earlier sprint and are kept here so the planned
 * tenancy / regions / AOI / alert-rules work doesn't get lost while the
 * per-table schema files (events, sources, reports, users, ...) take over as
 * the canonical layout. The `users`, `sources`, and `events` definitions from
 * the old file are intentionally NOT re-exported here — those are superseded
 * by the dedicated files in this folder.
 */

import {
  pgTable,
  text,
  timestamp,
  smallint,
  boolean,
  jsonb,
  uuid,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// ---------- Tenancy ----------

export const orgs = pgTable("orgs", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const memberships = pgTable(
  "memberships",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    role: text("role", { enum: ["admin", "analyst", "viewer", "api"] })
      .notNull()
      .default("viewer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.orgId, t.userId] }) }),
);

// ---------- Regions (KG-light) ----------

export const regions = pgTable(
  "regions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    countryIso2: text("country_iso2").notNull(),
    adminLevel: smallint("admin_level").notNull(), // 0..4
    slug: text("slug").notNull(),
    name: jsonb("name").$type<Record<string, string>>().notNull(),
    parentId: uuid("parent_id"),
  },
  (t) => ({
    isoIdx: index("regions_iso_idx").on(t.countryIso2),
    slugIdx: index("regions_slug_idx").on(
      t.countryIso2,
      t.adminLevel,
      t.slug,
    ),
  }),
);

// ---------- AOI / Watchlists / Alerts ----------

export const aois = pgTable("aois", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  name: text("name").notNull(),
  // GeoJSON polygon; replaced with PostGIS geometry later.
  polygon: jsonb("polygon").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const alertRules = pgTable("alert_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").notNull(),
  name: text("name").notNull(),
  filterDsl: jsonb("filter_dsl").notNull(),
  channels: jsonb("channels")
    .$type<{ kind: string; target: string }[]>()
    .notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ---------- Event normalization (future) ----------

export const eventSources = pgTable(
  "event_sources",
  {
    eventId: text("event_id").notNull(),
    sourceSlug: text("source_slug").notNull(),
    url: text("url").notNull(),
    archiveUrl: text("archive_url"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
    language: text("language").notNull(),
    contentHash: text("content_hash").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.sourceSlug, t.url] }),
  }),
);

export const eventMedia = pgTable("event_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: text("event_id").notNull(),
  type: text("type", { enum: ["image", "video"] }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  verificationState: text("verification_state").notNull().default("unverified"),
});

