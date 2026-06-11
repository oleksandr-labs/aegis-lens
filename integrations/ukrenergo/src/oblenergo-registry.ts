/**
 * Registry of Ukraine's regional distribution operators (oblenergo / DSO).
 *
 * Each of the 24 oblasts (+ Kyiv city) has a distribution operator that
 * publishes outage schedules in its own format and on its own site + Telegram.
 * This registry encodes, per region: the operator's display name (uk/ru/en),
 * its public site + Telegram, and a `format` hint that selects the right parser
 * in provider-adapters.ts.
 *
 * Sources used to compile operator identities: NEURC (НКРЕКП) licensee list,
 * Ukrenergo, and each operator's public site. URLs are publicly published
 * portals; we ingest via polite HTTP / Telegram Bot API only (see COMPLIANCE.md).
 *
 * Note on occupied/contested regions (Crimea, parts of Donetsk/Luhansk/Kherson/
 * Zaporizhzhia): the listed operator is the Ukrainian licensee; live coverage may
 * be partial. `coverage: "partial"` flags this.
 */

import type { OblastCode, ProviderFormat, LocalizedText } from "./types";

export interface OblenergoProvider {
  regionCode: OblastCode;
  /** Operator slug used in records/attribution. */
  slug: string;
  name: LocalizedText;
  /** Public schedule site (HTML). */
  site?: string;
  /** Public Telegram channel (read via Bot API only). */
  telegram?: string;
  /** Parser to apply to this operator's published schedules. */
  format: ProviderFormat;
  /** Number of rotation groups this operator publishes (typ. 6, or sub-groups). */
  groupCount?: number;
  /** Whether the consumer portal Yasno/DTEK also serves this region. */
  consumerPortal?: "yasno" | "dtek" | null;
  /** Live-data confidence caveat. */
  coverage: "full" | "partial";
}

/**
 * 25 entries: 24 oblasts + Kyiv city. Keyed by ISO 3166-2:UA oblast code.
 * Several DTEK-operated regions also expose schedules via the Yasno app.
 */
export const OBLENERGO_PROVIDERS: Record<OblastCode, OblenergoProvider> = {
  "UA-71": {
    regionCode: "UA-71", slug: "cherkasyoblenergo",
    name: { uk: "Черкасиобленерго", ru: "Черкассыоблэнерго", en: "Cherkasyoblenergo" },
    site: "https://www.cherkasyoblenergo.com", telegram: "https://t.me/cherkasyoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-74": {
    regionCode: "UA-74", slug: "chernihivoblenergo",
    name: { uk: "Чернігівобленерго", ru: "Черниговоблэнерго", en: "Chernihivoblenergo" },
    site: "https://www.chernihiv.energy", telegram: "https://t.me/chernigivoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-77": {
    regionCode: "UA-77", slug: "chernivtsioblenergo",
    name: { uk: "Чернівціобленерго", ru: "Черновцыоблэнерго", en: "Chernivtsioblenergo" },
    site: "https://www.oblenergo.cv.ua", telegram: "https://t.me/oblenergo_cv",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-12": {
    regionCode: "UA-12", slug: "dtek-dnem",
    name: { uk: "ДТЕК Дніпровські електромережі", ru: "ДТЭК Днепровские электросети", en: "DTEK Dnipro Grids" },
    site: "https://www.dtek-dnem.com.ua", telegram: "https://t.me/dtek_ua",
    format: "dtek_schedule_html", groupCount: 6, consumerPortal: "yasno", coverage: "full",
  },
  "UA-14": {
    regionCode: "UA-14", slug: "dtek-donetsk",
    name: { uk: "ДТЕК Донецькі електромережі", ru: "ДТЭК Донецкие электросети", en: "DTEK Donetsk Grids" },
    site: "https://www.dtek-dnem.com.ua", telegram: "https://t.me/dtek_ua",
    format: "dtek_schedule_html", groupCount: 6, consumerPortal: "dtek", coverage: "partial",
  },
  "UA-26": {
    regionCode: "UA-26", slug: "prykarpattyaoblenergo",
    name: { uk: "Прикарпаттяобленерго", ru: "Прикарпатьеоблэнерго", en: "Prykarpattyaoblenergo" },
    site: "https://www.oe.if.ua", telegram: "https://t.me/oe_if_ua",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-63": {
    regionCode: "UA-63", slug: "kharkivoblenergo",
    name: { uk: "Харківобленерго", ru: "Харьковоблэнерго", en: "Kharkivoblenergo" },
    site: "https://www.oblenergo.kharkov.ua", telegram: "https://t.me/kharkivoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-65": {
    regionCode: "UA-65", slug: "khersonoblenergo",
    name: { uk: "Херсонобленерго", ru: "Херсоноблэнерго", en: "Khersonoblenergo" },
    site: "https://www.ksoe.com.ua", telegram: "https://t.me/khersonoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "partial",
  },
  "UA-68": {
    regionCode: "UA-68", slug: "khmelnytskoblenergo",
    name: { uk: "Хмельницькобленерго", ru: "Хмельницкоблэнерго", en: "Khmelnytskoblenergo" },
    site: "https://www.hoe.com.ua", telegram: "https://t.me/khmelnytskoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-35": {
    regionCode: "UA-35", slug: "kirovohradoblenergo",
    name: { uk: "Кіровоградобленерго", ru: "Кировоградоблэнерго", en: "Kirovohradoblenergo" },
    site: "https://www.kiroe.com.ua", telegram: "https://t.me/kirovohradoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-30": {
    regionCode: "UA-30", slug: "dtek-kem",
    name: { uk: "ДТЕК Київські електромережі", ru: "ДТЭК Киевские электросети", en: "DTEK Kyiv Grids" },
    site: "https://www.dtek-kem.com.ua", telegram: "https://t.me/yasno_ua",
    format: "yasno_groups_json", groupCount: 6, consumerPortal: "yasno", coverage: "full",
  },
  "UA-32": {
    regionCode: "UA-32", slug: "dtek-krem",
    name: { uk: "ДТЕК Київські регіональні електромережі", ru: "ДТЭК Киевские региональные электросети", en: "DTEK Kyiv Regional Grids" },
    site: "https://www.dtek-krem.com.ua", telegram: "https://t.me/yasno_ua",
    format: "dtek_schedule_html", groupCount: 6, consumerPortal: "yasno", coverage: "full",
  },
  "UA-09": {
    regionCode: "UA-09", slug: "luhanskoblenergo",
    name: { uk: "Луганське ЕО", ru: "Луганское ЭО", en: "Luhansk Energy Association" },
    site: "https://www.loe.lg.ua", telegram: undefined,
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "partial",
  },
  "UA-46": {
    regionCode: "UA-46", slug: "lvivoblenergo",
    name: { uk: "Львівобленерго", ru: "Львовоблэнерго", en: "Lvivoblenergo" },
    site: "https://www.loe.lviv.ua", telegram: "https://t.me/lvivoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-48": {
    regionCode: "UA-48", slug: "mykolaivoblenergo",
    name: { uk: "Миколаївобленерго", ru: "Николаевоблэнерго", en: "Mykolaivoblenergo" },
    site: "https://www.energy.mk.ua", telegram: "https://t.me/mykolaivoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-51": {
    regionCode: "UA-51", slug: "dtek-oem",
    name: { uk: "ДТЕК Одеські електромережі", ru: "ДТЭК Одесские электросети", en: "DTEK Odesa Grids" },
    site: "https://www.dtek-oem.com.ua", telegram: "https://t.me/dtek_ua",
    format: "dtek_schedule_html", groupCount: 6, consumerPortal: "yasno", coverage: "full",
  },
  "UA-53": {
    regionCode: "UA-53", slug: "poltavaoblenergo",
    name: { uk: "Полтаваобленерго", ru: "Полтаваоблэнерго", en: "Poltavaoblenergo" },
    site: "https://www.poe.pl.ua", telegram: "https://t.me/poltavaoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-56": {
    regionCode: "UA-56", slug: "rivneoblenergo",
    name: { uk: "Рівнеобленерго", ru: "Ровнооблэнерго", en: "Rivneoblenergo" },
    site: "https://www.roe.vsei.ua", telegram: "https://t.me/rivneoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-59": {
    regionCode: "UA-59", slug: "sumyoblenergo",
    name: { uk: "Сумиобленерго", ru: "Сумыоблэнерго", en: "Sumyoblenergo" },
    site: "https://www.soe.com.ua", telegram: "https://t.me/sumyoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-61": {
    regionCode: "UA-61", slug: "ternopiloblenergo",
    name: { uk: "Тернопільобленерго", ru: "Тернопольоблэнерго", en: "Ternopiloblenergo" },
    site: "https://www.toe.com.ua", telegram: "https://t.me/ternopiloblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-05": {
    regionCode: "UA-05", slug: "vinnytsiaoblenergo",
    name: { uk: "Вінницяобленерго", ru: "Винницаоблэнерго", en: "Vinnytsiaoblenergo" },
    site: "https://www.voe.com.ua", telegram: "https://t.me/vinnytsiaoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-07": {
    regionCode: "UA-07", slug: "volynoblenergo",
    name: { uk: "Волиньобленерго", ru: "Волыньоблэнерго", en: "Volynoblenergo" },
    site: "https://www.energy.volyn.ua", telegram: "https://t.me/volynoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-21": {
    regionCode: "UA-21", slug: "zakarpattyaoblenergo",
    name: { uk: "Закарпаттяобленерго", ru: "Закарпатьеоблэнерго", en: "Zakarpattyaoblenergo" },
    site: "https://www.uz.energy", telegram: "https://t.me/zakarpattyaoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
  "UA-23": {
    regionCode: "UA-23", slug: "zaporizhzhiaoblenergo",
    name: { uk: "Запоріжжяобленерго", ru: "Запорожьеоблэнерго", en: "Zaporizhzhiaoblenergo" },
    site: "https://www.zoe.com.ua", telegram: "https://t.me/zaporizhzhiaoblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "partial",
  },
  "UA-18": {
    regionCode: "UA-18", slug: "zhytomyroblenergo",
    name: { uk: "Житомиробленерго", ru: "Житомироблэнерго", en: "Zhytomyroblenergo" },
    site: "https://www.ztoe.com.ua", telegram: "https://t.me/zhytomyroblenergo",
    format: "oblenergo_html_table", groupCount: 6, consumerPortal: null, coverage: "full",
  },
};

/** Lookup a provider by oblast code. */
export function getProvider(regionCode: OblastCode): OblenergoProvider | undefined {
  return OBLENERGO_PROVIDERS[regionCode];
}

/** All region codes covered by the registry. */
export function listRegionCodes(): OblastCode[] {
  return Object.keys(OBLENERGO_PROVIDERS);
}

/** Regions served by a given consumer portal (yasno/dtek). */
export function regionsByConsumerPortal(portal: "yasno" | "dtek"): OblenergoProvider[] {
  return Object.values(OBLENERGO_PROVIDERS).filter((p) => p.consumerPortal === portal);
}
