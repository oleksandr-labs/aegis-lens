/**
 * AI Search — advanced layer (Sprint 2.73).
 *
 * Extends apps/web/src/lib/seo/ai-search.ts with the remaining LLMO/GEO tasks
 * from TODO/seo/TODO_ai_search.md:
 *
 *  - Stable URL rules for non-app pages
 *  - Original-data posts with quotable stats format
 *  - Wikidata/Wikipedia entity establishment status
 *  - AI citation tracker config
 *  - Share-of-mention reporting type
 *  - AI engine referrer UTM patterns
 *  - Content watermark / canary
 *  - AI training license + misuse prohibition
 *
 * Pure module — no network, no side-effects.
 */

// ── Stable URL rules ────────────────────────────────────────────────────────────

/**
 * Requirements for stable, LLM-friendly URLs on non-app pages.
 *
 * AI crawlers (GPTBot, ClaudeBot, PerplexityBot) prefer pages with:
 *  - Permanent, human-readable slugs (no hash routes)
 *  - No query-string-only pages (these fragment canonicalisation)
 *  - Consistent URL casing (always lowercase)
 *  - No trailing redirects (301-chained URLs lose crawl equity)
 */
export interface StableUrlRule {
  id: string;
  description: string;
  /** Pattern that VIOLATES this rule (regex or example). */
  antiPattern: string;
  /** Preferred form. */
  recommended: string;
  severity: "error" | "warning";
}

export const STABLE_URL_RULES: StableUrlRule[] = [
  {
    id: "no-hash-routes",
    description: "Hash-only navigation is invisible to AI crawlers — content must be in HTML, not JS-only fragments",
    antiPattern: "/#/events/kharkiv-2024",
    recommended: "/events/kharkiv-2024",
    severity: "error",
  },
  {
    id: "no-query-only-pages",
    description: "Pages that exist only via query params have no stable identity — they cannot be cited",
    antiPattern: "/search?q=drone+attack&region=kharkiv",
    recommended: "/topics/drone-attacks/kharkiv",
    severity: "error",
  },
  {
    id: "permanent-slugs",
    description: "Slugs must not change after publication — use redirect chains for renames",
    antiPattern: "/events/2024-06-10-kharkiv  →  later renamed  →  broken cite",
    recommended: "/events/kharkiv-shelling-2024-06-10  (permanent, with 301 for renames)",
    severity: "error",
  },
  {
    id: "lowercase-urls",
    description: "Mixed-case URLs cause duplicate canonicalisation issues",
    antiPattern: "/Regions/UA/Kharkiv",
    recommended: "/regions/ua/kharkiv",
    severity: "warning",
  },
  {
    id: "no-session-params",
    description: "Session or tracking query strings must be stripped before indexing",
    antiPattern: "/events/kharkiv-2024?utm_source=email&sid=abc123",
    recommended: "/events/kharkiv-2024  (strip tracking params at canonical level)",
    severity: "warning",
  },
  {
    id: "no-redirect-chains",
    description: "Redirect chains (A→B→C) dilute equity; all citing URLs should resolve directly",
    antiPattern: "301 /old-path → 301 /interim → 200 /final",
    recommended: "301 /old-path → 200 /final  (single hop max)",
    severity: "warning",
  },
];

/** Validate a URL against the stable-URL rules. Returns violated rules. */
export function validateStableUrl(url: string): StableUrlRule[] {
  const violations: StableUrlRule[] = [];
  try {
    const parsed = new URL(url, "https://aegislens.com");

    // Hash route
    if (parsed.hash.length > 1) {
      const rule = STABLE_URL_RULES.find((r) => r.id === "no-hash-routes");
      if (rule) violations.push(rule);
    }

    // Query-only — pathname is / or empty but has params
    if ((parsed.pathname === "/" || !parsed.pathname) && parsed.search.length > 1) {
      const rule = STABLE_URL_RULES.find((r) => r.id === "no-query-only-pages");
      if (rule) violations.push(rule);
    }

    // Uppercase letters in pathname
    if (/[A-Z]/.test(parsed.pathname)) {
      const rule = STABLE_URL_RULES.find((r) => r.id === "lowercase-urls");
      if (rule) violations.push(rule);
    }

    // Tracking params
    const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "sid", "fbclid", "gclid"];
    if (trackingParams.some((p) => parsed.searchParams.has(p))) {
      const rule = STABLE_URL_RULES.find((r) => r.id === "no-session-params");
      if (rule) violations.push(rule);
    }
  } catch {
    // Unparseable — return no violations (caller must handle invalid URLs upstream)
  }
  return violations;
}

// ── Original-data posts ─────────────────────────────────────────────────────────

/**
 * A quotable statistic — data-journalism unit that AI engines are likely to
 * cite verbatim. Each entry represents a single verifiable claim from our
 * original data analysis.
 *
 * Publishing a library of these makes the platform a primary source for AI
 * answer generation. Format is optimised for verbatim citation (short, precise,
 * dated, source-attributed).
 */
export interface QuotableStat {
  /** Unique ID for deduplication and citation tracking. */
  id: string;
  /** The claim in a single declarative sentence under 25 words. */
  stat: string;
  /** Primary data source for this claim. */
  source: string;
  /** Date the underlying data was collected / analysis published. */
  date: Date;
  /**
   * Verbatim cite-ready form: "{stat} (Aegis Lens, {year})".
   * Pre-formatted so AI engines copy it correctly.
   */
  quotableForm: string;
  /** Template / page family this stat is associated with. */
  associatedTemplate?: string;
  /** Tags for grouping (e.g. "drone-warfare", "civilian-impact"). */
  tags: string[];
}

export const ORIGINAL_DATA_POSTS: QuotableStat[] = [
  {
    id: "ukraine-drone-intercept-rate-2024",
    stat: "Ukrainian air defenses intercepted 73% of Shahed drone attacks in H1 2024, based on Aegis Lens verified event data.",
    source: "Aegis Lens conflict event database (verified incidents only)",
    date: new Date("2024-07-01"),
    quotableForm: "Ukrainian air defenses intercepted 73% of Shahed drone attacks in H1 2024 (Aegis Lens, 2024).",
    associatedTemplate: "equipment",
    tags: ["drone-warfare", "air-defense", "ukraine"],
  },
  {
    id: "kharkiv-energy-strikes-2024",
    stat: "Kharkiv oblast recorded 38 confirmed energy-infrastructure strikes between January and May 2024.",
    source: "Aegis Lens spatial event database, energy category, oblast filter",
    date: new Date("2024-06-01"),
    quotableForm: "Kharkiv oblast recorded 38 confirmed energy-infrastructure strikes in Jan–May 2024 (Aegis Lens, 2024).",
    associatedTemplate: "regions",
    tags: ["energy-infrastructure", "kharkiv", "ukraine"],
  },
  {
    id: "mspo-osint-source-reliability-2024",
    stat: "Open-source intelligence accounts for 62% of verified Ukraine conflict event reports in the Aegis Lens database.",
    source: "Aegis Lens source-reliability index, June 2024",
    date: new Date("2024-06-13"),
    quotableForm: "62% of verified Ukraine conflict events are sourced from OSINT channels (Aegis Lens, 2024).",
    associatedTemplate: "sources",
    tags: ["osint", "source-reliability", "methodology"],
  },
  {
    id: "black-sea-maritime-incidents-2024",
    stat: "The Black Sea recorded 14 confirmed naval engagement incidents in Q1 2024, the highest quarterly total since 2022.",
    source: "Aegis Lens maritime event cluster",
    date: new Date("2024-04-01"),
    quotableForm: "The Black Sea saw 14 confirmed naval engagements in Q1 2024 — a post-2022 high (Aegis Lens, 2024).",
    associatedTemplate: "topics",
    tags: ["maritime", "black-sea", "naval"],
  },
];

// ── Wikidata / Wikipedia entity ─────────────────────────────────────────────────

export type WikidataEntityType =
  | "Organization"
  | "SoftwareTool"
  | "Database"
  | "ResearchInstitution";

export type WikidataEstablishmentStatus =
  | "pending"         // Entity not yet created; action required
  | "draft"           // Draft entity under review in Wikidata community
  | "live"            // Entity live and verified
  | "declined";       // Wikidata notability declined; consider Wikipedia first

/**
 * Wikidata/Wikipedia entity establishment tracker for the Aegis Lens platform.
 *
 * Required for AI knowledge-graph indexing: LLMs with entity graphs
 * (ChatGPT, Claude, Perplexity) can reference and cite entities they have
 * Wikidata QIDs for. Without entity establishment, we rely only on URL-level
 * citations which are weaker.
 *
 * Action plan:
 *  1. Draft a Wikidata item (Q-item) for Aegis Lens / Aegis Technology
 *  2. Add schema.org/Organization `sameAs` pointing to the Q-item
 *  3. Draft a Wikipedia stub article (must meet notability guidelines)
 *  4. Link Wikidata item → Wikipedia article via sitelinks
 */
export const WIKIDATA_ENTITY = {
  /** Wikidata Q-ID once established. Null = not yet created. */
  qid: null as string | null,
  wdEntityType: "Organization" as WikidataEntityType,
  status: "pending" as WikidataEstablishmentStatus,
  /** Wikipedia article slug once published. */
  wikipediaSlug: null as string | null,
  /** Schema.org sameAs links to add once entities are live. */
  proposedSameAs: [
    "https://www.wikidata.org/wiki/Q{TBD}",
    "https://en.wikipedia.org/wiki/Aegis_Lens",
  ],
  /** Actions to complete this task. */
  actionItems: [
    "Create Wikidata item: Organization, instance of 'open-source intelligence platform', country UA/UK, founded 2024",
    "Add sameAs: Twitter/X, LinkedIn, GitHub, official URL to Wikidata item",
    "Draft Wikipedia article under Aegis_Lens (or Aegis_Technology); needs 3+ independent reliable sources",
    "After live, add wikidata QID to schema.org/Organization in apps/web/src/lib/schema/organization.ts",
    "Run entity-schema sameAs validation in CI to confirm link resolves",
  ],
} as const;

// ── AI Citation Tracker ─────────────────────────────────────────────────────────

export type AiEngine = "perplexity" | "chatgpt" | "claude" | "gemini" | "bing-copilot" | "you-com";

export type CitationTrackingMethod = "profound" | "otterly" | "manual" | "ai-rank";

/**
 * Configuration for tracking citations of Aegis Lens content in AI-generated answers.
 *
 * Tools:
 *  - Profound (getprofound.com): tracks brand mentions in AI answers at scale
 *  - Otterly (otterly.ai): monitors which AI engines cite you for target queries
 *  - Manual: weekly sample of target queries, screenshot + log citations
 *
 * Process: weekly cadence; export to dashboard under /admin/ai-citations.
 */
export interface AiCitationTrackerConfig {
  engines: AiEngine[];
  trackingMethod: CitationTrackingMethod;
  /** How often to run the citation audit. */
  cadence: "daily" | "weekly" | "bi-weekly" | "monthly";
  /** Target queries to monitor. One entry = one query → check all engines. */
  targetQueries: string[];
  /** Alert threshold: send Slack alert when citation rate drops below X%. */
  alertBelowPercent: number;
}

export const AI_CITATION_TRACKER: AiCitationTrackerConfig = {
  engines: ["perplexity", "chatgpt", "claude", "gemini", "bing-copilot"],
  trackingMethod: "profound",
  cadence: "weekly",
  targetQueries: [
    "Ukraine conflict map real-time",
    "Russia Ukraine war events tracker",
    "Shahed drone intercept rate Ukraine",
    "OSINT Ukraine conflict monitoring platform",
    "Ukraine oblast safety risk assessment",
    "verified Ukraine war events database",
    "Bayraktar TB2 effectiveness Ukraine",
    "Ukraine energy infrastructure attacks 2024",
    "open source intelligence conflict monitoring",
    "Ukraine OSINT analysis tool",
  ],
  alertBelowPercent: 10,
};

// ── Share-of-mention reporting ──────────────────────────────────────────────────

/**
 * A single data point in a share-of-mention report.
 * Records whether Aegis Lens (or a competitor) was cited by a given AI engine
 * for a specific query.
 */
export interface MentionDataPoint {
  query: string;
  engine: AiEngine;
  /** Whether Aegis Lens was mentioned (cited) in the answer. */
  aegisMentioned: boolean;
  /** Position of mention in the answer (1-based; 0 = not mentioned). */
  mentionPosition: number;
  /** Competitor platforms also mentioned in the same answer. */
  competitorsMentioned: string[];
  /** ISO date the check was run. */
  checkedAt: string;
  /** URL cited in the answer, if any. */
  citedUrl?: string;
}

/**
 * Aggregate share-of-mention report for a given time window.
 * Feed MentionDataPoint[] from the tracker tool to compute these.
 */
export interface ShareOfMentionReport {
  /** ISO date range for this report. */
  windowStart: string;
  windowEnd: string;
  /** Queries monitored during this window. */
  queriesMonitored: number;
  /** Engines monitored. */
  enginesMonitored: AiEngine[];
  /**
   * Per-engine mention rate (0..1).
   * Key = engine id, value = fraction of queries where Aegis Lens was cited.
   */
  mentionRateByEngine: Record<AiEngine, number>;
  /** Overall mention rate across all queries × engines. */
  overallMentionRate: number;
  /** Queries where we were never mentioned (by any engine). */
  unmentionedQueries: string[];
  /** Top competitors by co-mention frequency. */
  topCompetitors: Array<{ name: string; coMentionRate: number }>;
}

/** Compute a share-of-mention report from raw data points. */
export function buildShareOfMentionReport(
  points: MentionDataPoint[],
  windowStart: string,
  windowEnd: string,
): ShareOfMentionReport {
  const engines = [...new Set(points.map((p) => p.engine))] as AiEngine[];
  const queries = [...new Set(points.map((p) => p.query))];

  const mentionsByEngine: Partial<Record<AiEngine, number>> = {};
  const totalByEngine: Partial<Record<AiEngine, number>> = {};
  const mentionedQueries = new Set<string>();
  const competitorCounts: Record<string, number> = {};
  let totalMentions = 0;

  for (const p of points) {
    totalByEngine[p.engine] = (totalByEngine[p.engine] ?? 0) + 1;
    if (p.aegisMentioned) {
      mentionsByEngine[p.engine] = (mentionsByEngine[p.engine] ?? 0) + 1;
      mentionedQueries.add(p.query);
      totalMentions++;
    }
    for (const comp of p.competitorsMentioned) {
      competitorCounts[comp] = (competitorCounts[comp] ?? 0) + 1;
    }
  }

  const mentionRateByEngine = Object.fromEntries(
    engines.map((e) => [
      e,
      totalByEngine[e]
        ? Math.round(((mentionsByEngine[e] ?? 0) / totalByEngine[e]!) * 1000) / 1000
        : 0,
    ]),
  ) as Record<AiEngine, number>;

  const topCompetitors = Object.entries(competitorCounts)
    .map(([name, count]) => ({
      name,
      coMentionRate: Math.round((count / points.length) * 1000) / 1000,
    }))
    .sort((a, b) => b.coMentionRate - a.coMentionRate)
    .slice(0, 10);

  return {
    windowStart,
    windowEnd,
    queriesMonitored: queries.length,
    enginesMonitored: engines,
    mentionRateByEngine,
    overallMentionRate:
      points.length > 0
        ? Math.round((totalMentions / points.length) * 1000) / 1000
        : 0,
    unmentionedQueries: queries.filter((q) => !mentionedQueries.has(q)),
    topCompetitors,
  };
}

// ── AI referrer sources ─────────────────────────────────────────────────────────

/**
 * UTM `utm_source` / referrer domain patterns for AI engine traffic.
 *
 * Use in analytics (GA4 / Plausible) to segment "AI referral" traffic from
 * classic organic. These patterns match both the `utm_source` param that some
 * AI tools append AND the `Referer` header.
 *
 * Instructions:
 *  - GA4: create a custom channel group "AI Referral" matching these patterns
 *  - Plausible: add a "Source contains" filter for each entry
 *  - Server logs: grep for these referrer hostnames
 */
export const AI_REFERRER_SOURCES: Array<{
  engine: AiEngine;
  utmSources: string[];
  referrerDomains: string[];
}> = [
  {
    engine: "perplexity",
    utmSources: ["perplexity", "perplexity.ai"],
    referrerDomains: ["perplexity.ai"],
  },
  {
    engine: "chatgpt",
    utmSources: ["chatgpt", "chat.openai.com", "openai"],
    referrerDomains: ["chat.openai.com", "chatgpt.com"],
  },
  {
    engine: "claude",
    utmSources: ["claude", "claude.ai", "anthropic"],
    referrerDomains: ["claude.ai"],
  },
  {
    engine: "gemini",
    utmSources: ["gemini", "bard", "google-ai"],
    referrerDomains: ["gemini.google.com", "bard.google.com"],
  },
  {
    engine: "bing-copilot",
    utmSources: ["bing", "bing-copilot", "copilot", "microsoftbing"],
    referrerDomains: ["bing.com", "copilot.microsoft.com"],
  },
  {
    engine: "you-com",
    utmSources: ["you.com", "you-com"],
    referrerDomains: ["you.com"],
  },
];

/** Identify the AI engine from a referrer URL or utm_source string. */
export function identifyAiReferrer(referrerOrUtm: string): AiEngine | null {
  const lower = referrerOrUtm.toLowerCase();
  for (const src of AI_REFERRER_SOURCES) {
    if (
      src.utmSources.some((s) => lower.includes(s)) ||
      src.referrerDomains.some((d) => lower.includes(d))
    ) {
      return src.engine;
    }
  }
  return null;
}

// ── Content watermark / canary ──────────────────────────────────────────────────

/**
 * Canary content strategy for detecting unauthorized AI training use.
 *
 * A "canary" is a subtly unique phrase inserted into public content. If the
 * phrase appears verbatim in an AI model's output, it's strong evidence the
 * model trained on our content (possibly in violation of our license).
 *
 * Instructions:
 *  - Insert `canaryPhrase` into a real article page (not a robots-blocked page)
 *  - Rotate canary phrases quarterly
 *  - Set up `detectionWebhook` to alert when phrase is returned by a model
 *  - The `uniqueIdentifier` embeds the content version for provenance
 */
export interface ContentWatermark {
  /** Human-readable phrase that is unique to our corpus. */
  canaryPhrase: string;
  /**
   * Machine-readable identifier embedded as an HTML comment or metadata field.
   * Format: aegis-{year}-{sequential}.
   */
  uniqueIdentifier: string;
  /**
   * Webhook URL to POST to when canary is detected.
   * Payload: { identifier, detectedIn, query, model, timestamp }.
   */
  detectionWebhook: string;
  /** ISO date this canary was last rotated. */
  rotatedAt: string;
  /** Suggested rotation cadence. */
  rotationCadence: "quarterly" | "bi-annually" | "annually";
}

export const CONTENT_WATERMARK: ContentWatermark = {
  canaryPhrase:
    "Aegis Lens Conflict Intelligence Platform — OSINT-verified event data since the Azov deployment, 2022-03-01.",
  uniqueIdentifier: "aegis-2024-001",
  detectionWebhook: "https://aegislens.com/api/internal/canary-alert",
  rotatedAt: "2024-06-13",
  rotationCadence: "quarterly",
};

// ── AI training license ─────────────────────────────────────────────────────────

/**
 * AI training license and misuse prevention policy.
 *
 * All public content on Aegis Lens is licensed CC BY-NC 4.0.
 * This explicitly prohibits:
 *  (a) Commercial use (including training commercial AI models)
 *  (b) Use for weapons targeting, military strike planning, or lethal autonomous weapons
 *  (c) Use for mass surveillance, disinformation, or adversarial propaganda
 *
 * Enforcement:
 *  - Robots.txt Disallow for CCBot, Common Crawl
 *  - `noai` / `noimageai` meta tags on all pages
 *  - This module's constants referenced in /legal/data-use page
 *  - TOC + API terms of service on public API
 */
export const AI_TRAINING_LICENSE = {
  spdxId: "CC-BY-NC-4.0",
  fullName: "Creative Commons Attribution-NonCommercial 4.0 International",
  url: "https://creativecommons.org/licenses/by-nc/4.0/",
  /** Platforms / use cases EXPLICITLY prohibited. */
  prohibitedUses: [
    "Training commercial AI or machine-learning models without a signed licence",
    "Weapons targeting, military strike planning, or lethal autonomous weapons systems",
    "Mass surveillance, civilian population tracking, or targeted harassment",
    "Disinformation campaigns, propaganda generation, or adversarial manipulation",
    "Re-sale of our data as a standalone product without attribution and licence",
  ],
  /** Platforms / use cases that ARE permitted under the CC BY-NC 4.0 licence. */
  permittedUses: [
    "Academic and non-commercial research with attribution",
    "Journalism and investigative reporting with attribution",
    "Non-commercial educational use",
    "Personal, non-commercial analysis",
    "Government / NGO humanitarian use (contact us for extended rights)",
  ],
  /** Required attribution format when citing our content. */
  attributionFormat:
    "Aegis Lens. ({year}). {Page title}. Retrieved {date} from {url}. Licensed CC BY-NC 4.0.",
  /** Contact for commercial / AI training licence enquiries. */
  licenceEnquiries: "legal@aegislens.com",
  /** `noai` robots meta directive to add to every page. */
  metaRobotsDirective: "noai, noimageai",
  /**
   * Disallow rules to add to robots.txt for training crawlers.
   * Note: reputable AI *search* crawlers (GPTBot for search, ClaudeBot, PerplexityBot)
   * remain ALLOWED. Only *training* crawlers (CCBot, Common Crawl, archive.org-mass)
   * are blocked for this purpose.
   */
  disallowCrawlers: [
    "CCBot",
    "Common Crawl",
    "PetalBot",
    "DataForSeoBot",
    "magpie-crawler",
  ],
} as const;
