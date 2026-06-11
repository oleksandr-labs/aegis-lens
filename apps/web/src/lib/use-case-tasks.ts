/**
 * Persona × Task SEO surface. Each vertical carries a small set of high-intent
 * tasks. The task page combines a problem framing, a recommended workflow using
 * Aegis Lens surfaces, and curated tool / guide / threat cross-links.
 */

export type UseCaseVertical =
  | "defense"
  | "journalism"
  | "humanitarian"
  | "financial"
  | "analysts"
  | "security"
  | "civilians";

export type UseCaseTask = {
  /** vertical_slug + task_slug uniquely identifies a page. */
  vertical: UseCaseVertical;
  slug: string;
  title: string;
  /** One-sentence problem framing (what the user is trying to accomplish). */
  problem: string;
  /** 4–6 step recommended workflow (each step references an Aegis surface). */
  workflow: { step: string; surface?: string }[];
  /** Tool category labels prioritized for this task. Used to pull from TOOLS. */
  toolCategories: string[];
  /** Threat slugs to surface alongside this task (cross-link). */
  threatSlugs?: string[];
  /** Guide slugs to surface (cross-link). */
  guideSlugs?: string[];
  /** Academy path slugs to surface (cross-link). */
  academyPathSlugs?: string[];
  /** Related tag slugs. */
  tags: string[];
};

export const USE_CASE_TASKS: UseCaseTask[] = [
  // --- defense ---
  {
    vertical: "defense",
    slug: "situational-awareness",
    title: "Maintain real-time situational awareness",
    problem:
      "Defense and intelligence teams need a continuously updated picture of events across an area of operations, derived from open sources with confidence scoring.",
    workflow: [
      { step: "Subscribe to the live map for your region of interest", surface: "/map" },
      { step: "Filter by event class and minimum confidence", surface: "/map" },
      { step: "Set danger-score threshold for paging", surface: "/incidents" },
      { step: "Pipe topic-class RSS feed into your dashboard", surface: "/topics/<class>/feed.xml" },
      { step: "Pull GET /api/events on a 60-second cadence", surface: "/docs/api" },
    ],
    toolCategories: ["OSINT", "Geospatial", "Mapping", "Satellite Imagery"],
    threatSlugs: ["shahed-strikes", "long-range-missile-strikes"],
    guideSlugs: ["reading-satellite-imagery"],
    tags: ["situational-awareness", "defense", "live"],
  },
  {
    vertical: "defense",
    slug: "battle-damage-assessment",
    title: "Conduct open-source battle damage assessment",
    problem:
      "Confirm whether a kinetic strike achieved its intended effect using publicly available imagery and reporting.",
    workflow: [
      { step: "Identify candidate strike events in the region", surface: "/incidents" },
      { step: "Cross-reference geolocated photographs and Sentinel imagery" },
      { step: "Note pre- and post-strike imagery dates" },
      { step: "Score confidence and publish finding via the API", surface: "/api/events" },
    ],
    toolCategories: ["Satellite Imagery", "Geospatial", "Verification", "OSINT"],
    threatSlugs: ["long-range-missile-strikes", "energy-grid-attacks"],
    guideSlugs: ["reading-satellite-imagery", "geolocating-a-photograph"],
    tags: ["bda", "imagery", "defense"],
  },
  {
    vertical: "defense",
    slug: "force-protection",
    title: "Operationalize force-protection alerts",
    problem:
      "Push alerts to deployed teams when severity in a named region crosses a threshold, without requiring an analyst to be watching.",
    workflow: [
      { step: "Define watch regions in the alerts subscription", surface: "/alerts" },
      { step: "Set per-class severity floors" },
      { step: "Wire webhook into deployment ticketing" },
      { step: "Cross-link to threat pages for civilian-vs-operator guidance", surface: "/threats" },
    ],
    toolCategories: ["Threat Intelligence", "OSINT", "Mapping"],
    threatSlugs: ["shahed-strikes", "civil-aviation-spillover"],
    tags: ["force-protection", "alerts", "defense"],
  },

  // --- journalism ---
  {
    vertical: "journalism",
    slug: "verify-a-photo",
    title: "Verify a photo before publication",
    problem:
      "Confirm a photograph's location, time, and authenticity to deadline, with a citation trail that survives fact-checking.",
    workflow: [
      { step: "Reverse-image search across multiple engines" },
      { step: "Geolocate using anchor objects and shadows", surface: "/guides/geolocating-a-photograph" },
      { step: "Verify timing with shadow azimuth + background signals" },
      { step: "Check provenance — who posted it first" },
      { step: "Archive every source link before publication" },
    ],
    toolCategories: ["Verification", "OSINT", "Satellite Imagery", "Archive"],
    guideSlugs: ["verifying-social-media-footage", "geolocating-a-photograph"],
    academyPathSlugs: ["verification-workflow", "geolocation-fundamentals"],
    tags: ["verification", "journalism", "photo"],
  },
  {
    vertical: "journalism",
    slug: "investigation-research",
    title: "Run an open-source investigation",
    problem:
      "Convert a tip into a publishable investigation grounded in named sources, with reproducible methodology.",
    workflow: [
      { step: "Scope the question to one sentence", surface: "/guides/getting-started-with-osint" },
      { step: "Collect from public sources with archive links" },
      { step: "Geolocate and corroborate critical claims" },
      { step: "Apply the three-source corroboration rule before publishing" },
      { step: "Cite event IDs via the API for reproducibility", surface: "/docs/api" },
    ],
    toolCategories: ["OSINT", "Verification", "Archive", "Mapping"],
    guideSlugs: ["getting-started-with-osint", "writing-a-publishable-osint-finding"],
    academyPathSlugs: ["osint-101"],
    tags: ["investigation", "journalism", "research"],
  },
  {
    vertical: "journalism",
    slug: "breaking-news-corroboration",
    title: "Corroborate a breaking-news claim under deadline",
    problem:
      "Decide whether to amplify a breaking-news claim that hasn't yet been confirmed by mainstream wires.",
    workflow: [
      { step: "Trace claim back to its earliest verified upload" },
      { step: "Cross-check against ≥2 independent regional sources", surface: "/sources" },
      { step: "Verify location and timing if visual" },
      { step: "If corroboration < 2 independent sources, label as unconfirmed in lede" },
    ],
    toolCategories: ["Verification", "OSINT", "Archive"],
    guideSlugs: ["verifying-social-media-footage"],
    tags: ["breaking-news", "corroboration", "journalism"],
  },

  // --- humanitarian ---
  {
    vertical: "humanitarian",
    slug: "evacuation-pre-positioning",
    title: "Pre-position evacuation capacity",
    problem:
      "Decide where to stage transport, medical, and shelter capacity based on observed and forecast event mix.",
    workflow: [
      { step: "Identify regions with elevated severity over the past 14 days", surface: "/stats" },
      { step: "Cross-reference threat pages for civilian-impact guidance", surface: "/threats" },
      { step: "Set monitoring thresholds per region", surface: "/alerts" },
      { step: "Brief operations teams with the region detail page", surface: "/regions" },
    ],
    toolCategories: ["OSINT", "Mapping", "Geospatial"],
    threatSlugs: ["humanitarian-corridor-attacks", "energy-grid-attacks"],
    tags: ["evacuation", "humanitarian", "pre-positioning"],
  },
  {
    vertical: "humanitarian",
    slug: "documenting-civilian-harm",
    title: "Document civilian harm for accountability",
    problem:
      "Preserve chain-of-custody for evidence of civilian harm, with provenance suitable for legal review.",
    workflow: [
      { step: "Archive primary-source material immediately" },
      { step: "Geolocate to the smallest defensible region" },
      { step: "Record fetched-at and content-hash for each artifact" },
      { step: "Submit corroborated findings to legal partners" },
    ],
    toolCategories: ["Verification", "Archive", "OSINT"],
    threatSlugs: ["humanitarian-corridor-attacks", "energy-grid-attacks"],
    guideSlugs: ["verifying-social-media-footage", "writing-a-publishable-osint-finding"],
    academyPathSlugs: ["verification-workflow", "osint-101"],
    tags: ["accountability", "documentation", "humanitarian"],
  },
  {
    vertical: "humanitarian",
    slug: "cluster-munitions-tracking",
    title: "Track cluster-munition incidents",
    problem:
      "Maintain a curated list of suspected and confirmed cluster-munition incidents for advocacy and demining priority-setting.",
    workflow: [
      { step: "Subscribe to civilian-alert + humanitarian topic feeds", surface: "/topics/civilian_alert/feed.xml" },
      { step: "Filter incidents by confidence ≥ 0.7" },
      { step: "Maintain a tagged dossier in your case-management tool" },
    ],
    toolCategories: ["OSINT", "Verification", "Archive"],
    tags: ["cluster-munitions", "humanitarian", "tracking"],
  },

  // --- financial ---
  {
    vertical: "financial",
    slug: "sanctions-screening",
    title: "Screen counterparties against sanctions-evasion signals",
    problem:
      "Identify shipping, corporate-structure, and trade-data signals that suggest counterparty involvement in sanctions evasion.",
    workflow: [
      { step: "Watch maritime AIS-spoofing patterns", surface: "/threats/ais-spoofing" },
      { step: "Cross-check corporate filings against known front-company clusters" },
      { step: "Subscribe to maritime + economic topic feeds" },
    ],
    toolCategories: ["Corporate Data", "Maritime", "OSINT", "Verification"],
    threatSlugs: ["ais-spoofing"],
    tags: ["sanctions", "financial", "compliance"],
  },
  {
    vertical: "financial",
    slug: "commodity-flow-monitoring",
    title: "Monitor commodity flows under sanctions",
    problem:
      "Track shipping movement, port activity, and warehouse signals for commodities under sanctions regimes.",
    workflow: [
      { step: "Pull current vessel positions + dark-fleet indicators" },
      { step: "Overlay onto port-activity satellite imagery" },
      { step: "Flag transshipment patterns with auto-alerts" },
    ],
    toolCategories: ["Maritime", "Satellite Imagery", "Corporate Data", "OSINT"],
    threatSlugs: ["ais-spoofing"],
    tags: ["commodities", "financial", "monitoring"],
  },
  {
    vertical: "financial",
    slug: "insurance-war-risk",
    title: "Model war-risk for insurance underwriting",
    problem:
      "Convert evolving event mix into actuarial inputs for war-risk insurance pricing in affected geographies.",
    workflow: [
      { step: "Pull region-scoped event counts and severity trends" },
      { step: "Map kinetic event density to insured-asset locations" },
      { step: "Re-price quarterly based on observed vs. forecast deltas" },
    ],
    toolCategories: ["OSINT", "Geospatial", "Mapping", "Corporate Data"],
    threatSlugs: ["long-range-missile-strikes", "energy-grid-attacks"],
    tags: ["insurance", "financial", "war-risk"],
  },

  // --- analysts ---
  {
    vertical: "analysts",
    slug: "geolocation",
    title: "Geolocate conflict photographs and videos",
    problem:
      "An OSINT analyst needs to pinpoint where a photo or video was taken using visual landmarks, terrain features, and satellite imagery cross-reference.",
    workflow: [
      { step: "Open the event on the map and review existing geolocation metadata", surface: "/map" },
      { step: "Use Bellingcat-style landmark matching against OpenStreetMap and Google Maps satellite" },
      { step: "Apply SunCalc for shadow analysis to corroborate the timestamp" },
      { step: "Assign a precision class (exact / approximate / region) based on matched features" },
      { step: "Submit a correction or new event with the verified coordinates via the API", surface: "/docs/api" },
    ],
    toolCategories: ["Geospatial", "Satellite Imagery", "OSINT", "Verification"],
    threatSlugs: ["shahed-strikes"],
    guideSlugs: ["geolocating-a-photograph"],
    academyPathSlugs: ["geolocation-fundamentals", "ai-for-analysts"],
    tags: ["geolocation", "analysts", "imagery"],
  },
  {
    vertical: "analysts",
    slug: "anomaly-detection",
    title: "Detect anomalies in the event feed",
    problem:
      "Spot unusual spikes, geographic shifts, or class-composition changes before they become obvious — early warning for analysts and their editors.",
    workflow: [
      { step: "Pull the past-7-day and past-30-day event counts by region and class via the API", surface: "/docs/api" },
      { step: "Calculate per-class rolling baselines and flag deviations > 2σ" },
      { step: "Cross-check suspected anomalies against the sources index for collection gaps", surface: "/sources" },
      { step: "Write a brief note via the investigation workflow if the anomaly proves genuine", surface: "/investigations" },
    ],
    toolCategories: ["OSINT", "Verification", "Archive"],
    tags: ["anomaly", "analysts", "monitoring"],
  },
  {
    vertical: "analysts",
    slug: "api-access",
    title: "Integrate Aegis Lens data into your analysis pipeline",
    problem:
      "A data team or independent analyst wants to pull verified event data programmatically for notebooks, dashboards, or custom alerting.",
    workflow: [
      { step: "Generate an API key in account settings", surface: "/account" },
      { step: "Review rate limits and pagination conventions", surface: "/docs/rate-limits" },
      { step: "Pull events with GET /v1/events using min_confidence and class filters", surface: "/docs/api" },
      { step: "Subscribe to a topic RSS feed for lightweight realtime ingestion", surface: "/docs/api" },
      { step: "Download the full events dataset for offline analysis", surface: "/datasets/events" },
    ],
    toolCategories: ["OSINT", "Geospatial", "Mapping", "Verification"],
    guideSlugs: ["reading-satellite-imagery"],
    tags: ["api", "analysts", "integration"],
  },

  // --- security ---
  {
    vertical: "security",
    slug: "travel-risk",
    title: "Assess travel risk before deployment",
    problem:
      "Corporate security teams and travel risk managers need a current, objective risk picture for a country or city before sending employees or contractors.",
    workflow: [
      { step: "Open the region page for the destination country", surface: "/regions" },
      { step: "Review the KPI strip: event count, severity index, top event class" },
      { step: "Filter the map for the past 30 days in the destination admin-1 region", surface: "/map" },
      { step: "Check threat pages for relevant threat profiles (kinetic, cyber, kidnap)", surface: "/threats" },
      { step: "Set a webhook or email alert for any critical-severity event in the region", surface: "/alerts" },
    ],
    toolCategories: ["Geospatial", "Mapping", "OSINT", "Satellite Imagery"],
    threatSlugs: ["shahed-strikes"],
    tags: ["travel-risk", "security", "duty-of-care"],
  },
  {
    vertical: "security",
    slug: "asset-protection",
    title: "Protect physical assets in conflict-adjacent areas",
    problem:
      "Facility security managers need real-time awareness of incidents near specific coordinates and automated notification before an incident escalates.",
    workflow: [
      { step: "Register asset coordinates as a watch area", surface: "/alerts" },
      { step: "Set a minimum danger score and event-class filter for the alert" },
      { step: "Wire the webhook to your physical security operations centre" },
      { step: "Pull the energy-attack and infrastructure threat profiles for mitigation planning", surface: "/threats" },
      { step: "Download event data for quarterly risk review", surface: "/datasets" },
    ],
    toolCategories: ["Geospatial", "Mapping", "OSINT", "Verification"],
    threatSlugs: ["energy-grid-attacks"],
    tags: ["asset-protection", "security", "critical-infrastructure"],
  },
  {
    vertical: "security",
    slug: "threat-intel",
    title: "Build a conflict-zone threat intelligence brief",
    problem:
      "Security analysts need to produce a structured threat intelligence brief for a region, with verified events, actor assessments, and trend data.",
    workflow: [
      { step: "Pull region-scoped events for the past 30 days", surface: "/docs/api" },
      { step: "Group events by class and identify top-3 threat categories" },
      { step: "Cross-link to relevant threat profile pages for actor and equipment detail", surface: "/threats" },
      { step: "Review the conflicts page for current status and diplomatic context", surface: "/conflicts" },
      { step: "Pull entity pages for named organisations and platforms cited in events", surface: "/entities" },
      { step: "Export as a structured JSON or cite the dataset DOI in the brief", surface: "/datasets" },
    ],
    toolCategories: ["OSINT", "Geospatial", "Verification", "Archive"],
    threatSlugs: ["shahed-strikes", "long-range-missile-strikes"],
    tags: ["threat-intel", "security", "brief"],
  },

  // --- civilians ---
  {
    vertical: "civilians",
    slug: "safety-near-me",
    title: "Check current safety in your area",
    problem:
      "A civilian in or near a conflict zone needs to quickly understand the current situation in their neighbourhood or city.",
    workflow: [
      { step: "Open the live map and allow location access or enter your city", surface: "/map" },
      { step: "Filter by the past 24 hours and minimum danger score 40" },
      { step: "Read the region page for your oblast for a full KPI summary", surface: "/regions" },
      { step: "Check the air-defence and shelter threat pages for local guidance", surface: "/threats" },
    ],
    toolCategories: ["Mapping", "Geospatial"],
    tags: ["safety", "civilians", "shelter"],
  },
  {
    vertical: "civilians",
    slug: "family-watchlist",
    title: "Monitor safety for family members in another region",
    problem:
      "A person outside a conflict zone wants to receive alerts when incidents occur near where their family members live.",
    workflow: [
      { step: "Find the region page for your family's city or oblast", surface: "/regions" },
      { step: "Click Subscribe to create an alert subscription for that region" },
      { step: "Set a minimum danger score and select the event classes that matter most" },
      { step: "Choose email or webhook delivery; no account required for basic email alerts" },
    ],
    toolCategories: ["Mapping"],
    tags: ["family", "civilians", "watchlist", "alerts"],
  },
];

export function listTasksFor(vertical: UseCaseVertical): UseCaseTask[] {
  return USE_CASE_TASKS.filter((t) => t.vertical === vertical);
}

export function listAllTasks(): UseCaseTask[] {
  return USE_CASE_TASKS.slice();
}

export function getTask(
  vertical: string,
  slug: string,
): UseCaseTask | null {
  return (
    USE_CASE_TASKS.find(
      (t) => t.vertical === vertical && t.slug === slug,
    ) ?? null
  );
}

export const VERTICAL_LABEL: Record<UseCaseVertical, string> = {
  defense: "Defense & military",
  journalism: "Journalism & OSINT",
  humanitarian: "Humanitarian & NGOs",
  financial: "Financial services",
  analysts: "Intelligence analysts",
  security: "Corporate security",
  civilians: "Civilians & families",
};

export const VERTICAL_BLURB: Record<UseCaseVertical, string> = {
  defense: "Situational awareness, battle damage assessment, and force-protection alerts for ministries and operational staff.",
  journalism: "Lead generation, verification, and source corroboration for newsrooms and investigative collectives.",
  humanitarian: "Pre-positioning, evacuation planning, and explosive-ordnance tracking for UN agencies, ICRC, and field NGOs.",
  financial: "Shipping disruption, commodity supply, sanctions-evasion detection, and war-risk modelling for traders and underwriters.",
  analysts: "Geolocation workflows, anomaly detection, and API-first integration for OSINT researchers and data teams.",
  security: "Travel risk assessment, asset protection, and threat intelligence briefs for corporate security operations.",
  civilians: "Real-time safety checks and family watchlist alerts for people in or near conflict zones.",
};
