/**
 * Webhook endpoints + delivery log.
 * See: services/webhooks/src/ for application-layer types.
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

// ── Webhook endpoints ─────────────────────────────────────────────────────────

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    endpointId: uuid("endpoint_id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    /** HMAC-SHA256 secret — stored hashed in production */
    secretHash: text("secret_hash").notNull(),
    /** JSON: WebhookEventType[] — empty = all events */
    eventFilters: jsonb("event_filters").notNull().default([]),
    isActive: boolean("is_active").notNull().default(true),
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    successRate: integer("success_rate_pct"),
    lastDeliveryAt: timestamp("last_delivery_at", { withTimezone: true }),
    disabledAt: timestamp("disabled_at", { withTimezone: true }),
    disabledReason: text("disabled_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("webhook_endpoints_org_idx").on(t.orgId),
    index("webhook_endpoints_active_idx").on(t.isActive),
  ],
);

// ── Webhook deliveries ────────────────────────────────────────────────────────

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    deliveryId: uuid("delivery_id").defaultRandom().primaryKey(),
    endpointId: uuid("endpoint_id").notNull(),
    payloadId: uuid("payload_id").notNull(),
    /** JSON: WebhookPayload */
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("pending"),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    attemptCount: integer("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("webhook_deliveries_endpoint_idx").on(t.endpointId),
    index("webhook_deliveries_status_idx").on(t.status),
    index("webhook_deliveries_next_attempt_idx").on(t.nextAttemptAt),
  ],
);

// ── Delivery attempts ─────────────────────────────────────────────────────────

export const webhookAttempts = pgTable(
  "webhook_attempts",
  {
    attemptId: uuid("attempt_id").defaultRandom().primaryKey(),
    deliveryId: uuid("delivery_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    durationMs: integer("duration_ms"),
    error: text("error"),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("webhook_attempts_delivery_idx").on(t.deliveryId),
  ],
);
