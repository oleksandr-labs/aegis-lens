/**
 * Source record + domain types for the UA General Staff + MoD integration.
 *
 * Authorities ingested (official, highest trust tier):
 *   - Генеральний штаб ЗСУ (General Staff of the Armed Forces of Ukraine)
 *     — the standardized daily operational summary ("оперативна інформація").
 *   - Міністерство оборони України / MoD (mod.gov.ua) — press releases.
 *   - Повітряні Сили ЗСУ (Air Force Command) — missile/drone threat posts.
 *   - Військово-Морські Сили ЗСУ (Navy Command).
 *   - Official spokespersons per branch.
 *
 * NEUTRALITY: these are official communications. We INGEST and PRESENT them as
 * structured data (loss tallies, frontline activity, regions) with citation
 * back to the source. We do NOT editorialise or assert the figures as
 * independently verified — they are carried as "official_statement" claims and
 * the divergence module surfaces where OSINT diverges. All user-facing strings
 * carry uk + en (+ de for press). Cyrillic is UTF-8.
 */

// ── Oblast registry (ISO 3166-2 :UA), shared shape across the platform ────────

export type OblastCode =
  | "UA-05" | "UA-07" | "UA-09" | "UA-12" | "UA-14" | "UA-18" | "UA-21"
  | "UA-23" | "UA-26" | "UA-30" | "UA-32" | "UA-35" | "UA-43" | "UA-46"
  | "UA-48" | "UA-51" | "UA-53" | "UA-56" | "UA-59" | "UA-61" | "UA-63"
  | "UA-65" | "UA-68" | "UA-71" | "UA-74" | "UA-77";

export interface OblastInfo {
  code: OblastCode;
  nameUk: string;
  nameEn: string;
  /** [lon, lat] administrative centre. */
  center: [number, number];
}

// ── Military branches + source channels ───────────────────────────────────────

/** The Ukrainian military authority that published a record. */
export type Branch =
  | "general_staff" // Генеральний штаб ЗСУ
  | "mod"           // Міністерство оборони / MoD
  | "air_force"     // Повітряні Сили
  | "navy"          // Військово-Морські Сили
  | "ground_forces" // Сухопутні війська
  | "spokesperson"; // an official spokesperson account (branch noted separately)

export type SourceKind =
  | "site_rss"
  | "site_html"
  | "telegram_channel"
  | "facebook_page";

/** A single configured official source endpoint. */
export interface SourceChannel {
  /** Stable id, e.g. "genstaff_tg" or "mod_site". */
  id: string;
  branch: Branch;
  kind: SourceKind;
  /** Telegram public channel username (no @) when kind === "telegram_channel". */
  telegramUsername?: string;
  /** Facebook page slug when kind === "facebook_page". */
  facebookSlug?: string;
  /** RSS feed / page URL for site_rss / site_html. */
  url?: string;
  nameUk: string;
  nameEn: string;
  /** True only for the genuinely official, verified handle of this authority. */
  official: boolean;
}

/** What kind of communication a raw post represents (drives the pipeline). */
export type CommKind =
  | "daily_summary"   // General Staff standardized daily report
  | "press_release"   // MoD / branch press release
  | "threat_alert"    // Air Force / Navy missile/drone threat post
  | "statement";      // spokesperson / general statement

/** A raw post/article as fetched from an official source (pre-parse). */
export interface RawOfficialPost {
  /** `${channelId}:${externalId}` — stable dedupe key. */
  id: string;
  channelId: string;
  branch: Branch;
  commKind: CommKind;
  /** Original publication time, ISO-8601. */
  publishedAt: string;
  /** Permalink to the source post/article. */
  url?: string;
  /** Raw title (Ukrainian, as published). */
  titleUk?: string;
  /** Raw body text (Ukrainian, as published). */
  text: string;
  /** Media URLs attached to the post, if any. */
  mediaUrls?: string[];
  sourceKind: SourceKind;
}

// ── General Staff daily summary (structured) ──────────────────────────────────

/**
 * The standardized categories of enemy materiel losses reported in the General
 * Staff daily summary ("Загальні бойові втрати противника"). Keys mirror the
 * canonical line items of the official report.
 */
export type LossCategory =
  | "personnel"
  | "tanks"
  | "afv"            // armoured fighting vehicles (ББМ)
  | "artillery"
  | "mlrs"
  | "air_defense"
  | "aircraft"
  | "helicopters"
  | "uav"            // operational-tactical UAVs (БПЛА)
  | "cruise_missiles"
  | "ships_boats"
  | "submarines"
  | "vehicles_fuel"  // автомобільна техніка / fuel tankers
  | "special_equipment";

export const LOSS_CATEGORY_META: Record<
  LossCategory,
  { labelEn: string; labelUk: string; labelDe: string }
> = {
  personnel:        { labelEn: "Personnel",                 labelUk: "Особовий склад",            labelDe: "Personal" },
  tanks:            { labelEn: "Tanks",                     labelUk: "Танки",                     labelDe: "Panzer" },
  afv:              { labelEn: "Armoured fighting vehicles",labelUk: "Бойові броньовані машини",  labelDe: "Schützenpanzer" },
  artillery:        { labelEn: "Artillery systems",         labelUk: "Артилерійські системи",     labelDe: "Artilleriesysteme" },
  mlrs:             { labelEn: "MLRS",                       labelUk: "РСЗВ",                      labelDe: "Mehrfachraketenwerfer" },
  air_defense:      { labelEn: "Air defence systems",        labelUk: "Засоби ППО",               labelDe: "Flugabwehrsysteme" },
  aircraft:         { labelEn: "Aircraft",                   labelUk: "Літаки",                    labelDe: "Flugzeuge" },
  helicopters:      { labelEn: "Helicopters",                labelUk: "Гелікоптери",              labelDe: "Hubschrauber" },
  uav:              { labelEn: "Operational-tactical UAVs",  labelUk: "БПЛА оперативно-тактичні", labelDe: "Drohnen" },
  cruise_missiles:  { labelEn: "Cruise missiles",            labelUk: "Крилаті ракети",           labelDe: "Marschflugkörper" },
  ships_boats:      { labelEn: "Ships / boats",              labelUk: "Кораблі / катери",         labelDe: "Schiffe / Boote" },
  submarines:       { labelEn: "Submarines",                 labelUk: "Підводні човни",           labelDe: "U-Boote" },
  vehicles_fuel:    { labelEn: "Vehicles & fuel tankers",    labelUk: "Автомобільна техніка та цистерни", labelDe: "Fahrzeuge & Tanklaster" },
  special_equipment:{ labelEn: "Special equipment",          labelUk: "Спеціальна техніка",       labelDe: "Spezialausrüstung" },
};

/** A single loss line item: cumulative total and (optional) 24h delta. */
export interface LossTally {
  category: LossCategory;
  /** Cumulative total reported (as published). */
  total: number;
  /** Change over the last 24h, if the report states it (often "+N"). */
  delta?: number;
}

/** One named frontline / operational direction with its activity descriptor. */
export interface FrontlineActivity {
  /** Direction name as published, e.g. "Покровський напрямок". */
  directionUk: string;
  directionEn?: string;
  /** Number of enemy assaults/engagements repelled, if stated. */
  engagements?: number;
  /** Free-text activity note (uk, short factual extract). */
  noteUk?: string;
  /** Oblast the direction primarily falls within, if resolvable. */
  oblast?: OblastCode;
}

/**
 * The General Staff standardized daily operational summary, parsed into typed
 * fields. Figures are carried VERBATIM as officially reported — not asserted as
 * independently verified.
 */
export interface GenStaffDailySummary {
  /** Report date (the morning summary covers the prior 24h), YYYY-MM-DD. */
  date: string;
  url?: string;
  sourceChannelId: string;
  /** "Загальні бойові втрати противника" — cumulative losses, as published. */
  losses: LossTally[];
  /** Named directions with activity, in published order. */
  directions: FrontlineActivity[];
  /** Total combat engagements over the period, if stated. */
  totalEngagements?: number;
  /** Oblasts referenced anywhere in the report (deduped). */
  regions: OblastCode[];
  /** Short factual extract + neutral framing (uk/en/de). */
  summary: { uk: string; en: string; de: string };
  /** True if any number could not be parsed and was left out. */
  partial: boolean;
}

// ── Air Force / Navy threat alerts ────────────────────────────────────────────

export type ThreatVector = "ballistic" | "cruise_missile" | "shahed_uav" | "aircraft" | "naval" | "unknown";

export interface ThreatAlert {
  id: string;
  branch: Branch;
  vector: ThreatVector;
  /** Affected oblasts as named in the post, if resolvable. */
  oblasts: OblastCode[];
  /** Direction of travel / origin note (uk). */
  noteUk?: string;
  issuedAt: string;
  url?: string;
  sourceChannelId: string;
  text: string;
}

// ── Named-entity / knowledge-graph enrichment (press) ─────────────────────────

export type EntityType =
  | "person"
  | "unit"            // military unit / brigade
  | "weapon_system"
  | "settlement"
  | "oblast"
  | "country"
  | "organization";

export interface NamedEntity {
  type: EntityType;
  /** Surface form as it appeared in text. */
  textUk: string;
  /** Canonical KG id when the entity resolves to a known node. */
  kgId?: string;
  /** Resolved oblast for settlement/oblast entities. */
  oblast?: OblastCode;
  /** Character offset where matched (for highlight / audit). */
  offset?: number;
}

/** A press release after NER + KG enrichment. */
export interface EnrichedPressRelease {
  id: string;
  branch: Branch;
  publishedAt: string;
  url?: string;
  titleUk?: string;
  text: string;
  entities: NamedEntity[];
  /** Oblasts mentioned, deduped (subset of entities). */
  regions: OblastCode[];
  /** KG node ids touched (for graph edge creation). */
  kgNodeIds: string[];
  summary: { uk: string; en: string; de: string };
}

// ── Provenance ────────────────────────────────────────────────────────────────

/** Trust tier — official military comms are the highest. */
export type TrustTier = "official" | "verified_osint" | "osint" | "unverified";

export interface OfficialProvenance {
  /** Source authority label (uk/en). */
  authority: { uk: string; en: string };
  branch: Branch;
  trustTier: TrustTier;
  sourceChannelId: string;
  url?: string;
  capturedAt: string;
  /** True if this carries officially-reported figures (loss tallies, etc.). */
  carriesOfficialFigures: boolean;
}

// ── Branch display metadata (uk + en + de) ────────────────────────────────────

export const BRANCH_META: Record<
  Branch,
  { labelEn: string; labelUk: string; labelDe: string; authorityUk: string; authorityEn: string }
> = {
  general_staff: { labelEn: "General Staff", labelUk: "Генштаб",        labelDe: "Generalstab",
    authorityUk: "Генеральний штаб ЗСУ", authorityEn: "General Staff of the Armed Forces of Ukraine" },
  mod:           { labelEn: "MoD",           labelUk: "Міноборони",     labelDe: "Verteidigungsministerium",
    authorityUk: "Міністерство оборони України", authorityEn: "Ministry of Defence of Ukraine" },
  air_force:     { labelEn: "Air Force",     labelUk: "Повітряні Сили", labelDe: "Luftstreitkräfte",
    authorityUk: "Повітряні Сили ЗСУ", authorityEn: "Air Force Command of Ukraine" },
  navy:          { labelEn: "Navy",          labelUk: "ВМС",            labelDe: "Marine",
    authorityUk: "Військово-Морські Сили ЗСУ", authorityEn: "Navy Command of Ukraine" },
  ground_forces: { labelEn: "Ground Forces", labelUk: "Сухопутні війська", labelDe: "Heer",
    authorityUk: "Сухопутні війська ЗСУ", authorityEn: "Ground Forces of Ukraine" },
  spokesperson:  { labelEn: "Spokesperson",  labelUk: "Речник",         labelDe: "Sprecher",
    authorityUk: "Офіційний речник", authorityEn: "Official spokesperson" },
};
