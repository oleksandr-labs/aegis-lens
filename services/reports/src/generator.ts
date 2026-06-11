/**
 * AI-assisted intelligence report generator.
 *
 * Flow:
 *   1. Retrieve relevant events (caller passes pre-fetched list)
 *   2. Build per-section prompts with context + citations
 *   3. Call LLM for each section (parallel)
 *   4. Assemble draft Report
 *
 * All reports start as "draft" status.
 * A human analyst MUST approve before publish.
 */

import type { Report, ReportCitation, ReportKind, ReportSection, ReportTemplate } from "./types";
import { REPORT_TEMPLATES } from "./types";

export interface EventSummary {
  event_id: string;
  summary_en: string;
  summary_uk?: string;
  occurred_at: string;
  class: string;
  subclass?: string | null;
  lat: number;
  lon: number;
  confidence: number;
  source_url?: string;
}

export interface GenerateReportInput {
  kind: ReportKind;
  regions: string[];
  eventClasses?: string[];
  periodStart: string;
  periodEnd: string;
  events: EventSummary[];
  targetLocales?: string[];
  customSections?: string[];
  model?: string;
}

export interface LLMBackend {
  complete(prompt: string, maxTokens?: number): Promise<string>;
}

// ── Claude / OpenAI compatible backend ───────────────────────────────────────

export class AnthropicBackend implements LLMBackend {
  constructor(
    private readonly apiKey: string,
    private readonly model = "claude-haiku-4-5-20251001",
  ) {}

  async complete(prompt: string, maxTokens = 512): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system:
          "You are an intelligence analyst. Write factual, structured, citation-backed reports. Never speculate beyond available evidence. Use measured language. Every claim must reference a cited event.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const json = (await res.json()) as { content: { type: string; text: string }[] };
    return json.content.find((c) => c.type === "text")?.text ?? "";
  }
}

export class OpenAIBackend implements LLMBackend {
  constructor(
    private readonly apiKey: string,
    private readonly model = "gpt-4o-mini",
  ) {}

  async complete(prompt: string, maxTokens = 512): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content:
              "You are an intelligence analyst. Write factual, structured, citation-backed reports.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    return json.choices[0]?.message?.content ?? "";
  }
}

// ── Report generator ──────────────────────────────────────────────────────────

export class ReportGenerator {
  constructor(private readonly llm: LLMBackend) {}

  async generate(input: GenerateReportInput): Promise<Report> {
    const template = REPORT_TEMPLATES[input.kind];
    const sectionKeys =
      input.kind === "custom" && input.customSections?.length
        ? input.customSections
        : template.sectionKeys;

    const locales = input.targetLocales ?? ["en"];
    const now = new Date().toISOString();

    const sections = await Promise.all(
      sectionKeys.map((key) =>
        this.generateSection(key, template, input, locales),
      ),
    );

    const titlePrompt = this.buildTitlePrompt(input);
    const titleEn = await this.llm.complete(titlePrompt, 60).catch(() => `${input.kind} Report — ${input.periodStart.slice(0, 10)}`);

    const title: Record<string, string> = { en: titleEn };
    if (locales.includes("uk")) {
      const ukTitle = await this.llm
        .complete(`Translate to Ukrainian (keep concise): ${titleEn}`, 60)
        .catch(() => titleEn);
      title.uk = ukTitle;
    }

    return {
      report_id: crypto.randomUUID(),
      kind: input.kind,
      title,
      regions: input.regions,
      eventClasses: input.eventClasses ?? [],
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      sections,
      status: "draft",
      model: input.model ?? "unknown",
      createdAt: now,
      updatedAt: now,
    };
  }

  private async generateSection(
    sectionKey: string,
    template: ReportTemplate,
    input: GenerateReportInput,
    locales: string[],
  ): Promise<ReportSection> {
    const relevantEvents = this.selectRelevantEvents(sectionKey, input.events, 10);
    const citations: ReportCitation[] = relevantEvents.map((e) => ({
      event_id: e.event_id,
      summary: e.summary_en,
      occurred_at: e.occurred_at,
      source_url: e.source_url,
    }));

    const contextBlock = relevantEvents
      .map(
        (e, i) =>
          `[${i + 1}] (${e.occurred_at.slice(0, 10)}) ${e.class}/${e.subclass ?? ""}: ${e.summary_en}`,
      )
      .join("\n");

    const sectionPrompt =
      template.sectionPrompts[sectionKey] ??
      `Write the "${sectionKey}" section of this ${input.kind} intelligence report.`;

    const prompt = `
You are writing the "${sectionKey}" section for an intelligence report.
Region: ${input.regions.join(", ")}
Period: ${input.periodStart.slice(0, 10)} to ${input.periodEnd.slice(0, 10)}

Available events (cite by index [N]):
${contextBlock}

Task: ${sectionPrompt}

Use only events listed above. Cite by [index]. Write 2-4 sentences maximum. Be factual and measured.
`.trim();

    const enBody = await this.llm.complete(prompt, 300).catch(() => "");

    const heading: Record<string, string> = {
      en: this.formatHeading(sectionKey, "en"),
    };
    const body: Record<string, string> = { en: enBody };

    if (locales.includes("uk") && enBody) {
      const ukBody = await this.llm
        .complete(`Translate to Ukrainian, preserving citation markers [N]:\n${enBody}`, 400)
        .catch(() => "");
      if (ukBody) {
        body.uk = ukBody;
        heading.uk = this.formatHeading(sectionKey, "uk");
      }
    }

    return { heading, body, citations };
  }

  private buildTitlePrompt(input: GenerateReportInput): string {
    return `Write a concise 8-12 word title for a ${input.kind} intelligence report covering ${input.regions.join(", ")} from ${input.periodStart.slice(0, 10)} to ${input.periodEnd.slice(0, 10)}. No quotes.`;
  }

  private selectRelevantEvents(
    sectionKey: string,
    events: EventSummary[],
    maxCount: number,
  ): EventSummary[] {
    // Section-to-class affinity mapping
    const affinityMap: Record<string, string[]> = {
      security_situation: ["military_action", "aviation", "maritime"],
      infrastructure: ["infrastructure"],
      humanitarian: ["humanitarian", "civilian_alert"],
      threat_trends: ["military_action", "cyber"],
      cyber: ["cyber"],
    };

    const preferred = affinityMap[sectionKey];
    if (preferred) {
      const matching = events.filter((e) => preferred.includes(e.class));
      if (matching.length > 0) {
        return matching
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, maxCount);
      }
    }

    // Fall back to most confident events
    return [...events].sort((a, b) => b.confidence - a.confidence).slice(0, maxCount);
  }

  private formatHeading(key: string, locale: string): string {
    const headings: Record<string, Record<string, string>> = {
      executive_summary: { en: "Executive Summary", uk: "Зведена аналітична записка" },
      security_situation: { en: "Security Situation", uk: "Безпекова ситуація" },
      infrastructure: { en: "Infrastructure", uk: "Інфраструктура" },
      humanitarian: { en: "Humanitarian Situation", uk: "Гуманітарна ситуація" },
      key_entities: { en: "Key Entities", uk: "Ключові суб'єкти" },
      outlook: { en: "Outlook", uk: "Прогноз" },
      incident_summary: { en: "Incident Summary", uk: "Короткий опис інциденту" },
      timeline: { en: "Timeline", uk: "Хронологія" },
      impact: { en: "Impact Assessment", uk: "Оцінка наслідків" },
      verification_status: { en: "Verification Status", uk: "Стан верифікації" },
      source_analysis: { en: "Source Analysis", uk: "Аналіз джерел" },
      week_summary: { en: "Week Summary", uk: "Підсумок тижня" },
      top_events: { en: "Top Events", uk: "Головні події" },
      threat_trends: { en: "Threat Trends", uk: "Тенденції загроз" },
      infrastructure_snapshot: { en: "Infrastructure Snapshot", uk: "Стан інфраструктури" },
      humanitarian_snapshot: { en: "Humanitarian Snapshot", uk: "Гуманітарний зріз" },
      next_week_watch: { en: "Next Week Watch", uk: "Що спостерігати наступного тижня" },
    };
    return headings[key]?.[locale] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
