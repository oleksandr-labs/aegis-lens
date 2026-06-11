import 'server-only';

const PLAUSIBLE_BASE_URL =
  process.env.PLAUSIBLE_BASE_URL || 'https://plausible.io';

const PLAUSIBLE_DOMAIN = process.env.PLAUSIBLE_DOMAIN || '';
const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY || '';

/** Returns true when server-side Plausible event tracking is configured. */
export function isPlausibleConfigured(): boolean {
  return PLAUSIBLE_DOMAIN.length > 0;
}

interface PlausibleEventPayload {
  name: string;
  url: string;
  domain: string;
  referrer?: string;
  props?: Record<string, string | number | boolean>;
}

/**
 * Sends a server-side event to Plausible Analytics.
 * No-op when PLAUSIBLE_DOMAIN is not configured.
 *
 * GDPR: Plausible stores no PII; no cookies required.
 * EU hosting: available at https://plausible.io/data-policy
 */
export async function trackPlausibleEvent(
  payload: PlausibleEventPayload,
): Promise<void> {
  if (!isPlausibleConfigured()) return;

  try {
    await fetch(`${PLAUSIBLE_BASE_URL}/api/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AegisLens/1.0 (server-side)',
        'X-Forwarded-For': '127.0.0.1', // anonymised; real IP must NOT be forwarded
      },
      body: JSON.stringify({
        name: payload.name,
        url: payload.url,
        domain: PLAUSIBLE_DOMAIN,
        referrer: payload.referrer ?? '',
        props: payload.props ?? {},
      }),
    });
  } catch {
    // Analytics must never break the application
  }
}

/**
 * Tracks a page view from a server component or API route.
 */
export async function trackPageView(
  url: string,
  referrer?: string,
): Promise<void> {
  return trackPlausibleEvent({ name: 'pageview', url, domain: PLAUSIBLE_DOMAIN, referrer });
}

/**
 * Tracks a custom event (e.g. "Alert Created", "Map Layer Toggled").
 * Props values must be strings, numbers, or booleans (Plausible constraint).
 */
export async function trackEvent(
  name: string,
  url: string,
  props?: Record<string, string | number | boolean>,
): Promise<void> {
  return trackPlausibleEvent({ name, url, domain: PLAUSIBLE_DOMAIN, props });
}

// ─── Stats API (read) ─────────────────────────────────────────────────────────

/**
 * Fetches aggregate stats from the Plausible Stats API.
 * Requires PLAUSIBLE_API_KEY (Stats API token from site settings).
 */
export async function fetchPlausibleStats(params: {
  period?: '12mo' | '6mo' | 'month' | '30d' | '7d' | 'day' | 'custom';
  metrics?: string[];
  filters?: string;
}): Promise<Record<string, unknown> | null> {
  if (!PLAUSIBLE_API_KEY || !PLAUSIBLE_DOMAIN) return null;

  const url = new URL(`${PLAUSIBLE_BASE_URL}/api/v1/stats/aggregate`);
  url.searchParams.set('site_id', PLAUSIBLE_DOMAIN);
  url.searchParams.set('period', params.period ?? '30d');
  url.searchParams.set(
    'metrics',
    (params.metrics ?? ['visitors', 'pageviews', 'bounce_rate', 'visit_duration']).join(','),
  );
  if (params.filters) url.searchParams.set('filters', params.filters);

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${PLAUSIBLE_API_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<Record<string, unknown>>;
  } catch {
    return null;
  }
}
