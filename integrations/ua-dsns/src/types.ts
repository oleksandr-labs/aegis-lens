/**
 * Source record + domain types for the ДСНС / DSNS integration.
 *
 * ДСНС = Державна служба України з надзвичайних ситуацій
 *        (State Emergency Service of Ukraine).
 *
 * The DSNS publishes operational reports on its official site (dsns.gov.ua),
 * regional branch sites, and Telegram channels (national + per-oblast).
 * This integration ingests those PUBLIC reports and normalises them into the
 * canonical Aegis Lens event model.
 *
 * All user-facing strings carry uk + en. Cyrillic is UTF-8.
 */

// ── Oblast registry (ISO 3166-2 :UA) ──────────────────────────────────────────

/** ISO 3166-2 oblast (+ Kyiv city) codes used across the platform. */
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

// ── DSNS source channels ──────────────────────────────────────────────────────

export type DsnsSourceKind = "site_rss" | "site_html" | "telegram_channel";

export type DsnsScope = "national" | "oblast";

/** A single configured DSNS source endpoint. */
export interface DsnsChannel {
  /** Stable id, e.g. "dsns_national_tg" or "dsns_lviv_tg". */
  id: string;
  scope: DsnsScope;
  kind: DsnsSourceKind;
  /** ISO 3166-2 oblast code for oblast-scoped channels. */
  oblast?: OblastCode;
  /** Telegram public channel username (no @) when kind === "telegram_channel". */
  telegramUsername?: string;
  /** RSS feed / page URL when kind is site_rss / site_html. */
  url?: string;
  nameUk: string;
  nameEn: string;
  /** Whether the source is officially operated by DSNS (vs. mirror). */
  official: boolean;
}

/** A raw post/article as fetched from a DSNS source (pre-classification). */
export interface DsnsRawReport {
  /** `${channelId}:${externalId}` — stable dedupe key. */
  id: string;
  channelId: string;
  scope: DsnsScope;
  oblast?: OblastCode;
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
  /** Which source kind produced this. */
  sourceKind: DsnsSourceKind;
}

// ── Emergency taxonomy ────────────────────────────────────────────────────────

/** DSNS-specific emergency type produced by the heuristic classifier. */
export type EmergencyType =
  | "fire"
  | "explosion"
  | "collapse"
  | "rescue"
  | "demining"
  | "flood"
  | "hazmat"
  | "evacuation"
  | "other";

/** Classification result for a single report. */
export interface EmergencyClassification {
  type: EmergencyType;
  /** 0–1 heuristic confidence. */
  confidence: number;
  /** Keyword(s) that matched (for explainability / audit). */
  matchedKeywords: string[];
  /** Optional secondary types detected (e.g. explosion + fire). */
  alsoDetected?: EmergencyType[];
}

/** A typed, geolocated emergency event (DSNS domain shape). */
export interface DsnsEmergencyEvent {
  /** Stable event id derived from the source report. */
  eventId: string;
  type: EmergencyType;
  scope: DsnsScope;
  oblast?: OblastCode;
  oblastNameUk?: string;
  oblastNameEn?: string;
  /** Resolved place name (settlement / district), if extracted. */
  placeNameUk?: string;
  /** Geocoded coordinates, when resolvable. */
  location?: { lat: number; lon: number; uncertaintyM?: number };
  occurredAt: string;
  /** Severity 1–5 (input to the canonical danger score). */
  severity: 1 | 2 | 3 | 4 | 5;
  /** 0–1 confidence. */
  confidence: number;
  title: { en: string; uk: string };
  summary: { en: string; uk: string };
  originalText: string;
  sourceUrl?: string;
  sourceChannelId: string;
  mediaUrls?: string[];
  /** Whether DSNS reported an evacuation order in this event. */
  evacuationOrdered?: boolean;
  /** Cross-reference: correlated NASA FIRMS / Sentinel fire detection id(s). */
  fireXrefIds?: string[];
}

// ── Daily operational summary ─────────────────────────────────────────────────

/** The DSNS daily nationwide operational summary ("оперативна інформація"). */
export interface DsnsDailySummary {
  /** Report date (the 24h window end), YYYY-MM-DD. */
  date: string;
  url?: string;
  /** Total emergencies handled in the period. */
  totalIncidents?: number;
  /** Breakdown by emergency type. */
  byType: Partial<Record<EmergencyType, number>>;
  /** Demined explosive ordnance count. */
  ordnanceDefused?: number;
  /** People rescued / evacuated. */
  peopleRescued?: number;
  /** Fires extinguished. */
  firesExtinguished?: number;
  summary: { en: string; uk: string };
}

// ── Emergency type display metadata (uk + en) ─────────────────────────────────

export const EMERGENCY_TYPE_META: Record<
  EmergencyType,
  { labelEn: string; labelUk: string; color: string; baseSeverity: 1 | 2 | 3 | 4 | 5 }
> = {
  fire:       { labelEn: "Fire",            labelUk: "Пожежа",                color: "#ef4444", baseSeverity: 3 },
  explosion:  { labelEn: "Explosion",       labelUk: "Вибух",                 color: "#dc2626", baseSeverity: 4 },
  collapse:   { labelEn: "Collapse",        labelUk: "Обвалення",             color: "#a16207", baseSeverity: 4 },
  rescue:     { labelEn: "Rescue",          labelUk: "Порятунок",             color: "#0ea5e9", baseSeverity: 2 },
  demining:   { labelEn: "Demining",        labelUk: "Розмінування",          color: "#16a34a", baseSeverity: 2 },
  flood:      { labelEn: "Flood",           labelUk: "Підтоплення",           color: "#2563eb", baseSeverity: 3 },
  hazmat:     { labelEn: "Hazmat",          labelUk: "Небезпечні речовини",   color: "#9333ea", baseSeverity: 4 },
  evacuation: { labelEn: "Evacuation",      labelUk: "Евакуація",             color: "#f97316", baseSeverity: 3 },
  other:      { labelEn: "Other emergency", labelUk: "Інша НС",               color: "#94a3b8", baseSeverity: 1 },
};
