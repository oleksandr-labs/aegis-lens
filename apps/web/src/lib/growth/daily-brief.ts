/**
 * Daily Brief — AI-generated public daily situational awareness briefs.
 *
 * Produces free, branded summaries of the day's top events, published
 * at BRIEF_PUBLISH_HOUR_UTC each day. Drives organic reach & return visits.
 *
 * Щоденні AI-брифінги для публічного доступу. Публікуються о BRIEF_PUBLISH_HOUR_UTC UTC.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** UTC hour at which the daily brief is published. / UTC-година публікації брифінгу. */
export const BRIEF_PUBLISH_HOUR_UTC = 6;

/** Maximum number of events summarised per brief. / Максимум подій у брифінгу. */
export const BRIEF_MAX_EVENTS = 10;

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DailyBriefConfig {
  /** YYYY-MM-DD date of this brief. / Дата брифінгу. */
  date: string;
  /** Locale for the brief text. / Локаль тексту брифінгу. */
  locale: "en" | "uk";
  /** Whether to include satellite imagery thumbnails. / Чи включати мініатюри. */
  includeImagery: boolean;
  /** Whether to include attribution chain. / Чи включати ланцюжок атрибуції. */
  includeAttribution: boolean;
  /** Max words in the generated brief body. / Максимум слів у тілі брифінгу. */
  maxWords: number;
}

export interface DailyBriefEvent {
  id: string;
  title: string;
  category: string;
  location: string;
  timestamp: string;
  confidence: number;
  sourceUrls: string[];
}

export interface DailyBriefTemplate {
  /** System prompt for the AI model. / Системний промпт для AI-моделі. */
  systemPrompt: string;
  /** Locale this template targets. / Цільова локаль шаблону. */
  locale: "en" | "uk";
  /** Output format hint. / Формат виводу. */
  outputFormat: "markdown" | "html" | "plain";
}

export interface DailyBriefEntry {
  date: string;
  locale: "en" | "uk";
  title: string;
  summary: string;
  events: DailyBriefEvent[];
  publishedAt: string;
  wordCount: number;
}

// ── Prompt builder ────────────────────────────────────────────────────────────

/**
 * Build the AI prompt for a daily brief given a list of top events.
 *
 * Будує промпт для AI на основі топ-подій дня.
 */
export function buildDailyBriefPrompt(
  events: DailyBriefEvent[],
  config: Pick<DailyBriefConfig, "locale" | "maxWords">,
): string {
  const capped = events.slice(0, BRIEF_MAX_EVENTS);
  const locale = config.locale === "uk" ? "Ukrainian" : "English";
  const eventLines = capped
    .map(
      (e, i) =>
        `${i + 1}. [${e.category}] ${e.title} — ${e.location} (${e.timestamp}, confidence ${e.confidence}%)`,
    )
    .join("\n");

  return `You are an OSINT analyst writing a daily situational-awareness brief in ${locale}.
Write a concise brief (max ${config.maxWords} words) covering the following events.
Include a one-sentence headline, a short paragraph summary, and bullet points for each event.
Cite confidence levels. Use neutral, factual language. Do NOT speculate beyond source material.

Events:
${eventLines}

Output format: Markdown.`;
}

// ── DailyBriefStore ───────────────────────────────────────────────────────────

export class DailyBriefStore {
  /** Keyed by `${date}:${locale}`. / Ключ: `${дата}:${локаль}`. */
  private readonly entries = new Map<string, DailyBriefEntry>();

  private key(date: string, locale: string): string {
    return `${date}:${locale}`;
  }

  /**
   * Store a generated brief.
   *
   * Зберігає згенерований брифінг.
   */
  save(entry: DailyBriefEntry): void {
    this.entries.set(this.key(entry.date, entry.locale), entry);
  }

  /**
   * Retrieve a brief by date and locale.
   *
   * Повертає брифінг за датою та локаллю.
   */
  get(date: string, locale: "en" | "uk"): DailyBriefEntry | undefined {
    return this.entries.get(this.key(date, locale));
  }

  /**
   * List all briefs, most recent first.
   *
   * Повертає список брифінгів, найновіші першими.
   */
  list(locale?: "en" | "uk"): DailyBriefEntry[] {
    const all = Array.from(this.entries.values());
    const filtered = locale ? all.filter((e) => e.locale === locale) : all;
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global daily brief store. */
export const dailyBriefStore = new DailyBriefStore();
