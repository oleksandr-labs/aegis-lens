/**
 * Registry of official spokespersons per branch (task 5).
 *
 * Spokespersons issue official statements that often precede or contextualise
 * the written daily summary / press release. We track their PUBLIC official
 * accounts only. As with `sources.ts`, handles must be verified against the
 * authority's own channels before live ingestion; unverified entries are
 * gated by `official: false`.
 *
 * NEUTRALITY: a spokesperson statement is an official claim, carried as such —
 * trust tier "official", not asserted as independently verified.
 */

import type { Branch, SourceChannel } from "./types";

export interface Spokesperson {
  /** Stable id, e.g. "spox_air_force". */
  id: string;
  branch: Branch;
  /** Role title (uk/en). Names are intentionally NOT hardcoded — roles persist
   *  across personnel changes; the live handle is resolved from `channel`. */
  roleUk: string;
  roleEn: string;
  /** The official source channel this spokesperson publishes through. */
  channel: SourceChannel;
}

/**
 * Per-branch spokesperson roles + their official statement channels.
 * Telegram usernames follow documented public naming; verify before enabling.
 */
export const SPOKESPERSONS: Spokesperson[] = [
  {
    id: "spox_general_staff",
    branch: "general_staff",
    roleUk: "Речник Генерального штабу ЗСУ",
    roleEn: "Spokesperson, General Staff of the AFU",
    channel: {
      id: "spox_genstaff_tg",
      branch: "spokesperson",
      kind: "telegram_channel",
      telegramUsername: "generalstaff_spox",
      nameUk: "Речник Генштабу ЗСУ — Telegram",
      nameEn: "General Staff spokesperson — Telegram",
      official: false,
    },
  },
  {
    id: "spox_air_force",
    branch: "air_force",
    roleUk: "Речник Повітряних Сил ЗСУ",
    roleEn: "Spokesperson, Air Force Command",
    channel: {
      id: "spox_air_force_tg",
      branch: "spokesperson",
      kind: "telegram_channel",
      telegramUsername: "air_force_spox",
      nameUk: "Речник Повітряних Сил — Telegram",
      nameEn: "Air Force spokesperson — Telegram",
      official: false,
    },
  },
  {
    id: "spox_navy",
    branch: "navy",
    roleUk: "Речник Військово-Морських Сил ЗСУ",
    roleEn: "Spokesperson, Navy Command",
    channel: {
      id: "spox_navy_tg",
      branch: "spokesperson",
      kind: "telegram_channel",
      telegramUsername: "navy_spox",
      nameUk: "Речник ВМС — Telegram",
      nameEn: "Navy spokesperson — Telegram",
      official: false,
    },
  },
  {
    id: "spox_mod",
    branch: "mod",
    roleUk: "Речник Міністерства оборони України",
    roleEn: "Spokesperson, Ministry of Defence",
    channel: {
      id: "spox_mod_tg",
      branch: "spokesperson",
      kind: "telegram_channel",
      telegramUsername: "mod_spox",
      nameUk: "Речник Міноборони — Telegram",
      nameEn: "MoD spokesperson — Telegram",
      official: false,
    },
  },
];

/** All spokesperson source channels (for the client to poll). */
export const SPOKESPERSON_CHANNELS: SourceChannel[] = SPOKESPERSONS.map((s) => s.channel);

export function spokespersonForBranch(branch: Branch): Spokesperson | undefined {
  return SPOKESPERSONS.find((s) => s.branch === branch);
}

export function getSpokesperson(id: string): Spokesperson | undefined {
  return SPOKESPERSONS.find((s) => s.id === id);
}
