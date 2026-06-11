/**
 * Retraction records + downstream citations.
 * See: services/retraction/src/ for application-layer types.
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";

// ── Retraction records ────────────────────────────────────────────────────────

export const retractions = pgTable(
  "retractions",
  {
    retractionId: uuid("retraction_id").defaultRandom().primaryKey(),
    eventId: text("event_id").notNull().unique(),
    state: text("state").notNull(),
    reason: text("reason").notNull(),
    /** JSON: { en, uk } */
    correctionSummary: jsonb("correction_summary"),
    replacementEventId: text("replacement_event_id"),
    retractedBy: text("retracted_by").notNull(),
    retractedAt: timestamp("retracted_at", { withTimezone: true }).notNull().defaultNow(),
    /** JSON: DownstreamRef[] */
    downstreamRefs: jsonb("downstream_refs").notNull().default([]),
    notificationsSent: boolean("notifications_sent").notNull().default(false),
    notificationsSentAt: timestamp("notifications_sent_at", { withTimezone: true }),
    publiclyVisible: boolean("publicly_visible").notNull().default(true),
  },
  (t) => [
    index("retractions_event_idx").on(t.eventId),
    index("retractions_state_idx").on(t.state),
    index("retractions_retracted_at_idx").on(t.retractedAt),
  ],
);

// ── Retraction notification log ───────────────────────────────────────────────

export const retractionNotifications = pgTable(
  "retraction_notifications",
  {
    notificationId: uuid("notification_id").defaultRandom().primaryKey(),
    retractionId: uuid("retraction_id").notNull(),
    eventId: text("event_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    channel: text("channel").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("retraction_notif_retraction_idx").on(t.retractionId),
    index("retraction_notif_recipient_idx").on(t.recipientId),
  ],
);
