/**
 * Alert rules + delivery log.
 * See: services/alerts/src/types.ts for the application-layer types.
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

// ── Alert rules ───────────────────────────────────────────────────────────────

export const alertRules = pgTable(
  "alert_rules",
  {
    ruleId: uuid("rule_id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    orgId: text("org_id"),
    name: text("name").notNull(),
    /** JSON: AlertRuleCondition */
    condition: jsonb("condition").notNull(),
    /** JSON: string[] of AlertChannel */
    channels: jsonb("channels").notNull(),
    priority: text("priority").notNull().default("medium"),
    /** JSON: AlertSchedule */
    schedule: jsonb("schedule").notNull(),
    dedupWindowS: integer("dedup_window_s").notNull().default(300),
    maxPerHour: integer("max_per_hour").notNull().default(60),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("alert_rules_user_idx").on(t.userId),
    orgIdx: index("alert_rules_org_idx").on(t.orgId),
  }),
);

export type AlertRuleRow = typeof alertRules.$inferSelect;
export type AlertRuleInsert = typeof alertRules.$inferInsert;

// ── Alert delivery log ────────────────────────────────────────────────────────

export const alertDeliveries = pgTable(
  "alert_deliveries",
  {
    deliveryId: uuid("delivery_id").defaultRandom().primaryKey(),
    ruleId: uuid("rule_id").notNull(),
    eventId: text("event_id").notNull(),
    channel: text("channel").notNull(),
    status: text("status").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).defaultNow().notNull(),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    error: text("error"),
    retryCount: integer("retry_count").notNull().default(0),
  },
  (t) => ({
    ruleIdx: index("alert_deliveries_rule_idx").on(t.ruleId),
    eventIdx: index("alert_deliveries_event_idx").on(t.eventId),
    statusIdx: index("alert_deliveries_status_idx").on(t.status),
  }),
);

export type AlertDeliveryRow = typeof alertDeliveries.$inferSelect;
export type AlertDeliveryInsert = typeof alertDeliveries.$inferInsert;

// ── User channel destinations ─────────────────────────────────────────────────

export const userChannelDestinations = pgTable(
  "user_channel_destinations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    channel: text("channel").notNull(),
    /** e.g. email address, Telegram chat_id, webhook URL */
    destination: text("destination").notNull(),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userChannelIdx: index("user_channel_dest_idx").on(t.userId, t.channel),
  }),
);

export type UserChannelDestinationRow = typeof userChannelDestinations.$inferSelect;
export type UserChannelDestinationInsert = typeof userChannelDestinations.$inferInsert;
