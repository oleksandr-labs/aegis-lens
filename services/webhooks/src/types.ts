export type WebhookEventType =
  | "event.created"
  | "event.updated"
  | "event.verified"
  | "event.retracted"
  | "alert.triggered"
  | "alert.resolved"
  | "report.published"
  | "source.health_changed"
  | "org.member_added"
  | "org.member_removed";

export interface WebhookEndpoint {
  id: string;
  orgId: string;
  url: string;
  description?: string;
  secret: string;
  eventFilters: WebhookEventType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Populated from delivery stats */
  successRate?: number;
  lastDeliveryAt?: string;
  consecutiveFailures?: number;
}

export interface WebhookPayload {
  id: string;
  type: WebhookEventType;
  apiVersion: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  payloadId: string;
  payload: WebhookPayload;
  status: "pending" | "success" | "failed" | "dead";
  httpStatus?: number;
  responseBody?: string;
  attemptCount: number;
  nextAttemptAt?: string;
  lastAttemptAt?: string;
  createdAt: string;
}

export interface DeliveryAttempt {
  deliveryId: string;
  attemptNumber: number;
  httpStatus?: number;
  responseBody?: string;
  durationMs: number;
  attemptedAt: string;
  error?: string;
}

export interface EndpointHealth {
  endpointId: string;
  successRate: number;
  p95LatencyMs: number;
  consecutiveFailures: number;
  lastDeliveryAt?: string;
  isHealthy: boolean;
}
