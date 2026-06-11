/**
 * Content roadmap configuration — 4 phases, content cadence, and performance
 * metrics definitions.
 *
 * Maps to TODO/roadmap/TODO_content_roadmap.md.
 * Phase structure aligns with the SEO roadmap in TODO/roadmap/TODO_seo_roadmap.md.
 *
 * Editorial rule: content is a flywheel — cadence > perfection. Ship on time.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContentPhase {
  phase: 1 | 2 | 3 | 4;
  /** Short theme label (EN) */
  theme_en: string;
  /** Primary editorial objectives for this phase */
  goals_en: string[];
  /** Concrete deliverable types expected in this phase */
  deliverables_en: string[];
  /** SEO outcomes being targeted */
  seoTargets_en: string[];
  /** Locales shipping content in this phase */
  locales: string[];
  /** Target total published pieces by end of phase */
  estimatedPieces: number;
}

export interface ContentCadenceItem {
  /** Content type name */
  type: string;
  /** How often this content type is produced */
  frequency: string;
  /** Primary locale for this content type */
  assignedLocale: string;
  /** Why this content type matters for SEO */
  seoPurpose_en: string;
}

export interface ContentPerformanceMetric {
  /** Metric name */
  metric: string;
  /** What it measures */
  description_en: string;
  /** Target value or range */
  target: string;
  /** Tool or method used to track it */
  trackingTool: string;
}

// ── Content Roadmap ───────────────────────────────────────────────────────────

/**
 * Four-phase editorial roadmap.
 *
 * Phase 1 = Foundation (EN only, domain authority building)
 * Phase 2 = Depth (EN+UK, programmatic scale)
 * Phase 3 = Multi-locale (EN+UK+PL+DE, international reach)
 * Phase 4 = Community (8+ locales, network effects)
 */
export const CONTENT_ROADMAP: ContentPhase[] = [
  {
    phase: 1,
    theme_en: "Foundation — establish EN authority",
    goals_en: [
      "Establish domain authority with high-quality cornerstone content",
      "Answer the 'what is OSINT' and 'how to verify' questions definitively",
      "Build topical coverage around Ukraine conflict monitoring",
      "Create the methodology and transparency pages that underpin E-E-A-T",
    ],
    deliverables_en: [
      "Pillar: What is OSINT (2,500+ words, author-attributed)",
      "Pillar: How to verify a photo / video",
      "Pillar: Geolocation fundamentals for analysts",
      "Core use-case pages × 8 (journalist, researcher, NGO, government, …)",
      "Methodology transparency page (how we source, verify, publish)",
      "About / Team page with named experts (E-E-A-T signal)",
      "Weekly conflict brief × 12 (Q1 cadence)",
      "First quarterly state-of-conflict report",
      "Tool comparison: Aegis Lens vs LiveUAmap vs Palantir",
      "Conflict explainer: Ukraine war timeline",
    ],
    seoTargets_en: [
      'Rank page-1 for "OSINT Ukraine" in EN within 6 months',
      "Earn first 50 editorial backlinks from press / NGOs",
      "Achieve DR 30+ via pillar-page link magnets",
      "Index 50+ unique high-quality pages",
    ],
    locales: ["en"],
    estimatedPieces: 50,
  },
  {
    phase: 2,
    theme_en: "Depth — programmatic scale + UK locale",
    goals_en: [
      "Launch UK locale with full translation of Phase 1 pillars",
      "Scale to 500+ programmatic region/city/equipment pages",
      "Build pillar clusters around core OSINT disciplines",
      "Establish analyst-authored case studies for E-E-A-T depth",
    ],
    deliverables_en: [
      "UK locale launch package (all Phase 1 pillars in Ukrainian)",
      "Programmatic region pages × 100 (Ukraine oblasts + major cities)",
      "Programmatic conflict-category pages × 50",
      "Programmatic equipment / weapon-system pages × 50",
      "Tutorial library: 20 step-by-step OSINT how-to guides",
      "Case studies × 5 (analyst-written, sourced, named authors)",
      "Conflict timelines: Kherson, Kharkiv, Mariupol deep dives",
      "Analyst spotlight interviews × 4",
      "12 weekly briefs (Q2 cadence)",
      "Year-half review (flagship mid-year report)",
    ],
    seoTargets_en: [
      "First 500 indexed UK-locale pages",
      'Rank page-1 for "карта бойових дій онлайн" in UK locale',
      "10k+ organic visits/month by end of Phase 2",
      "Programmatic templates generating at least 500 pages total",
    ],
    locales: ["en", "uk"],
    estimatedPieces: 200,
  },
  {
    phase: 3,
    theme_en: "Multi-locale — international reach",
    goals_en: [
      "Launch PL + DE locales (highest traffic potential after EN/UK)",
      "Publish RO + FR + ES at selective coverage level",
      "Build region-specific content for Polish and German OSINT communities",
      "Press-freedom and media-literacy content for EU audiences",
    ],
    deliverables_en: [
      "PL locale: full pillar translations + 20 PL-specific guides",
      "DE locale: full pillar translations + 20 DE-specific guides",
      "RO/FR/ES: selective translations of top 30 EN pages each",
      "Regional OSINT resource guides per locale (tools, communities, legal context)",
      "Press-freedom content series (targeting EU journalists)",
      "Quarterly reports in EN + UK + PL",
      "12 weekly briefs per active locale",
      "Sahel + Black Sea conflict cluster posts (EN primary)",
      "Comparison series: Aegis Lens vs regional competitors",
    ],
    seoTargets_en: [
      "500+ indexed PL pages, 500+ indexed DE pages",
      "First page-1 rankings in PL and DE for key conflict-map terms",
      "50k+ organic visits/month",
      "10k+ DA with 200+ referring domains",
    ],
    locales: ["en", "uk", "pl", "de", "ro", "fr", "es"],
    estimatedPieces: 500,
  },
  {
    phase: 4,
    theme_en: "Community — network effects at scale",
    goals_en: [
      "Enable community-contributed methodology content (moderated)",
      "Scale to 2,000+ indexed pages across all 8+ locales",
      "Establish Aegis Lens as the citation source in AI search engines",
      "Build a contributor programme for analyst-authored tutorials",
    ],
    deliverables_en: [
      "Community tutorial library (moderated user submissions)",
      "Annual public report (flagship, widely cited)",
      "DataCite dataset releases × 3 (quotable open data)",
      "Wikipedia / Wikidata entity establishment for Aegis Lens",
      "Contributor programme launch with style guide + editorial standards",
      "Partner story series (NGOs, press, academic institutions)",
      "Year-in-review (flagship annual content)",
      "12+ weekly briefs across all active locales",
      "Regional community roundtables (virtual events → content)",
    ],
    seoTargets_en: [
      "2,000+ total indexed pages",
      "Present in ChatGPT / Perplexity answers for key queries",
      "100+ press citations per quarter",
      "500k+ organic visits/month",
    ],
    locales: ["en", "uk", "ru", "pl", "de", "ro", "fr", "es"],
    estimatedPieces: 2000,
  },
];

// ── Content Cadence ───────────────────────────────────────────────────────────

/**
 * 10 content types with their production cadence and SEO purpose.
 * The "flywheel" — don't break cadence.
 */
export const CONTENT_CADENCE: ContentCadenceItem[] = [
  {
    type: "Weekly conflict brief",
    frequency: "Weekly (every Monday)",
    assignedLocale: "en",
    seoPurpose_en:
      "Freshness signal; targets topical news queries; builds return-visitor habit; " +
      "feeds RSS subscribers and AI crawlers with regular new content.",
  },
  {
    type: "Methodology post",
    frequency: "Bi-weekly (every 2 weeks)",
    assignedLocale: "en",
    seoPurpose_en:
      "Long-tail how-to keywords; builds E-E-A-T via demonstrated expertise; " +
      "attracts backlinks from OSINT educators and journalists.",
  },
  {
    type: "Monthly deep-dive analysis",
    frequency: "Monthly (first week)",
    assignedLocale: "en",
    seoPurpose_en:
      "High word-count pillar content; targets competitive head terms; " +
      "earns citations and backlinks; signals topical authority.",
  },
  {
    type: "Quarterly state-of-conflict report",
    frequency: "Quarterly",
    assignedLocale: "en",
    seoPurpose_en:
      "Flagship link magnet; widely cited by press, NGOs, academics; " +
      "drives branded search; DataCite DOI earns academic citations.",
  },
  {
    type: "Year-in-review / Annual report",
    frequency: "Annual (December)",
    assignedLocale: "en",
    seoPurpose_en:
      "Highest-authority link bait; generates press coverage; " +
      "ranks for [year] conflict retrospective queries.",
  },
  {
    type: "24h reaction post",
    frequency: "As needed (within 24h of major event)",
    assignedLocale: "en",
    seoPurpose_en:
      "Captures breaking-news queries before competitors; " +
      "signals freshness; drives referral traffic from social and news aggregators.",
  },
  {
    type: "Tutorial / how-to guide",
    frequency: "Monthly",
    assignedLocale: "en",
    seoPurpose_en:
      "Long-tail instructional keywords; attracts OSINT practitioners; " +
      "builds tutorial cluster for topical authority.",
  },
  {
    type: "Dataset / open-data release",
    frequency: "Quarterly",
    assignedLocale: "en",
    seoPurpose_en:
      "Earns academic and press citations; DataCite DOI creates durable backlinks; " +
      "AI crawlers index structured data for answer-engine coverage.",
  },
  {
    type: "Press mention response",
    frequency: "Within 48h of significant press coverage",
    assignedLocale: "en",
    seoPurpose_en:
      "Consolidates brand search; captures branded query traffic; " +
      "earns additional links from follow-up coverage.",
  },
  {
    type: "Partner story",
    frequency: "Quarterly",
    assignedLocale: "en",
    seoPurpose_en:
      "Co-marketing backlinks; expands audience via partner channels; " +
      "builds E-E-A-T through institutional association.",
  },
];

// ── Performance Metrics ───────────────────────────────────────────────────────

/**
 * 8 KPIs for measuring content programme performance.
 * Review monthly; adjust cadence and topic mix quarterly.
 */
export const CONTENT_PERFORMANCE_METRICS: ContentPerformanceMetric[] = [
  {
    metric: "Organic traffic per piece",
    description_en:
      "Average monthly organic sessions per published page. Low performers are audited for " +
      "thin content, poor keyword targeting, or crawl/index issues.",
    target: ">500 sessions/month within 3 months of publish",
    trackingTool: "Google Search Console + GA4",
  },
  {
    metric: "Average time on page",
    description_en:
      "How long visitors spend on each content page. Proxy for content quality and relevance. " +
      "Short dwell time signals mismatch between headline and body content.",
    target: ">2 minutes average across long-form content",
    trackingTool: "GA4 (engaged sessions)",
  },
  {
    metric: "Citations and backlinks earned",
    description_en:
      "External links pointing to each piece. The primary content quality signal for domain authority. " +
      "Distinguishes link-magnet content (reports, datasets) from commodity pages.",
    target: ">3 referring domains per pillar page within 6 months",
    trackingTool: "Ahrefs / Moz / SEMrush",
  },
  {
    metric: "Conversion rate (free → paid / sign-up)",
    description_en:
      "Percentage of content visitors who start a trial or create an account. " +
      "Indicates bottom-of-funnel alignment of content.",
    target: ">0.5% for high-intent pages",
    trackingTool: "GA4 goals + PostHog",
  },
  {
    metric: "Email signups from content",
    description_en:
      "Weekly brief + report subscriber growth attributable to organic content discovery. " +
      "Strong leading indicator of return-visit audience.",
    target: ">50 net new subscribers/month from organic",
    trackingTool: "Newsletter provider (Resend / ConvertKit) + UTM tracking",
  },
  {
    metric: "Social shares",
    description_en:
      "Share and save actions across platforms (Twitter/X, LinkedIn, Telegram). " +
      "Proxy for virality and amplification potential.",
    target: ">20 shares per deep-dive; >100 shares per quarterly report",
    trackingTool: "Buffer analytics + manual Telegram tracking",
  },
  {
    metric: "Rank position for target keyword",
    description_en:
      "Tracked keyword position in Google SERPs for each piece's primary keyword. " +
      "Goal: page 1 (top 10) within 3 months for long-tail; 6 months for competitive head terms.",
    target: "Top 10 for primary keyword within 3–6 months of publish",
    trackingTool: "Google Search Console + Ahrefs Rank Tracker",
  },
  {
    metric: "Content velocity (pieces/month)",
    description_en:
      "Number of net-new pages published per month. Ensures cadence is maintained. " +
      "Below-target cadence triggers an editorial retrospective.",
    target: "≥4 long-form pieces + ≥4 weekly briefs per month",
    trackingTool: "Editorial calendar (Notion / Linear sprint tracking)",
  },
];
