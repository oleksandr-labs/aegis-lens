import type { Locale } from "@aegis/i18n-config";

/**
 * Segmented sitemap definitions — one segment per template type.
 *
 * The monolithic `app/sitemap.ts` emits every route in a single urlset. As
 * volume grows, search engines crawl more efficiently when URLs are bucketed
 * by template (events, regions, comparisons, …) behind a sitemap index, each
 * bucket refreshing on its own cadence.
 *
 * This module is the typed contract: a registry of segments (id, label,
 * changefreq, priority band, the sub-sitemap path it is served at). The route
 * builders that materialize each segment live alongside (e.g. `sitemap-shard`
 * + the per-shard route handlers); this registry is what the index orchestrator
 * (`sitemap-index.ts`) iterates over.
 */

export type SitemapChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapSegment = {
  /** Stable id, also used as the `seg` query/url token. */
  id: string;
  /** en/uk human label for tooling + dashboards. */
  label: { en: string; uk: string };
  /** Absolute-from-root path the segment XML is served at. */
  path: string;
  /** Refresh cadence hint for this template family. */
  changeFrequency: SitemapChangeFreq;
  /** Default priority for entries in this segment (0..1). */
  priority: number;
  /** Whether this segment is locale-multiplied (hreflang alternates). */
  localized: boolean;
};

/**
 * Canonical segment registry. Ordered most→least important for crawl budget.
 * Paths intentionally mirror the existing sub-sitemap routes already present
 * under `app/` so the index can reference real, served endpoints.
 */
export const SITEMAP_SEGMENTS: readonly SitemapSegment[] = [
  {
    id: "core",
    label: { en: "Core & marketing", uk: "Основні та маркетингові" },
    path: "/sitemap.xml",
    changeFrequency: "weekly",
    priority: 0.9,
    localized: true,
  },
  {
    id: "events",
    label: { en: "Events", uk: "Події" },
    path: "/sitemap-events.xml",
    changeFrequency: "daily",
    priority: 0.5,
    localized: true,
  },
  {
    id: "cross-cuts",
    label: { en: "Cross-cut pivots", uk: "Перехресні зрізи" },
    path: "/sitemap-cross-cuts.xml",
    changeFrequency: "weekly",
    priority: 0.5,
    localized: true,
  },
  {
    id: "media",
    label: { en: "Media (video, podcast, case studies)", uk: "Медіа (відео, подкаст, кейси)" },
    path: "/sitemap-media.xml",
    changeFrequency: "weekly",
    priority: 0.55,
    localized: true,
  },
  {
    id: "news",
    label: { en: "Google News (48h)", uk: "Google News (48 год)" },
    path: "/news/sitemap.xml",
    changeFrequency: "hourly",
    priority: 0.9,
    localized: false,
  },
] as const;

/**
 * Proposed additional per-template segments (Sprint 2.61). These split the
 * current monolithic `core` urlset into finer template families so each can
 * refresh on its own cadence and the crawl-budget dashboard can attribute hits
 * per template. They become live once matching `sitemap-<id>.xml` routes + a
 * sitemap-index entry are wired (see handoff `sprint261_shared_CRAWL.txt`).
 */
export const PROPOSED_SEGMENTS: readonly SitemapSegment[] = [
  {
    id: "posts",
    label: { en: "Blog posts", uk: "Дописи блогу" },
    path: "/sitemap-posts.xml",
    changeFrequency: "weekly",
    priority: 0.6,
    localized: true,
  },
  {
    id: "reports",
    label: { en: "Reports & datasets", uk: "Звіти та набори даних" },
    path: "/sitemap-reports.xml",
    changeFrequency: "weekly",
    priority: 0.55,
    localized: true,
  },
  {
    id: "listings",
    label: { en: "Listings & directories", uk: "Каталоги та переліки" },
    path: "/sitemap-listings.xml",
    changeFrequency: "weekly",
    priority: 0.5,
    localized: true,
  },
] as const;

/** Every defined segment (live + proposed) — for robots `Sitemap:` enumeration. */
export const ALL_SEGMENTS: readonly SitemapSegment[] = [
  ...SITEMAP_SEGMENTS,
  ...PROPOSED_SEGMENTS,
];

/** Look up a segment by id (searches live + proposed). */
export function getSegment(id: string): SitemapSegment | undefined {
  return ALL_SEGMENTS.find((s) => s.id === id);
}

/** Locale-aware path for a localized segment (no-op for non-localized). */
export function segmentPath(seg: SitemapSegment, locale: Locale): string {
  if (!seg.localized || locale === "en") return seg.path;
  // Sub-sitemaps are global (one file enumerates all locales via hreflang),
  // so the served path does not vary by locale; locale only affects the
  // <loc>/<xhtml:link> entries inside. Returned as-is for symmetry.
  return seg.path;
}
