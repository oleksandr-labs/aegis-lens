export type CaseStudy = {
  slug: string;
  /** Anonymized client descriptor (e.g. "European defense ministry"). */
  client: string;
  industry: string;
  region: string;
  /** Hero one-liner. */
  oneLiner: string;
  challenge: string;
  solution: string;
  outcome: string;
  metrics: { label: string; value: string }[];
  quote?: { text: string; attribution: string };
  /** Tag slugs for /tags cross-linking. */
  tags: string[];
  /** Aegis Lens surfaces the customer is actively using. */
  surfaces: string[];
  /** Publication date (anonymous case studies still carry a date). */
  publishedAt: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "european-defense-ministry-situational-awareness",
    client: "European defense ministry",
    industry: "Defense",
    region: "EU",
    oneLiner:
      "How a NATO-allied defense ministry replaced three internal feeds with a single Aegis Lens API integration.",
    challenge:
      "The customer ran three overlapping internal feeds for open-source conflict signal — duplicated work, inconsistent confidence scoring, and no shared methodology disclosure.",
    solution:
      "Replaced the three feeds with `GET /api/events` pulled into the internal analyst portal, plus per-class RSS feeds piped into briefing tooling. Methodology disclosure satisfied procurement.",
    outcome:
      "Time-to-first-alert dropped from ~14 minutes to under 90 seconds. The analyst team reallocated the saved cycles to publishable findings rather than feed maintenance.",
    metrics: [
      { label: "Time-to-alert", value: "~14m → <90s" },
      { label: "Feeds consolidated", value: "3 → 1" },
      { label: "Analyst hours saved / month", value: "~120" },
    ],
    quote: {
      text: "The methodology disclosure was the deciding factor. We can defend our analytic line because they can defend theirs.",
      attribution: "Head of Open-Source Cell, anonymous EU ministry",
    },
    tags: ["defense", "api", "situational-awareness"],
    surfaces: ["/api/events", "/topics/<class>/feed.xml", "/methodology"],
    publishedAt: "2026-04-22",
  },
  {
    slug: "investigative-newsroom-verification",
    client: "Investigative newsroom",
    industry: "Journalism",
    region: "EU",
    oneLiner:
      "A 12-person investigative team ships verified findings to deadline using Aegis Lens as their corroboration layer.",
    challenge:
      "Newsroom needed faster cross-check of viral social-media claims without lowering verification standards. Existing workflow required two senior analysts per claim.",
    solution:
      "Adopted Aegis Lens `/api/events` for region-scoped corroboration plus the seven-check verification workflow from `/methodology/verification`. Junior analysts now run first-pass with senior review on edge cases.",
    outcome:
      "Time from claim to publishable finding fell from ~6 hours to ~90 minutes. Retraction rate dropped slightly thanks to stricter source-tier weighting.",
    metrics: [
      { label: "Claim-to-finding", value: "~6h → ~1.5h" },
      { label: "Retraction rate", value: "1.8% → 0.9%" },
      { label: "Stories shipped / week", value: "+40%" },
    ],
    quote: {
      text: "We were already disciplined. Aegis Lens just made the discipline survive deadline pressure.",
      attribution: "Lead investigative producer, anonymous EU outlet",
    },
    tags: ["journalism", "verification", "newsroom"],
    surfaces: ["/api/events", "/methodology/verification", "/guides/verifying-social-media-footage"],
    publishedAt: "2026-03-15",
  },
  {
    slug: "humanitarian-ngo-pre-positioning",
    client: "Humanitarian NGO",
    industry: "Humanitarian",
    region: "UA",
    oneLiner:
      "A humanitarian NGO uses Aegis Lens severity signals to pre-position evacuation capacity 36 hours ahead of need.",
    challenge:
      "NGO operations were reactive: capacity arrived hours after demand. Result: longer wait times, higher per-unit cost, and avoidable stress on volunteer drivers.",
    solution:
      "Subscribed to civilian_alert + humanitarian + infrastructure topic feeds. Built an internal dashboard reading `/api/events` and `/api/regions` and triggering pre-positioning when regional severity crosses a configured floor.",
    outcome:
      "Pre-positioning lead time improved from reactive to ~36 hours of advance signal in 70% of activations. Per-event response cost dropped meaningfully.",
    metrics: [
      { label: "Activation lead time", value: "reactive → +36h" },
      { label: "Activations with advance pre-position", value: "70%" },
      { label: "Per-event cost", value: "−28%" },
    ],
    tags: ["humanitarian", "ngo", "pre-positioning"],
    surfaces: ["/api/events", "/api/regions", "/topics/civilian_alert/feed.xml"],
    publishedAt: "2026-02-08",
  },
  {
    slug: "compliance-team-sanctions-screening",
    client: "Global bank compliance team",
    industry: "Finance",
    region: "EU",
    oneLiner:
      "A compliance team adds maritime AIS-spoofing signal to counterparty screening — without rebuilding the screening engine.",
    challenge:
      "Existing screening was list-based; sanctions-evasion via AIS spoofing flew under the radar. Adding bespoke maritime intel was scoped at 6+ months of integration work.",
    solution:
      "Wired `/api/events?class=maritime` and the AIS-spoofing threat page references into the existing screening enrichment pipeline. No new screening engine — just a pre-screening enrichment.",
    outcome:
      "Caught 11 counterparties showing spoofing-correlated vessel activity in the first quarter. Two were escalated to enhanced due diligence and one terminated.",
    metrics: [
      { label: "Counterparties flagged Q1", value: "11" },
      { label: "Escalated to EDD", value: "2" },
      { label: "Implementation time", value: "11 days" },
    ],
    quote: {
      text: "Eleven days to a working enrichment beat the multi-quarter rebuild we were planning.",
      attribution: "Head of Sanctions Compliance, anonymous global bank",
    },
    tags: ["finance", "sanctions", "ais-spoofing"],
    surfaces: ["/api/events", "/threats/ais-spoofing", "/sanctions/eu-consolidated"],
    publishedAt: "2026-05-02",
  },
  {
    slug: "energy-utility-resilience",
    client: "Regional energy utility",
    industry: "Energy",
    region: "UA",
    oneLiner:
      "A regional utility uses Aegis Lens infrastructure-class signal to prioritize transformer pre-positioning across the winter campaign.",
    challenge:
      "Repair throughput on damaged 330 kV substations was the binding constraint, not crews. Spare-transformer logistics needed earlier signal to stage spares closer to anticipated impact zones.",
    solution:
      "Used `/api/events?class=infrastructure` + `/threats/energy-grid-attacks` to model strike probability by oblast. Pre-positioned transformer spares per the rolling probability map.",
    outcome:
      "Average repair lead time on hit substations fell from 6.4 days to 4.1 days across the campaign. Customer-minutes-without-power dropped ~22% in affected oblasts.",
    metrics: [
      { label: "Repair lead time", value: "6.4d → 4.1d" },
      { label: "Customer minutes lost", value: "−22%" },
      { label: "Pre-positioned transformers", value: "+14 strategic" },
    ],
    tags: ["energy", "utility", "resilience"],
    surfaces: ["/api/events", "/threats/energy-grid-attacks", "/topics/infrastructure/feed.xml"],
    publishedAt: "2026-04-01",
  },
];

export function listCaseStudies(): CaseStudy[] {
  return CASE_STUDIES.slice().sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getCaseStudy(slug: string): CaseStudy | null {
  return CASE_STUDIES.find((c) => c.slug === slug) ?? null;
}
