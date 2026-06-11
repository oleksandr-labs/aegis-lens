/**
 * Conflict config: Israel–Palestine (ongoing; current escalation 2023–).
 *
 * Phase 3 — highest editorial risk on the platform.
 * DO NOT launch without all five launch gates satisfied.
 * See launchGates and ISRAEL_PALESTINE_EDITORIAL_POLICY for requirements.
 *
 * Editorial risk: VERY-HIGH — polarised global discourse, high disinformation
 * volume from state and non-state actors on all sides, legal exposure
 * (defamation, sanctions), child-safety obligations.
 */

import type {
  ConflictConfig,
  ConflictSource,
  ConflictToponymMap,
  EditorialPolicy,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────

export const ISRAEL_PALESTINE_CONFIG: ConflictConfig = {
  id: "israel-palestine",
  status: "active",
  phase: 3,
  editorialRisk: "very-high",

  name_en: "Israel–Palestine Conflict",
  name_uk: "Ізраїльсько-палестинський конфлікт",

  description_en:
    "Long-running conflict with active flashpoints including Gaza, West Bank, and Lebanon border. Current escalation from October 2023. Highest editorial-risk conflict on the platform.",
  description_uk:
    "Тривалий конфлікт з активними вогнищами напруги: сектор Газа, Західний берег, кордон з Ліваном. Поточна ескалація з жовтня 2023 р. Найвищий редакційний ризик на платформі.",

  // Covers Israel, West Bank, Gaza Strip, Lebanon border area, Golan Heights,
  // northern Sinai corridor. [minLon, minLat, maxLon, maxLat]
  geoBoundingBox: [34.2, 29.4, 36.0, 33.4],

  countries: ["il", "ps", "lb", "sy"],

  parties: [
    {
      id: "idf",
      name_en: "Israel Defense Forces (IDF)",
      classification: "state",
    },
    {
      id: "hamas",
      name_en: "Hamas (Izz ad-Din al-Qassam Brigades + political wing)",
      classification: "non-state",
    },
    {
      id: "hezbollah",
      name_en: "Hezbollah",
      classification: "non-state",
    },
    {
      id: "pa",
      name_en: "Palestinian Authority (PA) / Fatah",
      classification: "state",
    },
    {
      id: "pij",
      name_en: "Palestinian Islamic Jihad (PIJ)",
      classification: "non-state",
    },
    {
      id: "allied-actors-ir",
      name_en: "Iran-aligned regional actors (IRGC-linked)",
      classification: "foreign-actor",
    },
    {
      id: "us-uk-strikes",
      name_en: "US / UK (strikes on Houthi/Iran-linked targets in region)",
      classification: "foreign-actor",
    },
  ],

  locales: ["ar", "he", "en", "fr"],

  launchGates: [
    "Per-side editorial advisors retained (Israeli and Palestinian perspectives)",
    "Specialised regional review board convened (Middle East expertise required)",
    "AR + HE native translation reviewers contracted and briefed on editorial policy",
    "Internal ethics board formal sign-off obtained and documented",
    "External counsel review completed: defamation exposure + sanctions screening",
  ],

  // NOT launched — all five gates must be satisfied before setting true.
  isLaunched: false,
};

// ─── Sources ──────────────────────────────────────────────────────────────────

export const ISRAEL_PALESTINE_SOURCES: ConflictSource[] = [
  {
    conflictId: "israel-palestine",
    sourceId: "bellingcat-verified-osint",
    name_en: "Bellingcat-style verified OSINT (geolocation + open-source verification)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["acled-il-ps", "un-ocha-opt"],
  },
  {
    conflictId: "israel-palestine",
    sourceId: "il-ps-press-balanced",
    name_en: "Curated Israeli + Palestinian press (balanced allow-list)",
    type: "media",
    trustTier: 2,
    requiresVerification: true,
    balancedWith: ["bellingcat-verified-osint", "un-ocha-opt"],
  },
  {
    conflictId: "israel-palestine",
    sourceId: "acled-il-ps",
    name_en: "ACLED — Armed Conflict Location & Event Data (Israel/Palestine)",
    type: "academic",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["un-ocha-opt"],
  },
  {
    conflictId: "israel-palestine",
    sourceId: "un-ocha-opt",
    name_en: "UN OCHA — Occupied Palestinian Territory Situation Reports",
    type: "humanitarian",
    trustTier: 1,
    requiresVerification: false,
    balancedWith: ["acled-il-ps"],
  },
  {
    conflictId: "israel-palestine",
    sourceId: "sentinel-damage-assessment",
    name_en: "Sentinel-2 / Sentinel-1 SAR — damage assessment imagery (ESA Copernicus)",
    type: "osint",
    trustTier: 1,
    requiresVerification: false,
  },
];

// ─── Launch gates (explicit typed array) ─────────────────────────────────────

export const ISRAEL_PALESTINE_LAUNCH_GATES: string[] = [
  "Per-side editorial advisors retained (Israeli and Palestinian perspectives)",
  "Specialised regional review board convened (Middle East regional expertise)",
  "AR + HE native translation reviewers contracted and briefed",
  "Internal ethics board formal sign-off documented",
  "External counsel review: defamation exposure + sanctions screening complete",
];

// ─── Editorial policy ─────────────────────────────────────────────────────────

export const ISRAEL_PALESTINE_EDITORIAL_POLICY: EditorialPolicy = {
  conflictId: "israel-palestine",

  toponymPolicy_en:
    "Use internationally neutral forms for contested toponyms. Gaza / Gaza Strip (not 'Hamas-controlled Gaza'). West Bank — preferred neutral form; 'Occupied West Bank' acceptable with legal-status footnote; 'Judea and Samaria' is the Israeli government form and should only appear in direct attribution. East Jerusalem displayed as contested; note that Israeli law considers it part of unified Jerusalem while the UN and most states do not recognise this. Golan Heights: under Israeli administration since 1967, formally annexed 1981 (not widely recognised); cartographic note required. All place-name choices documented in source metadata.",

  disputedAreasPolicy_en:
    "Gaza Strip: cartographic overlay notes ongoing conflict and blockade; legal status as occupied territory per international humanitarian law noted. West Bank: Area A/B/C administrative demarcation shown with legal-status footnote referencing Oslo Accords and Fourth Geneva Convention obligations. Settlement areas in West Bank displayed with neutral boundaries; no endorsement of their legal status implied. East Jerusalem boundary: Green Line shown as dashed secondary line with footnote. Golan Heights: displayed with hatched overlay and footnote citing UNSC Resolution 497 (1981).",

  verificationStandard: "strict",

  civilianProtections: [
    "No publication of faces, names, or identifying information of minors under any circumstances.",
    "Child-safety policy strictly enforced: no imagery depicting children in distress, injured, or deceased.",
    "Civilian casualty figures published only when sourced from UN OCHA, ICRC, or equivalent T1 humanitarian source; divergence between sources explicitly noted.",
    "Hospital and shelter locations: no precision coordinates published that could aid targeting.",
    "Hostage/detention situations: no information published that could compromise negotiation or individual safety.",
    "Sexual violence allegations: handled per UNHCR/UN Women protocols; no survivor identification.",
  ],

  prohibitedFramings: [
    "Advocacy framing for either side: no editorial language that positions IDF or Palestinian armed groups as inherently legitimate or illegitimate.",
    "Collective-punishment framing: events affecting civilian populations must be reported on civilian-impact merits, not as strategic justification for military operations.",
    "\"Terrorist\" applied as editorial descriptor without consistent application and legal citation — use organisation names and classifications.",
    "\"Genocide\" or \"ethnic cleansing\" as editorial descriptors without direct citation from a competent international legal body making that finding.",
    "\"Both sides\" false equivalence that obscures power asymmetry or legal distinctions, or conversely, framing that denies any legitimate security concerns.",
    "Dehumanising language applied to any civilian population, regardless of which party they are associated with.",
  ],

  advisorsRequired: [
    "Israeli-perspective editorial advisor (Israeli civil society, legal, or media background)",
    "Palestinian-perspective editorial advisor (Palestinian civil society, legal, or media background)",
    "International humanitarian law (IHL) advisor",
    "AR-language editorial reviewer (native, conflict-context briefed)",
    "HE-language editorial reviewer (native, conflict-context briefed)",
  ],

  reviewBoardRequired: true,
  counselReviewRequired: true,
};

// ─── Toponym map ──────────────────────────────────────────────────────────────

export const ISRAEL_PALESTINE_TOPONYMS: ConflictToponymMap[] = [
  {
    conflictId: "israel-palestine",
    toponym: "gaza",
    preferredForm_en: "Gaza Strip",
    alternatives: ["Gaza", "Gaza City", "Hamas-controlled Gaza", "the Strip"],
    rationale_en:
      "\"Gaza Strip\" is the internationally recognised geographic designation. Avoid \"Hamas-controlled\" as editorial descriptor; note Hamas's de-facto governance in attribution context only.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "west-bank",
    preferredForm_en: "West Bank",
    alternatives: ["Occupied West Bank", "Judea and Samaria", "Palestinian territories"],
    rationale_en:
      "\"West Bank\" is the neutral standard form. \"Occupied West Bank\" is legally accurate per international law and acceptable with footnote. \"Judea and Samaria\" is the Israeli government designation; use only in direct attribution.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "east-jerusalem",
    preferredForm_en: "East Jerusalem",
    alternatives: ["East Jerusalem (occupied)", "Arab East Jerusalem"],
    rationale_en:
      "East Jerusalem captured 1967; Israeli law treats it as part of unified Jerusalem. UN and most states do not recognise this. Displayed with Green Line annotation.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "golan-heights",
    preferredForm_en: "Golan Heights",
    alternatives: ["Occupied Golan Heights", "Israeli Golan"],
    rationale_en:
      "Under Israeli administration since 1967; annexed 1981 (UNSC Res. 497 declared void). Cartographic note required. Neutral form \"Golan Heights\" used in all editorial output.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "beer-sheva",
    preferredForm_en: "Be'er Sheva",
    alternatives: ["Beersheba", "Beer-Sheba", "Beer Sheva"],
    rationale_en:
      "Hebrew transliteration Be'er Sheva is the current Israeli official form. Beersheba is the traditional English/Biblical form; both acceptable with Be'er Sheva preferred.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "tel-aviv",
    preferredForm_en: "Tel Aviv",
    alternatives: ["Tel Aviv-Yafo", "Tel Aviv–Jaffa", "Jaffa"],
    rationale_en:
      "\"Tel Aviv\" for the city in general use; \"Tel Aviv-Yafo\" for the full municipality. Jaffa/Yafo is the historic Arab-majority neighbourhood; referenced in historical and geographic context.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "haifa",
    preferredForm_en: "Haifa",
    alternatives: ["Hefa", "Hayfa"],
    rationale_en:
      "Standard EN form. Hebrew: Hefa; Arabic: Hayfa. Haifa universally recognised.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "rafah",
    preferredForm_en: "Rafah",
    alternatives: ["Rafa", "Rafah crossing", "Rafah border crossing"],
    rationale_en:
      "Standard EN form for the city and the border crossing between Gaza and Egypt. Rafah crossing is a distinct geographic and political reference.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "khan-younis",
    preferredForm_en: "Khan Younis",
    alternatives: ["Khan Yunis", "Khan Yunus", "Khan Younès"],
    rationale_en:
      "Khan Younis is the most common EN form in UN and press usage. All variants normalised.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "jenin",
    preferredForm_en: "Jenin",
    alternatives: ["Djénine", "Jenine"],
    rationale_en:
      "Standard form. City in West Bank; site of multiple military operations. Jenin refugee camp is a distinct reference.",
  },
  {
    conflictId: "israel-palestine",
    toponym: "ramallah",
    preferredForm_en: "Ramallah",
    alternatives: ["Ram Allah", "Ramalla"],
    rationale_en:
      "Standard EN form; seat of Palestinian Authority in West Bank. Ramallah used in all editorial output.",
  },
];
