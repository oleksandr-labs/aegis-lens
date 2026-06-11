/**
 * Registry of DSNS regional (per-oblast) branches and their PUBLIC channels.
 *
 * DSNS operates a central press service plus a Main Directorate
 * ("Головне управління ДСНС") in every oblast, each publishing to its own
 * Telegram channel and regional sub-site of dsns.gov.ua.
 *
 * Telegram usernames below follow the documented public naming pattern
 * (dsns_<oblast>). Where the real handle is unverified we mark `official:false`
 * so the client gates it. This is a CONFIG registry, not live data — verify
 * handles against dsns.gov.ua before enabling in production (see COMPLIANCE.md).
 */

import type { DsnsChannel, OblastCode, OblastInfo } from "./types";

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
 * Public-handle slug per oblast for the documented `dsns_<slug>` Telegram
 * naming pattern. Crimea is occupied — no operative DSNS branch — so it is
 * intentionally absent.
 */
const OBLAST_TG_SLUG: Partial<Record<OblastCode, string>> = {
  "UA-05": "vinnytsia", "UA-07": "volyn",      "UA-09": "luhansk",
  "UA-12": "dnipro",    "UA-14": "donetsk",    "UA-18": "zhytomyr",
  "UA-21": "zakarpattia","UA-23": "zaporizhzhia","UA-26": "ifr",
  "UA-30": "kyiv",      "UA-32": "kyivobl",    "UA-35": "kropyvnytskyi",
  "UA-46": "lviv",      "UA-48": "mykolaiv",   "UA-51": "odesa",
  "UA-53": "poltava",   "UA-56": "rivne",      "UA-59": "sumy",
  "UA-61": "ternopil",  "UA-63": "kharkiv",    "UA-65": "kherson",
  "UA-68": "khmelnytskyi","UA-71": "cherkasy", "UA-74": "chernihiv",
  "UA-77": "chernivtsi",
};

/** National-level DSNS sources. */
export const NATIONAL_CHANNELS: DsnsChannel[] = [
  {
    id: "dsns_national_site",
    scope: "national",
    kind: "site_rss",
    url: "https://dsns.gov.ua/news",
    nameUk: "ДСНС України — офіційний сайт",
    nameEn: "DSNS Ukraine — official site",
    official: true,
  },
  {
    id: "dsns_national_tg",
    scope: "national",
    kind: "telegram_channel",
    telegramUsername: "dsns_telegram",
    nameUk: "ДСНС України — Telegram",
    nameEn: "DSNS Ukraine — Telegram",
    official: true,
  },
];

/** Build the per-oblast branch channel list from the slug table. */
export function buildOblastBranches(): DsnsChannel[] {
  const out: DsnsChannel[] = [];
  for (const code of Object.keys(OBLAST_TG_SLUG) as OblastCode[]) {
    const info = OBLASTS[code];
    const slug = OBLAST_TG_SLUG[code]!;
    // Site sub-page (always present for live oblasts).
    out.push({
      id: `dsns_${slug}_site`,
      scope: "oblast",
      kind: "site_html",
      oblast: code,
      url: `https://${slug}.dsns.gov.ua/news`,
      nameUk: `ГУ ДСНС у ${info.nameUk} області`,
      nameEn: `DSNS Main Directorate — ${info.nameEn} Oblast`,
      official: true,
    });
    // Telegram channel — marked unofficial until the handle is verified
    // against dsns.gov.ua, so the client gates it (polite + safe default).
    out.push({
      id: `dsns_${slug}_tg`,
      scope: "oblast",
      kind: "telegram_channel",
      oblast: code,
      telegramUsername: `dsns_${slug}`,
      nameUk: `ГУ ДСНС у ${info.nameUk} області — Telegram`,
      nameEn: `DSNS — ${info.nameEn} Oblast — Telegram`,
      official: false,
    });
  }
  return out;
}

export const OBLAST_BRANCHES: DsnsChannel[] = buildOblastBranches();

/** Full channel registry (national + all oblast branches). */
export const ALL_DSNS_CHANNELS: DsnsChannel[] = [...NATIONAL_CHANNELS, ...OBLAST_BRANCHES];

/** Look up all channels for a given oblast. */
export function channelsForOblast(oblast: OblastCode): DsnsChannel[] {
  return OBLAST_BRANCHES.filter((c) => c.oblast === oblast);
}

/** Look up a channel by id. */
export function getChannel(id: string): DsnsChannel | undefined {
  return ALL_DSNS_CHANNELS.find((c) => c.id === id);
}
