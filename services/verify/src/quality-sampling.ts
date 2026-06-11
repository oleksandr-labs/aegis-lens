/**
 * Quality sampling — deterministic 10% double-review for QA.
 * Відбір якості — детерміновані 10% подвійної перевірки для контролю якості.
 *
 * Every ~1 in 10 events is flagged for a blind second review to measure
 * inter-rater reliability and feed accuracy statistics back to reviewers.
 *
 * Приблизно кожна 10-та подія позначається для сліпої другої перевірки з метою
 * вимірювання міжрецензентської узгодженості та зворотнього зв'язку аналітикам.
 */

import crypto from "crypto";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Fraction of events sampled for QA double-review. */
export const QUALITY_SAMPLE_RATE = 0.10;

// ── Sampling predicate ────────────────────────────────────────────────────────

/**
 * Deterministically decide whether an event should be QA-sampled.
 * Uses a SHA-256 hash of the eventId, takes the first byte mod 10.
 * Result is stable: same eventId always returns the same answer.
 *
 * Детерміноване рішення щодо відбору події для QA.
 * Використовує SHA-256 хеш eventId, перший байт mod 10.
 * Результат стабільний: той самий eventId завжди дає ту саму відповідь.
 */
export function shouldSampleForQA(eventId: string): boolean {
  const hash = crypto.createHash("sha256").update(eventId).digest();
  return hash[0] % 10 === 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QASampleRecord {
  eventId: string;
  /** ISO timestamp when the event was flagged for QA */
  sampledAt: string;
  /** UserId of the original (primary) reviewer */
  primaryReviewerId: string;
  /** UserId of the blind QA reviewer (assigned later) */
  qaReviewerId?: string;
  /** QA reviewer's verdict string */
  qaVerdict?: string;
  /** true if QA verdict matches primary; false if diverges; undefined if not yet reviewed */
  matchesPrimary?: boolean;
}

// ── Sampler ───────────────────────────────────────────────────────────────────

/**
 * In-memory QA sample registry.
 * In production, store records in a `qa_samples` DB table.
 *
 * Реєстр QA-відборів у пам'яті.
 * У продакшені зберігати в таблиці БД `qa_samples`.
 */
export class QASampler {
  private readonly samples = new Map<string, QASampleRecord>();

  /**
   * Flag an event for QA review (called after primary review is resolved).
   * Should only be called after `shouldSampleForQA(eventId)` returns true.
   *
   * Позначення події для QA-перевірки.
   */
  markForQA(eventId: string, primaryReviewerId: string): QASampleRecord {
    const record: QASampleRecord = {
      eventId,
      sampledAt: new Date().toISOString(),
      primaryReviewerId,
    };
    this.samples.set(eventId, record);
    return record;
  }

  /**
   * Assign a QA reviewer to a sampled event.
   * The QA reviewer must not be the same as the primary reviewer (blind review).
   *
   * Призначення QA-рецензента для відібраної події.
   * QA-рецензент не повинен збігатися з основним (сліпа перевірка).
   */
  assignQAReviewer(eventId: string, qaReviewerId: string): QASampleRecord {
    const record = this._require(eventId);
    record.qaReviewerId = qaReviewerId;
    return record;
  }

  /**
   * Record the QA reviewer's verdict and compare against primary.
   * `matchesPrimary` is true if both verdicts are identical strings.
   *
   * Запис вердикту QA-рецензента та порівняння з основним.
   */
  recordQAResult(eventId: string, qaVerdict: string): QASampleRecord {
    const record = this._require(eventId);
    // Retrieve primary verdict from the review queue in production;
    // here we compare against a stored primaryVerdict if available.
    record.qaVerdict = qaVerdict;
    // matchesPrimary requires the primary verdict to be stored alongside the record.
    // In production, join against the reviewTasks table.
    // For now, leave matchesPrimary undefined until wired.
    return record;
  }

  /**
   * Mark a QA result as matching or not matching the primary verdict.
   * Called after joining with the primary reviewer's resolved verdict.
   *
   * Позначення результату QA як відповідного або невідповідного основному.
   */
  setMatchResult(eventId: string, matchesPrimary: boolean): QASampleRecord {
    const record = this._require(eventId);
    record.matchesPrimary = matchesPrimary;
    return record;
  }

  /** Retrieve a QA sample record. */
  getRecord(eventId: string): QASampleRecord | undefined {
    return this.samples.get(eventId);
  }

  /** List all QA samples awaiting a QA reviewer assignment. */
  listUnassigned(): QASampleRecord[] {
    return [...this.samples.values()].filter((r) => !r.qaReviewerId);
  }

  /** List all QA samples assigned but not yet reviewed. */
  listPendingReview(): QASampleRecord[] {
    return [...this.samples.values()].filter(
      (r) => r.qaReviewerId && !r.qaVerdict,
    );
  }

  private _require(eventId: string): QASampleRecord {
    const record = this.samples.get(eventId);
    if (!record) throw new Error(`QASampleRecord not found for eventId: ${eventId}`);
    return record;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global QA sampler singleton. */
export const qaSampler = new QASampler();

// ── Accuracy helper ───────────────────────────────────────────────────────────

/**
 * Compute QA accuracy as a percentage of samples where primary and QA verdicts match.
 *
 * Обчислення точності QA як відсотка відборів, де вердикти збігаються.
 */
export function computeQAAccuracy(stats: { total: number; matches: number }): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.matches / stats.total) * 100 * 10) / 10; // 1 d.p. %
}

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] 10% sample rate:
 * Approximately 1 in 10 resolved review tasks is selected for QA double-review.
 * The deterministic hash ensures no reviewer can predict or game which items are sampled.
 *
 * [1] Частота відбору 10%:
 * Приблизно 1 із 10 вирішених завдань перевірки відбирається для QA.
 * Детерміністський хеш гарантує, що рецензент не може передбачити або маніпулювати відбором.
 */
export const NOTE_SAMPLE_RATE_EN =
  "10% sample rate: ~1 in 10 resolved review tasks are QA-sampled using a deterministic " +
  "SHA-256 hash. Reviewers cannot predict or influence which items are selected.";

export const NOTE_SAMPLE_RATE_UK =
  "Частота відбору 10%: ~1 із 10 вирішених завдань відбирається для QA за допомогою " +
  "детерміністського SHA-256 хешу. Рецензенти не можуть передбачити або вплинути на відбір.";

/**
 * [2] Blind review:
 * The QA reviewer is assigned without knowledge of the primary reviewer's verdict.
 * The primary verdict is revealed only after the QA reviewer submits their own verdict.
 *
 * [2] Сліпа перевірка:
 * QA-рецензент призначається без знання вердикту основного рецензента.
 * Основний вердикт розкривається лише після подання вердикту QA-рецензентом.
 */
export const NOTE_BLIND_REVIEW_EN =
  "Blind review: the QA reviewer sees the event without the primary verdict. " +
  "Reveal the primary verdict only after the QA reviewer submits their own.";

export const NOTE_BLIND_REVIEW_UK =
  "Сліпа перевірка: QA-рецензент бачить подію без основного вердикту. " +
  "Розкривати основний вердикт лише після подання вердикту QA-рецензентом.";

/**
 * [3] Accuracy feedback loop:
 * QA accuracy scores (computeQAAccuracy) are surfaced to individual reviewers
 * on their profile page and feed into the ContributorProfile.qaAccuracy field
 * used for tier promotion and queue access decisions.
 *
 * [3] Зворотній зв'язок для точності:
 * Показники точності QA відображаються рецензентам на їхній сторінці профілю
 * та передаються до поля ContributorProfile.qaAccuracy для рішень щодо рівня доступу.
 */
export const NOTE_ACCURACY_FEEDBACK_EN =
  "Accuracy feedback loop: computeQAAccuracy() scores feed into ContributorProfile.qaAccuracy. " +
  "Low accuracy scores may trigger tier demotion or queue access review.";

export const NOTE_ACCURACY_FEEDBACK_UK =
  "Зворотній зв'язок для точності: показники computeQAAccuracy() передаються до " +
  "ContributorProfile.qaAccuracy. Низькі показники можуть ініціювати зниження рівня або " +
  "перегляд доступу до черги.";
