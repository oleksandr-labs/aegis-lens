/**
 * Source record types for CERT-UA + SSSCIP cyber-incident ingestion.
 *
 * Primary sources:
 *   - CERT-UA  (cert.gov.ua)  — Computer Emergency Response Team of Ukraine.
 *                               Advisories ("Оповіщення") + RSS + Telegram (@certua).
 *   - SSSCIP   (cip.gov.ua)   — State Service of Special Communications and
 *                               Information Protection. Strategic-comms cyber announcements.
 *   - MISP / StateWatch feeds — threat-intel sharing (lawful access only — see COMPLIANCE.md).
 *
 * IMPORTANT — CADENCE: cyber events are RETROSPECTIVE. A published advisory typically
 * describes activity that occurred days to weeks earlier. Latency is measured in DAYS,
 * not seconds. This is encoded in the adapter cadence and in the display expectations
 * (`update_cadence_label`) — do NOT present this feed as real-time.
 */

// ── Region codes (shared with the air-raid / oblast model) ────────────────────

/** ISO 3166-2:UA oblast codes + Kyiv city (subset used by cyber sector mapping). */
export type RegionCode =
  | "UA-43" | "UA-71" | "UA-74" | "UA-77" | "UA-12" | "UA-14" | "UA-26"
  | "UA-63" | "UA-65" | "UA-68" | "UA-35" | "UA-30" | "UA-32" | "UA-09"
  | "UA-46" | "UA-48" | "UA-51" | "UA-53" | "UA-56" | "UA-40" | "UA-59"
  | "UA-61" | "UA-05" | "UA-07" | "UA-21" | "UA-23" | "UA-18"
  | "UA-ALL"; // nationwide / no single region

export interface RegionInfo {
  code: RegionCode;
  nameUk: string;
  nameEn: string;
  /** Approximate center [lon, lat] */
  center: [number, number];
}

/** Centroids for region-level cyber intensity choropleth. */
export const CYBER_REGIONS: Record<RegionCode, RegionInfo> = {
  "UA-ALL": { code: "UA-ALL", nameUk: "Уся Україна",        nameEn: "Nationwide",        center: [31.0, 49.0] },
  "UA-43":  { code: "UA-43",  nameUk: "АРК",                nameEn: "Crimea",            center: [34.10, 45.31] },
  "UA-71":  { code: "UA-71",  nameUk: "Черкаська",          nameEn: "Cherkasy",          center: [31.97, 49.44] },
  "UA-74":  { code: "UA-74",  nameUk: "Чернігівська",       nameEn: "Chernihiv",         center: [31.29, 51.50] },
  "UA-77":  { code: "UA-77",  nameUk: "Чернівецька",        nameEn: "Chernivtsi",        center: [25.94, 48.29] },
  "UA-12":  { code: "UA-12",  nameUk: "Дніпропетровська",   nameEn: "Dnipropetrovsk",    center: [35.04, 48.46] },
  "UA-14":  { code: "UA-14",  nameUk: "Донецька",           nameEn: "Donetsk",           center: [37.80, 48.01] },
  "UA-26":  { code: "UA-26",  nameUk: "Івано-Франківська",  nameEn: "Ivano-Frankivsk",   center: [24.71, 48.92] },
  "UA-63":  { code: "UA-63",  nameUk: "Харківська",         nameEn: "Kharkiv",           center: [36.23, 49.99] },
  "UA-65":  { code: "UA-65",  nameUk: "Херсонська",         nameEn: "Kherson",           center: [32.61, 46.64] },
  "UA-68":  { code: "UA-68",  nameUk: "Хмельницька",        nameEn: "Khmelnytskyi",      center: [26.99, 49.42] },
  "UA-35":  { code: "UA-35",  nameUk: "Кіровоградська",     nameEn: "Kirovohrad",        center: [32.26, 48.51] },
  "UA-30":  { code: "UA-30",  nameUk: "Київ",               nameEn: "Kyiv city",         center: [30.52, 50.45] },
  "UA-32":  { code: "UA-32",  nameUk: "Київська",           nameEn: "Kyiv oblast",       center: [30.57, 50.07] },
  "UA-09":  { code: "UA-09",  nameUk: "Луганська",          nameEn: "Luhansk",           center: [38.92, 48.57] },
  "UA-46":  { code: "UA-46",  nameUk: "Львівська",          nameEn: "Lviv",              center: [24.03, 49.84] },
  "UA-48":  { code: "UA-48",  nameUk: "Миколаївська",       nameEn: "Mykolaiv",          center: [31.99, 47.05] },
  "UA-51":  { code: "UA-51",  nameUk: "Одеська",            nameEn: "Odesa",             center: [30.74, 46.49] },
  "UA-53":  { code: "UA-53",  nameUk: "Полтавська",         nameEn: "Poltava",           center: [34.55, 49.59] },
  "UA-56":  { code: "UA-56",  nameUk: "Рівненська",         nameEn: "Rivne",             center: [26.25, 50.62] },
  "UA-40":  { code: "UA-40",  nameUk: "Севастополь",        nameEn: "Sevastopol",        center: [33.53, 44.60] },
  "UA-59":  { code: "UA-59",  nameUk: "Сумська",            nameEn: "Sumy",              center: [34.80, 51.02] },
  "UA-61":  { code: "UA-61",  nameUk: "Тернопільська",      nameEn: "Ternopil",          center: [25.60, 49.55] },
  "UA-05":  { code: "UA-05",  nameUk: "Вінницька",          nameEn: "Vinnytsia",         center: [28.47, 49.23] },
  "UA-07":  { code: "UA-07",  nameUk: "Волинська",          nameEn: "Volyn",             center: [25.33, 51.25] },
  "UA-21":  { code: "UA-21",  nameUk: "Закарпатська",       nameEn: "Zakarpattia",       center: [22.29, 48.62] },
  "UA-23":  { code: "UA-23",  nameUk: "Запорізька",         nameEn: "Zaporizhzhia",      center: [35.17, 47.84] },
  "UA-18":  { code: "UA-18",  nameUk: "Житомирська",        nameEn: "Zhytomyr",          center: [28.66, 50.25] },
};

// ── Sectors ───────────────────────────────────────────────────────────────────

/** Critical-infrastructure sectors tracked for cyber threat tagging. */
export type Sector =
  | "energy"
  | "telecom"
  | "finance"
  | "gov"
  | "media"
  | "transport"
  | "defense"
  | "healthcare"
  | "other";

export const SECTOR_LABELS: Record<Sector, { en: string; uk: string }> = {
  energy:     { en: "Energy",            uk: "Енергетика" },
  telecom:    { en: "Telecom",           uk: "Телеком" },
  finance:    { en: "Finance / Banking", uk: "Фінанси / банки" },
  gov:        { en: "Government",         uk: "Державний сектор" },
  media:      { en: "Media",             uk: "ЗМІ" },
  transport:  { en: "Transport",         uk: "Транспорт" },
  defense:    { en: "Defense",           uk: "Оборона" },
  healthcare: { en: "Healthcare",        uk: "Охорона здоров'я" },
  other:      { en: "Other",             uk: "Інше" },
};

// ── Source enumeration ─────────────────────────────────────────────────────────

export type CyberSource = "cert_ua" | "ssscip" | "misp";

export const SOURCE_HOMEPAGES: Record<CyberSource, string> = {
  cert_ua: "https://cert.gov.ua",
  ssscip:  "https://cip.gov.ua",
  misp:    "https://www.misp-project.org",
};

// ── Advisory severity ──────────────────────────────────────────────────────────

/** CERT-UA / SSSCIP advisory severity (maps to canonical 1–5). */
export type AdvisorySeverity = "info" | "low" | "medium" | "high" | "critical";

export const SEVERITY_RANK: Record<AdvisorySeverity, 1 | 2 | 3 | 4 | 5> = {
  info: 1,
  low: 2,
  medium: 3,
  high: 4,
  critical: 5,
};

// ── IOC model ──────────────────────────────────────────────────────────────────

/** Indicator-of-Compromise type. */
export type IocType =
  | "ipv4"
  | "ipv6"
  | "domain"
  | "url"
  | "md5"
  | "sha1"
  | "sha256"
  | "email"
  | "cve";

export interface Ioc {
  type: IocType;
  /** Normalized value (e.g. lower-cased domain, de-fanged form restored). */
  value: string;
  /** Source advisory id this IOC was extracted from. */
  advisoryId?: string;
  /** Free-text role/context, if available (e.g. "C2 server", "phishing domain"). */
  context?: string;
}

// ── Raw advisory record ────────────────────────────────────────────────────────

/** A single advisory as published by CERT-UA / SSSCIP (RSS item or page). */
export interface CertAdvisory {
  /** Stable id — e.g. CERT-UA#NNNN, or a hash of the URL. */
  advisoryId: string;
  source: CyberSource;
  titleUk: string;
  titleEn?: string;
  /** Full advisory body text (Ukrainian, possibly with technical sections). */
  bodyText: string;
  url: string;
  /** Date the advisory was PUBLISHED (ISO-8601). */
  publishedAt: string;
  /** Date the underlying activity is believed to have OCCURRED, if stated. */
  occurredAt?: string;
  severity: AdvisorySeverity;
  /** Sectors named/inferred in the advisory. */
  sectors: Sector[];
  /** Regions named/inferred in the advisory. Defaults to ["UA-ALL"]. */
  regions: RegionCode[];
  /** Threat-actor / group attribution as stated (e.g. "UAC-0010 / Gamaredon"). */
  actor?: string;
  /** IOCs extracted from the body (filled by ioc-extractor). */
  iocs?: Ioc[];
  /** CVE ids referenced (filled by cve-xref). */
  cveIds?: string[];
  /** Original Telegram message id, if ingested via Telegram bridge. */
  telegramMessageId?: number;
}

// ── MISP model (lawful-access threat-intel sharing) ────────────────────────────

/** Minimal MISP event/attribute model (see misp-client.ts + COMPLIANCE.md). */
export interface MispAttribute {
  uuid: string;
  /** MISP attribute type, e.g. "ip-dst", "domain", "sha256". */
  type: string;
  category: string;
  value: string;
  to_ids: boolean;
  comment?: string;
}

export interface MispEvent {
  uuid: string;
  info: string;
  date: string;
  /** Threat level: 1 high, 2 medium, 3 low, 4 undefined. */
  threat_level_id: "1" | "2" | "3" | "4";
  /** Analysis: 0 initial, 1 ongoing, 2 completed. */
  analysis: "0" | "1" | "2";
  /** Traffic Light Protocol sharing tag (governs republication — see COMPLIANCE.md). */
  tlp: "white" | "clear" | "green" | "amber" | "red";
  Attribute: MispAttribute[];
}
