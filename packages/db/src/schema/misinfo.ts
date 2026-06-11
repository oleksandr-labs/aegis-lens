/**
 * Misinformation signals, disputed badges, narrative clusters, source reputation.
 * See: services/misinfo/src/ for application-layer types.
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";

// ── Disputed badges ───────────────────────────────────────────────────────────

export const disputedBadges = pgTable(
  "disputed_badges",
  {
    badgeId: uuid("badge_id").defaultRandom().primaryKey(),
    eventId: text("event_id").notNull().unique(),
    /** JSON: MisinfoSignal[] */
    signals: jsonb("signals").notNull(),
    suspicionScore: real("suspicion_score").notNull(),
    /** JSON: { en, uk } */
    caveatText: jsonb("caveat_text").notNull(),
    requiresHumanReview: boolean("requires_human_review").notNull().default(false),
    humanReviewStatus: text("human_review_status"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("disputed_badges_event_idx").on(t.eventId),
    index("disputed_badges_review_status_idx").on(t.humanReviewStatus),
    index("disputed_badges_score_idx").on(t.suspicionScore),
  ],
);

// ── Narrative clusters ────────────────────────────────────────────────────────

export const narrativeClusters = pgTable(
  "narrative_clusters",
  {
    clusterId: uuid("cluster_id").defaultRandom().primaryKey(),
    label: text("label").notNull(),
    memberCount: integer("member_count").notNull().default(0),
    /** JSON: string[] — event IDs */
    memberIds: jsonb("member_ids").notNull().default([]),
    velocity: real("velocity").notNull().default(0),
    /** JSON: Record<string, number> */
    sourceCounts: jsonb("source_counts").notNull().default({}),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("narrative_clusters_velocity_idx").on(t.velocity),
    index("narrative_clusters_last_active_idx").on(t.lastActiveAt),
  ],
);

// ── Source reputation ─────────────────────────────────────────────────────────

export const sourceReputation = pgTable(
  "source_reputation",
  {
    sourceId: text("source_id").primaryKey(),
    score: real("score").notNull().default(0.5),
    totalEvents: integer("total_events").notNull().default(0),
    verifiedEvents: integer("verified_events").notNull().default(0),
    retractedEvents: integer("retracted_events").notNull().default(0),
    disputedEvents: integer("disputed_events").notNull().default(0),
    verificationYield: real("verification_yield").notNull().default(0),
    lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("source_reputation_score_idx").on(t.score),
  ],
);
