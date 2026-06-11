/**
 * Registry of official Ukrainian military source channels + oblast metadata.
 *
 * This is a CONFIG registry, not live data. Telegram handles / page slugs follow
 * the documented public naming of each authority; where a handle is unverified
 * it is marked `official: false` so the client gates it in live mode. Verify
 * handles against the authority's own site before enabling (see COMPLIANCE.md).
 *
 * Oblast centres are reused for region resolution in the summary parser and
 * threat-alert correlation.
 */

import type { OblastCode, OblastInfo, SourceChannel } from "./types";

/** Oblast metadata: name (uk/en) + administrative centre [lon, lat]. */
export const OBLASTS: Record<OblastCode, OblastInfo> = {
  "UA-05": { code: "UA-05", nameUk: "Вінницька",        nameEn: "Vinnytsia",        center: [28.468, 49.233] },
  "UA-07": { code: "UA-07", nameUk: "Волинська",        nameEn: "Volyn",            center: [25.325, 50.747] },
  "UA-09": { code: "UA-09", nameUk: "Луганська",        nameEn: "Luhansk",          center: [39.307, 48.574] },
  "UA-12": { code: "UA-12", nameUk: "Дніпропетровська", nameEn: "Dnipropetrovsk",   center: [35.045, 48.464] },
  "UA-14": { code: "UA-14", nameUk: "Донецька",         nameEn: "Donetsk",          center: [37.802, 48.015] },
  "UA-18": { code: "UA-18", nameUk: "Житомирська",      nameEn: "Zhytomyr",         center: [28.658, 50.254] },
  "UA-21": { code: "UA-21", nameUk: "Закарпатська",     nameEn: "Zakarpattia",      center: [22.300, 48.620] },
  "UA-23": { code: "UA-23", nameUk: "Запорізька",       nameEn: "Zaporizhzhia",     center: [35.139, 47.838] },
  "UA-26": { code: "UA-26", nameUk: "Івано-Франківська",nameEn: "Ivano-Frankivsk",  center: [24.711, 48.922] },
  "UA-30": { code: "UA-30", nameUk: "м. Київ",          nameEn: "Kyiv City",        center: [30.523, 50.450] },
  "UA-32": { code: "UA-32", nameUk: "Київська",         nameEn: "Kyiv Oblast",      center: [30.000, 50.050] },
  "UA-35": { code: "UA-35", nameUk: "Кіровоградська",   nameEn: "Kirovohrad",       center: [32.262, 48.508] },
  "UA-43": { code: "UA-43", nameUk: "АР Крим",          nameEn: "Crimea",           center: [34.100, 45.000] },
  "UA-46": { code: "UA-46", nameUk: "Львівська",        nameEn: "Lviv",             center: [24.032, 49.840] },
  "UA-48": { code: "UA-48", nameUk: "Миколаївська",     nameEn: "Mykolaiv",         center: [31.995, 46.975] },
  "UA-51": { code: "UA-51", nameUk: "Одеська",          nameEn: "Odesa",            center: [30.733, 46.484] },
  "UA-53": { code: "UA-53", nameUk: "Полтавська",       nameEn: "Poltava",          center: [34.551, 49.589] },
  "UA-56": { code: "UA-56", nameUk: "Рівненська",       nameEn: "Rivne",            center: [26.251, 50.619] },
  "UA-59": { code: "UA-59", nameUk: "Сумська",          nameEn: "Sumy",             center: [34.799, 50.907] },
  "UA-61": { code: "UA-61", nameUk: "Тернопільська",    nameEn: "Ternopil",         center: [25.595, 49.554] },
  "UA-63": { code: "UA-63", nameUk: "Харківська",       nameEn: "Kharkiv",          center: [36.232, 49.994] },
  "UA-65": { code: "UA-65", nameUk: "Херсонська",       nameEn: "Kherson",          center: [32.617, 46.635] },
  "UA-68": { code: "UA-68", nameUk: "Хмельницька",      nameEn: "Khmelnytskyi",     center: [26.987, 49.423] },
  "UA-71": { code: "UA-71", nameUk: "Черкаська",        nameEn: "Cherkasy",         center: [32.060, 49.444] },
  "UA-74": { code: "UA-74", nameUk: "Чернігівська",     nameEn: "Chernihiv",        center: [31.289, 51.494] },
  "UA-77": { code: "UA-77", nameUk: "Чернівецька",      nameEn: "Chernivtsi",       center: [25.935, 48.292] },
};

/**
 * Resolve oblast codes referenced in a block of Ukrainian text by matching the
 * oblast stem (e.g. "Харків" → UA-63). Returns deduped codes in first-seen
 * order. Conservative: only matches the oblast root, not arbitrary settlements.
 */
export function resolveOblasts(text: string): OblastCode[] {
  const lower = text.toLowerCase();
  const seen = new Set<OblastCode>();
  // Match on the oblast adjective stem (strip the "ська/зька" suffix).
  for (const info of Object.values(OBLASTS)) {
    const stem = info.nameUk.toLowerCase().replace(/(ська|зька|цька)$/u, "");
    if (stem.length >= 4 && lower.includes(stem)) seen.add(info.code);
  }
  return [...seen];
}

// ── Official source channels (national authorities) ───────────────────────────

export const SOURCE_CHANNELS: SourceChannel[] = [
  // General Staff — Facebook is the primary daily-summary surface; Telegram mirror.
  {
    id: "genstaff_fb",
    branch: "general_staff",
    kind: "facebook_page",
    facebookSlug: "GeneralStaff.ua",
    url: "https://www.facebook.com/GeneralStaff.ua",
    nameUk: "Генеральний штаб ЗСУ — Facebook",
    nameEn: "General Staff of the AFU — Facebook",
    official: true,
  },
  {
    id: "genstaff_tg",
    branch: "general_staff",
    kind: "telegram_channel",
    telegramUsername: "GeneralStaffZSU",
    nameUk: "Генеральний штаб ЗСУ — Telegram",
    nameEn: "General Staff of the AFU — Telegram",
    official: true,
  },
  // MoD — press releases on site + Telegram.
  {
    id: "mod_site",
    branch: "mod",
    kind: "site_html",
    url: "https://www.mil.gov.ua/news/",
    nameUk: "Міністерство оборони України — сайт",
    nameEn: "Ministry of Defence of Ukraine — site",
    official: true,
  },
  {
    id: "mod_tg",
    branch: "mod",
    kind: "telegram_channel",
    telegramUsername: "modofukraine",
    nameUk: "Міністерство оборони України — Telegram",
    nameEn: "Ministry of Defence of Ukraine — Telegram",
    official: true,
  },
  // Air Force Command — missile/drone threat posts.
  {
    id: "air_force_tg",
    branch: "air_force",
    kind: "telegram_channel",
    telegramUsername: "kpszsu",
    nameUk: "Повітряні Сили ЗСУ — Telegram",
    nameEn: "Air Force Command of Ukraine — Telegram",
    official: true,
  },
  // Navy Command.
  {
    id: "navy_tg",
    branch: "navy",
    kind: "telegram_channel",
    telegramUsername: "UkrainianNavy",
    nameUk: "Військово-Морські Сили ЗСУ — Telegram",
    nameEn: "Navy Command of Ukraine — Telegram",
    official: true,
  },
];

export function getChannel(id: string): SourceChannel | undefined {
  return SOURCE_CHANNELS.find((c) => c.id === id);
}

export function channelsForBranch(branch: SourceChannel["branch"]): SourceChannel[] {
  return SOURCE_CHANNELS.filter((c) => c.branch === branch);
}
