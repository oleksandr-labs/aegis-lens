/**
 * Structured source registry for Aegis Lens.
 * Replaces the simpler sources-public-seed.ts with typed tiers,
 * freshness metrics, event counts, and topic coverage.
 *
 * Sprint 2: replace with DB-backed source registry + live ingestion stats.
 */

export type SourceType =
  | "telegram"
  | "official"
  | "ngo"
  | "research"
  | "satellite"
  | "ais"
  | "rss"
  | "api"
  | "social";

export type SourceTier = "tier1" | "tier2" | "tier3"; // trust tiers

export type Source = {
  slug: string;
  name: string;
  type: SourceType;
  tier: SourceTier;
  country: string; // ISO 2
  language: string;
  description: string;
  url: string;
  topics: string[]; // event class ids from ALL_CLASSES
  activeStatus: "active" | "unreliable" | "inactive";
  eventCount: number; // approximate events ingested
  freshnessMinutes: number; // avg update frequency
  verified: boolean;
};

export const SOURCES: Source[] = [
  {
    slug: "ukraine-genstaff",
    name: "Ukraine General Staff",
    type: "official",
    tier: "tier1",
    country: "ua",
    language: "uk",
    description:
      "Official Ukrainian Armed Forces operational updates via Telegram and website.",
    url: "https://t.me/GeneralStaff_ua",
    topics: ["military_action"],
    activeStatus: "active",
    eventCount: 14200,
    freshnessMinutes: 60,
    verified: true,
  },
  {
    slug: "isw-daily",
    name: "ISW Daily Assessment",
    type: "research",
    tier: "tier1",
    country: "us",
    language: "en",
    description:
      "Institute for the Study of War — daily conflict assessments with maps and analysis.",
    url: "https://understandingwar.org",
    topics: ["military_action", "political"],
    activeStatus: "active",
    eventCount: 8900,
    freshnessMinutes: 1440,
    verified: true,
  },
  {
    slug: "deepstatemap",
    name: "DeepStateMAP",
    type: "ngo",
    tier: "tier1",
    country: "ua",
    language: "uk",
    description:
      "Ukrainian volunteer team tracking frontline positions and military events.",
    url: "https://deepstatemap.live",
    topics: ["military_action"],
    activeStatus: "active",
    eventCount: 32000,
    freshnessMinutes: 30,
    verified: true,
  },
  {
    slug: "alerts-in-ua",
    name: "alerts.in.ua",
    type: "api",
    tier: "tier1",
    country: "ua",
    language: "uk",
    description:
      "Official air raid alert API for all Ukrainian oblasts. Sub-minute latency.",
    url: "https://alerts.in.ua",
    topics: ["civilian_alert"],
    activeStatus: "active",
    eventCount: 89000,
    freshnessMinutes: 1,
    verified: true,
  },
  {
    slug: "nasa-firms",
    name: "NASA FIRMS",
    type: "satellite",
    tier: "tier1",
    country: "us",
    language: "en",
    description:
      "Fire Information for Resource Management System — near real-time fire data from MODIS and VIIRS.",
    url: "https://firms.modaps.eosdis.nasa.gov",
    topics: ["environmental", "military_action"],
    activeStatus: "active",
    eventCount: 12000,
    freshnessMinutes: 180,
    verified: true,
  },
  {
    slug: "ua-dsns",
    name: "ДСНС Ukraine (SES)",
    type: "official",
    tier: "tier1",
    country: "ua",
    language: "uk",
    description:
      "State Emergency Service of Ukraine — rescue operations, civilian incidents.",
    url: "https://t.me/dsns_telegram",
    topics: ["civilian_alert", "humanitarian"],
    activeStatus: "active",
    eventCount: 6700,
    freshnessMinutes: 120,
    verified: true,
  },
  {
    slug: "uas-tracker",
    name: "UAControlMap",
    type: "ngo",
    tier: "tier2",
    country: "ua",
    language: "uk",
    description: "Volunteer tracking of UAV activity and routes.",
    url: "https://t.me/",
    topics: ["military_action"],
    activeStatus: "active",
    eventCount: 4500,
    freshnessMinutes: 15,
    verified: true,
  },
  {
    slug: "opensky",
    name: "OpenSky Network",
    type: "api",
    tier: "tier2",
    country: "ch",
    language: "en",
    description: "ADS-B flight tracking network — aviation position data.",
    url: "https://opensky-network.org",
    topics: ["aviation"],
    activeStatus: "active",
    eventCount: 28000,
    freshnessMinutes: 5,
    verified: true,
  },
  {
    slug: "sentinel-hub",
    name: "Sentinel Hub (ESA)",
    type: "satellite",
    tier: "tier1",
    country: "eu",
    language: "en",
    description:
      "Copernicus Sentinel-2 optical and Sentinel-1 SAR imagery.",
    url: "https://www.sentinel-hub.com",
    topics: ["infrastructure", "environmental", "military_action"],
    activeStatus: "active",
    eventCount: 3200,
    freshnessMinutes: 720,
    verified: true,
  },
  {
    slug: "cert-ua",
    name: "CERT-UA",
    type: "official",
    tier: "tier1",
    country: "ua",
    language: "uk",
    description:
      "Computer Emergency Response Team of Ukraine — cyber incidents and advisories.",
    url: "https://cert.gov.ua",
    topics: ["cyber"],
    activeStatus: "active",
    eventCount: 890,
    freshnessMinutes: 360,
    verified: true,
  },
];

// ─── Derived helpers ─────────────────────────────────────────────────────────

export function getSource(slug: string): Source | undefined {
  return SOURCES.find((s) => s.slug === slug);
}

export function sourcesByType(type: SourceType): Source[] {
  return SOURCES.filter((s) => s.type === type);
}

export function sourcesByTier(tier: SourceTier): Source[] {
  return SOURCES.filter((s) => s.tier === tier);
}

export function sourcesByTopic(topicId: string): Source[] {
  return SOURCES.filter((s) => s.topics.includes(topicId));
}

/** Total events ingested across all sources */
export const TOTAL_EVENTS = SOURCES.reduce((n, s) => n + s.eventCount, 0);

/** Weighted average freshness in minutes (by event count) */
export const AVG_FRESHNESS_MINUTES = Math.round(
  SOURCES.reduce((sum, s) => sum + s.freshnessMinutes * s.eventCount, 0) /
    TOTAL_EVENTS,
);

/** Human-readable freshness label */
export function freshnessLabel(minutes: number): string {
  if (minutes < 60) return `~${minutes}min`;
  if (minutes < 1440) return `~${Math.round(minutes / 60)}h`;
  return `~${Math.round(minutes / 1440)}d`;
}

export const TYPE_ICON: Record<SourceType, string> = {
  telegram: "📡",
  official: "🏛",
  ngo: "🌍",
  research: "🔬",
  satellite: "🛰",
  ais: "🚢",
  rss: "📰",
  api: "⚡",
  social: "💬",
};

export const TIER_LABEL: Record<SourceTier, string> = {
  tier1: "T1",
  tier2: "T2",
  tier3: "T3",
};

export const TIER_COLOR: Record<SourceTier, string> = {
  tier1: "text-green-400 border-green-700 bg-green-950/40",
  tier2: "text-yellow-400 border-yellow-700 bg-yellow-950/40",
  tier3: "text-slate-400 border-slate-600 bg-slate-900/40",
};

export const STATUS_DOT: Record<Source["activeStatus"], string> = {
  active: "bg-green-500",
  unreliable: "bg-yellow-500",
  inactive: "bg-slate-500",
};

export const TIER_EXPLANATION: Record<SourceTier, string> = {
  tier1:
    "Tier 1 sources are institutionally verified, consistently accurate, and form the backbone of event confidence. Discrepancies from Tier 1 sources trigger human review.",
  tier2:
    "Tier 2 sources are generally reliable but require corroboration from at least one Tier 1 source before an event is marked confirmed.",
  tier3:
    "Tier 3 sources are supplementary signals — useful for early detection but carry higher noise and require multi-source corroboration.",
};
