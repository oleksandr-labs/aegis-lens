/**
 * Webhook endpoint registry: CRUD + event-type filtering.
 */

import { createHmac, randomBytes } from "crypto";
import type { WebhookEndpoint, WebhookEventType, WebhookPayload } from "./types";

export function generateSecret(): string {
  return randomBytes(32).toString("hex");
}

export interface EndpointRegistry {
  create(endpoint: Omit<WebhookEndpoint, "id" | "createdAt" | "updatedAt">): Promise<WebhookEndpoint>;
  update(id: string, patch: Partial<Pick<WebhookEndpoint, "url" | "description" | "eventFilters" | "isActive">>): Promise<WebhookEndpoint | null>;
  delete(id: string): Promise<boolean>;
  getById(id: string): Promise<WebhookEndpoint | null>;
  listByOrg(orgId: string): Promise<WebhookEndpoint[]>;
  /** Return endpoints that should receive this event type */
  resolveRecipients(orgId: string, eventType: WebhookEventType): Promise<WebhookEndpoint[]>;
}

export class InMemoryEndpointRegistry implements EndpointRegistry {
  private readonly endpoints = new Map<string, WebhookEndpoint>();

  async create(endpoint: Omit<WebhookEndpoint, "id" | "createdAt" | "updatedAt">): Promise<WebhookEndpoint> {
    const now = new Date().toISOString();
    const created: WebhookEndpoint = {
      ...endpoint,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.endpoints.set(created.id, created);
    return { ...created };
  }

  async update(id: string, patch: Partial<Pick<WebhookEndpoint, "url" | "description" | "eventFilters" | "isActive">>): Promise<WebhookEndpoint | null> {
    const existing = this.endpoints.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.endpoints.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.endpoints.delete(id);
  }

  async getById(id: string): Promise<WebhookEndpoint | null> {
    return this.endpoints.get(id) ?? null;
  }

  async listByOrg(orgId: string): Promise<WebhookEndpoint[]> {
    return [...this.endpoints.values()].filter((e) => e.orgId === orgId);
  }

  async resolveRecipients(orgId: string, eventType: WebhookEventType): Promise<WebhookEndpoint[]> {
    return [...this.endpoints.values()].filter(
      (e) =>
        e.orgId === orgId &&
        e.isActive &&
        (e.eventFilters.length === 0 || e.eventFilters.includes(eventType)),
    );
  }
}

/** Build a canonical webhook payload from an application event */
export function buildPayload(
  type: WebhookEventType,
  data: Record<string, unknown>,
): WebhookPayload {
  return {
    id: crypto.randomUUID(),
    type,
    apiVersion: "2024-01",
    createdAt: new Date().toISOString(),
    data,
  };
}
