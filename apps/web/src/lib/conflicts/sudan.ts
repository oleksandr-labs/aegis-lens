/**
 * Conflict config: Sudan War (2023–present; SAF vs RSF civil war).
 *
 * Phase 3 — humanitarian priority.
 * One of the world's most underreported major conflicts.
 * High state-actor disinformation environment; AR coverage essential.
 *
 * Editorial risk: HIGH — disinformation at scale, limited access for
 * independent verification, foreign-actor interference (UAE/Russia/Egypt).
 */

import type {
  ConflictConfig,
  ConflictSource,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const SUDAN_CONFIG: ConflictConfig = {
  id: "sudan",
  status: "active",
  phase: 3,
  editorialRisk: "high",

  name_en: "Sudan War (SAF–RSF Conflict)",
  name_uk: "Війна в Судані (ЗС Судану — RSF)",

  description_en:
    "Civil war between the Sudanese Armed Forces (SAF) and the Rapid Support Forces (RSF) that began April 2023. One of the world's largest humanitarian crises, heavily underreported in Western media.",
  description_uk:
    "Громадянська війна між Збройними силами Судану (ЗСС) та Силами швидкого реагування (RSF), яка почалась у квітні 2023 р. Одна з найбільших гуманітарних криз у світі, яка майже не висвітлюється у захіних ЗМІ.",

  // Covers Sudan, South Sudan border zone, Chad border corridor, Red Sea coast.
  // [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [21.8, 3.5, 38.6, 22.2],

  countries: ["sd", "ss", "td", "eg", "er"],

  parties: [
    {
      id: "saf",
      name_en: "Sudanese Armed Forces (SAF)",
      classification: "state",
    },
    {
      id: "rsf",
      name_en: "Rapid Support Forces (RSF)",
      classification: "non-state",
    },
    {
      id: "allied-militias",
      name_en: "SAF-aligned and RSF-aligned militias",
      classification: "non-state",
    },
    {
      id: "uae-actor",
      name_en: "UAE (alleged RSF support; evidence-based attribution required)",
      classification: "foreign-actor",
    },
    {
      id: "russia-actor",
      name_en: "Russia / Wagner-Africa Corps (alleged RSF support)",
      classification: "foreign-actor",
    },
    {
      id: "egypt-actor",
      name_en: "Egypt (alleged SAF support; evidence-based attribution required)",
      classification: "foreign-actor",
    },
  ],

  locales: ["ar", "en", "fr"],

  launchGates: [
    "Humanitarian layer mature: displacement tracking (IOM DTM) + shelter data operational",
    "AR locale fully operational with native editorial reviewer",
    "Regional Sudan/Horn of Africa advisor retained",
    "UN OCHA Sudan partnership or data-sharing agreement in place",
  ],

  isLaunched: false,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const SUDAN_SOURCES: ConflictSource[] = [
  {
    conflictId: "sudan",
    sourceId: "acled-sudan",
    name_en: "ACLED — Armed Conflict Location & Event Data (Sudan)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["un-ocha-sudan", "iom-dtm-sudan"],
  },
  {
    conflictId: "sudan",
    sourceId: "un-ocha-sudan",
    name_en: "UN OCHA Sudan — Situation Reports + Humanitarian Dashboard",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["acled-sudan"],
  },
  {
    conflictId: "sudan",
    sourceId: "iom-dtm-sudan",
    name_en: "IOM Displacement Tracking Matrix (DTM) — Sudan",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "sudan",
    sourceId: "sentinel-sudan",
    name_en: "Sentinel-1 SAR + Sentinel-2 — urban warfare damage assessment, Sudan",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "sudan",
    sourceId: "curated-sudan-analysts",
    name_en: "Curated Sudan analysts (OSINT, diaspora press, Sudanese civil society)",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-sudan", "un-ocha-sudan"],
  },
  {
    conflictId: "sudan",
    sourceId: "hot-osm-sudan",
    name_en: "HOT OSM — Humanitarian OpenStreetMap Team (Sudan crisis mapping)",
    type: "humanitarian",
    trustTier: 2,
    requiresVerification: false,
  },
];

// ─── Launch gates (explicit typed array) ─────────────────────────────────────

export const SUDAN_LAUNCH_GATES: string[] = [
  "Humanitarian layer mature: IOM DTM displacement tracking + shelter data operational",
  "AR locale fully operational with native editorial reviewer",
  "Regional Sudan / Horn of Africa advisor retained",
  "UN OCHA Sudan data-sharing agreement or partnership in place",
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const SUDAN_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "sudan",

  toponymPolicy_en:
    "Use UN OCHA and AU standard Arabic transliterations for Sudanese place names. Khartoum (not Al-Khartum in EN editorial). El Fasher (not Al-Fashir; UN form preferred in EN). Omdurman, Port Sudan, Kassala, Nyala: standard EN forms. South Sudan border areas: use UNMISS and UN OCHA designations. AR-language output uses standard Arabic forms without transliteration. Disputed border areas (Abyei, Hala'ib Triangle): displayed with neutral cartographic treatment and ownership-status footnote.",

  disputedAreasPolicy_en:
    "Abyei Area: administered jointly by Sudan and South Sudan per 2005 CPA; displayed with hatched overlay and AU/UN status footnote. Hala'ib Triangle: administered by Egypt, claimed by Sudan; neutral cartographic treatment. RSF-controlled areas displayed with overlay indicating de-facto control only, not political recognition. SAF-controlled and contested zones shown per most recent ACLED / UN OCHA situation data.",

  verificationStandard: "strict",

  civilianProtections: [
    "Casualty figures: published only with explicit source attribution; divergence between SAF, RSF, and humanitarian sources must be noted prominently.",
    "No real-time location data for displacement camps or civilian shelters.",
    "Sexual violence in conflict: documented per UN protocols; no survivor identification.",
    "No imagery identifying individuals in refugee or IDP settings without consent.",
    "Famine and food-insecurity data: use IPC Phase classifications; no speculative famine declarations without IPC confirmation.",
  ],

  prohibitedFramings: [
    "Casualty figures from SAF or RSF official statements presented as verified without T1 corroboration.",
    "Foreign-actor involvement (UAE, Russia, Egypt) asserted without evidence-based attribution; use \"alleged\" and cite sources.",
    "Framing that implies RSF or SAF has internationally legitimate sole authority over Sudanese territory.",
    "\"Tribal conflict\" framing that reduces the conflict to ethnic dimensions without structural and political context.",
    "Normalising coup governance without noting the 2019 revolution, civilian transition disruption, and international non-recognition context.",
  ],

  advisorsRequired: [
    "Sudan / Horn of Africa regional advisor (named external role)",
    "AR-language editorial reviewer (native, Sudan-context briefed)",
  ],

  reviewBoardRequired: false,
  counselReviewRequired: false,
};
