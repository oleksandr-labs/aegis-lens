/**
 * Conflict config: Russia–Ukraine War (2014–present; full-scale invasion 2022–).
 *
 * Phase 1 anchor conflict. All editorial standards established here serve as
 * the reference implementation for subsequent conflict configs.
 *
 * Editorial risk: HIGH — real-time targeting concerns, disinformation at scale,
 * state-actor influence on both sides.
 */

import type {
  ConflictConfig,
  ConflictSource,
  ConflictToponymMap,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const UA_RU_CONFIG: ConflictConfig = {
  id: "ua-ru",
  status: "active",
  phase: 1,
  editorialRisk: "high",

  name_en: "Russia–Ukraine War",
  name_uk: "Російсько-українська війна",

  description_en:
    "Full-scale Russian invasion of Ukraine (February 2022) and preceding conflict since 2014 (Crimea, Donbas). Anchor coverage for the Aegis Lens platform.",
  description_uk:
    "Повномасштабне вторгнення Росії в Україну (лютий 2022) та попередній конфлікт з 2014 року (Крим, Донбас). Базовий конфлікт платформи Aegis Lens.",

  // Bounding box covers Ukraine, border oblasts of Russia, Belarus (transit),
  // Black Sea, Sea of Azov. [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [22.0, 44.0, 40.5, 52.5],

  countries: ["ua", "ru", "by"],

  parties: [
    {
      id: "afu",
      name_en: "Armed Forces of Ukraine (AFU)",
      classification: "state",
    },
    {
      id: "ru-af",
      name_en: "Russian Armed Forces",
      classification: "state",
    },
    {
      id: "tdf-ua",
      name_en: "Ukrainian Territorial Defense Forces",
      classification: "state",
    },
    {
      id: "wagner",
      name_en: "Wagner Group (historical — now Africa Corps)",
      classification: "non-state",
    },
    {
      id: "ru-rosgvardia",
      name_en: "Rosgvardia (Russian National Guard)",
      classification: "state",
    },
    {
      id: "dnr-lnr",
      name_en: "DPR/LPR forces (Russian proxy; incorporated into RF armed forces 2022)",
      classification: "non-state",
    },
  ],

  locales: ["uk", "en", "ru", "pl", "de"],

  launchGates: [
    "All UA integrations live (alerts, OVA, MoD, DeepStateMAP, Oryx)",
    "Editorial board approved conflict config",
    "OSINT-ethics policy published",
    "DeepStateMAP partnership in motion",
  ],

  // UA-RU is the launched anchor conflict.
  isLaunched: true,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const UA_RU_SOURCES: ConflictSource[] = [
  {
    conflictId: "ua-ru",
    sourceId: "isw-daily",
    name_en: "ISW — Institute for the Study of War (Daily Assessment)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["genstaff-ua", "deepstatemap"],
  },
  {
    conflictId: "ua-ru",
    sourceId: "deepstatemap",
    name_en: "DeepStateMAP",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["isw-daily"],
  },
  {
    conflictId: "ua-ru",
    sourceId: "genstaff-ua",
    name_en: "General Staff of the Armed Forces of Ukraine",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["isw-daily"],
  },
  {
    conflictId: "ua-ru",
    sourceId: "mod-ua",
    name_en: "Ministry of Defence of Ukraine",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "ova-telegram",
    name_en: "Oblast Military Administration Telegram channels (OVA)",
    type: "official",
    trustTier: 1,
    requiresVerification: true,
    balancedWith: ["dsns-ua"],
  },
  {
    conflictId: "ua-ru",
    sourceId: "alerts-in-ua",
    name_en: "alerts.in.ua — Air Raid Alert API",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "oryx-losses",
    name_en: "Oryx — Visually Confirmed Equipment Losses",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "acled-ua",
    name_en: "ACLED — Armed Conflict Location & Event Data (Ukraine)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["isw-daily", "deepstatemap"],
  },
  {
    conflictId: "ua-ru",
    sourceId: "cert-ua",
    name_en: "CERT-UA — Computer Emergency Response Team of Ukraine",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "ukrenergo",
    name_en: "Ukrenergo — National Power Grid Operator",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "dsns-ua",
    name_en: "DSNS Ukraine — State Emergency Service",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "ua-losses",
    name_en: "UALosses — Ukrainian Equipment & Personnel Loss Tracker",
    type: "osint",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["oryx-losses", "genstaff-ua"],
  },
  {
    conflictId: "ua-ru",
    sourceId: "ukrhydromet",
    name_en: "Ukrhydromet — Ukrainian Hydrometeorological Center",
    type: "official",
    trustTier: 2,
    requiresVerification: false,
  },
  {
    conflictId: "ua-ru",
    sourceId: "copernicus-ems",
    name_en: "Copernicus Emergency Management Service (EMS)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const UA_RU_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "ua-ru",

  toponymPolicy_en:
    "Use Ukrainian-government-preferred transliterations exclusively: Kyiv (not Kiev), Kharkiv (not Kharkov), Odesa (not Odessa), Lviv (not Lvov), Zaporizhzhia (not Zaporozhye or Zaporizhia), Dnipro (not Dnipropetrovsk), Kherson, Mykolaiv, Mariupol. Crimean place names: use Ukrainian forms with a parenthetical note acknowledging the name used under Russian administration where relevant for source attribution. Donbas (not Donbass). Luhansk (not Lugansk). All toponyms normalised at ingestion; raw source strings retained in metadata.",

  disputedAreasPolicy_en:
    "Crimea, Donetsk People's Republic (DPR), Luhansk People's Republic (LPR), Zaporizhzhia Oblast (Russian-occupied portions), and Kherson Oblast (Russian-occupied portions) are displayed with hatched overlays indicating occupied status per Ukrainian government lines. De-facto Russian administrative lines are shown as dashed secondary lines. The platform does not recognise Russian annexation claims for editorial or cartographic purposes. All boundary layers are accompanied by a legal-status footnote citing UN General Assembly Resolution ES-11/1.",

  verificationStandard: "strict",

  civilianProtections: [
    "No publication of real-time precision locations of civilian shelters or evacuation routes where such detail could aid targeting.",
    "Air-raid alert data published with intentional sub-oblast granularity only (no street-level alerts).",
    "Ukrainian civilian infrastructure damage documented with source attribution and timestamp; no speculative targeting attribution without T1 corroboration.",
    "POW imagery subject to consent review before publication; Geneva Convention compliance checked.",
    "No publication of casualty data that identifies individual civilians by name without family consent.",
    "Mariupol historical record preserved: civilian siege, Azovstal, evacuation corridors documented with UN + ICRC corroboration.",
  ],

  prohibitedFramings: [
    "\"Civil war\" framing for the Russia-Ukraine conflict — this is an internationally recognised cross-border war of aggression (UN GA Resolution ES-11/1).",
    "\"Both sides\" false equivalence between aggressor and defender in framing of territorial claims.",
    "Presentation of Russian state media casualty or territorial claim figures as primary or equivalent to independently verified data.",
    "\"Disputed\" applied to Crimea or Donbas without immediate clarification of internationally-recognised Ukrainian sovereignty.",
    "Coverage that implies Ukrainian military targets on civilian infrastructure without T1 source verification.",
  ],

  advisorsRequired: [
    "Ukrainian legal/constitutional affairs advisor",
    "Ukraine-focused OSINT analyst (external, named)",
  ],

  reviewBoardRequired: false, // Standard editorial board sufficient for Phase 1 anchor
  counselReviewRequired: false,
};

// ─── Toponym map ──────────────────────────────────────────────────────────────

export const UA_RU_TOPONYMS: ConflictToponymMap[] = [
  {
    conflictId: "ua-ru",
    toponym: "kyiv",
    preferredForm_en: "Kyiv",
    alternatives: ["Kiev", "Kiyev", "Kiew"],
    rationale_en:
      "Ukrainian transliteration; internationally adopted since 2019 UA MFA campaign. Kiev is the Russian-era form.",
  },
  {
    conflictId: "ua-ru",
    toponym: "kharkiv",
    preferredForm_en: "Kharkiv",
    alternatives: ["Kharkov", "Charkiw"],
    rationale_en:
      "Ukrainian transliteration. Kharkov is the Russian-language form; deprecated for editorial use.",
  },
  {
    conflictId: "ua-ru",
    toponym: "zaporizhzhia",
    preferredForm_en: "Zaporizhzhia",
    alternatives: ["Zaporizhia", "Zaporozhye", "Zaporozhe", "Zaporizhya"],
    rationale_en:
      "Ukrainian government standard spelling. Zaporozhye is Russian; Zaporizhia is an older transliteration still found in some OSINT sources.",
  },
  {
    conflictId: "ua-ru",
    toponym: "lviv",
    preferredForm_en: "Lviv",
    alternatives: ["Lvov", "Lwów", "Lemberg"],
    rationale_en:
      "Ukrainian name; Lvov is Russian, Lwów is Polish, Lemberg is German/Austro-Hungarian. Lviv used in all editorial output.",
  },
  {
    conflictId: "ua-ru",
    toponym: "dnipro",
    preferredForm_en: "Dnipro",
    alternatives: ["Dnipropetrovsk", "Dnepropetrovsk", "Dnepro"],
    rationale_en:
      "City renamed from Dnipropetrovsk in 2016 under Ukraine decommunisation law. Dnepropetrovsk is the Soviet/Russian form.",
  },
  {
    conflictId: "ua-ru",
    toponym: "odesa",
    preferredForm_en: "Odesa",
    alternatives: ["Odessa", "Odessa (de)"],
    rationale_en:
      "Ukrainian single-s spelling per UA government standard. Odessa (double-s) is the Russian and historical Western form.",
  },
  {
    conflictId: "ua-ru",
    toponym: "donbas",
    preferredForm_en: "Donbas",
    alternatives: ["Donbass", "Donbas region", "Eastern Ukraine"],
    rationale_en:
      "Single-s Ukrainian form. Donbass (double-s) is the Russian form. \"Eastern Ukraine\" is an acceptable geographic descriptor but should not replace Donbas in conflict context.",
  },
  {
    conflictId: "ua-ru",
    toponym: "luhansk",
    preferredForm_en: "Luhansk",
    alternatives: ["Lugansk", "Luganск"],
    rationale_en:
      "Ukrainian transliteration. Lugansk is Russian; both refer to the same city. Use Luhansk in editorial output.",
  },
  {
    conflictId: "ua-ru",
    toponym: "donetsk",
    preferredForm_en: "Donetsk",
    alternatives: ["Donetzk", "Donetsk (RU-controlled)"],
    rationale_en:
      "Spelling consistent across UA and EN usage. Editorially noted as de-facto Russian-controlled since 2014; sovereignty remains Ukrainian per international law.",
  },
  {
    conflictId: "ua-ru",
    toponym: "simferopol",
    preferredForm_en: "Simferopol",
    alternatives: ["Simferopolʹ", "Akmescit", "Aqmescit"],
    rationale_en:
      "Widely used EN form. Akmescit/Aqmescit is the Crimean Tatar name; referenced in cultural/historical context. City is in Russian-occupied Crimea.",
  },
  {
    conflictId: "ua-ru",
    toponym: "sevastopol",
    preferredForm_en: "Sevastopol",
    alternatives: ["Sebastopol", "Sevastopol'"],
    rationale_en:
      "Standard EN spelling. Located in Russian-occupied Crimea; noted as occupied in cartographic output.",
  },
  {
    conflictId: "ua-ru",
    toponym: "crimea",
    preferredForm_en: "Crimea",
    alternatives: ["Krym", "Crimeа (Russian-occupied)", "Autonomous Republic of Crimea"],
    rationale_en:
      "Standard EN toponym. Always accompanied in context by note that Crimea is internationally recognised as Ukrainian territory under Russian occupation since 2014.",
  },
  {
    conflictId: "ua-ru",
    toponym: "snake-island",
    preferredForm_en: "Snake Island",
    alternatives: ["Zmiinyi Island", "Zmiiny Island", "Ostriv Zmiinyi"],
    rationale_en:
      "\"Snake Island\" is the widely recognised EN form following the February 2022 incident. Zmiinyi/Zmiiny are Ukrainian transliterations; both acceptable in source attribution.",
  },
  {
    conflictId: "ua-ru",
    toponym: "bakhmut",
    preferredForm_en: "Bakhmut",
    alternatives: ["Artemivsk", "Artemovsk", "Bachmut"],
    rationale_en:
      "Bakhmut is the Ukrainian name (restored 2016 under decommunisation). Artemivsk/Artemovsk are Soviet-era names still used by Russian forces and some Western outlets; should be noted as alternative but Bakhmut is the preferred form.",
  },
  {
    conflictId: "ua-ru",
    toponym: "kherson",
    preferredForm_en: "Kherson",
    alternatives: ["Cherson", "Херсон"],
    rationale_en:
      "Standard EN form. Kherson Oblast partially occupied by Russian forces; city of Kherson was liberated by Ukraine in November 2022. Cartographic note required for oblast boundary display.",
  },
  {
    conflictId: "ua-ru",
    toponym: "mykolaiv",
    preferredForm_en: "Mykolaiv",
    alternatives: ["Nikolaev", "Nikolayev", "Mykolayiv"],
    rationale_en:
      "Ukrainian form. Nikolaev/Nikolayev are Russian forms; deprecated for editorial use.",
  },
  {
    conflictId: "ua-ru",
    toponym: "mariupol",
    preferredForm_en: "Mariupol",
    alternatives: ["Mariupil", "Mariupolʹ"],
    rationale_en:
      "Standard form; under Russian occupation since May 2022 following Azovstal siege. Historical record of siege and civilian casualties documented. The Russian administration renamed it; the platform uses Mariupol exclusively.",
  },
];
