/**
 * Endpoint health tracking: rolling success rate, p95 latency, consecutive failures.
 * Auto-disable endpoint after persistent failure.
 */

import type { DeliveryAttempt, WebhookEndpoint, EndpointHealth } from "./types";

const ROLLING_WINDOW = 100;
const AUTO_DISABLE_THRESHOLD = 10;

export interface EndpointHealthStore {
  getAttempts(endpointId: string, limit?: number): Promise<DeliveryAttempt[]>;
  disableEndpoint(endpointId: string, reason: string): Promise<void>;
  notifyEndpointDisabled(endpoint: WebhookEndpoint, reason: string): Promise<void>;
}

export function computeHealth(attempts: DeliveryAttempt[]): Omit<EndpointHealth, "endpointId"> {
  if (attempts.length === 0) {
    return { successRate: 1, p95LatencyMs: 0, consecutiveFailures: 0, isHealthy: true };
  }

  const recent = attempts.slice(-ROLLING_WINDOW);
  const successes = recent.filter((a) => a.httpStatus && a.httpStatus >= 200 && a.httpStatus < 300).length;
  const successRate = successes / recent.length;

  const sorted = [...recent].map((a) => a.durationMs).sort((x, y) => x - y);
  const p95Idx = Math.floor(sorted.length * 0.95);
  const p95LatencyMs = sorted[p95Idx] ?? sorted[sorted.length - 1] ?? 0;

  // Count consecutive failures from the end
  let consecutiveFailures = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    const a = recent[i];
    const isSuccess = a.httpStatus && a.httpStatus >= 200 && a.httpStatus < 300;
    if (!isSuccess) consecutiveFailures++;
    else break;
  }

  const lastDeliveryAt = recent[recent.length - 1]?.attemptedAt;

  return {
    successRate,
    p95LatencyMs,
    consecutiveFailures,
    lastDeliveryAt,
    isHealthy: consecutiveFailures < AUTO_DISABLE_THRESHOLD,
  };
}

export class EndpointHealthMonitor {
  constructor(private readonly store: EndpointHealthStore) {}

  async evaluate(endpoint: WebhookEndpoint): Promise<EndpointHealth> {
    const attempts = await this.store.getAttempts(endpoint.id, ROLLING_WINDOW);
    const health = computeHealth(attempts);

    if (!health.isHealthy && endpoint.isActive) {
      const reason = `${AUTO_DISABLE_THRESHOLD} consecutive failures — auto-disabled`;
      await this.store.disableEndpoint(endpoint.id, reason);
      await this.store.notifyEndpointDisabled(endpoint, reason);
    }

    return { endpointId: endpoint.id, ...health };
  }
}
