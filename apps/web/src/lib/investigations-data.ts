/**
 * investigations-data.ts
 *
 * Extended investigation records that augment investigations-seed.ts with
 * structured timeline entries, typed sources, status tracking, and multiple
 * authors. These records are keyed by slug and merged at render time.
 *
 * Synthetic demo data only — not real intelligence.
 */

export type InvestigationStatus = "ongoing" | "concluded" | "archived";

export type SourceType = "telegram" | "official" | "video" | "satellite" | "report";

export type TimelineEntry = {
  date: string;
  event: string;
  source: string;
};

export type TypedSource = {
  name: string;
  url: string;
  type: SourceType;
};

export type InvestigationData = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  authors: string[];
  status: InvestigationStatus;
  tags: string[];
  summary: string;
  eventIds: string[];
  keyFindings: string[];
  timeline: TimelineEntry[];
  sources: TypedSource[];
  relatedSlugs: string[];
};

export const INVESTIGATIONS_DATA: InvestigationData[] = [
  {
    slug: "kharkiv-strikes-q2-2026",
    title: "Kharkiv Oblast Strikes — Q2 2026",
    subtitle:
      "A systematic analysis of strike patterns in Kharkiv Oblast from April to June 2026",
    date: "2026-06-01",
    authors: ["Aegis OSINT Team", "Bellingcat Network"],
    status: "ongoing",
    tags: ["military_action", "drone", "kharkiv"],
    summary:
      "This investigation documents and verifies reported strikes in Kharkiv Oblast during Q2 2026, cross-referencing SES alerts, satellite imagery, and OSINT sources to establish patterns and assess civilian impact.",
    eventIds: ["01HXKHARKIVDRONE001"],
    keyFindings: [
      "47 verified strike events in the period, concentrated in northern districts",
      "Drone activity increased 34% week-over-week in May 2026",
      "3 industrial facilities confirmed damaged via satellite imagery",
      "Average warning time before alerts: 4.2 minutes",
    ],
    timeline: [
      {
        date: "2026-06-01",
        event: "Investigation ongoing — new satellite imagery analyzed",
        source: "Sentinel-2",
      },
      {
        date: "2026-05-28",
        event:
          "34% weekly increase in drone events confirmed by OSINT cross-reference",
        source: "Multiple Telegram",
      },
      {
        date: "2026-05-20",
        event: "3rd industrial facility damage confirmed via satellite",
        source: "Planet Labs",
      },
      {
        date: "2026-05-10",
        event: "Investigation opened after anomaly detection flagged cluster",
        source: "Aegis AI",
      },
    ],
    sources: [
      {
        name: "Kharkiv SES Telegram",
        url: "https://t.me/dsns_kharkiv",
        type: "telegram",
      },
      {
        name: "UA Air Force Telegram",
        url: "https://t.me/kpszsu",
        type: "official",
      },
      {
        name: "Sentinel-2 imagery (ESA)",
        url: "https://apps.sentinel-hub.com",
        type: "satellite",
      },
      {
        name: "ISW Daily Assessment",
        url: "https://understandingwar.org",
        type: "report",
      },
    ],
    relatedSlugs: ["black-sea-drone-patterns"],
  },
  {
    slug: "black-sea-drone-patterns",
    title: "Black Sea Maritime Drone Patterns",
    subtitle:
      "Tracking surface drone deployment routes and attack patterns in the Black Sea",
    date: "2026-05-15",
    authors: ["Maritime Desk"],
    status: "concluded",
    tags: ["maritime", "drone", "black-sea"],
    summary:
      "Analysis of documented surface drone deployments in the Black Sea, reconstructing launch geometries and attack patterns from AIS data, satellite imagery, and open-source reporting.",
    eventIds: [],
    keyFindings: [
      "14 confirmed surface drone incidents in Q1 2026",
      "Primary launch points identified via trajectory analysis",
      "AIS data anomalies correlated with 3 undeclared incidents",
    ],
    timeline: [
      {
        date: "2026-05-15",
        event: "Investigation concluded — final report published",
        source: "Aegis Maritime",
      },
      {
        date: "2026-04-30",
        event: "AIS correlation analysis completed",
        source: "AISStream",
      },
      {
        date: "2026-04-15",
        event: "Trajectory reconstruction of 8 incidents",
        source: "Satellite + AIS",
      },
    ],
    sources: [
      {
        name: "AISStream.io data",
        url: "https://aisstream.io",
        type: "official",
      },
      {
        name: "Sentinel-1 SAR imagery",
        url: "https://scihub.copernicus.eu",
        type: "satellite",
      },
    ],
    relatedSlugs: ["kharkiv-strikes-q2-2026"],
  },
  // Entries below mirror existing seed slugs and enrich them with status/timeline/typed sources
  {
    slug: "iran-russia-drone-supply-chain",
    title: "Iran–Russia drone supply chain",
    subtitle:
      "Corporate and logistical structures moving Iranian UAV components to Russian assembly lines",
    date: "2026-04-18",
    authors: ["M. Korol", "S. Marchenko", "T. Adeyemi"],
    status: "concluded",
    tags: ["UAV", "sanctions", "supply-chain", "Iran", "Russia"],
    summary:
      "Traces component flows, shipping manifests, and front-company structures behind Shahed-family UAV deliveries used in long-range strikes against Ukrainian infrastructure.",
    eventIds: ["01HXKHARKIVDRONE001", "01HXSUMYDRONE001"],
    keyFindings: [
      "14 front companies in UAE and Hong Kong acted as intermediaries for engine and microcontroller shipments",
      "Engine variants match production-line markings from a single Iranian facility",
      "Sanctions evasion relies on three commodity codes under-enforced at transshipment points",
    ],
    timeline: [
      {
        date: "2026-04-18",
        event: "Investigation published with DOI 10.57967/aegis.2026.0001",
        source: "Aegis Editorial",
      },
      {
        date: "2026-04-10",
        event: "Director-overlap evidence confirmed across 9 of 14 intermediaries",
        source: "Corporate registry cross-reference",
      },
      {
        date: "2026-03-20",
        event: "Engine serial-prefix correlation completed",
        source: "Conflict Armament Research",
      },
      {
        date: "2026-03-01",
        event: "Investigation opened — bill-of-lading anomaly flagged",
        source: "Trade data platform",
      },
    ],
    sources: [
      {
        name: "Conflict Armament Research field reports",
        url: "https://www.conflictarm.com",
        type: "report",
      },
      {
        name: "RUSI Open-Source Intelligence Programme",
        url: "https://www.rusi.org",
        type: "report",
      },
      {
        name: "Bellingcat — drone component teardowns",
        url: "https://www.bellingcat.com",
        type: "report",
      },
    ],
    relatedSlugs: ["shahed-launch-site-network", "black-sea-drone-patterns"],
  },
  {
    slug: "black-sea-magura-usv-operations",
    title: "Black Sea Magura USV operations",
    subtitle:
      "Open-source reconstruction of unmanned surface vessel sorties against Russian naval assets",
    date: "2026-03-12",
    authors: ["T. Marchenko", "P. Oleksiienko", "K. Hassan"],
    status: "concluded",
    tags: ["USV", "naval", "Black Sea", "OSINT"],
    summary:
      "Open-source reconstruction of unmanned surface vessel sorties against Russian naval assets, including launch geography, payload evolution, and attribution patterns.",
    eventIds: [],
    keyFindings: [
      "Launch geometry shifted progressively westward since mid-2024",
      "Payload mass per sortie roughly doubled across three platform generations",
      "~70% high-confidence attribution rate combining MoD statements and debris analysis",
    ],
    timeline: [
      {
        date: "2026-03-12",
        event: "Investigation concluded and published",
        source: "Aegis Maritime Desk",
      },
      {
        date: "2026-03-01",
        event: "Gen-3 platform profile finalised from waterline photography",
        source: "H I Sutton / Covert Shores",
      },
      {
        date: "2026-02-15",
        event: "AIS correlation for 14 sorties completed",
        source: "AISStream.io",
      },
    ],
    sources: [
      {
        name: "Naval News — Black Sea coverage",
        url: "https://www.navalnews.com",
        type: "report",
      },
      {
        name: "Ukrainian GUR public briefings",
        url: "https://gur.gov.ua",
        type: "official",
      },
      {
        name: "H I Sutton — Covert Shores",
        url: "http://www.hisutton.com",
        type: "report",
      },
    ],
    relatedSlugs: ["black-sea-drone-patterns", "crimea-bridge-infrastructure"],
  },
  {
    slug: "shahed-launch-site-network",
    title: "Shahed launch site network",
    subtitle:
      "Recurring launch geometries and dispersal patterns for one-way attack drones in the 2025–2026 winter campaign",
    date: "2026-01-11",
    authors: ["S. Hrytsenko"],
    status: "archived",
    tags: ["UAV", "geolocation", "strike-network"],
    summary:
      "Identifies recurring launch geometries and dispersal patterns for one-way attack drones operating from occupied and Russian territory across the 2025–2026 winter campaign.",
    eventIds: [],
    keyFindings: [
      "5 primary launch areas account for ~80% of observed sorties",
      "Deliberate decoy-to-live-munitions mix to saturate air-defense capacity",
      "Dispersal between salvos increases after high-attrition nights — adaptive counter-targeting",
    ],
    timeline: [
      {
        date: "2026-01-11",
        event: "Investigation published and archived",
        source: "Aegis Editorial",
      },
      {
        date: "2026-01-05",
        event: "Salvo-spacing analysis finalized",
        source: "Ukrainian Air Force summaries",
      },
      {
        date: "2025-12-20",
        event: "Launch geometry clustering completed across campaign window",
        source: "OSINT-Defender geolocation",
      },
    ],
    sources: [
      {
        name: "Ukrainian Air Force operational summaries",
        url: "https://www.zsu.gov.ua",
        type: "official",
      },
      {
        name: "DefMon / DefenseMonitor open-source reporting",
        url: "https://defmon.substack.com",
        type: "report",
      },
      {
        name: "OSINT-Defender geolocation threads",
        url: "https://twitter.com/sentdefender",
        type: "report",
      },
    ],
    relatedSlugs: ["iran-russia-drone-supply-chain"],
  },
];

/** Look up extended data by slug. Returns null if no entry exists. */
export function getInvestigationData(slug: string): InvestigationData | null {
  return INVESTIGATIONS_DATA.find((d) => d.slug === slug) ?? null;
}

/** Status badge display config. */
export const STATUS_CONFIG: Record<
  InvestigationStatus,
  { label: string; color: string }
> = {
  ongoing: { label: "Ongoing", color: "text-orange-400" },
  concluded: { label: "Concluded", color: "text-text-muted" },
  archived: { label: "Archived", color: "text-text-muted" },
};

/** Emoji icon per source type. */
export const SOURCE_TYPE_ICON: Record<SourceType, string> = {
  telegram: "📡",
  official: "🏛",
  video: "🎥",
  satellite: "🛰",
  report: "📄",
};
