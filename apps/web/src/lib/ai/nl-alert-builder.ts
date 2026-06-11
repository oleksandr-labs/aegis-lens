import "server-only";

/**
 * NL → Alert Rule Builder — LLM-powered natural-language alert parsing
 *
 * Accepts a plain-language query such as:
 *   "Notify me when there are airstrikes in Kyiv oblast with severity ≥ 4"
 * and returns a structured ParsedFilterSet that maps directly to the alert-rule schema.
 *
 * Phase 2 — NL → alert rule builder
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ParsedFilterSet {
  eventTypes?: string[];
  regions?: string[];
  /** 1-5 minimum severity inclusive. */
  minSeverity?: number;
  /** 0-1 minimum source confidence. */
  minConfidence?: number;
  keywords?: string[];
  hasMedia?: boolean;
}

export interface NlAlertRule {
  /** Original query in English. */
  naturalLanguageQuery_en: string;
  /** Original query in Ukrainian (or LLM-translated). */
  naturalLanguageQuery_uk: string;
  parsedFilters: ParsedFilterSet;
  /** 0-1 parser confidence. */
  confidence: number;
  /** Suggested human-readable rule name. */
  suggestedName: string;
}

// ── Few-shot examples ─────────────────────────────────────────────────────────

export const NL_ALERT_EXAMPLES_EN: string[] = [
  "Notify me about airstrikes in Kyiv or Kharkiv with severity 4 or higher",
  "Alert when Russian naval activity is reported in the Black Sea",
  "Send alerts for any cyber incidents targeting Ukrainian infrastructure",
  "Notify me when there are ground assaults near Zaporizhzhia with verified media",
  "Alert on humanitarian corridor reports in Donetsk or Luhansk regions",
];

export const NL_ALERT_EXAMPLES_UK: string[] = [
  "Повідомляй мене про авіаудари в Київській або Харківській областях із серйозністю 4 і вище",
  "Сповіщати про морську активність Росії в Чорному морі",
  "Надсилати сповіщення про будь-які кіберінциденти проти української інфраструктури",
  "Сповіщати про наземні атаки поблизу Запоріжжя за наявності підтверджених медіа",
  "Сповіщати про повідомлення щодо гуманітарних коридорів у Донецькій або Луганській областях",
];

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an alert-rule parser for a conflict-intelligence platform.
Given a natural-language query, extract a structured alert filter in JSON.

Output ONLY valid JSON with this shape:
{
  "parsedFilters": {
    "eventTypes": ["airstrike","artillery","ground-assault","naval","cyber","humanitarian","political","logistics"],
    "regions": ["oblast name or region code"],
    "minSeverity": 1-5,
    "minConfidence": 0.0-1.0,
    "keywords": ["keyword"],
    "hasMedia": true|false|null
  },
  "confidence": 0.0-1.0,
  "suggestedName": "short rule name",
  "naturalLanguageQuery_uk": "Ukrainian translation of the query"
}

Omit keys that are not implied by the query. No markdown, no explanation.

Examples of queries and expected output:
${NL_ALERT_EXAMPLES_EN.map((q, i) => `${i + 1}. "${q}"`).join("\n")}`;

// ── LLM call ──────────────────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

interface LLMParsedRule {
  parsedFilters: ParsedFilterSet;
  confidence: number;
  suggestedName: string;
  naturalLanguageQuery_uk?: string;
}

function heuristicFallback(text: string, lang: "en" | "uk"): NlAlertRule {
  const lower = text.toLowerCase();
  const eventTypes: string[] = [];
  if (/airstrike|авіаудар/i.test(lower)) eventTypes.push("airstrike");
  if (/artillery|артилерія/i.test(lower)) eventTypes.push("artillery");
  if (/ground|наземн/i.test(lower)) eventTypes.push("ground-assault");
  if (/naval|морськ/i.test(lower)) eventTypes.push("naval");
  if (/cyber|кібер/i.test(lower)) eventTypes.push("cyber");
  if (/humanitarian|гуманітарн/i.test(lower)) eventTypes.push("humanitarian");

  const severityMatch = lower.match(/severity\s*[≥>=]\s*(\d)/i);
  const minSeverity = severityMatch ? parseInt(severityMatch[1], 10) : undefined;

  return {
    naturalLanguageQuery_en: lang === "en" ? text : "",
    naturalLanguageQuery_uk: lang === "uk" ? text : "",
    parsedFilters: { eventTypes: eventTypes.length ? eventTypes : undefined, minSeverity },
    confidence: 0.45,
    suggestedName: text.slice(0, 50),
  };
}

class NlAlertBuilderService {
  async parseRule(text: string, lang: "en" | "uk"): Promise<NlAlertRule> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return heuristicFallback(text, lang);

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
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Language: ${lang}\nQuery: "${text}"`,
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

      const parsed = JSON.parse(raw) as LLMParsedRule;

      return {
        naturalLanguageQuery_en: lang === "en" ? text : "",
        naturalLanguageQuery_uk: parsed.naturalLanguageQuery_uk ?? (lang === "uk" ? text : ""),
        parsedFilters: parsed.parsedFilters ?? {},
        confidence: parsed.confidence ?? 0.7,
        suggestedName: parsed.suggestedName ?? text.slice(0, 50),
      };
    } catch {
      return heuristicFallback(text, lang);
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const nlAlertBuilder = new NlAlertBuilderService();
export { NlAlertBuilderService };
