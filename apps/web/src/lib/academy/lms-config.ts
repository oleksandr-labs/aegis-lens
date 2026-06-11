/**
 * LMS Configuration & Standards — Aegis Lens Academy
 *
 * Learning Management System provider config, SCORM/xAPI export spec,
 * cohort schedule template, and integration constants.
 *
 * Конфігурація LMS, стандарти SCORM/xAPI, шаблон розкладу когорти.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/** Supported LMS providers. */
export type LmsProvider =
  | "custom"
  | "teachable"
  | "thinkific"
  | "moodle"
  | "canvas"
  | "internal";

/**
 * LMS configuration record for a given Academy deployment.
 *
 * Запис конфігурації LMS для конкретного розгортання Академії.
 */
export interface LmsConfig {
  /** Which LMS platform powers the Academy. */
  provider: LmsProvider;
  /** Whether the LMS is self-hosted on Aegis Lens infrastructure. */
  selfHosted: boolean;
  /** SCORM/xAPI version used for all exportable courses. */
  scormVersion: "1.2" | "2004" | "xapi";
  /** Base API endpoint for the LMS (undefined = internal, no external call). */
  apiEndpoint?: string;
  /** Whether SSO (Single Sign-On) with the main Aegis Lens account is enabled. */
  ssoEnabled: boolean;
  /** Slack workspace/channel invite link for the current cohort (if applicable). */
  cohortSlack?: string;
  /** Discord server invite link for the current cohort (if applicable). */
  cohortDiscord?: string;
}

// ── Default configuration ─────────────────────────────────────────────────────

/**
 * Default LMS config for Aegis Lens Academy.
 * Uses the internal custom LMS with xAPI, SSO enabled.
 *
 * Стандартна конфігурація LMS Академії Aegis Lens.
 */
export const LMS_CONFIG: LmsConfig = {
  provider: "internal",
  selfHosted: true,
  scormVersion: "xapi",
  apiEndpoint: undefined, // served from /api/lms/* internally
  ssoEnabled: true,
  cohortSlack: undefined,  // set per cohort
  cohortDiscord: undefined, // set per cohort
};

// ── Cohort schedule template ──────────────────────────────────────────────────

/**
 * Eight-week bootcamp schedule template.
 * Each entry describes one week of the cohort programme.
 *
 * Восьмитижневий шаблон розкладу буткемпу.
 */
export const COHORT_SCHEDULE_TEMPLATE: {
  weekNumber: number;
  topic_en: string;
  hoursMin: number;
  deliverable_en: string;
}[] = [
  {
    weekNumber: 1,
    topic_en: "OSINT Foundations & Tradecraft",
    hoursMin: 12,
    deliverable_en:
      "Submit a source evaluation matrix for 10 online sources on an assigned topic.",
  },
  {
    weekNumber: 2,
    topic_en: "Photo & Video Verification Deep-Dive",
    hoursMin: 14,
    deliverable_en:
      "Verify or debunk 5 assigned media items with full methodology documentation.",
  },
  {
    weekNumber: 3,
    topic_en: "Geolocation Techniques",
    hoursMin: 16,
    deliverable_en:
      "Geolocate 3 conflict-zone images to within 50 metres, with confidence notation.",
  },
  {
    weekNumber: 4,
    topic_en: "Entity Research & Network Mapping",
    hoursMin: 14,
    deliverable_en:
      "Produce a link-analysis diagram for an assigned entity (org or individual).",
  },
  {
    weekNumber: 5,
    topic_en: "Conflict Intelligence & Order of Battle",
    hoursMin: 16,
    deliverable_en:
      "Draft a unit-identification report for an assigned conflict footage set.",
  },
  {
    weekNumber: 6,
    topic_en: "Data Analysis, Visualisation & Storytelling",
    hoursMin: 12,
    deliverable_en:
      "Produce a data-driven briefing slide deck (10 slides max) on an assigned dataset.",
  },
  {
    weekNumber: 7,
    topic_en: "Ethics, Legal Frameworks & Source Protection",
    hoursMin: 10,
    deliverable_en:
      "Submit a written ethics review for a supplied hypothetical OSINT scenario.",
  },
  {
    weekNumber: 8,
    topic_en: "Capstone: Full Investigation Sprint",
    hoursMin: 20,
    deliverable_en:
      "Deliver a publication-ready intelligence report with full source documentation and methodology notes.",
  },
];

// ── SCORM / xAPI export specification ────────────────────────────────────────

/**
 * Technical specification for SCORM/xAPI exports from Aegis Lens Academy.
 * Referenced by enterprise clients for LMS integration.
 *
 * Технічна специфікація для SCORM/xAPI-експорту Академії.
 */
export const SCORM_EXPORT_SPEC: {
  supportedVersions: string[];
  exportFormat: "zip";
  playerCompatibility: string[];
  notes_en: string;
} = {
  supportedVersions: ["SCORM 1.2", "SCORM 2004 4th Edition", "xAPI (Tin Can)"],
  exportFormat: "zip",
  playerCompatibility: [
    "Moodle 4.x",
    "Canvas LMS",
    "SAP Litmos",
    "Cornerstone OnDemand",
    "Docebo",
    "TalentLMS",
    "Absorb LMS",
    "Blackboard Learn",
    "360Learning",
  ],
  notes_en: [
    "Each SCORM/xAPI package includes all course assets (video, text, quizzes).",
    "xAPI packages report granular completion and score data to your LRS.",
    "SCORM 1.2 is recommended for maximum compatibility with legacy LMS platforms.",
    "SCORM 2004 or xAPI is recommended when detailed learner analytics are required.",
    "Custom branding (logo, colours) is available in Corporate Training packages.",
    "Packages are regenerated and re-delivered when course content is updated.",
  ].join(" "),
};

// ── Stripe / payment constants ────────────────────────────────────────────────

/** Price IDs in Stripe (populated at runtime from env). */
export const STRIPE_PRICE_IDS: Record<string, string> = {
  "geolocation-fundamentals": process.env.NEXT_PUBLIC_STRIPE_PRICE_GEOLOCATIONS ?? "",
  "advanced-copilot-mastery": process.env.NEXT_PUBLIC_STRIPE_PRICE_COPILOT ?? "",
  "open-source-conflict-intelligence": process.env.NEXT_PUBLIC_STRIPE_PRICE_CONFLICT_INTEL ?? "",
  "osint-for-journalists": process.env.NEXT_PUBLIC_STRIPE_PRICE_JOURNALISTS ?? "",
  "osint-bootcamp-cohort": process.env.NEXT_PUBLIC_STRIPE_PRICE_BOOTCAMP ?? "",
};
