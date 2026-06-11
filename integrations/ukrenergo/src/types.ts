/**
 * Source record types for the Ukrenergo + oblenergo power-grid integration.
 *
 * This package ingests the Ukrainian electricity-grid status published by:
 *   - Ukrenergo (national TSO / dispatcher)            → ukrenergo-client.ts
 *   - 24 regional distribution operators (oblenergo)   → oblenergo-registry.ts
 *   - consumer-facing schedule portals (Yasno / DTEK)  → dtek-yasno-client.ts
 *
 * The varied raw formats are normalised into the shared OutageSignal shape
 * consumed by integrations/power-outages (fusion.ts). We re-declare a
 * structurally-identical OutageSignal here so this package has no build-time
 * dependency on the power-outages package; `to-power-outages.ts` is the bridge.
 */

/** ISO 3166-2:UA oblast code, e.g. "UA-63" (Kharkiv). */
export type OblastCode = string;

/** Three-letter UI locales used across the platform. */
export type Locale = "uk" | "ru" | "en";

/** Localized text keyed by locale. */
export interface LocalizedText {
  uk: string;
  ru: string;
  en: string;
}

// ── Outage classification ──────────────────────────────────────────────────────

/**
 * Distinguishes the *nature* of an outage. This is the key civilian signal:
 * a scheduled rotation is predictable; an emergency shutdown is not.
 */
export type OutageKind =
  | "scheduled"        // planned rotating restriction (графік погодинних відключень / ГПВ)
  | "emergency"        // emergency unscheduled shutdown (аварійні / екстрені відключення / ЕВ)
  | "stabilization"    // stabilization schedule applied (графік стабілізаційних відключень / ГСВ)
  | "restored"         // power returned
  | "unknown";

/** Reason behind the outage (maps onto power-outages OutageCause). */
export type OutageCause = "damage" | "scheduled" | "weather" | "unknown";

// ── Schedule model (rotation groups / queues / черги) ──────────────────────────

/**
 * Ukrainian rotating-blackout schedules are organised into numbered groups
 * ("черги" / queues / lines). A group is on/off for declared time-blocks.
 * Yasno/DTEK use sub-groups like "3.1", "3.2"; oblenergos often use "1".."6".
 */
export interface TimeBlock {
  /** Local (Kyiv, UTC+2/+3) start hour:minute, 24h "HH:MM". */
  from: string;
  /** Local end "HH:MM" (may be "24:00"). */
  to: string;
  /** Whether power is OFF during this block (true) or guaranteed ON (false). */
  off: boolean;
}

/** One rotation group's schedule for a single day. */
export interface ScheduleGroup {
  /** Group / queue label as published, e.g. "1", "3.2". */
  group: string;
  /** Local date the schedule applies to (YYYY-MM-DD). */
  date: string;
  /** Ordered time-blocks across the day. */
  blocks: TimeBlock[];
}

/** A parsed per-region schedule from one provider. */
export interface RegionSchedule {
  regionCode: OblastCode;
  provider: string;
  /** When the provider published / last updated this schedule (ISO 8601). */
  publishedAt: string;
  groups: ScheduleGroup[];
  /** Schedule type currently in force. */
  kind: OutageKind;
  sourceUrl?: string;
}

// ── Raw provider records (pre-parse) ───────────────────────────────────────────

/**
 * Raw status as published by a provider, before format-specific parsing.
 * `format` tells provider-adapters.ts which parser to apply.
 */
export interface RawProviderRecord {
  provider: string;
  regionCode: OblastCode;
  /** Format hint — selects the parser in provider-adapters.ts. */
  format: ProviderFormat;
  /** The raw payload (HTML, JSON string, Telegram text, table rows…). */
  raw: string | Record<string, unknown>;
  /** Provider publish timestamp (ISO 8601). */
  publishedAt: string;
  sourceUrl?: string;
  /** Channel the record came from. */
  channel: "site" | "telegram" | "api";
}

/** Format families across the 24 oblenergos + national/consumer providers. */
export type ProviderFormat =
  | "ukrenergo_api"        // national power-balance / press JSON
  | "ukrenergo_telegram"   // Ukrenergo Telegram prose
  | "yasno_groups_json"    // Yasno consumer schedule JSON (group → blocks)
  | "dtek_schedule_html"   // DTEK regional HTML schedule table
  | "oblenergo_html_table" // generic oblenergo HTML table (rows = groups)
  | "oblenergo_telegram"   // oblenergo Telegram prose (parsed heuristically)
  | "svitlo_json";         // "Світло"/СвітлоБот portal JSON

// ── Emitted outage signal (mirror of power-outages OutageSignal) ───────────────

export type OutageSignalSource =
  | "cloudflare_radar"
  | "community_report"
  | "telegram_channel"
  | "scheduled_blackout"
  | "viirs_nightlights";

/**
 * Structurally identical to integrations/power-outages OutageSignal so it can
 * be handed straight to fuseSignals(). Kept local to avoid a cross-package
 * build dependency; to-power-outages.ts produces these.
 */
export interface OutageSignal {
  source: OutageSignalSource;
  regionCode: OblastCode;
  confidence: number;            // 0–1
  detectedAt: string;            // ISO 8601
  cause: OutageCause;
  estimatedCoverage?: number;    // 0–1 fraction of region affected
  rawData?: Record<string, unknown>;
}

// ── Restoration ETA ────────────────────────────────────────────────────────────

export interface RestorationEta {
  regionCode: OblastCode;
  /** Estimated restoration time (ISO 8601), or null if indeterminate. */
  estimatedAt: string | null;
  /** Confidence in the ETA, 0–1. */
  confidence: number;
  /** Whether the ETA is provider-declared vs. inferred from a schedule. */
  basis: "provider_declared" | "schedule_inferred" | "historical_median" | "none";
  note?: LocalizedText;
}
