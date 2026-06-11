/**
 * NL → structured alert rule parser.
 *
 * Two modes:
 *   1. LLMParser: sends the NL query to Claude/OpenAI, extracts structured JSON
 *   2. RegexParser: fast fallback for simple patterns (no API call)
 *
 * FallbackParser tries LLM first, falls back to regex on error.
 */

import type { ParsedRule, ParseResult } from "./types";

// ── Regex parser ──────────────────────────────────────────────────────────────

const CLASS_PATTERNS: [RegExp, string][] = [
  [/drone\s?strike|bezpilotny/i, "military_action"],
  [/missile|rocket|ракета/i, "military_action"],
  [/explosion|вибух/i, "explosion"],
  [/shelling|обстріл|artillery/i, "military_action"],
  [/air\s?alert|повітряна тривога/i, "civilian_alert"],
  [/infrastructure|infrastructure_damage/i, "infrastructure_damage"],
  [/weather|погода/i, "environmental"],
];

const SEVERITY_PATTERNS: [RegExp, 1 | 2 | 3][] = [
  [/critical|extreme|catastrophic|high severity/i, 3],
  [/significant|major|moderate/i, 2],
  [/minor|low severity/i, 1],
];

const CONFIDENCE_PATTERN = /(?:confidence|впевненість)\s*[>≥]\s*(0\.\d+|\d+%)/i;
const RADIUS_PATTERN = /within\s+(\d+)\s*km|(?:радіус|radius)\s+(\d+)\s*km/i;

const LOCATION_NAMES: Record<string, { lat: number; lon: number }> = {
  odesa: { lat: 46.48, lon: 30.74 },
  kyiv: { lat: 50.45, lon: 30.52 },
  kharkiv: { lat: 49.99, lon: 36.23 },
  zaporizhzhia: { lat: 47.84, lon: 35.14 },
  kherson: { lat: 46.64, lon: 32.62 },
  dnipro: { lat: 48.46, lon: 35.05 },
  lviv: { lat: 49.84, lon: 24.03 },
  mykolaiv: { lat: 46.97, lon: 31.99 },
};

export class RegexParser {
  parse(input: string): ParseResult {
    const rule: ParsedRule = {};
    const evidences: string[] = [];

    // Event class
    const classes: string[] = [];
    for (const [pat, cls] of CLASS_PATTERNS) {
      if (pat.test(input)) {
        if (!classes.includes(cls)) classes.push(cls);
        evidences.push(cls);
      }
    }
    if (classes.length) rule.eventClasses = classes;

    // Severity
    for (const [pat, sev] of SEVERITY_PATTERNS) {
      if (pat.test(input)) {
        rule.minSeverity = sev;
        evidences.push(`severity>=${sev}`);
        break;
      }
    }

    // Confidence
    const confMatch = CONFIDENCE_PATTERN.exec(input);
    if (confMatch) {
      const val = confMatch[1];
      rule.minConfidence = val.endsWith("%") ? parseFloat(val) / 100 : parseFloat(val);
      evidences.push(`confidence>=${rule.minConfidence}`);
    }

    // Location + radius
    const radiusMatch = RADIUS_PATTERN.exec(input);
    const radiusKm = radiusMatch ? Number(radiusMatch[1] ?? radiusMatch[2]) : 50;

    for (const [name, coords] of Object.entries(LOCATION_NAMES)) {
      const re = new RegExp(name, "i");
      if (re.test(input)) {
        rule.geo = { placeName: name, ...coords, radiusKm };
        evidences.push(`near ${name} (${radiusKm}km)`);
        break;
      }
    }

    const confidence = Math.min(0.9, (evidences.length / 3) * 0.5 + 0.3);
    const preview = buildPreview(rule);

    return {
      rule,
      preview,
      confidence,
      input,
      suggestions:
        confidence < 0.6
          ? ["Try being more specific: 'drone strike within 30km of Odesa with severity ≥ 2'"]
          : undefined,
    };
  }
}

export class LLMParser {
  constructor(
    private readonly apiKey: string,
    private readonly model = "claude-haiku-4-5-20251001",
  ) {}

  async parse(input: string): Promise<ParseResult> {
    const systemPrompt = `You are an alert rule parser. Convert natural language alert queries into structured JSON.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "rule": {
    "eventClasses": ["military_action"|"explosion"|"infrastructure_damage"|"environmental"|"civilian_alert"],
    "minSeverity": 1|2|3,
    "minConfidence": 0.0-1.0,
    "geo": { "placeName": "...", "lat": number, "lon": number, "radiusKm": number } | null,
    "keywords": ["..."],
    "channels": ["email"|"push"|"telegram"|"slack"]
  },
  "preview": "You will be alerted when...",
  "confidence": 0.0-1.0
}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: input }],
      }),
    });

    if (!res.ok) {
      throw new Error(`LLM API ${res.status}: ${await res.text()}`);
    }

    const body = (await res.json()) as { content: { type: string; text: string }[] };
    const text = body.content.find((c) => c.type === "text")?.text ?? "{}";

    const parsed = JSON.parse(text) as { rule: ParsedRule; preview: string; confidence: number };
    return {
      rule: parsed.rule ?? {},
      preview: parsed.preview ?? buildPreview(parsed.rule ?? {}),
      confidence: parsed.confidence ?? 0.7,
      input,
    };
  }
}

export class FallbackParser {
  private readonly regex = new RegexParser();

  constructor(private readonly llm?: LLMParser) {}

  async parse(input: string): Promise<ParseResult> {
    if (this.llm) {
      try {
        return await this.llm.parse(input);
      } catch {
        // Fall through to regex
      }
    }
    return this.regex.parse(input);
  }
}

function buildPreview(rule: ParsedRule): string {
  const parts: string[] = ["You will be alerted when"];

  if (rule.eventClasses?.length) {
    parts.push(rule.eventClasses.join(" or ") + " events occur");
  } else {
    parts.push("any event occurs");
  }

  if (rule.minSeverity) {
    parts.push(`with severity ≥ ${rule.minSeverity}`);
  }

  if (rule.geo) {
    parts.push(`within ${rule.geo.radiusKm}km of ${rule.geo.placeName}`);
  }

  if (rule.minConfidence) {
    parts.push(`(confidence ≥ ${Math.round(rule.minConfidence * 100)}%)`);
  }

  return parts.join(" ") + ".";
}
