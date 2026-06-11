import "server-only";

/**
 * AI Report Drafts — LLM-powered intelligence report generation
 *
 * Generates structured multi-section reports from event data and analyst notes.
 * All sections are produced in both EN and UK locales.
 *
 * Phase 2 — AI report drafts
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportDraftRequest {
  title: string;
  timeRange: {
    /** ISO-8601 date-time string. */
    from: string;
    /** ISO-8601 date-time string. */
    to: string;
  };
  regions: string[];
  eventTypes: string[];
  analystNotes?: string;
  outputLocales: ("en" | "uk")[];
}

export interface ReportDraftSection {
  sectionType:
    | "executive-summary"
    | "key-events"
    | "trend-analysis"
    | "source-assessment"
    | "recommendations";
  content_en: string;
  content_uk: string;
  /** 0-1 factual-grounding confidence for this section. */
  confidence: number;
  /** Event IDs that were used as evidence in this section. */
  citedEventIds: string[];
}

export interface ReportDraft {
  requestId: string;
  title: string;
  sections: ReportDraftSection[];
  /** ISO-8601 generation timestamp. */
  generatedAt: string;
  /** Approximate word count across all sections (both locales). */
  wordCount: number;
  /** True when confidence < 0.7 on any section or no ANTHROPIC_API_KEY present. */
  reviewRequired: boolean;
}

// ── Templates ─────────────────────────────────────────────────────────────────

export const REPORT_TEMPLATES: Record<string, Partial<ReportDraftRequest>> = {
  "daily-brief": {
    title: "Daily Intelligence Brief",
    eventTypes: ["airstrike", "artillery", "ground-assault", "naval"],
    outputLocales: ["en", "uk"],
  },
  weekly: {
    title: "Weekly Situational Report",
    eventTypes: ["airstrike", "artillery", "ground-assault", "naval", "cyber", "political"],
    outputLocales: ["en", "uk"],
  },
  "incident-flash": {
    title: "Incident Flash Report",
    eventTypes: ["airstrike", "artillery", "ground-assault"],
    outputLocales: ["en", "uk"],
  },
  "monthly-summary": {
    title: "Monthly Summary Assessment",
    eventTypes: [
      "airstrike", "artillery", "ground-assault", "naval",
      "cyber", "political", "humanitarian", "logistics",
    ],
    outputLocales: ["en", "uk"],
  },
};

// ── Section prompts ───────────────────────────────────────────────────────────

const SECTION_PROMPTS: Record<ReportDraftSection["sectionType"], string> = {
  "executive-summary":
    "Write a 3-5 sentence executive summary of the key developments during this period.",
  "key-events":
    "List the 5-10 most significant events in bullet-point format with dates and locations.",
  "trend-analysis":
    "Analyse observable trends: frequency changes, geographic shifts, or tactic evolution. 2-3 paragraphs.",
  "source-assessment":
    "Assess source diversity, confidence distribution, and any observed information gaps. 1-2 paragraphs.",
  recommendations:
    "Provide 3-5 actionable analyst recommendations based on the observed patterns.",
};

const SYSTEM_PROMPT_EN = `You are a senior intelligence analyst producing a structured report.
Write in clear, professional English. Be factual — cite only what is in the provided context.
Return ONLY valid JSON:
{
  "content_en": "<section text in English>",
  "content_uk": "<section text in Ukrainian>",
  "confidence": 0.0-1.0
}`;

// ── LLM call ──────────────────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

function stubSection(
  sectionType: ReportDraftSection["sectionType"],
  req: ReportDraftRequest,
): ReportDraftSection {
  const placeholder = `[${sectionType.toUpperCase()} — requires ANTHROPIC_API_KEY for AI generation. Period: ${req.timeRange.from} → ${req.timeRange.to}. Regions: ${req.regions.join(", ")}.]`;
  return {
    sectionType,
    content_en: placeholder,
    content_uk: `[${sectionType.toUpperCase()} — потребує ANTHROPIC_API_KEY для генерації AI. Період: ${req.timeRange.from} → ${req.timeRange.to}.]`,
    confidence: 0,
    citedEventIds: [],
  };
}

interface LLMSectionResponse {
  content_en: string;
  content_uk: string;
  confidence: number;
}

async function generateSection(
  sectionType: ReportDraftSection["sectionType"],
  req: ReportDraftRequest,
  key: string,
): Promise<ReportDraftSection> {
  const contextText = [
    `Report title: ${req.title}`,
    `Period: ${req.timeRange.from} to ${req.timeRange.to}`,
    `Regions: ${req.regions.join(", ")}`,
    `Event types covered: ${req.eventTypes.join(", ")}`,
    req.analystNotes ? `Analyst notes: ${req.analystNotes}` : "",
    `\nTask: ${SECTION_PROMPTS[sectionType]}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: 800,
        system: SYSTEM_PROMPT_EN,
        messages: [{ role: "user", content: contextText }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);

    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const raw =
      json.content
        ?.map((c) => (c.type === "text" ? c.text : ""))
        .filter(Boolean)
        .join("") ?? "";

    const parsed = JSON.parse(raw) as LLMSectionResponse;

    return {
      sectionType,
      content_en: parsed.content_en ?? "",
      content_uk: parsed.content_uk ?? "",
      confidence: parsed.confidence ?? 0.7,
      citedEventIds: [],
    };
  } catch {
    return stubSection(sectionType, req);
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

const SECTION_ORDER: ReportDraftSection["sectionType"][] = [
  "executive-summary",
  "key-events",
  "trend-analysis",
  "source-assessment",
  "recommendations",
];

class ReportDraftService {
  async generateDraft(req: ReportDraftRequest): Promise<ReportDraft> {
    const requestId = `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const key = process.env.ANTHROPIC_API_KEY;

    const sections: ReportDraftSection[] = await Promise.all(
      SECTION_ORDER.map((sectionType) =>
        key
          ? generateSection(sectionType, req, key)
          : Promise.resolve(stubSection(sectionType, req)),
      ),
    );

    const wordCount = sections.reduce(
      (s, sec) =>
        s +
        sec.content_en.split(/\s+/).length +
        sec.content_uk.split(/\s+/).length,
      0,
    );

    const reviewRequired = !key || sections.some((s) => s.confidence < 0.7);

    return {
      requestId,
      title: req.title,
      sections,
      generatedAt: new Date().toISOString(),
      wordCount,
      reviewRequired,
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const reportDraftService = new ReportDraftService();
export { ReportDraftService };
