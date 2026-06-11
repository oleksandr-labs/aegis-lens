/**
 * Plugin SDK — Local dev mode with live reload against staging API.
 *
 * Dev mode proxies all plugin → host messages through a local dev server
 * on DEV_PROXY_PORT so developers can iterate against the staging API without
 * publishing to the marketplace.
 *
 * Dev-режим проксіює всі повідомлення плагін → хост через локальний сервер
 * на DEV_PROXY_PORT, дозволяючи ітерації проти staging API без публікації.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Default local proxy port for plugin development.
 *
 * Стандартний порт локального проксі для розробки плагінів.
 */
export const DEV_PROXY_PORT = 4242 as const;

/**
 * Dev mode note — English.
 * Inlined in plugin bundle to remind developers this is not a production build.
 */
export const DEV_MODE_NOTE_EN =
  "Aegis Lens Plugin SDK — DEV MODE. Messages are proxied through localhost. " +
  "Do not ship this build to the marketplace." as const;

/**
 * Dev mode note — Ukrainian.
 * Вбудовується в бандл плагіну для нагадування, що це не продакшн-збірка.
 */
export const DEV_MODE_NOTE_UK =
  "Aegis Lens Plugin SDK — РЕЖИМ РОЗРОБКИ. Повідомлення проксіюються через localhost. " +
  "Не публікуйте цей бандл у маркетплейсі." as const;

// ── DevModeConfig ─────────────────────────────────────────────────────────────

/**
 * Configuration object for the local dev mode proxy.
 *
 * Конфігурація локального проксі для dev-режиму.
 */
export interface DevModeConfig {
  /** Whether dev mode is active */
  enabled: boolean;
  /**
   * Staging API base URL used for all plugin API calls in dev mode.
   * Defaults to the official staging endpoint.
   *
   * Базовий URL staging API для всіх дзвінків плагіну в dev-режимі.
   */
  stagingApiUrl: string;
  /** Local proxy port (default: DEV_PROXY_PORT) */
  proxyPort: number;
  /**
   * Local proxy origin, e.g. "http://localhost:4242".
   * Derived from proxyPort.
   *
   * Локальний origin проксі, наприклад "http://localhost:4242".
   */
  proxyOrigin: string;
  /**
   * Whether to enable verbose message logging to the browser console.
   *
   * Чи логувати детальні повідомлення в консоль браузера.
   */
  verboseLogging: boolean;
  /**
   * Live reload WebSocket URL. The dev server pushes reload events here.
   *
   * URL WebSocket для live-reload. Дев-сервер надсилає події оновлення.
   */
  liveReloadUrl: string;
}

// ── isDevMode ─────────────────────────────────────────────────────────────────

/**
 * Detect whether the SDK is running in dev mode.
 *
 * Detection order:
 * 1. `window.__AEGIS_DEV_MODE__` flag (injected by the dev proxy)
 * 2. `AEGIS_DEV` environment variable (Node / build-time replacement)
 * 3. Hostname is localhost or 127.0.0.1
 *
 * Порядок визначення dev-режиму: прапорець window, env-змінна, hostname.
 */
export function isDevMode(): boolean {
  // Browser context
  if (typeof window !== "undefined") {
    if ((window as Record<string, unknown>).__AEGIS_DEV_MODE__ === true) return true;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
  }
  // Node / build-time context
  if (typeof process !== "undefined" && process.env?.AEGIS_DEV === "true") return true;
  return false;
}

// ── buildDevModeConfig ────────────────────────────────────────────────────────

/**
 * Build a DevModeConfig for the given staging API URL.
 * Uses DEV_PROXY_PORT as the default proxy port unless overridden.
 *
 * Формує DevModeConfig для заданого staging API URL.
 */
export function buildDevModeConfig(
  stagingApiUrl: string,
  options: { proxyPort?: number; verboseLogging?: boolean } = {},
): DevModeConfig {
  const proxyPort = options.proxyPort ?? DEV_PROXY_PORT;
  return {
    enabled: true,
    stagingApiUrl,
    proxyPort,
    proxyOrigin: `http://localhost:${proxyPort}`,
    verboseLogging: options.verboseLogging ?? true,
    liveReloadUrl: `ws://localhost:${proxyPort}/__aegis_hmr__`,
  };
}

// ── Default staging config ────────────────────────────────────────────────────

/**
 * Pre-built config targeting the official Aegis Lens staging environment.
 * Import directly for fast local plugin development.
 *
 * Готова конфігурація для офіційного staging-середовища Aegis Lens.
 */
export const DEFAULT_DEV_CONFIG: DevModeConfig = buildDevModeConfig(
  "https://staging.api.aegislens.com",
);
