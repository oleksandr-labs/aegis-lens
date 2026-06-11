/**
 * Task 1 — Curated registry of all 24 OVA official channels + five major
 * city-council channels (Kyiv, Kharkiv, Odesa, Dnipro, Lviv).
 *
 * This EXTENDS the seed `OVA_CHANNELS` map already started in
 * `@ua-map/alerts-in-ua → src/ova-fallback.ts` (which only listed front-line
 * oblasts for failover). Here we provide the complete, structured registry for
 * ALL oblasts plus city councils, plus a slot for pre-registered backups.
 *
 * Oblast metadata (names/centers/codes) is reused from `@ua-map/civilian-alerts`
 * via OBLASTS — we do NOT re-declare oblast geography.
 *
 * Channel usernames are the publicly-known official OVA channels. This file is
 * DATA: corrections need no code change. Authenticity is enforced separately in
 * `verification.ts`; nothing here is treated as trusted until verified.
 */

import type { OblastCode, OvaChannel, OvaOblastGroup } from "./types";
import { OBLASTS } from "./types";

function ova(
  oblastCode: OblastCode,
  username: string,
  labelUk: string,
  labelEn: string,
  labelRu: string,
  officialSiteUrl?: string,
): OvaChannel {
  return {
    username,
    oblastCode,
    kind: "oblast_ova",
    role: "primary",
    label: { uk: labelUk, en: labelEn, ru: labelRu },
    officialSiteUrl,
  };
}

function city(
  oblastCode: OblastCode,
  username: string,
  labelUk: string,
  labelEn: string,
  labelRu: string,
  officialSiteUrl?: string,
): OvaChannel {
  return {
    username,
    oblastCode,
    kind: "city_council",
    role: "primary",
    label: { uk: labelUk, en: labelEn, ru: labelRu },
    officialSiteUrl,
  };
}

/**
 * Primary OVA channel per oblast (all 26 ISO codes incl. occupied territories).
 * Usernames consistent with `alerts-in-ua/ova-fallback.ts` where overlapping.
 */
export const OVA_PRIMARY: Record<OblastCode, OvaChannel> = {
  "UA-71": ova("UA-71", "cherkaskaODA", "Черкаська ОВА", "Cherkasy OMA", "Черкасская ОВА", "https://ck-oda.gov.ua"),
  "UA-74": ova("UA-74", "chernihivskaODA", "Чернігівська ОВА", "Chernihiv OMA", "Черниговская ОВА", "https://cg.gov.ua"),
  "UA-77": ova("UA-77", "chernivtsioda", "Чернівецька ОВА", "Chernivtsi OMA", "Черновицкая ОВА", "https://bukoda.gov.ua"),
  "UA-12": ova("UA-12", "dnipropetrovskaODA", "Дніпропетровська ОВА", "Dnipropetrovsk OMA", "Днепропетровская ОВА", "https://adm.dp.gov.ua"),
  "UA-14": ova("UA-14", "donoda_official", "Донецька ОВА", "Donetsk OMA", "Донецкая ОВА", "https://dn.gov.ua"),
  "UA-26": ova("UA-26", "pravda_if", "Івано-Франківська ОВА", "Ivano-Frankivsk OMA", "Ивано-Франковская ОВА", "https://www.if.gov.ua"),
  "UA-63": ova("UA-63", "synegubov", "Харківська ОВА", "Kharkiv OMA", "Харьковская ОВА", "https://kharkivoda.gov.ua"),
  "UA-65": ova("UA-65", "khersonskaODA", "Херсонська ОВА", "Kherson OMA", "Херсонская ОВА", "https://khoda.gov.ua"),
  "UA-68": ova("UA-68", "khmelnytskaODA", "Хмельницька ОВА", "Khmelnytskyi OMA", "Хмельницкая ОВА", "https://www.adm-km.gov.ua"),
  "UA-35": ova("UA-35", "kirovogradska_oda", "Кіровоградська ОВА", "Kirovohrad OMA", "Кировоградская ОВА", "https://kr-admin.gov.ua"),
  "UA-30": ova("UA-30", "kyivcity_official", "Київ (КМВА)", "Kyiv (City MA)", "Киев (КГВА)", "https://kmva.gov.ua"),
  "UA-32": ova("UA-32", "kyivobladmin", "Київська ОВА", "Kyiv Oblast OMA", "Киевская ОВА", "https://koda.gov.ua"),
  "UA-09": ova("UA-09", "luhanskaVTSA", "Луганська ОВА", "Luhansk OMA", "Луганская ОВА", "https://loga.gov.ua"),
  "UA-46": ova("UA-46", "lvivoda", "Львівська ОВА", "Lviv OMA", "Львовская ОВА", "https://loda.gov.ua"),
  "UA-48": ova("UA-48", "mykolaivskaODA", "Миколаївська ОВА", "Mykolaiv OMA", "Николаевская ОВА", "https://mk.gov.ua"),
  "UA-51": ova("UA-51", "odeskaODA", "Одеська ОВА", "Odesa OMA", "Одесская ОВА", "https://oda.odessa.gov.ua"),
  "UA-53": ova("UA-53", "poltavskaODA", "Полтавська ОВА", "Poltava OMA", "Полтавская ОВА", "https://www.adm-pl.gov.ua"),
  "UA-56": ova("UA-56", "rivnenska_oda", "Рівненська ОВА", "Rivne OMA", "Ровенская ОВА", "https://www.rv.gov.ua"),
  "UA-59": ova("UA-59", "Sumska_oda", "Сумська ОВА", "Sumy OMA", "Сумская ОВА", "https://sumyoda.gov.ua"),
  "UA-61": ova("UA-61", "ternopilskaODA", "Тернопільська ОВА", "Ternopil OMA", "Тернопольская ОВА", "https://oda.te.gov.ua"),
  "UA-05": ova("UA-05", "vinnytskaODA", "Вінницька ОВА", "Vinnytsia OMA", "Винницкая ОВА", "https://www.vin.gov.ua"),
  "UA-07": ova("UA-07", "volynska_oda", "Волинська ОВА", "Volyn OMA", "Волынская ОВА", "https://voladm.gov.ua"),
  "UA-21": ova("UA-21", "zakarpatskaODA", "Закарпатська ОВА", "Zakarpattia OMA", "Закарпатская ОВА", "https://carpathia.gov.ua"),
  "UA-23": ova("UA-23", "zoda_gov_ua", "Запорізька ОВА", "Zaporizhzhia OMA", "Запорожская ОВА", "https://www.zoda.gov.ua"),
  "UA-18": ova("UA-18", "zhytomyrskaODA", "Житомирська ОВА", "Zhytomyr OMA", "Житомирская ОВА", "https://zhytomyr-oda.gov.ua"),
  // Occupied / no active free administration — registered for completeness.
  "UA-43": ova("UA-43", "crimeanfront", "Кримська адміністрація", "Crimea administration", "Крымская администрация"),
  "UA-40": ova("UA-40", "sevastopol_admin", "Севастополь", "Sevastopol", "Севастополь"),
};

/** Five major city councils explicitly requested (Kyiv, Kharkiv, Odesa, Dnipro, Lviv). */
export const CITY_COUNCILS: OvaChannel[] = [
  city("UA-30", "kyivcity_gov_ua", "Київська міська рада", "Kyiv City Council", "Киевский горсовет", "https://kyivcity.gov.ua"),
  city("UA-63", "kharkiv_oficial", "Харківська міська рада", "Kharkiv City Council", "Харьковский горсовет", "https://www.city.kharkiv.ua"),
  city("UA-51", "odesacity", "Одеська міська рада", "Odesa City Council", "Одесский горсовет", "https://omr.gov.ua"),
  city("UA-12", "dniprorada", "Дніпровська міська рада", "Dnipro City Council", "Днепровский горсовет", "https://dniprorada.gov.ua"),
  city("UA-46", "lvivcityofficial", "Львівська міська рада", "Lviv City Council", "Львовский горсовет", "https://city-adm.lviv.ua"),
];

/**
 * Pre-registered backup/mirror channels (used by backup-detection.ts on a ban).
 * Sparse: only oblasts with publicly-known mirrors. Easily extended as data.
 */
export const KNOWN_BACKUPS: OvaChannel[] = [
  { username: "synegubov_backup", oblastCode: "UA-63", kind: "oblast_ova", role: "backup", label: { uk: "Харківська ОВА (резерв)", en: "Kharkiv OMA (backup)", ru: "Харьковская ОВА (резерв)" } },
  { username: "zoda_backup", oblastCode: "UA-23", kind: "oblast_ova", role: "backup", label: { uk: "Запорізька ОВА (резерв)", en: "Zaporizhzhia OMA (backup)", ru: "Запорожская ОВА (резерв)" } },
];

/** All channels flattened (primary OVAs + city councils + backups). */
export function allChannels(): OvaChannel[] {
  return [
    ...Object.values(OVA_PRIMARY),
    ...CITY_COUNCILS,
    ...KNOWN_BACKUPS,
  ];
}

/** Build the structured per-oblast group (primary + city councils + backups). */
export function oblastGroup(oblastCode: OblastCode): OvaOblastGroup {
  return {
    oblastCode,
    primary: OVA_PRIMARY[oblastCode],
    cityCouncils: CITY_COUNCILS.filter((c) => c.oblastCode === oblastCode),
    backups: KNOWN_BACKUPS.filter((b) => b.oblastCode === oblastCode),
  };
}

/** All 26 groups (24 active oblasts + Crimea + Sevastopol). */
export function allGroups(): OvaOblastGroup[] {
  return (Object.keys(OVA_PRIMARY) as OblastCode[]).map(oblastGroup);
}

/** Reverse lookup: @username → registered channel (case-insensitive). */
export function channelByUsername(username: string): OvaChannel | undefined {
  const u = username.replace(/^@/, "").toLowerCase();
  return allChannels().find((c) => c.username.toLowerCase() === u);
}

/** Convenience: oblast display info passthrough from civilian-alerts OBLASTS. */
export function oblastInfo(oblastCode: OblastCode) {
  return OBLASTS[oblastCode];
}
