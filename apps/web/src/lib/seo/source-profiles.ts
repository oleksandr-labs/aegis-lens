/**
 * SEO helpers for per-source public profile pages.
 * Sprint 2.72 — source-profiles-seo deliverable.
 *
 * Each OSINT source we monitor gets a dedicated /sources/<slug> page.
 * These types + helpers drive metadata, JSON-LD, robots policy, and
 * the transparency artefacts (methodology, comparable sources, sample events).
 */

// ---------------------------------------------------------------------------
// Core content interface
// ---------------------------------------------------------------------------

/** Full SEO + content payload for a single source profile page. */
export interface SourceProfileContent {
  /** URL-safe identifier used in /sources/<slug>. */
  slug: string;
  /** Human-readable source name. */
  name: string;
  /** Bilingual short description (meta + intro paragraph). */
  description: { en: string; uk: string };
  /** Broad taxonomy of the source organisation. */
  type: 'government' | 'ngo' | 'media' | 'osint' | 'academic' | 'international';
  /** ISO 3166-1 alpha-2 country codes or broader geographic tags (e.g. "UA", "EU"). */
  region: string[];
  /** BCP-47 language codes of content published by this source (e.g. ["uk", "en"]). */
  languages: string[];
  /**
   * Typical update cadence of the source in minutes.
   * Used to calculate freshness signals.
   */
  freshnessMinutes: number;
  /** Reliability score 0..1 based on editorial cross-check methodology. */
  reliabilityScore: number;
  /** Total events from this source indexed by Aegis Lens to date. */
  totalEventsContributed: number;
  /** ISO 8601 datetime of the most recently ingested item. */
  lastSeen: string;
  /** Bilingual "How we use this source" methodology snippet. */
  methodology: { en: string; uk: string };
  /** Slugs of structurally similar sources shown in the comparable-sources block. */
  comparableSources: string[];
  /** Robots directive for this source's profile page. */
  robotsPolicy: 'index' | 'noindex';
  /**
   * Sensitive sources (e.g. human-intelligence channels) whose profile pages
   * should not be indexed to protect methods.
   */
  sensitive: boolean;
}

// ---------------------------------------------------------------------------
// Robots policy
// ---------------------------------------------------------------------------

/**
 * Default robots policy applied when source.robotsPolicy is not overridden.
 * Sensitive sources are always noindex — set SOURCE_ROBOTS_POLICY per record.
 */
export const SOURCE_ROBOTS_POLICY: Record<'default' | 'gated', 'index' | 'noindex'> = {
  default: 'index',
  gated: 'noindex',
};

/** Derive the effective robots policy for a profile, respecting `sensitive`. */
export function effectiveRobotsPolicy(profile: Pick<SourceProfileContent, 'robotsPolicy' | 'sensitive'>): 'index' | 'noindex' {
  return profile.sensitive ? SOURCE_ROBOTS_POLICY.gated : profile.robotsPolicy;
}

// ---------------------------------------------------------------------------
// JSON-LD builder
// ---------------------------------------------------------------------------

/**
 * Build a Schema.org JSON-LD object for a source profile page.
 * - Non-academic sources → `Organization` schema.
 * - Academic sources → `WebSite` schema (universities / research institutes).
 */
export function buildSourceProfileJsonLd(
  profile: SourceProfileContent,
): Record<string, unknown> {
  const shared = {
    '@context': 'https://schema.org',
    name: profile.name,
    description: profile.description.en,
    inLanguage: profile.languages,
    areaServed: profile.region,
  };

  if (profile.type === 'academic') {
    return {
      ...shared,
      '@type': 'WebSite',
      url: `https://aegislens.uk/sources/${profile.slug}`,
    };
  }

  return {
    ...shared,
    '@type': 'Organization',
    url: `https://aegislens.uk/sources/${profile.slug}`,
    // Aggregate rating proxy — derived from reliabilityScore (0..1 → 0..5)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (profile.reliabilityScore * 5).toFixed(1),
      bestRating: '5',
      worstRating: '0',
      ratingCount: profile.totalEventsContributed,
    },
  };
}

// ---------------------------------------------------------------------------
// Per-locale variant
// ---------------------------------------------------------------------------

/**
 * Locale-specific override for a source description.
 * Human-reviewed translations populate `reviewedByNative = true`.
 */
export interface PER_LOCALE_SOURCE_VARIANT {
  sourceSlug: string;
  locale: 'en' | 'uk';
  /** Locale-specific description text. */
  description: string;
  /** Whether a native speaker reviewed this translation. */
  reviewedByNative: boolean;
}

// ---------------------------------------------------------------------------
// User-facing links
// ---------------------------------------------------------------------------

/**
 * "Report this source" CTA shown at the bottom of each source profile page.
 * Href is relative and uses the source slug at runtime.
 */
export const REPORT_SOURCE_LINK: { text: { en: string; uk: string }; href: string } = {
  text: {
    en: 'Report an issue with this source',
    uk: 'Повідомити про проблему з цим джерелом',
  },
  href: '/sources/<slug>/report',
};

/**
 * Canonical link to the public methodology page anchored to the sources section.
 */
export const PUBLIC_METHODOLOGY_LINK = '/methodology#sources';

// ---------------------------------------------------------------------------
// Comparable sources block
// ---------------------------------------------------------------------------

/**
 * Internal-linking block showing structurally similar sources on a profile page.
 * Each comparable entry includes a short human-readable reason for the comparison.
 */
export interface COMPARABLE_SOURCES_BLOCK {
  /** Slug of the source whose profile page this block appears on. */
  currentSlug: string;
  comparables: Array<{
    slug: string;
    name: string;
    /** One-sentence reason why these sources are comparable (e.g. same region, same type). */
    reason: string;
  }>;
}

// ---------------------------------------------------------------------------
// Sample events schema
// ---------------------------------------------------------------------------

/**
 * A small curated list of representative events from a source, embedded as
 * structured data and rendered as a linked preview list on the profile page.
 */
export interface SAMPLE_EVENTS_SCHEMA {
  sourceSlug: string;
  events: Array<{
    /** Aegis Lens internal event ID. */
    id: string;
    /** Human-readable event title (English). */
    title: string;
    /** ISO 8601 date string. */
    date: string;
    /** Canonical URL to the event detail page. */
    url: string;
  }>;
}
