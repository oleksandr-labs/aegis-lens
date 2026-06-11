/**
 * Daily forecast sync — pulls UHMC forecasts for every oblast centre once per
 * cycle and produces an overlay-ready snapshot for the `weather` map layer.
 *
 * Cadence: UHMC refreshes its public forecast a few times daily; a 6-hourly
 * sync is plenty and respectful of the public-good source. This module is a
 * pure orchestrator — the host wires it to a cron/worker (no scheduler dep
 * here, matching the package's no-secret / no-runtime-dep posture).
 */

import { UkrhydrometClient } from "./client";
import { SevereWarningClient, isWarningActive } from "./severe-warnings";
import { HydrologyClient } from "./hydrology";
import type { OblastForecast, SevereWarning, RiverGauge } from "./types";

/** Recommended minimum gap between full syncs (ms). */
export const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h

export interface ForecastSyncSnapshot {
  generatedAt: string;
  isDemo: boolean;
  forecastDays: number;
  forecasts: OblastForecast[];
  activeWarnings: SevereWarning[];
  floodAlerts: RiverGauge[];
  meta: {
    oblastCount: number;
    warningCount: number;
    floodAlertCount: number;
    source: "meteo.gov.ua";
    layer: "weather";
    attribution: { en: string; uk: string };
    attributionUrl: string;
  };
}

export interface ForecastSyncDeps {
  forecastClient?: UkrhydrometClient;
  warningClient?: SevereWarningClient;
  hydrologyClient?: HydrologyClient;
  forecastDays?: number;
}

/**
 * Run one full sync: forecasts + active warnings + flood alerts.
 * Returns a single snapshot the overlay/route can serve directly.
 */
export async function runForecastSync(deps: ForecastSyncDeps = {}): Promise<ForecastSyncSnapshot> {
  const forecastClient = deps.forecastClient ?? new UkrhydrometClient();
  const warningClient = deps.warningClient ?? new SevereWarningClient();
  const hydrologyClient = deps.hydrologyClient ?? new HydrologyClient();
  const forecastDays = deps.forecastDays ?? 5;

  const [forecasts, allWarnings, floodAlerts] = await Promise.all([
    forecastClient.getAllForecasts(forecastDays),
    warningClient.getActiveWarnings(),
    hydrologyClient.getFloodAlerts(),
  ]);

  const activeWarnings = allWarnings.filter((w) => isWarningActive(w));

  return {
    generatedAt: new Date().toISOString(),
    isDemo: forecastClient.isDemo,
    forecastDays,
    forecasts,
    activeWarnings,
    floodAlerts,
    meta: {
      oblastCount: forecasts.length,
      warningCount: activeWarnings.length,
      floodAlertCount: floodAlerts.length,
      source: "meteo.gov.ua",
      layer: "weather",
      attribution: {
        en: "Forecast & warning data: Ukrainian Hydrometeorological Center (meteo.gov.ua)",
        uk: "Прогноз і попередження: Український гідрометеорологічний центр (meteo.gov.ua)",
      },
      attributionUrl: "https://www.meteo.gov.ua/",
    },
  };
}

/** Should we run another sync given the last run time? */
export function isSyncDue(lastRunIso: string | undefined, now = Date.now()): boolean {
  if (!lastRunIso) return true;
  return now - Date.parse(lastRunIso) >= SYNC_INTERVAL_MS;
}
