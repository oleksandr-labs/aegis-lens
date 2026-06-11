/**
 * Per-Environment Config — typed configuration for all deployment environments.
 *
 * Defines four environments: development, preview, staging, production.
 * Secrets are never stored here — only structural config (URLs, feature flags, timeouts).
 *
 * Конфігурація для кожного середовища: жодних секретів, лише структурні параметри.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const ENV_CONFIG_NOTE_EN =
  "No secrets in this file. All sensitive values are injected at runtime via Doppler / ASCP. " +
  "This file defines structural config only (URLs, flags, timeouts).";

export const ENV_CONFIG_NOTE_UK =
  "Жодних секретів у цьому файлі. Усі чутливі значення — через Doppler / ASCP. " +
  "Тут лише структурна конфігурація (URL, прапори, таймаути).";

// ── Environment ───────────────────────────────────────────────────────────────

export type Environment = "development" | "preview" | "staging" | "production";

// ── EnvironmentConfig ─────────────────────────────────────────────────────────

export interface EnvironmentConfig {
  env: Environment;
  /** Public base URL of the web application */
  appUrl: string;
  /** API base URL */
  apiUrl: string;
  /** Whether debug logging is enabled */
  debugLogging: boolean;
  /** Whether feature flags default to enabled (for early testing) */
  featureFlagsDefaultOn: boolean;
  /** Rate limit multiplier vs production baseline (1.0 = same as prod) */
  rateLimitMultiplier: number;
  /** Whether Stripe is in test mode */
  stripeTestMode: boolean;
  /** Whether emails are sent to real recipients */
  realEmailDelivery: boolean;
  /** Maximum API request timeout in milliseconds */
  apiTimeoutMs: number;
  /** Whether error details are exposed in API responses */
  exposeErrorDetails: boolean;
  /** Database connection pool size */
  dbPoolSize: number;
}

// ── ENV_CONFIGS ───────────────────────────────────────────────────────────────

/**
 * Configuration for all four deployment environments.
 *
 * Конфігурація всіх чотирьох середовищ розгортання.
 */
export const ENV_CONFIGS: Record<Environment, EnvironmentConfig> = {
  development: {
    env: "development",
    appUrl: "http://localhost:3000",
    apiUrl: "http://localhost:3000/api/v1",
    debugLogging: true,
    featureFlagsDefaultOn: true,
    rateLimitMultiplier: 100, // very permissive for local dev
    stripeTestMode: true,
    realEmailDelivery: false,
    apiTimeoutMs: 30_000,
    exposeErrorDetails: true,
    dbPoolSize: 5,
  },
  preview: {
    env: "preview",
    appUrl: "https://pr-{PR_NUMBER}-aegis.vercel.app",
    apiUrl: "https://pr-{PR_NUMBER}-aegis.vercel.app/api/v1",
    debugLogging: true,
    featureFlagsDefaultOn: true,
    rateLimitMultiplier: 10,
    stripeTestMode: true,
    realEmailDelivery: false,
    apiTimeoutMs: 15_000,
    exposeErrorDetails: true,
    dbPoolSize: 3,
  },
  staging: {
    env: "staging",
    appUrl: "https://staging.aegis-lens.uk",
    apiUrl: "https://staging.aegis-lens.uk/api/v1",
    debugLogging: true,
    featureFlagsDefaultOn: false,
    rateLimitMultiplier: 5,
    stripeTestMode: true,
    realEmailDelivery: true,
    apiTimeoutMs: 10_000,
    exposeErrorDetails: false,
    dbPoolSize: 5,
  },
  production: {
    env: "production",
    appUrl: "https://aegis-lens.uk",
    apiUrl: "https://aegis-lens.uk/api/v1",
    debugLogging: false,
    featureFlagsDefaultOn: false,
    rateLimitMultiplier: 1.0,
    stripeTestMode: false,
    realEmailDelivery: true,
    apiTimeoutMs: 8_000,
    exposeErrorDetails: false,
    dbPoolSize: 20,
  },
};
