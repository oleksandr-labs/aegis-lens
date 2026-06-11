/**
 * Brand voice guide for Aegis Lens.
 * Defines tone, approved language, and prohibited phrases for all content.
 */

export type ToneAttribute =
  | "authoritative"
  | "precise"
  | "urgent-not-alarmist"
  | "neutral"
  | "human"
  | "transparent"
  | "mission-driven";

export interface BrandVoiceGuide {
  attributes: ToneAttribute[];
  dos_en: string[];
  donts_en: string[];
  exampleGoodCopy_en: string;
  exampleBadCopy_en: string;
  persona_en: string;
}

export const BRAND_VOICE_GUIDE: BrandVoiceGuide = {
  attributes: [
    "authoritative",
    "precise",
    "urgent-not-alarmist",
    "mission-driven",
    "transparent",
  ],
  dos_en: [
    "Cite sources and timestamps for every factual claim",
    "Use plain language — analysts and journalists are smart, not jargon-hungry",
    "Acknowledge uncertainty: 'Unverified reports suggest…' over stating as fact",
    "Lead with verifiable facts; context and analysis follow",
    "Use active voice for clarity and directness",
    "Translate severity to impact: explain what a risk score means in human terms",
    "Acknowledge corrections openly — transparency builds trust",
  ],
  donts_en: [
    "Do not sensationalise — avoid adjectives that amplify emotion over fact",
    "Do not use partisan framing or loaded political language",
    "Do not use ALL-CAPS for urgency — use severity levels and visual hierarchy instead",
    "Do not lead headlines with casualty counts without verified sourcing and context",
    "Do not publish content that could endanger individuals in conflict zones",
    "Do not use dehumanising language for any group",
    "Do not speculate presented as analysis",
    "Do not imply platform endorsement of any political actor",
  ],
  exampleGoodCopy_en:
    "Three unverified reports of shelling were recorded near Kherson (06:14–06:32 UTC). Source: local monitoring channel. Verification: pending OSINT cross-check.",
  exampleBadCopy_en:
    "BREAKING!! Massive attack devastates Kherson — catastrophic destruction reported!!",
  persona_en:
    "Think: a senior war-zone correspondent who also has a data-science background. Calm, precise, deeply knowledgeable, never sensational. Treats the audience as adults capable of handling nuance.",
};

/**
 * Phrases explicitly prohibited in UI copy, marketing, and AI-generated summaries.
 * Review list quarterly with editorial and legal.
 */
export const PROHIBITED_PHRASES_EN: string[] = [
  "breaking!!",              // use "New:" or severity label instead
  "massacre",                // use specific verified term (e.g. 'mass casualty event', 'killing of civilians')
  "terrorists",              // use without attribution — always 'designated as terrorist' + source
  "devastates",              // sensational verb; use factual description
  "catastrophic",            // sensational adjective; quantify instead
  "annihilated",             // dehumanising / sensational
  "wiped out",               // vague + sensational
  "all hell broke loose",    // colloquial + sensational
  "shocking footage",        // clickbait; describe content factually
  "sources close to the",    // vague anonymity without editorial review
  "it's official",           // overconfident; cite the official source directly
  "100% confirmed",          // false certainty; use verification tier language
];

export const APPROVED_PRODUCT_NAMES: {
  name: string;
  approved: boolean;
  usage_en: string;
}[] = [
  {
    name: "Aegis Lens",
    approved: true,
    usage_en: "Full product name — use in formal contexts, marketing, legal",
  },
  {
    name: "Aegis",
    approved: true,
    usage_en: "Short form — acceptable in informal product copy and UI chrome after first full mention",
  },
  {
    name: "The Platform",
    approved: true,
    usage_en: "Internal only — do not use in external-facing copy or marketing",
  },
  {
    name: "Lens",
    approved: true,
    usage_en: "Informal shorthand in conversational contexts only; not in headlines or formal copy",
  },
  {
    name: "AegisLens",
    approved: false,
    usage_en: "Do not concatenate — always two words: Aegis Lens",
  },
  {
    name: "AEGIS",
    approved: false,
    usage_en: "Do not use all-caps — not an acronym; avoid military-product connotation",
  },
];
