/**
 * Motion tracking tables — AIS vessel positions and ADS-B aircraft positions.
 * Both use a timeseries append-only pattern: one row per position report.
 *
 * Partition by time in production (monthly). Use TimescaleDB hypertable.
 * PostGIS `geom` column can be added via migration once PostGIS is enabled.
 */

import {
  pgTable,
  text,
  timestamp,
  real,
  smallint,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// ── AIS vessel positions ───────────────────────────────────────────────────────

export const vesselPositions = pgTable(
  "vessel_positions",
  {
    /** Auto-increment surrogate — use as cursor for streaming */
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    /** Maritime Mobile Service Identity */
    mmsi: text("mmsi").notNull(),
    imo: text("imo"),
    callsign: text("callsign"),
    shipName: text("ship_name"),
    shipType: text("ship_type").notNull().default("unknown"),
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    speedKnots: real("speed_knots"),
    courseDeg: real("course_deg"),
    headingDeg: real("heading_deg"),
    navStatus: text("nav_status"),
    destination: text("destination"),
    draughtM: real("draught_m"),
    flag: text("flag"),
    msgType: smallint("msg_type"),
    /** Whether vessel is on a sanctions watchlist */
    isSanctioned: boolean("is_sanctioned").notNull().default(false),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    mmsiTimeIdx: index("vp_mmsi_time_idx").on(t.mmsi, t.observedAt.desc()),
    timeIdx: index("vp_time_idx").on(t.observedAt.desc()),
    flagIdx: index("vp_flag_idx").on(t.flag),
    typeIdx: index("vp_type_idx").on(t.shipType),
  }),
);

export type VesselPositionRow = typeof vesselPositions.$inferSelect;
export type VesselPositionInsert = typeof vesselPositions.$inferInsert;

// ── ADS-B aircraft positions ──────────────────────────────────────────────────

export const aircraftPositions = pgTable(
  "aircraft_positions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    /** 24-bit ICAO Mode S address */
    icao24: text("icao24").notNull(),
    callsign: text("callsign"),
    originCountry: text("origin_country"),
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    altitudeM: real("altitude_m"),
    velocityMs: real("velocity_ms"),
    headingDeg: real("heading_deg"),
    verticalRateMs: real("vertical_rate_ms"),
    /** true = aircraft on ground */
    onGround: boolean("on_ground").notNull().default(false),
    /** Aircraft category from DB (military / civilian / private / etc.) */
    category: text("category").notNull().default("unknown"),
    isMilitary: boolean("is_military").notNull().default(false),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    icaoTimeIdx: index("ap_icao_time_idx").on(t.icao24, t.observedAt.desc()),
    timeIdx: index("ap_time_idx").on(t.observedAt.desc()),
    militaryIdx: index("ap_military_idx").on(t.isMilitary),
  }),
);

export type AircraftPositionRow = typeof aircraftPositions.$inferSelect;
export type AircraftPositionInsert = typeof aircraftPositions.$inferInsert;

// ── Vessel/aircraft watchlist ─────────────────────────────────────────────────

export const motionWatchlist = pgTable(
  "motion_watchlist",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    kind: text("kind").notNull(), // "vessel" | "aircraft"
    identifier: text("identifier").notNull(), // mmsi or icao24
    reason: text("reason").notNull(),
    addedBy: text("added_by").notNull(),
    /** ISO 3166-1 alpha-2 sanctioning authority (e.g. "OFAC", "EU") */
    sanctioningAuthority: text("sanctioning_authority"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => ({
    identifierIdx: index("mwl_identifier_idx").on(t.kind, t.identifier),
  }),
);

export type MotionWatchlistRow = typeof motionWatchlist.$inferSelect;
export type MotionWatchlistInsert = typeof motionWatchlist.$inferInsert;
