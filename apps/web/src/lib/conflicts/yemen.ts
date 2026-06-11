/**
 * Conflict config: Yemen War + Red Sea Crisis (2014–present).
 *
 * Phase 3 — maritime + humanitarian priority.
 * Worst ongoing humanitarian crisis globally (UN designation).
 * Active Red Sea shipping-lane disruption by Houthi forces from 2023.
 *
 * Editorial risk: HIGH — AR coverage required, high disinformation volume,
 * maritime attribution is complex multi-actor environment,
 * sanctions compliance (Houthi designation as SDT in some jurisdictions).
 */

import type {
  ConflictConfig,
  ConflictSource,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const YEMEN_CONFIG: ConflictConfig = {
  id: "yemen",
  status: "active",
  phase: 3,
  editorialRisk: "high",

  name_en: "Yemen War + Red Sea Crisis",
  name_uk: "Війна в Ємені та криза в Червоному морі",

  description_en:
    "Multi-party civil war since 2014 and full Saudi-led coalition intervention since 2015. From late 2023, Houthi forces (Ansar Allah) began targeting Red Sea shipping lanes, drawing US and UK strikes. Worst ongoing humanitarian crisis globally.",
  description_uk:
    "Багатостороння громадянська війна з 2014 р. та втручання коаліції під керівництвом Саудівської Аравії з 2015 р. З кінця 2023 р. сили хуситів (Ансар Аллах) атакують судноплавство у Червоному морі, що призвело до ударів США та Великобританії. Найгірша поточна гуманітарна криза у світі.",

  // Covers Yemen mainland, Red Sea shipping lanes (Bab-el-Mandeb), Gulf of Aden.
  // [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [41.5, 11.0, 55.5, 19.0],

  countries: ["ye", "sa", "ae", "om"],

  parties: [
    {
      id: "houthi-ansar-allah",
      name_en: "Houthi Movement / Ansar Allah",
      classification: "non-state",
    },
    {
      id: "irg-ye",
      name_en: "Internationally Recognised Government of Yemen (Presidential Leadership Council)",
      classification: "state",
    },
    {
      id: "sac-coalition",
      name_en: "Saudi-led Coalition (Saudi Arabia + UAE + allies)",
      classification: "foreign-actor",
    },
    {
      id: "uae-yemen",
      name_en: "UAE (STC support, Socotra, southern Yemen)",
      classification: "foreign-actor",
    },
    {
      id: "stc",
      name_en: "Southern Transitional Council (STC)",
      classification: "non-state",
    },
    {
      id: "us-uk-redSea",
      name_en: "US / UK (Operation Prosperity Guardian + bilateral strikes)",
      classification: "foreign-actor",
    },
    {
      id: "iran-houthi-support",
      name_en: "Iran (Houthi weapons/logistics support; evidence-based attribution)",
      classification: "foreign-actor",
    },
  ],

  locales: ["ar", "en"],

  launchGates: [
    "Maritime layer mature: AIS integration + dark-vessel detection operational",
    "AR locale fully operational with native editorial reviewer",
    "Yemen / GCC regional advisor retained",
  ],

  isLaunched: false,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const YEMEN_SOURCES: ConflictSource[] = [
  {
    conflictId: "yemen",
    sourceId: "acled-yemen",
    name_en: "ACLED — Armed Conflict Location & Event Data (Yemen)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["un-ocha-yemen", "yemen-data-project"],
  },
  {
    conflictId: "yemen",
    sourceId: "yemen-data-project",
    name_en: "Yemen Data Project — airstrike and civilian casualty database",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["acled-yemen"],
  },
  {
    conflictId: "yemen",
    sourceId: "un-ocha-yemen",
    name_en: "UN OCHA Yemen — Humanitarian Situation Reports + Flash Updates",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["acled-yemen"],
  },
  {
    conflictId: "yemen",
    sourceId: "icrc-yemen",
    name_en: "ICRC Yemen — International Committee of the Red Cross field reports",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "yemen",
    sourceId: "ais-dark-vessel",
    name_en: "AIS + dark-vessel detection (maritime priority: Red Sea / Bab-el-Mandeb)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "yemen",
    sourceId: "sentinel1-sar-yemen",
    name_en: "Sentinel-1 SAR — vessel tracking + facility damage assessment, Red Sea / Yemen",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "yemen",
    sourceId: "local-journalists-yemen",
    name_en: "Curated Yemen local journalists + diaspora press",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-yemen", "un-ocha-yemen"],
  },
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const YEMEN_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "yemen",

  toponymPolicy_en:
    "Use UN OCHA and UNOSAT standard EN transliterations for Yemeni place names. Sanaa (not Sana'a in EN running text; use Sana'a in titles and maps for accuracy). Aden, Hodeida (UN preferred EN form; alternative: Hudaydah — note in parenthetical). Marib (not Ma'rib in EN running text). Socotra Island. Red Sea + Bab-el-Mandeb Strait: international hydrographic standard names. Gulf of Aden: standard form. AR-language output uses standard Arabic forms without transliteration.",

  disputedAreasPolicy_en:
    "Yemen's territory is contested between Houthi-controlled areas (north and west, including Sanaa), IRG-controlled areas (east, south), and STC-controlled areas (Aden, southern coastline). Control lines shown per most recent ACLED data with date stamp and caveat about access limitations. Socotra: shown as internationally recognised Yemeni territory; UAE administrative presence noted. Maritime: Red Sea shipping lanes with active incident zones marked per AIS + ACLED data; no sovereignty claims implied for international waters.",

  verificationStandard: "strict",

  civilianProtections: [
    "Civilian casualty figures: use Yemen Data Project + ACLED + UN OCHA cross-verification; coalition, Houthi, and IRG figures published with explicit caveat.",
    "Famine and food-insecurity data: IPC Phase 5 designations only; no speculative famine declarations.",
    "No real-time location of civilian shelter or humanitarian operation corridors.",
    "Cholera and disease outbreak data: WHO Yemen + UNICEF sourced; no amplification of unverified outbreak reports.",
    "No imagery identifying civilian individuals without consent, particularly in IDP and camp settings.",
  ],

  prohibitedFramings: [
    "\"Houthi rebels\" as primary descriptor without context of territorial control and de-facto governance (use \"Houthi forces\" or \"Ansar Allah\").",
    "\"Legitimate government\" applied to either IRG or Houthi forces without context of internationally recognised authority vs de-facto control distinction.",
    "Saudi-led coalition strikes described without civilian impact documentation available from T1 humanitarian sources.",
    "Maritime incidents in the Red Sea attributed to Houthi forces without AIS + OSINT corroboration; \"suspected\" used where attribution is incomplete.",
    "Iran's role in Houthi weapons supply asserted beyond what evidence supports; \"alleged\" and source citation required.",
    "Framing that minimises the humanitarian crisis scale; use IPC, UN, and NGO figures prominently.",
  ],

  advisorsRequired: [
    "Yemen / GCC regional advisor (named external role)",
    "AR-language editorial reviewer (native, Yemen-context briefed)",
    "Maritime law / sanctions compliance reviewer (for Red Sea incident coverage)",
  ],

  reviewBoardRequired: false,
  counselReviewRequired: false,
};
