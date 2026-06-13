/**
 * Programmatic SEO quality gates — Sprint 2.73.
 *
 * Closes TODO/seo/TODO_programmatic_seo.md open tasks:
 *  - Minimum unique content threshold per template (no thin pages)
 *  - Per-template `noindex` if data below threshold
 *  - Dynamic last-updated timestamp
 *  - Internal linking from each page to ≥5 related pages
 *  - Sitemap segmentation per template
 *  - Crawl budget monitoring
 *
 * Complements the existing thin-guard.ts (field + word count) and
 * noindex-policy.ts. This module adds event-count thresholds and the
 * richer per-template sitemap registry.
 *
 * Pure — no network, no DB.
 */

import { SITEMAP_SEGMENTS, type SitemapSegment } from "./sitemap-segments";

// ── Template names ─────────────────────────────────────────────────────────────

export type TemplateName =
  | "regions"
  | "country"
  | "city"
  | "safety"
  | "travel"
  | "topics"
  | "conflicts"
  | "equipment"
  | "units"
  | "use-cases"
  | "vs"
  | "alternatives"
  | "glossary"
  | "sources"
  | "events";

// ── Content threshold registry ─────────────────────────────────────────────────

/**
 * Per-template content thresholds.
 *
 * `minWordCount`  — minimum body text words the page must carry.
 * `minEvents`     — minimum related events the page must reference.
 *                   Undefined = not applicable for this template type.
 * `minUniqueFields` — minimum non-boilerplate structured-data fields.
 */
export interface ContentThreshold {
  minWordCount: number;
  minEvents?: number;
  minUniqueFields: number;
}

export const CONTENT_THRESHOLD_BY_TEMPLATE: Record<TemplateName, ContentThreshold> = {
  regions: { minWordCount: 200, minEvents: 5, minUniqueFields: 4 },
  country: { minWordCount: 250, minEvents: 8, minUniqueFields: 5 },
  city: { minWordCount: 180, minEvents: 3, minUniqueFields: 3 },
  safety: { minWordCount: 200, minEvents: 3, minUniqueFields: 4 },
  travel: { minWordCount: 180, minEvents: 2, minUniqueFields: 3 },
  topics: { minWordCount: 300, minEvents: 5, minUniqueFields: 4 },
  conflicts: { minWordCount: 350, minEvents: 10, minUniqueFields: 6 },
  equipment: { minWordCount: 300, minEvents: 3, minUniqueFields: 5 },
  units: { minWordCount: 200, minUniqueFields: 4 },
  "use-cases": { minWordCount: 250, minUniqueFields: 4 },
  vs: { minWordCount: 300, minUniqueFields: 5 },
  alternatives: { minWordCount: 250, minUniqueFields: 5 },
  glossary: { minWordCount: 150, minUniqueFields: 2 },
  sources: { minWordCount: 150, minUniqueFields: 3 },
  events: { minWordCount: 120, minUniqueFields: 4 },
};

// ── Template data shape ────────────────────────────────────────────────────────

/**
 * Minimal data shape passed into quality-gate functions.
 * Callers project their own richer objects into this.
 */
export interface TemplateData {
  /** Template this page uses — must be one of TemplateName. */
  template: TemplateName;
  /** Number of related events surfaced on this page. */
  eventCount?: number;
  /** Structured fields that are non-empty on this page (keys present = filled). */
  uniqueFields: string[];
  /** Raw body / main content text used for word counting. */
  bodyText: string;
  /** ISO 8601 timestamps for sorting / last-updated derivation. */
  contentUpdatedAt?: string;
  /** Most recent event ISO timestamp on this page (may be undefined). */
  latestEventAt?: string;
  /** Data publication / record update ISO timestamp. */
  dataUpdatedAt?: string;
}

// ── Word count helper ──────────────────────────────────────────────────────────

function wordCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/u).filter(Boolean).length;
}

// ── Threshold evaluation ───────────────────────────────────────────────────────

export interface ThresholdResult {
  ok: boolean;
  template: TemplateName;
  wordCount: number;
  eventCount: number;
  uniqueFieldCount: number;
  threshold: ContentThreshold;
  /** Human-readable list of failed checks. Empty when ok. */
  failures: string[];
}

/** Evaluate a page's data against its template threshold. */
export function evaluateThreshold(data: TemplateData): ThresholdResult {
  const threshold = CONTENT_THRESHOLD_BY_TEMPLATE[data.template];
  const words = wordCount(data.bodyText);
  const eventCount = data.eventCount ?? 0;
  const uniqueFieldCount = data.uniqueFields.length;
  const failures: string[] = [];

  if (words < threshold.minWordCount) {
    failures.push(
      `word count ${words} < required ${threshold.minWordCount}`,
    );
  }
  if (
    threshold.minEvents !== undefined &&
    eventCount < threshold.minEvents
  ) {
    failures.push(
      `event count ${eventCount} < required ${threshold.minEvents}`,
    );
  }
  if (uniqueFieldCount < threshold.minUniqueFields) {
    failures.push(
      `unique fields ${uniqueFieldCount} < required ${threshold.minUniqueFields}`,
    );
  }

  return {
    ok: failures.length === 0,
    template: data.template,
    wordCount: words,
    eventCount,
    uniqueFieldCount,
    threshold,
    failures,
  };
}

/**
 * Returns `true` when the page should receive a `noindex` robots directive
 * because its data falls below the template's content threshold.
 *
 * This is an additional gate layered on top of the existing `shouldNoindex`
 * in `dedup/noindex-policy.ts` which checks route class + uniqueness.
 * Call both; noindex if either fires.
 */
export function shouldNoindex(template: TemplateName, data: TemplateData): boolean {
  return !evaluateThreshold(data).ok;
}

// ── Dynamic last-updated ───────────────────────────────────────────────────────

/**
 * Derive the most relevant "last updated" date for a programmatic page.
 *
 * Priority:
 *  1. Most recent event timestamp (if present and more recent than data update)
 *  2. Data record update timestamp
 *  3. Content editorial update timestamp
 *  4. Current date (fallback — means the date is unknown, caller should handle)
 */
export function getDynamicLastUpdated(data: TemplateData): Date {
  const candidates: Date[] = [];

  if (data.latestEventAt) {
    const d = new Date(data.latestEventAt);
    if (!Number.isNaN(d.getTime())) candidates.push(d);
  }
  if (data.dataUpdatedAt) {
    const d = new Date(data.dataUpdatedAt);
    if (!Number.isNaN(d.getTime())) candidates.push(d);
  }
  if (data.contentUpdatedAt) {
    const d = new Date(data.contentUpdatedAt);
    if (!Number.isNaN(d.getTime())) candidates.push(d);
  }

  if (candidates.length === 0) return new Date();

  return candidates.reduce((latest, d) => (d > latest ? d : latest));
}

// ── Internal linking ──────────────────────────────────────────────────────────

/**
 * A resolved internal link to be rendered on a page.
 */
export interface InternalLink {
  url: string;
  /** Anchor text (English — caller localises). */
  anchor: string;
  /** Semantic relation type for crawl-shape hints. */
  relation: "geo-nearby" | "same-conflict" | "related-term" | "parent-hub" | "related";
}

/** Minimal page descriptor used by the page index. */
export interface PageContext {
  url: string;
  template: TemplateName;
  /** Geographic coordinates (lat/lng) — for geo-proximity ranking. */
  coords?: { lat: number; lng: number };
  /** IDs of conflict slugs this page is associated with. */
  conflictSlugs?: string[];
  /** Glossary term slugs this page mentions. */
  relatedTerms?: string[];
  /** Human-readable title used as default anchor text. */
  title: string;
  locale: string;
}

/** Flat index of all pages — keyed by URL. */
export type PageIndex = Map<string, PageContext>;

/**
 * Haversine distance in km between two lat/lng points.
 * Used for geo-proximity sorting on region/city/safety templates.
 */
function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinLat * sinLat +
          Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            sinLng * sinLng,
      ),
    );
  return R * c;
}

/**
 * Build a ranked list of ≥`count` internal links for a given page, using:
 *  - geo-nearby  (region/city/safety/travel templates → same-locale neighbors by coords)
 *  - same-conflict (equipment/topics/conflicts → related conflict pages)
 *  - related-term (glossary → pages that mention the same terms)
 *  - fallback     (other templates → same-template pages)
 *
 * Always returns same-locale links only (locale-preserving).
 * Returns at most `count` entries, but may return fewer if the index is sparse.
 */
export function buildInternalLinks(
  page: PageContext,
  allPages: PageIndex,
  count = 5,
): InternalLink[] {
  const links: InternalLink[] = [];
  const seen = new Set<string>([page.url]);
  const locale = page.locale;

  const GEO_TEMPLATES: TemplateName[] = ["regions", "country", "city", "safety", "travel"];
  const CONFLICT_TEMPLATES: TemplateName[] = ["equipment", "topics", "conflicts", "units"];
  const TERM_TEMPLATES: TemplateName[] = ["glossary"];

  if (GEO_TEMPLATES.includes(page.template) && page.coords) {
    // Geo-nearby: sort same-template, same-locale pages by haversine distance.
    const geoNeighbors: Array<{ page: PageContext; dist: number }> = [];
    for (const [, candidate] of allPages) {
      if (candidate.locale !== locale) continue;
      if (candidate.url === page.url) continue;
      if (!GEO_TEMPLATES.includes(candidate.template)) continue;
      if (!candidate.coords) continue;
      geoNeighbors.push({
        page: candidate,
        dist: haversineKm(page.coords, candidate.coords),
      });
    }
    geoNeighbors.sort((a, b) => a.dist - b.dist);
    for (const { page: n } of geoNeighbors) {
      if (links.length >= count) break;
      if (seen.has(n.url)) continue;
      seen.add(n.url);
      links.push({ url: n.url, anchor: n.title, relation: "geo-nearby" });
    }
  }

  if (CONFLICT_TEMPLATES.includes(page.template) && page.conflictSlugs?.length) {
    // Same-conflict: pages sharing at least one conflict slug.
    const conflictSet = new Set(page.conflictSlugs);
    const conflictMatches: PageContext[] = [];
    for (const [, candidate] of allPages) {
      if (candidate.locale !== locale) continue;
      if (candidate.url === page.url) continue;
      if (seen.has(candidate.url)) continue;
      const overlap = candidate.conflictSlugs?.some((s) => conflictSet.has(s));
      if (overlap) conflictMatches.push(candidate);
    }
    for (const n of conflictMatches) {
      if (links.length >= count) break;
      seen.add(n.url);
      links.push({ url: n.url, anchor: n.title, relation: "same-conflict" });
    }
  }

  if (TERM_TEMPLATES.includes(page.template) && page.relatedTerms?.length) {
    // Related-term: other glossary pages sharing related term slugs.
    const termSet = new Set(page.relatedTerms);
    const termMatches: PageContext[] = [];
    for (const [, candidate] of allPages) {
      if (candidate.locale !== locale) continue;
      if (candidate.url === page.url) continue;
      if (seen.has(candidate.url)) continue;
      if (candidate.template !== "glossary") continue;
      const overlap = candidate.relatedTerms?.some((t) => termSet.has(t));
      if (overlap) termMatches.push(candidate);
    }
    for (const n of termMatches) {
      if (links.length >= count) break;
      seen.add(n.url);
      links.push({ url: n.url, anchor: n.title, relation: "related-term" });
    }
  }

  // Fill remaining slots with same-template, same-locale pages.
  if (links.length < count) {
    for (const [, candidate] of allPages) {
      if (links.length >= count) break;
      if (candidate.locale !== locale) continue;
      if (seen.has(candidate.url)) continue;
      if (candidate.template !== page.template) continue;
      seen.add(candidate.url);
      links.push({ url: candidate.url, anchor: candidate.title, relation: "related" });
    }
  }

  // Final fallback: any same-locale page.
  if (links.length < count) {
    for (const [, candidate] of allPages) {
      if (links.length >= count) break;
      if (candidate.locale !== locale) continue;
      if (seen.has(candidate.url)) continue;
      seen.add(candidate.url);
      links.push({ url: candidate.url, anchor: candidate.title, relation: "related" });
    }
  }

  return links.slice(0, count);
}

// ── Per-template sitemap segments ─────────────────────────────────────────────

/**
 * Template-to-sitemap-segment mapping. Each template family is served in its
 * own sitemap file so search engines can crawl per-template on independent
 * cadences.
 *
 * References the live SITEMAP_SEGMENTS registry from sitemap-segments.ts for
 * the shared segment definitions (events, core) and adds the programmatic-
 * template-specific entries.
 */
export interface TemplateSitemapSegment {
  /** Sitemap XML path served at this URL. */
  path: string;
  /** Templates included in this segment. */
  templates: TemplateName[];
  /** Crawl frequency hint. */
  changeFrequency: "hourly" | "daily" | "weekly" | "monthly";
  /** Default priority (0..1). */
  priority: number;
}

export const TEMPLATE_SITEMAP_SEGMENTS: TemplateSitemapSegment[] = [
  {
    path: "/sitemap-regions.xml",
    templates: ["regions", "country", "city", "safety", "travel"],
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/sitemap-equipment.xml",
    templates: ["equipment", "units"],
    changeFrequency: "weekly",
    priority: 0.65,
  },
  {
    path: "/sitemap-glossary.xml",
    templates: ["glossary"],
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/sitemap-events.xml",
    templates: ["events"],
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    path: "/sitemap-sources.xml",
    templates: ["sources"],
    changeFrequency: "weekly",
    priority: 0.55,
  },
  {
    path: "/sitemap-topics.xml",
    templates: ["topics", "conflicts"],
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/sitemap-use-cases.xml",
    templates: ["use-cases", "vs", "alternatives"],
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

/** Look up the sitemap segment for a given template. */
export function sitemapSegmentFor(template: TemplateName): TemplateSitemapSegment | undefined {
  return TEMPLATE_SITEMAP_SEGMENTS.find((s) => s.templates.includes(template));
}

// ── Crawl budget monitor config ────────────────────────────────────────────────

/**
 * Configuration object for the crawl-budget monitoring dashboard.
 *
 * The live monitoring logic lives in `crawl-budget.ts`; this provides the
 * per-template targets and alert configuration that the dashboard reads.
 *
 * Integration:
 *  - Feed CDN/nginx access logs into `aggregateCrawlBudget()` from crawl-budget.ts
 *  - Compare per-template crawl rates against these targets
 *  - Alert when `indexedPerCrawled` drops below `alertThreshold`
 */
export interface CrawlBudgetMonitorConfig {
  /** Desired search-bot crawls per day across the whole site. */
  targetCrawlRate: number;
  /**
   * Minimum acceptable ratio of indexed pages to crawled pages.
   * Below this → investigate noindex coverage, thin content, or crawl traps.
   */
  indexedPerCrawled: number;
  /**
   * Alert fires when `indexedPerCrawled` drops below
   * `alertThreshold * indexedPerCrawled`.
   */
  alertThreshold: number;
  /** Per-template crawl-rate targets (crawls/day). */
  perTemplate: Record<TemplateName, { crawledPerDay: number; priority: "high" | "medium" | "low" }>;
}

export const CRAWL_BUDGET_MONITOR: CrawlBudgetMonitorConfig = {
  targetCrawlRate: 5000,
  indexedPerCrawled: 0.85,
  alertThreshold: 0.8,
  perTemplate: {
    events: { crawledPerDay: 2000, priority: "high" },
    regions: { crawledPerDay: 400, priority: "high" },
    country: { crawledPerDay: 100, priority: "high" },
    city: { crawledPerDay: 150, priority: "medium" },
    safety: { crawledPerDay: 100, priority: "medium" },
    travel: { crawledPerDay: 80, priority: "medium" },
    topics: { crawledPerDay: 200, priority: "high" },
    conflicts: { crawledPerDay: 100, priority: "high" },
    equipment: { crawledPerDay: 200, priority: "high" },
    units: { crawledPerDay: 50, priority: "medium" },
    "use-cases": { crawledPerDay: 80, priority: "medium" },
    vs: { crawledPerDay: 60, priority: "medium" },
    alternatives: { crawledPerDay: 60, priority: "medium" },
    glossary: { crawledPerDay: 150, priority: "medium" },
    sources: { crawledPerDay: 100, priority: "low" },
  },
};

/**
 * Check whether a template is within its crawl-budget target window.
 *
 * @param template  Template to check.
 * @param actualCrawledPerDay  Actual crawls/day observed in logs.
 * @returns `true` if within budget; `false` if exceeding target (potential crawl trap).
 */
export function isWithinCrawlBudget(
  template: TemplateName,
  actualCrawledPerDay: number,
): boolean {
  const target = CRAWL_BUDGET_MONITOR.perTemplate[template];
  if (!target) return true;
  // Allow 20% over target before flagging — routine variance.
  return actualCrawledPerDay <= target.crawledPerDay * 1.2;
}
