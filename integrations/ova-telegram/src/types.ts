/**
 * Types for the OVA (Oblast Military Administration) official Telegram feed.
 *
 * OVA channels are the "official-of-record" tier: the highest trust short of a
 * Cabinet of Ministers statement. Each oblast has one authoritative OVA channel;
 * five major cities also have an official city-council channel. We ingest these
 * via the read-only Telegram **Bot API** only (within Telegram ToS — no userbot,
 * no MTProto scraping of user accounts).
 *
 * The oblast registry (codes, names, centers) is REUSED from
 * `@ua-map/civilian-alerts` so there is a single source of truth across the repo.
 */

import type { OblastCode } from "../../civilian-alerts/src/types";

export type { OblastCode } from "../../civilian-alerts/src/types";
export { OBLASTS } from "../../civilian-alerts/src/types";
export type { OblastInfo } from "../../civilian-alerts/src/types";

/** Locales used across the package. UK is primary; EN + RU are derived. */
export type Locale = "uk" | "en" | "ru";

/** What kind of institution owns the channel. */
export type ChannelKind =
  | "oblast_ova" // Oblast/regional military administration (official-of-record)
  | "city_council"; // Major city council (official municipal channel)

/** Role of a channel inside its oblast's redundancy group. */
export type ChannelRole = "primary" | "backup" | "mirror";

/** Liveness/authenticity status from continuous verification. */
export type ChannelStatus =
  | "active" // verified + posting
  | "stale" // verified but silent beyond expected cadence
  | "banned" // removed / blocked by Telegram or hijacked
  | "unverified"; // not yet authenticated

/** A single curated channel entry in the registry. */
export interface OvaChannel {
  /** Telegram @username (without the @). */
  username: string;
  oblastCode: OblastCode;
  kind: ChannelKind;
  role: ChannelRole;
  /** Display label of the institution. */
  label: { uk: string; en: string; ru?: string };
  /** Numeric Telegram channel id, if known (stable across rename). */
  chatId?: number;
  /** Official site that links to / confirms this channel (authenticity anchor). */
  officialSiteUrl?: string;
  /** Verified blue-check on Telegram, if applicable. */
  telegramVerified?: boolean;
}

/** Curated per-oblast group: one primary OVA + optional city councils + backups. */
export interface OvaOblastGroup {
  oblastCode: OblastCode;
  primary: OvaChannel;
  /** City-council channels for major cities in this oblast (Kyiv, Kharkiv...). */
  cityCouncils: OvaChannel[];
  /** Pre-registered backup/mirror channels for failover. */
  backups: OvaChannel[];
}

/** A normalized post ingested from an OVA channel (pre-translation). */
export interface OvaPost {
  postId: string; // `${username}:${message_id}`
  username: string;
  oblastCode: OblastCode;
  kind: ChannelKind;
  /** Raw Ukrainian text exactly as posted (ALWAYS preserved). */
  textUk: string;
  /** ISO-8601 of the Telegram post date. */
  postedAt: string;
  /** Permanent permalink back to the source post. */
  evidenceUrl: string;
  mediaUrls?: string[];
}

/** Translation envelope — UA original is ALWAYS preserved alongside derived langs. */
export interface OvaTranslatedPost extends OvaPost {
  translations: {
    /** Original; mirrors `textUk` for completeness. */
    uk: string;
    en?: string;
    ru?: string;
  };
  /** Provider that produced the EN/RU strings (e.g. "demo-passthrough", "deepl"). */
  translationProvider: string;
}

/** Confidence input forwarded to the canonical Event schema (0–1). */
export interface OvaConfidenceInput {
  /** Base trust of the channel tier (OVA official-of-record is high). */
  channelTrust: number;
  /** Authenticity multiplier from verification.ts (0–1). */
  authenticity: number;
  /** Reputation multiplier from cadence.ts (0–1). */
  reputation: number;
}
