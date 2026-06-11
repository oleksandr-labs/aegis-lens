/**
 * Commercial satellite tasking integration — Phase 3 config/types.
 *
 * This module defines the configuration and stub client for ordering
 * commercial satellite imagery via Planet Labs, BlackSky, Maxar, and Airbus.
 *
 * Phase 3 implementation note: actual API calls require enterprise contracts
 * and credentials. See TASKING_NOTES_EN for details.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN implementation notes */
export const TASKING_NOTES_EN = [
  "enterprise-only: commercial satellite tasking requires an enterprise contract; expose behind enterprise-tier + KYC gate",
  "phase-3-pending: full API integration is scheduled for Phase 3; this module provides config/types only",
  "Planet-Labs-API-Planet-SDK: use the official Planet Python SDK (https://github.com/planetlabs/planet-client-python) or REST API at https://api.planet.com/tasking/v2/",
] as const;

/** UA нотатки щодо реалізації */
export const TASKING_NOTES_UK = [
  "enterprise-only: комерційне замовлення знімків потребує корпоративного контракту; доступно лише на enterprise-рівні з KYC",
  "phase-3-pending: повна інтеграція API запланована на Фазу 3; цей модуль надає лише конфігурацію та типи",
  "Planet-Labs-API-Planet-SDK: використовуйте офіційний Planet Python SDK (https://github.com/planetlabs/planet-client-python) або REST API на https://api.planet.com/tasking/v2/",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported commercial satellite providers */
export type SatelliteProvider = "planet" | "blacksky" | "maxar" | "airbus";

/** Ground-sample distance options */
export type SatelliteResolution = "0.3m" | "0.5m" | "1m";

/** Tasking priority */
export type TaskingPriority = "rush" | "standard";

/** Request to task a satellite over an AOI */
export interface TaskingRequest {
  aoiId: string;
  provider: SatelliteProvider;
  resolution: SatelliteResolution;
  priority: TaskingPriority;
  /** ISO-8601 start of collection window */
  windowFrom: string;
  /** ISO-8601 end of collection window */
  windowTo: string;
}

/** Provider quote for a tasking request */
export interface TaskingQuote {
  requestId: string;
  estimatedCostUsd: number;
  deliveryDays: number;
  revisitCount: number;
}

// ---------------------------------------------------------------------------
// Client stub
// ---------------------------------------------------------------------------

/**
 * SatelliteTaskingClient — stub implementation.
 *
 * In Phase 3 each method should call the provider's REST API using
 * credentials stored in environment variables (e.g. PLANET_API_KEY,
 * BLACKSKY_API_KEY).
 */
export class SatelliteTaskingClient {
  /**
   * Request a quote for a tasking order.
   * Returns a stub quote until Phase 3 API integration is complete.
   */
  async getQuote(request: TaskingRequest): Promise<TaskingQuote> {
    // Stub prices per provider (USD per km²)
    const pricePerKm2: Record<SatelliteProvider, number> = {
      planet: 1.5,
      blacksky: 2.0,
      maxar: 4.0,
      airbus: 3.5,
    };
    const pricePerResolution: Record<SatelliteResolution, number> = {
      "0.3m": 3.0,
      "0.5m": 1.5,
      "1m": 1.0,
    };

    const baseCost = (pricePerKm2[request.provider] ?? 2) * (pricePerResolution[request.resolution] ?? 1.5);
    const rushMultiplier = request.priority === "rush" ? 2.5 : 1.0;

    return {
      requestId: `task_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
      estimatedCostUsd: Math.round(baseCost * rushMultiplier * 10) / 10,
      deliveryDays: request.priority === "rush" ? 1 : 5,
      revisitCount: 1,
    };
  }

  /**
   * Submit a tasking order.
   * STUB — throws until Phase 3 integration is complete.
   */
  async submitOrder(_request: TaskingRequest, _quote: TaskingQuote): Promise<{ orderId: string }> {
    throw new Error(
      "SatelliteTaskingClient.submitOrder() is not yet implemented. " +
        "Phase 3 integration required. See TASKING_NOTES_EN[1].",
    );
  }

  /**
   * Check the delivery status of an order.
   * STUB — throws until Phase 3 integration is complete.
   */
  async getOrderStatus(_orderId: string): Promise<{ status: string; downloadUrl?: string }> {
    throw new Error(
      "SatelliteTaskingClient.getOrderStatus() is not yet implemented. " +
        "Phase 3 integration required. See TASKING_NOTES_EN[1].",
    );
  }
}

/** Module-level singleton */
export const satelliteTaskingClient = new SatelliteTaskingClient();
