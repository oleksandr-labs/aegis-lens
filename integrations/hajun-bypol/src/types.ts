/**
 * Source record + domain types for the Hajun Project (BYPOL) integration.
 *
 * Hajun Project (Беларускі Гаюн) and BYPOL are Belarusian-opposition OSINT
 * monitoring initiatives that track Russian military presence and movement
 * THROUGH Belarus — the northern flank of the war against Ukraine. They publish
 * sightings (trains, columns, aircraft at airbases) and analysis via PUBLIC
 * Telegram channels and websites, sourced from a community of vetted local
 * contributors who report at considerable personal risk.
 *
 * SOURCE-PROTECTION IS A FIRST-CLASS REQUIREMENT (see COMPLIANCE.md):
 *   - We ingest only PUBLIC, already-published material.
 *   - The vetted-contributor registry stores PSEUDONYMOUS handles + trust
 *     metadata ONLY. It MUST NOT store, derive, or expose real identities,
 *     precise home locations, phone/device identifiers, or anything that could
 *     deanonymise a contributor. See `contributors.ts`.
 *
 * Languages: all user-facing strings carry uk + en + be (Belarusian). Cyrillic
 * (Ukrainian / Belarusian / Russian) is UTF-8.
 */

// ── Source channels ───────────────────────────────────────────────────────────

export type HajunSourceKind = "telegram_channel" | "site_html" | "site_rss";

/** Which monitoring initiative a source belongs to. */
export type HajunOrg = "hajun" | "bypol" | "community";

/** A single configured Hajun/BYPOL source endpoint (PUBLIC channels only). */
export interface HajunChannel {
  /** Stable id, e.g. "hajun_tg" or "bypol_site". */
  id: string;
  org: HajunOrg;
  kind: HajunSourceKind;
  /** Telegram public channel username (no @) when kind === "telegram_channel". */
  telegramUsername?: string;
  /** Feed / page URL when kind is site_rss / site_html. */
  url?: string;
  nameEn: string;
  nameUk: string;
  nameBe: string;
  /** Whether the source is the initiative's own official outlet (vs. a mirror). */
  official: boolean;
}

/** A raw post/article as fetched from a Hajun/BYPOL source (pre-classification). */
export interface HajunRawReport {
  /** `${channelId}:${externalId}` — stable dedupe key. */
  id: string;
  channelId: string;
  org: HajunOrg;
  /** Original publication time, ISO-8601. */
  publishedAt: string;
  /** Permalink to the source post/article. */
  url?: string;
  /** Raw body text (Belarusian / Russian / Ukrainian, as published). */
  text: string;
  /** Media URLs attached to the post, if any (linked, never rehosted). */
  mediaUrls?: string[];
  sourceKind: HajunSourceKind;
}

// ── Equipment taxonomy ────────────────────────────────────────────────────────

/**
 * Coarse equipment category for a military sighting. The vision classifier and
 * text heuristics both resolve to this taxonomy; a finer model string (e.g.
 * "iskander_m", "su_34") may be carried alongside in `equipmentModel`.
 */
export type EquipmentClass =
  | "rail_echelon"      // military train / эшелон (tanks/IFVs on flatcars)
  | "armor"             // tanks, IFVs, APCs on the move
  | "sam_system"        // S-300/S-400, Pantsir, Tor, Buk
  | "missile_system"    // Iskander, ballistic/cruise TELs
  | "aircraft"          // fighters / bombers at airbases
  | "helicopter"
  | "uav"               // Shahed / Geran launch & storage
  | "fuel_logistics"    // POL trains, tankers, supply columns
  | "personnel"         // troop trains / barracks activity
  | "other";

/** A finer, named model where identifiable (heuristic or vision-derived). */
export type EquipmentModel =
  | "t72" | "t80" | "t90"
  | "bmp" | "btr"
  | "s300" | "s400" | "pantsir" | "tor" | "buk"
  | "iskander_m" | "iskander_k"
  | "su24" | "su25" | "su34" | "su35" | "mig31"
  | "tu22m3" | "tu95" | "tu160"
  | "ka52" | "mi24" | "mi8"
  | "shahed_geran"
  | "unknown";

export interface EquipmentClassification {
  class: EquipmentClass;
  /** Finer named model where resolvable. */
  model?: EquipmentModel;
  /** Reported / estimated unit count (e.g. "12 flatcars"), if any. */
  count?: number;
  /** 0–1 heuristic/vision confidence. */
  confidence: number;
  /** Keyword(s) or visual cue(s) that matched (for explainability / audit). */
  matched: string[];
}

// ── Belarus geography ─────────────────────────────────────────────────────────

/** A point of interest in the BY gazetteer (rail node or airbase). */
export type ByPoiKind = "rail_node" | "airbase" | "garrison" | "border_crossing" | "settlement";

export interface ByPoi {
  id: string;
  kind: ByPoiKind;
  nameEn: string;
  nameUk: string;
  nameBe: string;
  /** [lon, lat]. */
  lonlat: [number, number];
  /** Alternative spellings (be/ru/uk/translit) used for prose matching, lowercased. */
  aliases: string[];
}

// ── Domain event ──────────────────────────────────────────────────────────────

/** A typed, geolocated Belarus military sighting (Hajun/BYPOL domain shape). */
export interface HajunSighting {
  /** Stable event id derived from the source report. */
  eventId: string;
  org: HajunOrg;
  equipment: EquipmentClassification;
  /** Resolved POI (rail node / airbase / …) if matched. */
  poiId?: string;
  poiNameEn?: string;
  poiNameUk?: string;
  /** Geocoded coordinates, when resolvable (LOW precision near rail/airbase). */
  location?: { lat: number; lon: number; uncertaintyM?: number };
  occurredAt: string;
  /** Direction of movement if stated, free heading text. */
  headingNote?: { en: string; uk: string };
  /** Severity 1–5 (input to the canonical danger score). */
  severity: 1 | 2 | 3 | 4 | 5;
  /** 0–1 confidence (blends source trust + classification + geocode). */
  confidence: number;
  title: { en: string; uk: string; be: string };
  summary: { en: string; uk: string; be: string };
  originalText: string;
  sourceUrl?: string;
  sourceChannelId: string;
  mediaUrls?: string[];
  /** Sentinel-1 SAR verification ids that corroborate this sighting. */
  sarXrefIds?: string[];
  /** RU equipment-pool inventory entry ids this sighting was matched against. */
  poolXrefIds?: string[];
}

// ── Equipment-class display metadata (en + uk + be) ───────────────────────────

export const EQUIPMENT_CLASS_META: Record<
  EquipmentClass,
  { labelEn: string; labelUk: string; labelBe: string; color: string; baseSeverity: 1 | 2 | 3 | 4 | 5 }
> = {
  rail_echelon:   { labelEn: "Rail echelon",     labelUk: "Військовий ешелон",     labelBe: "Воінскі эшалон",      color: "#b45309", baseSeverity: 4 },
  armor:          { labelEn: "Armor",            labelUk: "Бронетехніка",          labelBe: "Бронетэхніка",        color: "#92400e", baseSeverity: 4 },
  sam_system:     { labelEn: "SAM system",       labelUk: "Зенітний комплекс",     labelBe: "Зенітны комплекс",    color: "#0e7490", baseSeverity: 4 },
  missile_system: { labelEn: "Missile system",   labelUk: "Ракетний комплекс",     labelBe: "Ракетны комплекс",    color: "#dc2626", baseSeverity: 5 },
  aircraft:       { labelEn: "Aircraft",         labelUk: "Літаки",                labelBe: "Самалёты",            color: "#2563eb", baseSeverity: 4 },
  helicopter:     { labelEn: "Helicopter",       labelUk: "Гелікоптери",           labelBe: "Верталёты",           color: "#3b82f6", baseSeverity: 3 },
  uav:            { labelEn: "UAV / Shahed",      labelUk: "БпЛА / Shahed",         labelBe: "БПЛА / Shahed",       color: "#9333ea", baseSeverity: 4 },
  fuel_logistics: { labelEn: "Fuel / logistics", labelUk: "Паливо / логістика",    labelBe: "Паліва / лагістыка",  color: "#ca8a04", baseSeverity: 3 },
  personnel:      { labelEn: "Personnel",        labelUk: "Особовий склад",        labelBe: "Асабовы склад",       color: "#65a30d", baseSeverity: 3 },
  other:          { labelEn: "Other sighting",   labelUk: "Інше",                  labelBe: "Іншае",               color: "#94a3b8", baseSeverity: 2 },
};
