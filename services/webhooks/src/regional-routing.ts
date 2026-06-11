/**
 * Per-region webhook URL routing for data residency and compliance.
 *
 * Aegis Lens delivers webhooks from the closest regional endpoint to ensure
 * payloads containing event data do not cross regulated boundaries (GDPR, etc.).
 *
 * Sprint 2: regional endpoints will be real Hetzner / CloudFlare regional URLs.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type WebhookRegion = "eu" | "us" | "ua" | "global";

// ── Regional base URLs ────────────────────────────────────────────────────────

/**
 * Base webhook delivery endpoint per region.
 * These are the outbound IP/hostname pools used for signing + delivery.
 *
 * Sprint 2: replace placeholders with real regional dispatcher hosts.
 */
export const REGIONAL_ENDPOINTS: Record<WebhookRegion, string> = {
  eu:     "https://webhooks-eu.aegislens.io",
  us:     "https://webhooks-us.aegislens.io",
  ua:     "https://webhooks-ua.aegislens.io",
  global: "https://webhooks.aegislens.io",
};

// ── Country → Region mapping ──────────────────────────────────────────────────

/**
 * ISO-3166-1 alpha-2 country code → webhook region.
 *
 * Rationale:
 *  - EU member states → "eu" (GDPR jurisdiction)
 *  - Ukraine + neighbouring conflict-zone states → "ua" (data sovereignty)
 *  - US + Canada → "us"
 *  - Everything else → "global"
 */
export const COMPLIANCE_REGION_MAP: Record<string, WebhookRegion> = {
  // Ukraine and immediate neighbourhood
  UA: "ua",
  BY: "ua",
  MD: "ua",

  // European Union member states (GDPR)
  AT: "eu", BE: "eu", BG: "eu", HR: "eu", CY: "eu",
  CZ: "eu", DK: "eu", EE: "eu", FI: "eu", FR: "eu",
  DE: "eu", GR: "eu", HU: "eu", IE: "eu", IT: "eu",
  LV: "eu", LT: "eu", LU: "eu", MT: "eu", NL: "eu",
  PL: "eu", PT: "eu", RO: "eu", SK: "eu", SI: "eu",
  ES: "eu", SE: "eu",

  // EEA non-EU (treated as EU for data residency)
  IS: "eu", LI: "eu", NO: "eu",

  // UK (post-Brexit adequacy decision)
  GB: "eu",

  // North America
  US: "us",
  CA: "us",

  // Russia / Belarus — excluded from UA region, routed to global with monitoring
  RU: "global",
};

// ── Core functions ─────────────────────────────────────────────────────────────

/**
 * Resolve the appropriate webhook delivery region for an organisation's country.
 *
 * @param orgCountry — ISO-3166-1 alpha-2 country code (e.g. "DE", "UA", "US")
 * @returns the applicable WebhookRegion
 */
export function getWebhookRegion(orgCountry: string): WebhookRegion {
  const upper = orgCountry.toUpperCase().trim();
  return COMPLIANCE_REGION_MAP[upper] ?? "global";
}

/**
 * Build the full regional webhook endpoint URL for a delivery path.
 *
 * @param orgCountry — ISO-3166-1 alpha-2 country code
 * @param path       — path component, e.g. "/deliver/evt_abc"
 *
 * @example
 *   buildRegionalEndpointUrl("DE", "/deliver/evt_abc")
 *   // → "https://webhooks-eu.aegislens.io/deliver/evt_abc"
 */
export function buildRegionalEndpointUrl(orgCountry: string, path: string): string {
  const region = getWebhookRegion(orgCountry);
  const base = REGIONAL_ENDPOINTS[region];
  const normPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normPath}`;
}
