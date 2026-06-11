/**
 * Content operations — style guide, fact-check workflow, performance metrics
 * Ukrainian MAP / Aegis Lens — Content Strategy
 */

export interface StyleGuideRule {
  category: "voice" | "tone" | "citation" | "formatting";
  rule: string;
  examples?: string[];
}

export const STYLE_GUIDE: StyleGuideRule[] = [
  // Voice
  {
    category: "voice",
    rule: "Analytical but accessible: write for an educated generalist, not only for intelligence professionals. Avoid unexplained jargon; define acronyms on first use.",
    examples: [
      "Write: 'OSINT (open-source intelligence) analysts…' not just 'OSINT analysts…'",
    ],
  },
  {
    category: "voice",
    rule: "Use UK English spelling and vocabulary for the 'en' locale. Use '-ise' not '-ize', 'defence' not 'defense', 'colour' not 'color'.",
    examples: ["'analyse', 'recognise', 'programme'"],
  },
  {
    category: "voice",
    rule: "First-person plural ('we') is acceptable for platform-authored content; avoid first-person singular in analytical pieces.",
  },
  // Tone
  {
    category: "tone",
    rule: "Maintain a neutral, evidence-based tone. Present multiple interpretations when the evidence is ambiguous.",
    examples: [
      "Write: 'Available evidence suggests…' not 'It is clear that…' when uncertainty exists.",
    ],
  },
  {
    category: "tone",
    rule: "No speculation without explicit caveat. All forward-looking statements must be flagged with hedging language ('likely', 'assessed with medium confidence', etc.).",
    examples: [
      "Use: 'We assess with low confidence that…' / 'This may indicate…'",
    ],
  },
  {
    category: "tone",
    rule: "Avoid emotionally charged language. Describe atrocities factually, citing verified sources, without sensationalism.",
  },
  // Citation
  {
    category: "citation",
    rule: "Cite primary sources wherever possible: official statements, satellite imagery providers, verified eyewitness accounts. Secondary sources must themselves cite primaries.",
  },
  {
    category: "citation",
    rule: "Include archival links (e.g. Wayback Machine or archive.ph) for all cited URLs so links remain reachable if originals are removed.",
  },
  {
    category: "citation",
    rule: "State the date accessed for every external URL, and the publication/capture date of the primary source.",
  },
  // Formatting
  {
    category: "formatting",
    rule: "Pillar pages: H1 → introduction → H2 sections (≥3) → key takeaways → related reading. Each H2 should be ≥300 words.",
  },
  {
    category: "formatting",
    rule: "Use numbered lists for ordered steps (e.g. verification workflows). Use bulleted lists for unordered collections (e.g. tool lists).",
  },
  {
    category: "formatting",
    rule: "Include a TL;DR summary box at the top of all articles exceeding 2000 words.",
    examples: [
      "Box heading: 'Key findings' or 'Summary'; 3–5 bullet points maximum.",
    ],
  },
];

export interface FactCheckWorkflow {
  requiresReviewers: number;
  analyticalClaimGate: boolean;
  minimumSourceCount: number;
  approvedSourceTypes: string[];
}

export const FACT_CHECK_WORKFLOW: FactCheckWorkflow = {
  requiresReviewers: 2,
  analyticalClaimGate: true,
  minimumSourceCount: 2,
  approvedSourceTypes: [
    "official", // government, military, international body statements
    "eyewitness_verified", // first-hand accounts cross-checked by at least one other source
    "satellite", // commercial satellite imagery from named provider
    "archived_media", // archived news/social media captures with original URL
  ],
};

export interface ContentPerformanceMetrics {
  slug: string;
  organicClicks: number;
  avgTimeOnPageSeconds: number;
  bounceRate: number;
  conversions: number;
  lastUpdated: string;
}
