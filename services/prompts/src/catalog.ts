/**
 * Canonical prompt catalog.
 *
 * All prompts used by the platform are registered here.
 * Changes require a new version entry — never edit existing versions.
 */

import { PromptLibrary } from "./library";
import type { PromptDefinition } from "./types";

const PROMPTS: PromptDefinition[] = [
  // ── NLP: Event classification ─────────────────────────────────────────────
  {
    id: "nlp.classify",
    name: "Event classification",
    description: "Classify a conflict event into class/subclass/severity from raw text",
    service: "nlp",
    tags: ["classification", "conflict"],
    activeVersion: "1.0.0",
    locales: ["en"],
    versions: [
      {
        version: "1.0.0",
        locale: "en",
        content: `Classify the following conflict-related text into a structured event.

Text:
{{text}}

Respond with JSON only:
{
  "class": "military_action|explosion|infrastructure_damage|environmental|civilian_alert",
  "subclass": "string or null",
  "severity": 1|2|3,
  "confidence": 0.0-1.0
}`,
        variables: [{ name: "text", type: "string", required: true, description: "Raw event text to classify" }],
        model: "claude-haiku-4-5-20251001",
        maxTokens: 256,
        temperature: 0,
        author: "platform",
        releasedAt: "2024-01-01",
      },
    ],
  },
  // ── NLP: Summary generation ───────────────────────────────────────────────
  {
    id: "nlp.summarize",
    name: "Event summarization",
    description: "Generate a 1-2 sentence summary of a conflict event for the given locale",
    service: "nlp",
    tags: ["summarization", "conflict"],
    activeVersion: "1.0.0",
    locales: ["en", "uk"],
    versions: [
      {
        version: "1.0.0",
        locale: "en",
        systemPrompt:
          "You are a concise, neutral intelligence analyst. Summarize conflict events in 1-2 sentences. Do not editorialize. Omit PII.",
        content: `Summarize this conflict event in 1-2 sentences in English.

Source text:
{{text}}

Location context: {{location}}
Event class: {{class}}`,
        variables: [
          { name: "text", type: "string", required: true },
          { name: "location", type: "string", required: false, default: "unknown" },
          { name: "class", type: "string", required: false, default: "military_action" },
        ],
        model: "claude-haiku-4-5-20251001",
        maxTokens: 150,
        temperature: 0.2,
        author: "platform",
        releasedAt: "2024-01-01",
      },
      {
        version: "1.0.0",
        locale: "uk",
        systemPrompt:
          "Ви стислий нейтральний аналітик розвідки. Підсумовуйте конфліктні події в 1-2 реченнях. Без редакторських коментарів. Видаляйте персональні дані.",
        content: `Підсумуйте цю подію конфлікту в 1-2 реченнях українською мовою.

Вихідний текст:
{{text}}

Контекст місцезнаходження: {{location}}
Клас події: {{class}}`,
        variables: [
          { name: "text", type: "string", required: true },
          { name: "location", type: "string", required: false, default: "невідомо" },
          { name: "class", type: "string", required: false, default: "military_action" },
        ],
        model: "claude-haiku-4-5-20251001",
        maxTokens: 150,
        temperature: 0.2,
        author: "platform",
        releasedAt: "2024-01-01",
      },
    ],
  },
  // ── Copilot: User query ───────────────────────────────────────────────────
  {
    id: "copilot.query",
    name: "Copilot user query",
    description: "Answer user OSINT questions with conflict-context awareness",
    service: "copilot",
    tags: ["copilot", "qa"],
    activeVersion: "1.0.0",
    locales: ["en", "uk"],
    versions: [
      {
        version: "1.0.0",
        locale: "en",
        systemPrompt: `You are Aegis Lens, an AI-powered OSINT assistant focused on the Ukrainian conflict.
Answer questions using the provided event context. Always cite your sources.
Be precise, neutral, and factual. Acknowledge uncertainty explicitly.
Current date: {{current_date}}`,
        content: `User question: {{question}}

Relevant events:
{{events_context}}`,
        variables: [
          { name: "question", type: "string", required: true },
          { name: "events_context", type: "string", required: true },
          { name: "current_date", type: "string", required: true },
        ],
        model: "claude-sonnet-4-6",
        maxTokens: 1024,
        temperature: 0.3,
        author: "platform",
        releasedAt: "2024-01-01",
      },
    ],
  },
  // ── Reports: Regional brief ───────────────────────────────────────────────
  {
    id: "reports.regional_brief",
    name: "Regional brief generation",
    description: "Generate a regional intelligence brief from event data",
    service: "reports",
    tags: ["reports", "brief"],
    activeVersion: "1.0.0",
    locales: ["en"],
    versions: [
      {
        version: "1.0.0",
        locale: "en",
        systemPrompt:
          "You are an intelligence analyst writing a factual regional brief. Include key developments, patterns, and caveats. Cite specific events. Use clear section headers.",
        content: `Write a regional intelligence brief for {{region}} covering {{date_range}}.

Key events:
{{events}}

Focus areas: {{focus_areas}}

Format: Executive Summary, Key Developments, Patterns & Trends, Outlook, Caveats.`,
        variables: [
          { name: "region", type: "string", required: true },
          { name: "date_range", type: "string", required: true },
          { name: "events", type: "string", required: true },
          { name: "focus_areas", type: "string", required: false, default: "military, infrastructure, civilian" },
        ],
        model: "claude-sonnet-4-6",
        maxTokens: 2048,
        temperature: 0.2,
        author: "platform",
        releasedAt: "2024-01-01",
      },
    ],
  },
  // ── Rule builder: NL parse ────────────────────────────────────────────────
  {
    id: "rule_builder.parse",
    name: "NL rule parser",
    description: "Parse natural language alert rule into structured JSON",
    service: "rule-builder",
    tags: ["rules", "alerts"],
    activeVersion: "1.0.0",
    locales: ["en", "uk"],
    versions: [
      {
        version: "1.0.0",
        locale: "en",
        systemPrompt:
          'Convert natural language alert queries to JSON. Respond ONLY with valid JSON. No markdown.',
        content: `Parse this alert rule into structured JSON:

"{{nl_rule}}"

Schema: { "rule": { "eventClasses": [], "minSeverity": 1|2|3, "minConfidence": 0-1, "geo": null|{"placeName":"","lat":0,"lon":0,"radiusKm":0}, "keywords": [] }, "preview": "You will be alerted when...", "confidence": 0-1 }`,
        variables: [{ name: "nl_rule", type: "string", required: true }],
        model: "claude-haiku-4-5-20251001",
        maxTokens: 512,
        temperature: 0,
        author: "platform",
        releasedAt: "2024-01-01",
      },
    ],
  },
];

export const PROMPT_LIBRARY = new PromptLibrary();
for (const prompt of PROMPTS) {
  PROMPT_LIBRARY.register(prompt);
}
