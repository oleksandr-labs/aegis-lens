import "server-only";
import { createHash } from "crypto";

export interface WebhookEndpoint {
  endpointId: string;
  url: string;
  /** SHA-256 of the signing secret — never expose the raw secret */
  secretHash: string;
  description?: string;
  eventFilters: string[];  // e.g. ["events.created", "alerts.triggered"]
  enabled: boolean;
  orgId?: string;
  consecutiveFailures: number;
  lastDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const webhookEndpointStore = new Map<string, WebhookEndpoint>();

// Seed demo endpoint
const demoSecret = "whsec_demo1234567890abcdef";
webhookEndpointStore.set("ep_demo_001", {
  endpointId: "ep_demo_001",
  url: "https://example.com/hooks/aegis",
  secretHash: createHash("sha256").update(demoSecret).digest("hex"),
  description: "Demo webhook endpoint",
  eventFilters: ["events.created", "alerts.triggered"],
  enabled: true,
  consecutiveFailures: 0,
  createdAt: new Date(Date.now() - 86400_000 * 7).toISOString(),
  updatedAt: new Date(Date.now() - 86400_000 * 7).toISOString(),
});

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export const VALID_EVENT_FILTERS = [
  "events.created",
  "events.updated",
  "events.retracted",
  "alerts.triggered",
  "aois.entered",
  "aois.exited",
  "reports.ready",
  "cases.created",
  "cases.updated",
] as const;
