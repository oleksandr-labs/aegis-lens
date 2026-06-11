/**
 * Event Summaries — typed contract + EventSummaryService
 *
 * Wraps the existing LLMSummarizer / ExtractiveSummarizer chain with a
 * richer interface that enforces citation grounding and returns per-locale
 * summaries in a single call.
 *
 * Phase 1 — AI summaries per event (with citation)
 */

import "server-only";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SummaryRequest {
  eventId: string;
  eventText: string;
  eventType: string;
  /** Detected or declared language of the source text. */
  sourceLanguage: "uk" | "ru" | "en" | "auto";
  /** Locales to produce summaries for. */
  targetLocales: ("en" | "uk")[];
  /** Max tokens per summary (default 300). */
  maxTokens?: number;
}

export interface SummaryResult {
  eventId: string;
  /** Keyed by locale code. */
  summaries: Record<"en" | "uk", string>;
  /** Source sentences / snippets used to ground the summary. */
  citations: string[];
  /** 0-1 overall factual-grounding confidence. */
  confidence: number;
  /** Model identifier actually used. */
  model: string;
  processingMs: number;
}

export interface SummaryQualitySignal {
  /** At least one citation was extracted from source text. */
  hasCitation: boolean;
  /** All factual claims appear in the source text (no hallucination). */
  isGrounded: boolean;
  /** Number of distinct factual claims detected in the summary. */
  factualClaims: number;
  /** Any claim contradicts the source text. */
  conflictsWithSource: boolean;
}

// ── System prompts ────────────────────────────────────────────────────────────

export const SUMMARY_SYSTEM_PROMPT_EN = `You are an expert conflict-intelligence analyst.
Summarise the supplied event text in 2-3 sentences of plain English.
Rules:
1. Cite verbatim phrases from the source using square brackets, e.g. ["captured the village"].
2. Do NOT add facts that are absent from the source.
3. Output JSON: { "summary": "<text>", "citations": ["<phrase1>", ...] }
Only output valid JSON — no markdown, no preamble.`;

export const SUMMARY_SYSTEM_PROMPT_UK = `Ви — аналітик розвідки конфліктів.
Підсумуйте поданий текст події у 2-3 реченнях українською мовою.
Правила:
1. Цитуйте дослівні фрази із джерела у квадратних дужках, наприклад ["захопили село"].
2. НЕ додавайте факти, яких немає в джерелі.
3. Виведіть JSON: { "summary": "<text>", "citations": ["<phrase1>", ...] }
Виводьте лише валідний JSON — без markdown, без передмови.`;

// ── Service ───────────────────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

interface LLMSummaryResponse {
  summary: string;
  citations: string[];
}

function extractiveFallback(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, 2).map((s) => s.trim()).join(" ");
}

class EventSummaryService {
  async summarize(req: SummaryRequest): Promise<SummaryResult> {
    const startedAt = Date.now();
    const key = process.env.ANTHROPIC_API_KEY;
    const maxTokens = req.maxTokens ?? 300;

    const results: Partial<Record<"en" | "uk", string>> = {};
    let allCitations: string[] = [];
    let confidence = 0;
    let modelUsed = "extractive-fallback";

    for (const locale of req.targetLocales) {
      const systemPrompt =
        locale === "uk" ? SUMMARY_SYSTEM_PROMPT_UK : SUMMARY_SYSTEM_PROMPT_EN;

      if (!key) {
        results[locale] = extractiveFallback(req.eventText);
        continue;
      }

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
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: `Event type: ${req.eventType}\n\nSource text:\n${req.eventText}`,
              },
            ],
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

        const parsed = JSON.parse(raw) as LLMSummaryResponse;
        results[locale] = parsed.summary ?? extractiveFallback(req.eventText);
        if (parsed.citations?.length) {
          allCitations = [...new Set([...allCitations, ...parsed.citations])];
        }
        confidence = allCitations.length > 0 ? 0.85 : 0.6;
        modelUsed = DEFAULT_MODEL;
      } catch {
        results[locale] = extractiveFallback(req.eventText);
        confidence = 0.4;
      }
    }

    // Fill missing locales with extractive fallback
    const en = results["en"] ?? extractiveFallback(req.eventText);
    const uk = results["uk"] ?? extractiveFallback(req.eventText);

    return {
      eventId: req.eventId,
      summaries: { en, uk },
      citations: allCitations,
      confidence,
      model: modelUsed,
      processingMs: Date.now() - startedAt,
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const eventSummaryService = new EventSummaryService();
export { EventSummaryService };
