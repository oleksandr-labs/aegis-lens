/**
 * SEO helpers for per-city coverage surfaces (Local SEO).
 * Sprint 2.72 — local-seo deliverable.
 *
 * City pages already have Place + containedInPlace schema (Sprint 1.7).
 * This module adds: OG images, news widget config, shelter/evac data,
 * press partnerships, hreflang, map-embed config, breadcrumbs, and
 * the min-event guard that prevents thin pages.
 */

// ---------------------------------------------------------------------------
// Minimum event threshold — prevents thin city pages
// ---------------------------------------------------------------------------

/**
 * Minimum number of events required before a city-level page is generated.
 * Cities below this threshold are silently skipped during static-path generation.
 */
export const MIN_EVENT_THRESHOLD = 100;

// ---------------------------------------------------------------------------
// OG image — live map snapshot
// ---------------------------------------------------------------------------

/**
 * Configuration for city-specific Open Graph images generated from a
 * live map snapshot API (server-side rendered at build time or on-demand).
 */
export const CITY_OG_IMAGE_CONFIG: {
  strategy: 'live-map-snapshot';
  snapshotApiRoute: string;
  width: number;
  height: number;
  refreshIntervalMinutes: number;
} = {
  strategy: 'live-map-snapshot',
  snapshotApiRoute: '/api/og/city-snapshot',
  width: 1200,
  height: 630,
  refreshIntervalMinutes: 60,
};

// ---------------------------------------------------------------------------
// City news widget
// ---------------------------------------------------------------------------

/**
 * Configuration for the "latest verified events" widget shown on city pages.
 * `verifiedOnly: true` is a hard constraint — never relax this for city pages.
 */
export interface CityNewsWidget {
  citySlug: string;
  /** ISO 3166-2:UA oblast code, e.g. "UA-30" for Kyiv. */
  oblastCode: string;
  /** Maximum number of events to display in the widget. */
  maxEvents: number;
  /** Only show events that have been human or algorithmic cross-verified. */
  verifiedOnly: true;
  /** Client-side polling interval in seconds (0 = no polling; SSE preferred). */
  refreshSeconds: number;
}

// ---------------------------------------------------------------------------
// Shelter / evacuation info
// ---------------------------------------------------------------------------

/**
 * Per-city shelter and evacuation data.
 * Fields are optional because coverage varies significantly by city.
 * When `hasData` is false, the UI should hide the section rather than show nulls.
 */
export interface SHELTER_EVAC_INFO {
  citySlug: string;
  /** Whether any shelter/evac data is available for this city. */
  hasData: boolean;
  /** Number of registered civil-defence shelters within the city boundary. */
  shelterCount?: number;
  /** Human-readable descriptions of primary evacuation routes. */
  evacuationRoutes?: string[];
  /** URL of the official municipal or OVA source for this data. */
  officialSource?: string;
  /** ISO 8601 datetime this data was last verified against the official source. */
  lastUpdated?: string;
}

// ---------------------------------------------------------------------------
// Local press partnerships
// ---------------------------------------------------------------------------

/**
 * Represents a content partnership with a local press organisation for a city.
 * Used to surface region-specific reporting and for cross-linking.
 */
export interface LOCAL_PRESS_PARTNERSHIP {
  citySlug: string;
  /** Full name of the press organisation. */
  pressOrg: string;
  /** Absolute URL to the partner's logo (served from Aegis CDN). */
  logoUrl: string;
  /** Optional API or feed endpoint for pulling partner content. */
  apiEndpoint?: string;
  /** Integration method: RSS feed, custom API, or manually curated. */
  feedType: 'rss' | 'api' | 'manual';
}

// ---------------------------------------------------------------------------
// Hreflang
// ---------------------------------------------------------------------------

/**
 * Canonical hreflang configuration for city pages.
 * Handles the /uk/<city> ↔ /en/<city> pair.
 * `<city>` is replaced at render time with the actual city slug.
 */
export const HREFLANG_CITY_CONFIG: {
  pattern: '/uk/<city>';
  enEquivalent: '/en/<city>';
  xDefault: 'en';
} = {
  pattern: '/uk/<city>',
  enEquivalent: '/en/<city>',
  xDefault: 'en',
};

// ---------------------------------------------------------------------------
// Google Business Profile
// ---------------------------------------------------------------------------

/**
 * Aegis Lens is a software platform, not a local business.
 * No Google Business Profile is created at the national/city level.
 * If physical offices are opened in future, create one profile per office.
 *
 * // we are not a local business; future: one per physical office
 */
export const NO_GOOGLE_BUSINESS_PROFILE: true = true;

// ---------------------------------------------------------------------------
// Map embed per city page
// ---------------------------------------------------------------------------

/**
 * Deep-link configuration for the embedded map widget on city pages.
 * `<citySlug>` is replaced with the actual city slug at render time.
 * `autoOpenLayers` lists the layer IDs that should be toggled on by default.
 */
export const MAP_EMBED_CITY_CONFIG: {
  deepLinkPattern: '/map?focus=<citySlug>&zoom=12';
  autoOpenLayers: string[];
} = {
  deepLinkPattern: '/map?focus=<citySlug>&zoom=12',
  autoOpenLayers: ['air-alerts', 'events-heatmap', 'shelters'],
};

// ---------------------------------------------------------------------------
// City breadcrumbs — internal link: city → region → country
// ---------------------------------------------------------------------------

/** Input chain for building a city-level BreadcrumbList. */
export type CITY_BREADCRUMB_CHAIN = {
  /** City name (display string). */
  city: string;
  /** Region / oblast name (display string). */
  region: string;
  /** Country name (display string). */
  country: string;
};

/**
 * Build a Schema.org BreadcrumbList JSON-LD for the city → region → country chain.
 * Slugs are derived by lowercasing and replacing spaces with hyphens.
 */
export function buildCityBreadcrumbs(chain: CITY_BREADCRUMB_CHAIN): Record<string, unknown> {
  const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: chain.country,
        item: `/en/${toSlug(chain.country)}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: chain.region,
        item: `/en/${toSlug(chain.country)}/${toSlug(chain.region)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: chain.city,
        item: `/en/${toSlug(chain.country)}/${toSlug(chain.region)}/${toSlug(chain.city)}`,
      },
    ],
  };
}
