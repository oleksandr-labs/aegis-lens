import type { Locale } from "@aegis/i18n-config";

type Localized = Partial<Record<Locale, string>> & { en: string };

export type AcademyLesson = {
  /** Unique within a path. */
  slug: string;
  title: Localized;
  /** Estimated minutes to complete. */
  durationMinutes: number;
  /** Brief learning outcome. */
  outcome: Localized;
};

export type AcademyPath = {
  slug: string;
  title: Localized;
  audience: string;
  level: "beginner" | "intermediate" | "advanced";
  hours: number;
  summary: Localized;
  /** Tags for cross-listing in /tags. */
  tags: string[];
  /** Optional cert badge slug for E-E-A-T signaling. */
  certificate?: string;
  /** Lessons in order. */
  lessons: AcademyLesson[];
};

export const PATHS: AcademyPath[] = [
  {
    slug: "osint-101",
    title: { en: "OSINT 101" },
    audience: "Beginner",
    level: "beginner",
    hours: 6,
    summary: {
      en: "A pragmatic foundation in open-source intelligence. Scoping, sourcing, verification, and the discipline of saying what you know.",
    },
    tags: ["osint", "beginner", "training"],
    certificate: "osint-foundations",
    lessons: [
      {
        slug: "what-osint-is",
        title: { en: "What OSINT is — and isn't" },
        durationMinutes: 25,
        outcome: {
          en: "Distinguish OSINT from adjacent disciplines and recognize the limits of public information.",
        },
      },
      {
        slug: "scoping-the-question",
        title: { en: "Scoping the question" },
        durationMinutes: 35,
        outcome: {
          en: "Write a one-sentence question that fits a single working session.",
        },
      },
      {
        slug: "sourcing-and-archiving",
        title: { en: "Sourcing and archiving" },
        durationMinutes: 45,
        outcome: {
          en: "Establish a notebook habit — archive link, fetched-at, language — for every claim.",
        },
      },
      {
        slug: "corroboration-as-trust",
        title: { en: "Corroboration as the unit of trust" },
        durationMinutes: 40,
        outcome: {
          en: "Apply the 1-source / 2-source / 3-source rule to a real claim and defend the call.",
        },
      },
      {
        slug: "publishing-a-finding",
        title: { en: "Publishing a finding" },
        durationMinutes: 50,
        outcome: {
          en: "Convert internal notes into a publishable paragraph with citations and calibrated hedging.",
        },
      },
    ],
  },
  {
    slug: "geolocation-fundamentals",
    title: { en: "Geolocation fundamentals" },
    audience: "Analyst",
    level: "intermediate",
    hours: 8,
    summary: {
      en: "Locate a photograph using shadows, signage, vegetation, and street-level imagery. Worked examples for each technique.",
    },
    tags: ["geospatial", "geolocation", "imagery"],
    certificate: "geo-fundamentals",
    lessons: [
      {
        slug: "anchor-objects",
        title: { en: "Identifying anchor objects" },
        durationMinutes: 35,
        outcome: {
          en: "Pick the most distinctive feature in a frame and turn it into a search seed.",
        },
      },
      {
        slug: "shadows-and-time",
        title: { en: "Shadows and time-of-day" },
        durationMinutes: 45,
        outcome: {
          en: "Use sun azimuth to constrain location and time within an hour.",
        },
      },
      {
        slug: "street-level-cross-check",
        title: { en: "Street-level cross-check" },
        durationMinutes: 50,
        outcome: {
          en: "Confirm a candidate location with ≥3 independent features from Street View / Mapillary.",
        },
      },
      {
        slug: "worked-example",
        title: { en: "Worked example: from photo to coordinates" },
        durationMinutes: 60,
        outcome: {
          en: "Replicate a published geolocation end-to-end and explain each decision.",
        },
      },
    ],
  },
  {
    slug: "verification-workflow",
    title: { en: "Verification workflow" },
    audience: "Journalist · Analyst",
    level: "intermediate",
    hours: 5,
    summary: {
      en: "The seven checks Aegis Lens runs before social-media footage influences a published event: provenance, timing, location, content, attribution, language, corroboration.",
    },
    tags: ["verification", "social-media", "osint"],
    certificate: "verification-practitioner",
    lessons: [
      {
        slug: "provenance",
        title: { en: "Provenance: who posted it first?" },
        durationMinutes: 30,
        outcome: {
          en: "Trace a viral clip back to its earliest verified upload across two platforms.",
        },
      },
      {
        slug: "timing",
        title: { en: "Timing: shadows, weather, background signals" },
        durationMinutes: 40,
        outcome: {
          en: "Triangulate the time of an event without trusting EXIF alone.",
        },
      },
      {
        slug: "content-integrity",
        title: { en: "Content integrity" },
        durationMinutes: 40,
        outcome: {
          en: "Spot re-encoding artifacts, mismatched audio, and obvious manipulation.",
        },
      },
    ],
  },
  {
    slug: "ai-for-analysts",
    title: { en: "AI for analysts" },
    audience: "Analyst",
    level: "advanced",
    hours: 4,
    summary: {
      en: "Practical AI tooling for OSINT analysts — classification, entity extraction, RAG, and the hallucination tax. How to add LLM-grade speed without giving up sourcing.",
    },
    tags: ["ai", "analyst", "rag"],
    lessons: [
      {
        slug: "where-llms-help",
        title: { en: "Where LLMs actually help an analyst" },
        durationMinutes: 30,
        outcome: {
          en: "Identify three workflow steps where LLM assistance saves real time, and two where it costs more than it saves.",
        },
      },
      {
        slug: "retrieval-grounding",
        title: { en: "Retrieval-grounded generation" },
        durationMinutes: 45,
        outcome: {
          en: "Configure a RAG pipeline over your own evidence corpus and audit its citations.",
        },
      },
      {
        slug: "hallucination-tax",
        title: { en: "The hallucination tax" },
        durationMinutes: 35,
        outcome: {
          en: "Build a citation-required workflow that fails closed when the model invents.",
        },
      },
    ],
  },
];

export function listPaths(): AcademyPath[] {
  return PATHS.slice().sort((a, b) => {
    const order = { beginner: 0, intermediate: 1, advanced: 2 };
    return order[a.level] - order[b.level];
  });
}

export function getPath(slug: string): AcademyPath | null {
  return PATHS.find((p) => p.slug === slug) ?? null;
}
