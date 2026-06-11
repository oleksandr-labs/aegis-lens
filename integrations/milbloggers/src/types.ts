/**
 * @ua-map/milbloggers — shared types.
 *
 * EDITORIAL POLICY (read before touching this file):
 *   - This is a CURATED allow-list, NOT an algorithmic feed. Every account is
 *     added by a human editor after vetting (see vetting.ts).
 *   - `side` is a structural, mandatory field. It is NEVER dropped, normalized,
 *     or made optional. UA-side and RU-side accounts are NOT treated as
 *     equivalent — see side-label.ts for the no-false-equivalence invariant.
 *   - RU-side accounts exist ONLY to surface the opposing narrative for
 *     analysis/comparison. They carry a mandatory `oppositionLabel` and are
 *     never presented as neutral or trustworthy reporting.
 */

/** Which side's narrative the account speaks for. */
export type Side = "ua" | "ru" | "int";

/** Localized text: en + uk always; ru where relevant. */
export interface L10nText {
  en: string;
  uk: string;
  ru?: string;
}

/** Platforms we ingest curated accounts from (public surfaces only). */
export type Platform = "telegram" | "x" | "youtube" | "web";

/** Specialty focus tags (see tags.ts for the canonical catalog). */
export type SpecialtyTag =
  | "frontline"
  | "air_defense"
  | "drones"
  | "geolocation"
  | "equipment_id"
  | "naval"
  | "logistics"
  | "war_crimes"
  | "humanitarian"
  | "cyber"
  | "propaganda_analysis"
  | "official"
  | "investigative";

/**
 * A single curated milblogger / OSINT account.
 *
 * NOTE: `side` and (for RU) `oppositionLabel` are mandatory by policy.
 */
export interface MilbloggerAccount {
  /** Stable internal id (platform:handle). */
  id: string;
  /** Platform handle without leading @ / t.me. */
  handle: string;
  platform: Platform;
  name: string;
  /** UA / RU / INT — STRUCTURAL, never dropped. */
  side: Side;
  /**
   * Mandatory for `side: "ru"`. Human-readable label clarifying that the
   * account is tracked solely for opposite-narrative analysis. Surfaced in
   * every UI/API rendering. Absent for ua/int.
   */
  oppositionLabel?: L10nText;
  description: L10nText;
  /** BCP-47 primary language. */
  language: string;
  /** ISO 3166-2 / "UA" / "ALL" focus regions. */
  regions: string[];
  /** Editorial reputation seed 0–1 (see reputation.ts). */
  reputation: number;
  /** Specialty focus tags. */
  tags: SpecialtyTag[];
  /** Public verifiable identity / track record note (vetting requirement). */
  trackRecord: string;
  /** Whether identity is publicly attributable (anonymous = harder gate). */
  anonymous: boolean;
  /** Date the editor vetted + admitted the account, ISO-8601. */
  vettedAt: string;
  /** Editor handle who admitted the account. */
  vettedBy: string;
  /** Whether currently active in the ingest pipeline. */
  active: boolean;
}

/** A post pulled from a curated account (pre-classification). */
export interface RawPost {
  accountId: string;
  postId: string;
  url: string;
  text: string;
  language?: string;
  publishedAt: string;
  mediaUrls?: string[];
}

/** Content classification of a post. */
export type ContentClass =
  | "frontline_report"
  | "strike_claim"
  | "equipment_loss"
  | "geolocation"
  | "official_statement"
  | "analysis"
  | "humanitarian"
  | "propaganda"
  | "unclassified";

/** A classified, side-labelled post ready for cross-reference / review. */
export interface ClassifiedPost extends RawPost {
  /** Carried from the source account — NEVER inferred per-post, NEVER dropped. */
  side: Side;
  oppositionLabel?: L10nText;
  contentClass: ContentClass;
  classConfidence: number;
  tags: SpecialtyTag[];
  /** Source reputation snapshot at ingest time. */
  sourceReputation: number;
}
