/**
 * Conflict config: Myanmar Civil War (2021–present; post-coup).
 *
 * Phase 4 — APAC strategic expansion.
 * Underreported; NGO and humanitarian press are primary beneficiaries.
 * Optical imagery limited by cloud cover; Sentinel-1 SAR prioritised.
 *
 * Editorial risk: HIGH — per-region complexity (each state/region distinct),
 * limited press access, junta media environment, BU locale requires Phase 4.
 */

import type {
  ConflictConfig,
  ConflictSource,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const MYANMAR_CONFIG: ConflictConfig = {
  id: "myanmar",
  status: "active",
  phase: 4,
  editorialRisk: "high",

  name_en: "Myanmar Civil War (Post-coup conflict)",
  name_uk: "Громадянська війна в М'янмі (конфлікт після перевороту)",

  description_en:
    "Civil war following the February 2021 military coup by the SAC (State Administration Council / Tatmadaw). People's Defence Forces (PDFs) and Ethnic Armed Organisations (EAOs) oppose the junta across multiple fronts.",
  description_uk:
    "Громадянська війна після військового перевороту Ради державного управління (SAC / Татмадо) у лютому 2021 р. Сили народної оборони (PDF) та Збройні організації етнічних меншин (EAO) протистоять хунті на кількох фронтах.",

  // Covers Myanmar + neighboring border areas (Thailand, Bangladesh, India, China, Laos).
  // [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [92.0, 9.5, 101.2, 28.5],

  countries: ["mm", "th", "bd", "in"],

  parties: [
    {
      id: "sac-tatmadaw",
      name_en: "SAC — State Administration Council (Tatmadaw / Myanmar military junta)",
      classification: "state",
    },
    {
      id: "pdf",
      name_en: "People's Defence Forces (PDFs — NUG-aligned)",
      classification: "non-state",
    },
    {
      id: "nug",
      name_en: "National Unity Government (NUG — shadow government)",
      classification: "non-state",
    },
    {
      id: "eaos",
      name_en: "Ethnic Armed Organisations (EAOs — multiple, distinct per region)",
      classification: "non-state",
    },
    {
      id: "3bha",
      name_en: "Three Brotherhood Alliance (MNDAA, TNLA, AA)",
      classification: "non-state",
    },
  ],

  locales: ["en", "bu"],

  launchGates: [
    "APAC region playbook active",
    "Myanmar / Southeast Asia regional advisor retained",
  ],

  isLaunched: false,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const MYANMAR_SOURCES: ConflictSource[] = [
  {
    conflictId: "myanmar",
    sourceId: "acled-myanmar",
    name_en: "ACLED — Armed Conflict Location & Event Data (Myanmar)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["myanmar-now", "un-ocha-myanmar"],
  },
  {
    conflictId: "myanmar",
    sourceId: "myanmar-now",
    name_en: "Myanmar Now — independent journalism",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-myanmar"],
  },
  {
    conflictId: "myanmar",
    sourceId: "frontier-myanmar",
    name_en: "Frontier Myanmar — independent investigative journalism",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-myanmar"],
  },
  {
    conflictId: "myanmar",
    sourceId: "irrawaddy",
    name_en: "The Irrawaddy — news and analysis",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["acled-myanmar"],
  },
  {
    conflictId: "myanmar",
    sourceId: "sentinel1-sar-myanmar",
    name_en: "Sentinel-1 SAR — Myanmar (optical limited by cloud cover; SAR priority)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "myanmar",
    sourceId: "un-ocha-myanmar",
    name_en: "UN OCHA Myanmar — Humanitarian Situation Reports",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
  },
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const MYANMAR_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "myanmar",

  toponymPolicy_en:
    "Use Myanmar (not Burma) for the country name in editorial output; Burma acceptable in historical context (pre-1989). Naypyidaw (capital). Yangon (not Rangoon). State and region names: use official Myanmar names. Rakhine State (not Arakan in EN editorial; acceptable as alternative in historical context). Rohingya: use as the community's self-identification; the Myanmar junta's rejection of this term is noted but not adopted editorially. Kachin, Kayah (Karenni), Karen (Kayin), Mon, Chin, Shan states: use Myanmar/EN government standard names.",

  disputedAreasPolicy_en:
    "Control lines shown per ACLED data with date stamp; per-state/region complexity acknowledged in display metadata. SAC-controlled, PDF/NUG-controlled, and EAO-controlled zones overlaid separately with source caveat. Rakhine State: Rohingya displacement and conflict zones noted separately from other conflict areas. China-border EAO zones: note limited independent verification access.",

  verificationStandard: "strict",

  civilianProtections: [
    "No imagery or data identifying Rohingya or other ethnic minority community members in displacement settings.",
    "Airstrike civilian casualty data: Myanmar Now / ACLED / UN OCHA cross-verification required.",
    "No real-time location of civilian displacement areas or IDP camps.",
    "No information that could compromise cross-border humanitarian corridor access.",
  ],

  prohibitedFramings: [
    "The SAC/Tatmadaw framed as the sole legitimate government of Myanmar without noting the 2020 election outcome, coup, NUG formation, and international non-recognition.",
    "NUG/PDF framed as terrorist organisations without citation from a competent legal authority making that designation.",
    "EAOs discussed as a monolithic bloc; each has distinct political objectives and operational zones.",
    "Ethnic conflict framing that reduces the civil war to ethnic dimensions without the post-coup political context.",
  ],

  advisorsRequired: [
    "Myanmar / Southeast Asia regional advisor (named external role)",
  ],

  reviewBoardRequired: false,
  counselReviewRequired: false,
};
