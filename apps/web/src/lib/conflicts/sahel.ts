/**
 * Conflict config: Sahel (Mali / Burkina Faso / Niger / Chad / Mauritania).
 *
 * Phase 3 — humanitarian + geopolitical priority.
 * Underserved by Western OSINT; Wagner/Africa Corps presence documented.
 * FR + EN primary; hostile media environments in Mali, BF, Niger post-coup.
 *
 * Editorial risk: HIGH — state-actor manipulation, limited access,
 * per-country coup governments with hostile media environments.
 */

import type {
  ConflictConfig,
  ConflictSource,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const SAHEL_CONFIG: ConflictConfig = {
  id: "sahel",
  status: "active",
  phase: 3,
  editorialRisk: "high",

  name_en: "Sahel Crisis (Mali / Burkina Faso / Niger / Chad)",
  name_uk: "Криза Сахелю (Малі / Буркіна-Фасо / Нігер / Чад)",

  description_en:
    "Overlapping insurgencies, coups, and humanitarian crises across the Sahel belt. Key actors include national armies, jihadist groups (JNIM, IS-Sahel), Russian Africa Corps (ex-Wagner), and international forces. Underserved by Western OSINT.",
  description_uk:
    "Переплетені повстання, перевороти та гуманітарні кризи у поясі Сахелю. Ключові актори: національні армії, джихадистські угруповання (JNIM, IS-Sahel), Африканський корпус Росії (кол. Вагнер) та міжнародні сили. Майже не охоплено захіним OSINT.",

  // Covers Mali, Burkina Faso, Niger, Chad, Mauritania, northern Nigeria,
  // and the Lake Chad basin. [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [-17.5, 9.0, 24.0, 23.5],

  countries: ["ml", "bf", "ne", "td", "mr", "ng", "sn"],

  parties: [
    {
      id: "fama-mali",
      name_en: "FAMA — Malian Armed Forces",
      classification: "state",
    },
    {
      id: "bf-army",
      name_en: "Burkina Faso Armed Forces (Forces armées du Burkina Faso)",
      classification: "state",
    },
    {
      id: "niger-far",
      name_en: "Niger Armed Forces (FAR — Forces armées du Niger)",
      classification: "state",
    },
    {
      id: "chad-ant",
      name_en: "Chadian National Army (ANT)",
      classification: "state",
    },
    {
      id: "jnim",
      name_en: "JNIM — Jama'at Nusrat al-Islam wal-Muslimin",
      classification: "non-state",
    },
    {
      id: "is-sahel",
      name_en: "IS-Sahel — Islamic State in the Greater Sahara (ISGS)",
      classification: "non-state",
    },
    {
      id: "africa-corps",
      name_en: "Russia Africa Corps (ex-Wagner Group)",
      classification: "foreign-actor",
    },
    {
      id: "ecowas-forces",
      name_en: "ECOWAS regional forces",
      classification: "foreign-actor",
    },
    {
      id: "un-minusma",
      name_en: "UN MINUSMA (withdrawn 2023; historical)",
      classification: "foreign-actor",
    },
  ],

  locales: ["fr", "en", "ar"],

  launchGates: [
    "Africa-focused editor or regional Sahel advisor retained",
    "FR locale operational with native editorial reviewer",
    "ACLED data-sharing license confirmed for Sahel coverage",
    "Per-country legal counsel awareness: Mali, Burkina Faso, Niger hostile media environments assessed",
  ],

  isLaunched: false,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const SAHEL_SOURCES: ConflictSource[] = [
  {
    conflictId: "sahel",
    sourceId: "acled-sahel",
    name_en: "ACLED — Armed Conflict Location & Event Data (Sahel / West Africa)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["un-ocha-sahel", "local-fr-press-sahel"],
  },
  {
    conflictId: "sahel",
    sourceId: "un-ocha-sahel",
    name_en: "UN OCHA West and Central Africa — Sahel Humanitarian Situation Reports",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["acled-sahel"],
  },
  {
    conflictId: "sahel",
    sourceId: "local-fr-press-sahel",
    name_en: "Curated local Francophone press allow-list (per country)",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-sahel", "un-ocha-sahel"],
  },
  {
    conflictId: "sahel",
    sourceId: "eu-eu-defense-sahel",
    name_en: "French MoD + EU Defense EUTM / EUAM reporting",
    type: "official",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-sahel"],
  },
  {
    conflictId: "sahel",
    sourceId: "minusma-archive",
    name_en: "UN MINUSMA Archives (post-withdrawal 2023; historical record)",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "sahel",
    sourceId: "sentinel-sahel",
    name_en: "Sentinel-2 optical + Sentinel-1 SAR — Sahel (event verification)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "sahel",
    sourceId: "icrc-sahel",
    name_en: "ICRC — International Committee of the Red Cross (Sahel operations)",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
  },
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const SAHEL_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "sahel",

  toponymPolicy_en:
    "FR names are primary for Malian, Burkinabé, Nigerien, and Chadian place names in EN editorial output where no established EN form exists. Use UN and OCHA standard forms. Bamako, Ouagadougou, Niamey, N'Djamena: standard EN forms. Timbuktu (EN) / Tombouctou (FR): use Timbuktu in EN editorial, Tombouctou in FR output. Sahel as a geographic region descriptor, not a political entity. Lake Chad basin: note the transboundary nature (Chad, Niger, Nigeria, Cameroon) in geographic context.",

  disputedAreasPolicy_en:
    "No formally disputed international boundaries in the primary coverage zone, but de-facto control lines between government, JNIM, and IS-Sahel zones are shown with ACLED-sourced overlays and noted as approximate given access limitations. Coup-government territorial claims treated as de-facto administrative facts only; no implied legitimacy endorsement. ECOWAS sanctions lines and border closures (post-coup) noted where relevant to humanitarian access.",

  verificationStandard: "strict",

  civilianProtections: [
    "Casualty figures from government or armed group sources published only with explicit caveat; ACLED cross-verification required.",
    "No real-time location of civilian displacement camps or humanitarian corridors.",
    "Humanitarian access obstruction (by any party) documented and attributed.",
    "Images of civilians in conflict-affected areas: editorial review before publication.",
  ],

  prohibitedFramings: [
    "Coups presented as politically normal governance transitions without context of constitutional disruption, international non-recognition, and civilian-transition history.",
    "Wagner / Africa Corps presence described as \"security assistance\" without noting human rights documentation (ACLED, UN, HRW).",
    "\"Jihadist\" or \"terrorist\" as primary editorial framing without event-specific context and organisational attribution.",
    "Framing that implies JNIM or IS-Sahel have legitimate political standing in any country.",
    "Per-country state propaganda from junta governments presented as primary factual source without corroboration.",
  ],

  advisorsRequired: [
    "Africa / Sahel regional advisor (named external role)",
    "FR-language editorial reviewer (native, Sahel-context briefed)",
  ],

  reviewBoardRequired: false,
  counselReviewRequired: false,
};
