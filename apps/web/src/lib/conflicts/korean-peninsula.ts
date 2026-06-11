/**
 * Conflict config: Korean Peninsula (frozen-but-active flashpoint).
 *
 * Phase 4 — strategic APAC expansion.
 * Value: finance + APAC defense personas; sanctions-vessel tracking priority.
 * DPRK monitoring via Sentinel-1 SAR (nuclear/missile facilities).
 *
 * Editorial risk: HIGH — DPRK is one of the least transparent states;
 * strict editorial discipline on attribution and speculation required.
 * PRC operations are out of scope for this config.
 */

import type {
  ConflictConfig,
  ConflictSource,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const KOREAN_PENINSULA_CONFIG: ConflictConfig = {
  id: "korean-peninsula",
  status: "frozen",
  phase: 4,
  editorialRisk: "high",

  name_en: "Korean Peninsula — Frozen Conflict / Active Flashpoint",
  name_uk: "Корейський півострів — заморожений конфлікт / активне вогнище напруги",

  description_en:
    "Armistice (1953) — no peace treaty. DMZ divides the peninsula. Active flashpoints: missile tests, maritime incidents, cyber operations, and DPRK troops deployed to Russia (2024). Sanctions-vessel tracking and nuclear/missile monitoring are primary intelligence products.",
  description_uk:
    "Перемир'я (1953) без мирного договору. ДМЗ розділяє півострів. Активні вогнища: випробування ракет, морські інциденти, кіберопераціі, розгортання військ КНДР у Росії (2024). Відстеження суден під санкціями та моніторинг ядерних/ракетних об'єктів — пріоритетні розвідувальні продукти.",

  // Covers Korean Peninsula, DMZ, surrounding waters (Yellow Sea, Sea of Japan/East Sea).
  // [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [124.0, 33.0, 132.0, 43.0],

  countries: ["kr", "kp", "jp"],

  parties: [
    {
      id: "rok-armed-forces",
      name_en: "Republic of Korea Armed Forces (ROK)",
      classification: "state",
    },
    {
      id: "dprk-kpa",
      name_en: "Democratic People's Republic of Korea — Korean People's Army (KPA)",
      classification: "state",
    },
    {
      id: "usfk",
      name_en: "US Forces Korea (USFK)",
      classification: "foreign-actor",
    },
    {
      id: "dprk-russia",
      name_en: "DPRK troops deployed to Russia (2024–; support for Russian forces)",
      classification: "foreign-actor",
    },
  ],

  locales: ["ko", "en", "ja"],

  launchGates: [
    "APAC region playbook active",
    "KO locale operational with native editorial reviewer",
    "Korean Peninsula regional advisor retained",
    "Maritime layer mature (AIS + dark-vessel for sanctions compliance)",
  ],

  isLaunched: false,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const KOREAN_PENINSULA_SOURCES: ConflictSource[] = [
  {
    conflictId: "korean-peninsula",
    sourceId: "38north",
    name_en: "38 North — DPRK monitoring (Stimson Center)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["nknews", "rok-jcs"],
  },
  {
    conflictId: "korean-peninsula",
    sourceId: "nknews",
    name_en: "NK News — North Korea specialist reporting",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["38north"],
  },
  {
    conflictId: "korean-peninsula",
    sourceId: "rok-jcs",
    name_en: "ROK Joint Chiefs of Staff official statements",
    type: "official",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["38north"],
  },
  {
    conflictId: "korean-peninsula",
    sourceId: "csis-iiss-korea",
    name_en: "CSIS / IISS — strategic analysis, Korean Peninsula",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "korean-peninsula",
    sourceId: "japan-mod-korea",
    name_en: "Japan Ministry of Defense — regional security statements",
    type: "official",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["rok-jcs"],
  },
  {
    conflictId: "korean-peninsula",
    sourceId: "sentinel1-sar-dprk",
    name_en: "Sentinel-1 SAR — DPRK facility monitoring (nuclear / missile infrastructure)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
  {
    conflictId: "korean-peninsula",
    sourceId: "ais-sanctions-dprk",
    name_en: "AIS + dark-vessel detection — DPRK sanctions-evasion vessel tracking",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const KOREAN_PENINSULA_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "korean-peninsula",

  toponymPolicy_en:
    "Use internationally standard English forms: Seoul, Pyongyang, Incheon, Busan, Panmunjom (DMZ village). Sea name: \"Sea of Japan\" with parenthetical note \"(East Sea in Korean)\" where space permits; editorial standard follows IHO. Yellow Sea: standard form. DMZ: Demilitarized Zone (acronym acceptable after first use). North Korea / South Korea acceptable in general EN usage alongside DPRK / ROK in formal/official contexts. KO-language output uses Korean standard forms.",

  disputedAreasPolicy_en:
    "DMZ shown as the de-facto dividing line; armistice line (1953) noted, not treated as an internationally recognised border in the conventional sense. No implied recognition of DPRK's claimed maritime boundaries where they exceed internationally accepted limits. DPRK-controlled territory shown as such; no diplomatic status judgement. DPRK missile test zones and NOTAM areas shown when issued; no pre-publication of expected test zones.",

  verificationStandard: "strict",

  civilianProtections: [
    "No speculation about DPRK internal political events that could endanger identified individuals.",
    "No publication of information that could compromise DPRK defector or at-risk individual identities.",
    "Missile test data: use official NOTAM / ROK JCS / Japan JDA sources; no speculative pre-publication.",
  ],

  prohibitedFramings: [
    "DPRK nuclear or missile capabilities speculation beyond what T1 analytical sources (38 North, IAEA) state.",
    "Attribution of DPRK internal political events without named, credible sourcing.",
    "PRC military operations coverage (out of scope for this config; separate config required).",
    "Framing that implies armistice = peace treaty; the Korean War has not formally ended.",
  ],

  advisorsRequired: [
    "Korean Peninsula / APAC regional advisor (named external role)",
    "KO-language editorial reviewer (native)",
  ],

  reviewBoardRequired: false,
  counselReviewRequired: false,
};
