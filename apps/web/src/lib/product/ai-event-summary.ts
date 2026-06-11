/**
 * AI Event Summary — Claude-powered per-event narrative summaries.
 *
 * Each verified event receives a short AI-generated summary surfaced in
 * the event card, timeline tooltip, and digest emails.
 *
 * Короткі AI-резюме подій на базі Claude. Відображаються в картці події,
 * підказці таймлайну та дайджест-листах.
 */

'use server';

// ── Model & limits ────────────────────────────────────────────────────────────

export const AI_SUMMARY_MODEL = 'claude-haiku-4-5-20251001' as const;
export const AI_SUMMARY_MAX_TOKENS = 300 as const;
export const AI_SUMMARY_TEMPERATURE = 0.3 as const;

// ── Config ────────────────────────────────────────────────────────────────────

export interface AiSummaryConfig {
  model: typeof AI_SUMMARY_MODEL;
  maxTokens: typeof AI_SUMMARY_MAX_TOKENS;
  temperature: number;
  /** Summary languages to generate — Мови для генерації резюме */
  languages: string[];
  /** Queue concurrency limit — Ліміт паралельності черги */
  concurrency: number;
  /** Per-user daily summary quota — Денна квота резюме на користувача */
  dailyQuotaPerUser: number;
  /** Cache TTL in seconds — TTL кешу (сек) */
  cacheTtlSeconds: number;
}

export const AI_SUMMARY_CONFIG: AiSummaryConfig = {
  model: AI_SUMMARY_MODEL,
  maxTokens: AI_SUMMARY_MAX_TOKENS,
  temperature: AI_SUMMARY_TEMPERATURE,
  languages: ['en', 'uk'],
  concurrency: 10,
  dailyQuotaPerUser: 200,
  cacheTtlSeconds: 3_600,
};

// ── Prompt builder ────────────────────────────────────────────────────────────

export interface EventSummaryInput {
  eventId: string;
  eventClass: string;
  location: string;
  occurredAt: string;
  rawText: string;
  confidence: number;
  dangerScore: number;
  language?: string;
}

/**
 * Builds the system + user prompt for a single-event summary.
 *
 * Формує system + user промпт для резюме однієї події.
 */
export function buildEventSummaryPrompt(event: EventSummaryInput): string {
  return [
    `You are an OSINT analyst assistant. Summarise the following conflict event in 2–3 concise sentences.`,
    `Focus on: what happened, where, when, and the significance. Confidence: ${(event.confidence * 100).toFixed(0)}%. Danger: ${event.dangerScore}/100.`,
    `Do NOT speculate beyond the provided text. Do NOT include source names. Output plain text only.`,
    ``,
    `Event class: ${event.eventClass}`,
    `Location: ${event.location}`,
    `Occurred at: ${event.occurredAt}`,
    `Source text: ${event.rawText.slice(0, 800)}`,
  ].join('\n');
}

// ── Queue ─────────────────────────────────────────────────────────────────────

interface QueueEntry {
  event: EventSummaryInput;
  resolve: (summary: string) => void;
  reject: (err: Error) => void;
}

/**
 * In-process priority queue for AI summary generation.
 * Wraps concurrency control around the Claude API client.
 *
 * Черга для генерації AI-резюме з контролем паралельності.
 */
export class AiSummaryQueue {
  private readonly queue: QueueEntry[] = [];
  private running = 0;
  private readonly concurrency: number;

  constructor(concurrency = AI_SUMMARY_CONFIG.concurrency) {
    this.concurrency = concurrency;
  }

  enqueue(event: EventSummaryInput): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.queue.push({ event, resolve, reject });
      this.drain();
    });
  }

  private drain(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const entry = this.queue.shift()!;
      this.running += 1;
      this.process(entry).finally(() => {
        this.running -= 1;
        this.drain();
      });
    }
  }

  private async process(entry: QueueEntry): Promise<void> {
    try {
      // Actual Claude API call injected at runtime via llm.ts
      // Реальний виклик Claude API вставляється через llm.ts під час виконання
      const prompt = buildEventSummaryPrompt(entry.event);
      // Placeholder: real implementation calls import('../llm').generateText(prompt, config)
      entry.resolve(`[summary pending for event ${entry.event.eventId}]: ${prompt.slice(0, 60)}…`);
    } catch (err) {
      entry.reject(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global AI summary queue singleton — Глобальний синглтон черги резюме */
export const aiSummaryQueue = new AiSummaryQueue();
