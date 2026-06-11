export {
  PostHogClient,
  postHogClient,
} from './client';
export type { PostHogConfig, PostHogEvent } from './client';

// ─── Convenience helpers ──────────────────────────────────────────────────────

import { postHogClient } from './client';

/**
 * Tracks a page view event.
 * @param url — the page URL (e.g. req.nextUrl.pathname)
 * @param distinctId — anonymous or authenticated user ID
 * @param extra — additional properties (referrer, utm params, etc.)
 */
export function trackPageView(
  url: string,
  distinctId: string,
  extra?: Record<string, unknown>,
): void {
  postHogClient.capture({
    event: '$pageview',
    distinctId,
    properties: { $current_url: url, ...extra },
  });
}

/**
 * Tracks usage of a platform feature (e.g. "map:layer:toggle", "alert:create").
 * @param feature — dot-namespaced feature identifier
 * @param distinctId — user or anonymous session ID
 * @param properties — optional context (e.g. { layerType: 'adsb', value: true })
 */
export function trackFeatureUsage(
  feature: string,
  distinctId: string,
  properties?: Record<string, unknown>,
): void {
  postHogClient.capture({
    event: `feature:${feature}`,
    distinctId,
    properties: properties ?? {},
  });
}
