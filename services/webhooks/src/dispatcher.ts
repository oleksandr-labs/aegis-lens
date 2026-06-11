/**
 * Webhook dispatcher: deliver a payload to an endpoint, record the attempt,
 * schedule retry or mark dead on final failure.
 *
 * This module is transport-agnostic: storage/queue backends are injected.
 */

import { buildHeaders } from "./signer";
import { nextAttemptAt, isRetryable, MAX_ATTEMPTS } from "./retry";
import type {
  WebhookEndpoint,
  WebhookPayload,
  WebhookDelivery,
  DeliveryAttempt,
} from "./types";

export interface DeliveryStore {
  createDelivery(delivery: WebhookDelivery): Promise<void>;
  updateDelivery(id: string, patch: Partial<WebhookDelivery>): Promise<void>;
  recordAttempt(attempt: DeliveryAttempt): Promise<void>;
  getDelivery(id: string): Promise<WebhookDelivery | null>;
}

const DELIVERY_TIMEOUT_MS = 10_000;

export class WebhookDispatcher {
  constructor(private readonly store: DeliveryStore) {}

  async dispatch(endpoint: WebhookEndpoint, payload: WebhookPayload): Promise<WebhookDelivery> {
    const deliveryId = crypto.randomUUID();
    const body = JSON.stringify(payload);

    const delivery: WebhookDelivery = {
      id: deliveryId,
      endpointId: endpoint.id,
      payloadId: payload.id,
      payload,
      status: "pending",
      attemptCount: 0,
      createdAt: new Date().toISOString(),
    };

    await this.store.createDelivery(delivery);
    await this.attempt(delivery, endpoint, body);
    return delivery;
  }

  async attempt(
    delivery: WebhookDelivery,
    endpoint: WebhookEndpoint,
    body?: string,
  ): Promise<void> {
    const resolvedBody = body ?? JSON.stringify(delivery.payload);
    const attemptNumber = delivery.attemptCount + 1;
    const attemptedAt = new Date().toISOString();
    const startMs = Date.now();

    const headers = buildHeaders(endpoint.secret, delivery.id, resolvedBody);

    let httpStatus: number | undefined;
    let responseBody: string | undefined;
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

      try {
        const res = await fetch(endpoint.url, {
          method: "POST",
          headers,
          body: resolvedBody,
          signal: controller.signal,
        });

        httpStatus = res.status;
        responseBody = (await res.text()).slice(0, 1024);
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      error = String(err);
    }

    const durationMs = Date.now() - startMs;
    const success = httpStatus !== undefined && httpStatus >= 200 && httpStatus < 300;

    const attempt: DeliveryAttempt = {
      deliveryId: delivery.id,
      attemptNumber,
      httpStatus,
      responseBody,
      durationMs,
      attemptedAt,
      error,
    };

    await this.store.recordAttempt(attempt);

    const patch: Partial<WebhookDelivery> = {
      attemptCount: attemptNumber,
      lastAttemptAt: attemptedAt,
      httpStatus,
      responseBody,
    };

    if (success) {
      patch.status = "success";
    } else if (!isRetryable(httpStatus) || attemptNumber >= MAX_ATTEMPTS) {
      patch.status = "dead";
    } else {
      const nextAt = nextAttemptAt(attemptNumber);
      patch.status = "pending";
      patch.nextAttemptAt = nextAt?.toISOString();
    }

    await this.store.updateDelivery(delivery.id, patch);
    Object.assign(delivery, patch);
  }

  /** Replay a dead or failed delivery (manual trigger) */
  async replay(deliveryId: string, endpoint: WebhookEndpoint): Promise<WebhookDelivery | null> {
    const delivery = await this.store.getDelivery(deliveryId);
    if (!delivery) return null;

    // Reset to pending so it can be reattempted
    await this.store.updateDelivery(deliveryId, { status: "pending" });
    delivery.status = "pending";

    await this.attempt(delivery, endpoint);
    return delivery;
  }
}

/** In-memory delivery store for testing and development */
export class InMemoryDeliveryStore implements DeliveryStore {
  private deliveries = new Map<string, WebhookDelivery>();
  private attempts: DeliveryAttempt[] = [];

  async createDelivery(delivery: WebhookDelivery): Promise<void> {
    this.deliveries.set(delivery.id, { ...delivery });
  }

  async updateDelivery(id: string, patch: Partial<WebhookDelivery>): Promise<void> {
    const existing = this.deliveries.get(id);
    if (existing) Object.assign(existing, patch);
  }

  async recordAttempt(attempt: DeliveryAttempt): Promise<void> {
    this.attempts.push({ ...attempt });
  }

  async getDelivery(id: string): Promise<WebhookDelivery | null> {
    return this.deliveries.get(id) ?? null;
  }

  getAttempts(deliveryId: string): DeliveryAttempt[] {
    return this.attempts.filter((a) => a.deliveryId === deliveryId);
  }

  allDeliveries(): WebhookDelivery[] {
    return [...this.deliveries.values()];
  }
}
