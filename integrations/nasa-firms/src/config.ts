/**
 * Typed config reader for NASA FIRMS.
 *
 * The FIRMS Area API requires a free MAP_KEY. It is read ONLY from
 * `process.env.FIRMS_API_KEY` — never hardcoded, never committed (see COMPLIANCE.md).
 * This module turns env vars into a typed `FIRMSConfig` for `FIRMSClient`, with a
 * demo/fallback mode so the adapter is exercisable without a real key.
 */

import type { FIRMSConfig, FIRMSSource } from "./client";

/** Env var name carrying the FIRMS MAP_KEY. Documented in COMPLIANCE.md §1. */
export const FIRMS_API_KEY_ENV = "FIRMS_API_KEY";

/** Default area: Ukraine bounding box "west,south,east,north". */
export const DEFAULT_FIRMS_AREA = "22.0,44.0,40.0,52.5";

export interface ReadConfigOptions {
  /** Override source (default VIIRS_SNPP_NRT). */
  source?: FIRMSSource;
  /** Override day range 1–10 (default 1). */
  dayRange?: number;
  /** Override area bbox string. */
  area?: string;
  /**
   * When true, return a config with a placeholder key instead of throwing if the
   * env var is missing — for demo/fixture runs that never hit the network.
   */
  allowDemoFallback?: boolean;
}

/** Sentinel key value used only in demo/fallback mode (never a real credential). */
export const DEMO_FIRMS_KEY = "DEMO_NO_KEY";

/** True when a real FIRMS key is present in the environment. */
export function hasFIRMSKey(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env[FIRMS_API_KEY_ENV] && env[FIRMS_API_KEY_ENV] !== DEMO_FIRMS_KEY;
}

/**
 * Read a typed FIRMSConfig from the environment.
 * Throws if `FIRMS_API_KEY` is missing and demo fallback is not allowed.
 */
export function readFIRMSConfig(
  options: ReadConfigOptions = {},
  env: NodeJS.ProcessEnv = process.env,
): FIRMSConfig {
  const rawKey = env[FIRMS_API_KEY_ENV];

  let apiKey: string;
  if (rawKey) {
    apiKey = rawKey;
  } else if (options.allowDemoFallback) {
    apiKey = DEMO_FIRMS_KEY;
  } else {
    throw new Error(
      `[nasa-firms] ${FIRMS_API_KEY_ENV} is not set. ` +
        `Request a free MAP_KEY at https://firms.modaps.eosdis.nasa.gov/api/map_key/ ` +
        `and provide it via the ${FIRMS_API_KEY_ENV} environment variable ` +
        `(or pass { allowDemoFallback: true } for offline/demo runs).`,
    );
  }

  const dayRange = options.dayRange ?? 1;
  if (dayRange < 1 || dayRange > 10) {
    throw new Error(`[nasa-firms] dayRange must be 1–10, got ${dayRange}`);
  }

  return {
    apiKey,
    source: options.source ?? "VIIRS_SNPP_NRT",
    dayRange,
    area: options.area ?? DEFAULT_FIRMS_AREA,
  };
}
