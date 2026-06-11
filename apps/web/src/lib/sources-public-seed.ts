/**
 * Public OSINT sources seed.
 * Sprint 1.1 placeholder. Sprint 2: DB-backed source registry + ingestion stats.
 */

export type SourcePublic = {
  slug: string;
  name: string;
  kind:
    | "telegram"
    | "satellite"
    | "news"
    | "official_gov"
    | "ova_telegram"
    | "cyber"
    | "academic"
    | "milblogger";
  country: string; // ISO2
  language: string;
  description: string;
  reliability: number; // 0..1
  homepageUrl: string;
};

export const PUBLIC_SOURCES: SourcePublic[] = [
  {
    slug: "alerts-in-ua",
    name: "Alerts.in.ua",
    kind: "ova_telegram",
    country: "UA",
    language: "uk",
    description: "Realtime Ukrainian air-raid alert aggregator sourced from OVA telegram channels.",
    reliability: 0.92,
    homepageUrl: "https://alerts.in.ua",
  },
  {
    slug: "deepstatemap",
    name: "DeepStateMap",
    kind: "official_gov",
    country: "UA",
    language: "uk",
    description: "Ukrainian frontline situational map updated from OSINT and military sources.",
    reliability: 0.88,
    homepageUrl: "https://deepstatemap.live",
  },
  {
    slug: "oryx",
    name: "Oryx",
    kind: "news",
    country: "NL",
    language: "en",
    description: "Photo-verified equipment-loss tracker for the Russo-Ukrainian war.",
    reliability: 0.85,
    homepageUrl: "https://www.oryxspioenkop.com",
  },
  {
    slug: "isw",
    name: "Institute for the Study of War",
    kind: "academic",
    country: "US",
    language: "en",
    description: "Daily campaign assessments and control-of-terrain maps from ISW analysts.",
    reliability: 0.9,
    homepageUrl: "https://www.understandingwar.org",
  },
  {
    slug: "ukrenergo",
    name: "Ukrenergo",
    kind: "official_gov",
    country: "UA",
    language: "uk",
    description: "Ukrainian transmission system operator — official grid status and outage reports.",
    reliability: 0.95,
    homepageUrl: "https://ua.energy",
  },
  {
    slug: "cert-ua",
    name: "CERT-UA",
    kind: "cyber",
    country: "UA",
    language: "uk",
    description: "Computer Emergency Response Team of Ukraine — official cyber-incident advisories.",
    reliability: 0.88,
    homepageUrl: "https://cert.gov.ua",
  },
  {
    slug: "sentinel-2",
    name: "Sentinel-2",
    kind: "satellite",
    country: "EU",
    language: "en",
    description: "Copernicus Sentinel-2 optical imagery — 10m resolution, ~5-day revisit.",
    reliability: 0.78,
    homepageUrl: "https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2",
  },
  {
    slug: "bellingcat",
    name: "Bellingcat",
    kind: "news",
    country: "NL",
    language: "en",
    description: "Investigative OSINT collective — geolocation, verification, and forensic reporting.",
    reliability: 0.9,
    homepageUrl: "https://www.bellingcat.com",
  },
  {
    slug: "hajun-bypol",
    name: "Hajun Project (BYPOL)",
    kind: "milblogger",
    country: "BY",
    language: "ru",
    description: "Belarusian monitoring group tracking military movements through Belarus.",
    reliability: 0.72,
    homepageUrl: "https://hajun.media",
  },
  {
    slug: "un-ocha",
    name: "UN OCHA",
    kind: "academic",
    country: "CH",
    language: "en",
    description: "UN Office for the Coordination of Humanitarian Affairs — situation reports and datasets.",
    reliability: 0.85,
    homepageUrl: "https://www.unocha.org",
  },
];
