/**
 * AI Assist — draft generation, summarisation, title suggestion and keyword
 * extraction for editorial content. ALL AI suggestions require human review
 * before publication.
 *
 * AI Assist — генерація чернеток, резюмування, пропозиції заголовків та
 * видобуток ключових слів для редакторського контенту.
 * УСІ пропозиції AI вимагають перевірки людиною перед публікацією.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Mandatory human-review gate — must remain true; never skip.
 *
 * Обов'язкова перевірка людиною — має завжди бути true; не пропускати.
 */
export const AI_ASSIST_HUMAN_REVIEW_REQUIRED = true as const;

// ── Action types ──────────────────────────────────────────────────────────────

export type AiAssistAction =
  | "draft"
  | "summarize"
  | "suggest-title"
  | "extract-keywords";

// ── Request / Result types ────────────────────────────────────────────────────

export interface AiAssistRequest {
  /** The action to perform. / Дія, яку потрібно виконати. */
  action: AiAssistAction;
  /** Source content or prompt for the AI. / Вхідний контент або промпт для AI. */
  input: string;
  /** Optional locale hint (e.g. "uk", "en"). / Необов'язкова підказка мови. */
  locale?: string;
  /** Optional content type context. / Необов'язковий контекст типу контенту. */
  contentType?: string;
  /** User id initiating the request (for audit). / ID користувача для аудиту. */
  userId: string;
}

export interface AiAssistResult {
  action: AiAssistAction;
  /** AI-generated output text. / Текст, згенерований AI. */
  output: string;
  /** Confidence score 0–1 (heuristic). / Оцінка впевненості 0–1 (евристична). */
  confidence: number;
  /**
   * Always true — human must approve before this output reaches production.
   *
   * Завжди true — людина повинна затвердити перед публікацією.
   */
  requiresHumanReview: true;
  /** ISO-8601 timestamp of generation. / Мітка часу генерації ISO-8601. */
  generatedAt: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export class AiAssistStore {
  /** Pending results awaiting human review. / Результати, що очікують перевірки. */
  private readonly pending = new Map<string, AiAssistResult>();
  private counter = 0;

  /**
   * Store a generated AI result as pending review.
   * Returns the assigned review id.
   *
   * Зберігає згенерований результат AI як очікуючий перевірки.
   * Повертає присвоєний review id.
   */
  enqueue(result: AiAssistResult): string {
    const id = `ai-${++this.counter}`;
    this.pending.set(id, result);
    return id;
  }

  /**
   * Retrieve a pending result by review id.
   *
   * Отримує результат, що очікує перевірки, за review id.
   */
  getPending(reviewId: string): AiAssistResult | undefined {
    return this.pending.get(reviewId);
  }

  /**
   * Approve a pending result (moves it out of the pending queue).
   * Returns the approved result for the caller to apply.
   *
   * Затверджує результат (вилучає з черги очікування).
   */
  approve(reviewId: string): AiAssistResult {
    const result = this.pending.get(reviewId);
    if (!result) {
      throw new Error(`[cms/ai-assist] Review id "${reviewId}" not found`);
    }
    this.pending.delete(reviewId);
    return result;
  }

  /**
   * Reject a pending result (removes without applying).
   *
   * Відхиляє результат (видаляє без застосування).
   */
  reject(reviewId: string): void {
    this.pending.delete(reviewId);
  }

  /** List all pending review ids. / Список усіх review id в очікуванні. */
  listPending(): string[] {
    return [...this.pending.keys()];
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const aiAssistStore = new AiAssistStore();
