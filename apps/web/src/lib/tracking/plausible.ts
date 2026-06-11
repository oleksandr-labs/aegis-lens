import "server-only";

/**
 * Typed Plausible Analytics integration.
 *
 * Server-only: the API secret must never reach the browser.
 * Use the Plausible script tag (public) for client-side pageviews;
 * use this module only for server-side goal / conversion events.
 *
 * Docs: https://plausible.io/docs/events-api
 */

import type { TrackingEventName } from "./types";

// ── Config ────────────────────────────────────────────────────────────────

export interface PlausibleConfig {
  domain: string;
  apiSecret?: string;
  selfHosted?: boolean;
}

// ── Goal name registry ────────────────────────────────────────────────────

/**
 * Plausible goal names that map 1-to-1 with our `TrackingEventName` values.
 *
 * Using `satisfies` to keep the union check without losing the literal types.
 */
export const PLAUSIBLE_GOALS = {
  page_view:                 "page_view",
  map_workspace_activation:  "map_workspace_activation",
  filter_created:            "filter_created",
  filter_saved:              "filter_saved",
  alert_created:             "alert_created",
  embed_installed:           "embed_installed",
  api_key_created:           "api_key_created",
  api_first_call:            "api_first_call",
  trial_to_paid:             "trial_to_paid",
  pro_to_enterprise:         "pro_to_enterprise",
} as const satisfies Record<TrackingEventName, string>;

// ── API endpoint resolution ───────────────────────────────────────────────

function resolveApiUrl(config: PlausibleConfig): string {
  if (config.selfHosted) {
    // Self-hosted domains expose the same /api/event path
    const base = config.domain.startsWith("http")
      ? config.domain
      : `https://${config.domain}`;
    return `${base}/api/event`;
  }
  return "https://plausible.io/api/event";
}

// ── sendPlausibleEvent ────────────────────────────────────────────────────

/**
 * Send a custom goal event to Plausible via the Events API.
 *
 * @param config - Plausible configuration (domain, optional secret, self-hosted flag).
 * @param event  - Goal name (use `PLAUSIBLE_GOALS` constants for type safety).
 * @param props  - Custom properties attached to the event.
 *
 * Silently ignores errors in production so tracking never blocks the request.
 */
export async function sendPlausibleEvent(
  config: PlausibleConfig,
  event: string,
  props: Record<string, string | number>,
): Promise<void> {
  const url = resolveApiUrl(config);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent":   "aegislens-server/1.0",
  };

  if (config.apiSecret) {
    headers["Authorization"] = `Bearer ${config.apiSecret}`;
  }

  const body = JSON.stringify({
    name:   event,
    url:    `https://${config.domain}`,
    domain: config.domain,
    props,
  });

  try {
    const res = await fetch(url, { method: "POST", headers, body });

    if (!res.ok && process.env.NODE_ENV !== "production") {
      const text = await res.text();
      console.warn(
        `[plausible] event "${event}" rejected (${res.status}): ${text}`,
      );
    }
  } catch (err) {
    // Network errors must never surface to callers
    if (process.env.NODE_ENV !== "production") {
      console.error("[plausible] sendPlausibleEvent failed:", err);
    }
  }
}
