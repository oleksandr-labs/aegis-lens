/**
 * Model feedback collector — captures human corrections for ML retraining.
 * Збирач зворотного зв'язку для моделей — фіксує людські виправлення для повторного навчання.
 *
 * Whenever a human reviewer overrides an AI prediction, the signal is recorded here.
 * Signals are batched and exported weekly for offline model fine-tuning.
 *
 * Кожного разу, коли рецензент скасовує прогноз ШІ, сигнал фіксується тут.
 * Сигнали збираються в пакети та щотижня експортуються для донавчання моделей.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type CorrectionType =
  | "classification"    // human changed the event category/type
  | "geolocation"       // human corrected lat/lng or location name
  | "confidence"        // human judged AI confidence as over- or under-stated
  | "deepfake"          // human overrode deepfake/manipulation flag
  | "object_detection"; // human corrected a bounding-box or label

export interface FeedbackSignal {
  eventId: string;
  /** AI output that was corrected (privacy-stripped — no PII) */
  originalPrediction: Record<string, unknown>;
  /** The human-supplied correct verdict (string label or JSON stringified) */
  humanVerdict: string;
  correctionType: CorrectionType;
  /** ISO timestamp of the human decision */
  timestamp: string;
}

export interface FeedbackBatch {
  signals: FeedbackSignal[];
  /** Unique batch identifier for tracking in the training pipeline */
  batchId: string;
  /** ISO timestamp of export; undefined until exported */
  exportedAt?: string;
}

// ── Collector ─────────────────────────────────────────────────────────────────

/**
 * In-memory feedback signal collector.
 * In production, persist signals to a `model_feedback` append-only table.
 * Export job calls `exportBatch()` weekly and hands off to the training pipeline.
 *
 * Збирач сигналів у пам'яті.
 * У продакшені зберігати в append-only таблиці `model_feedback`.
 * Завдання експорту викликає `exportBatch()` щотижня та передає до навчального конвеєра.
 */
export class ModelFeedbackCollector {
  private readonly signals: FeedbackSignal[] = [];
  private batchSeq = 0;

  /**
   * Record a feedback signal.
   * PII must be stripped from `originalPrediction` by the caller before passing here.
   *
   * Запис сигналу зворотного зв'язку.
   * Виклик повинен очистити PII з `originalPrediction` перед передачею сюди.
   */
  record(signal: FeedbackSignal): void {
    this.signals.push({ ...signal });
  }

  /**
   * Export up to `maxSize` signals as a batch for the training pipeline.
   * Exported signals are removed from the pending queue.
   * Default maxSize = 1000; minimum useful batch = 100.
   *
   * Експортувати до `maxSize` сигналів у вигляді пакету для навчального конвеєра.
   */
  exportBatch(maxSize = 1000): FeedbackBatch {
    const batchSignals = this.signals.splice(0, maxSize);
    const batchId = `fb-batch-${++this.batchSeq}-${Date.now()}`;
    return {
      signals: batchSignals,
      batchId,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Return aggregate stats on collected (not yet exported) signals.
   *
   * Зведена статистика зібраних (ще не експортованих) сигналів.
   */
  stats(): { total: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const s of this.signals) {
      byType[s.correctionType] = (byType[s.correctionType] ?? 0) + 1;
    }
    return { total: this.signals.length, byType };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global model feedback collector singleton. */
export const modelFeedbackCollector = new ModelFeedbackCollector();

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * [1] Weekly export to training:
 * A scheduled job (cron: 0 2 * * 1 — every Monday at 02:00 UTC) calls
 * `exportBatch()` and uploads the resulting FeedbackBatch JSON to the
 * model training storage bucket. Minimum viable batch is 100 signals.
 *
 * [1] Щотижневий експорт до навчання:
 * Планове завдання (cron: 0 2 * * 1) викликає `exportBatch()` та завантажує
 * результуючий FeedbackBatch JSON до навчального сховища. Мінімальний пакет — 100 сигналів.
 */
export const NOTE_WEEKLY_EXPORT_EN =
  "Weekly export to training: a cron job (Monday 02:00 UTC) calls exportBatch() " +
  "and uploads the FeedbackBatch JSON to the ML training storage bucket. " +
  "Batches smaller than 100 signals are deferred to the following week.";

export const NOTE_WEEKLY_EXPORT_UK =
  "Щотижневий експорт: cron-завдання (понеділок 02:00 UTC) викликає exportBatch() " +
  "та завантажує FeedbackBatch JSON до сховища навчання ML. " +
  "Пакети менше 100 сигналів відкладаються до наступного тижня.";

/**
 * [2] Privacy stripped:
 * Before calling `record()`, the caller must strip all PII from `originalPrediction`.
 * This means removing: names, faces, device identifiers, precise coordinates,
 * and any raw text that could identify individuals.
 * The eventId is retained for lineage tracing but is pseudonymised in the export.
 *
 * [2] Очищення персональних даних:
 * Перед викликом `record()` виклик має очистити всі PII з `originalPrediction`.
 * eventId зберігається для відстеження, але псевдонімізується при експорті.
 */
export const NOTE_PRIVACY_STRIPPED_EN =
  "Privacy stripped: callers must remove all PII from originalPrediction before " +
  "calling record(). Names, faces, precise coordinates, and device IDs must be " +
  "removed. eventId is pseudonymised before export.";

export const NOTE_PRIVACY_STRIPPED_UK =
  "Очищення персональних даних: виклик повинен видалити всі PII з originalPrediction " +
  "перед record(). Імена, обличчя, точні координати та ідентифікатори пристроїв видаляти. " +
  "eventId псевдонімізується перед експортом.";

/**
 * [3] Minimum batch of 100 signals:
 * Exporting fewer than 100 signals risks overfitting on a small correction set.
 * The export job should check `stats().total >= 100` before exporting.
 * If below threshold, defer and alert the ML team.
 *
 * [3] Мінімальний пакет 100 сигналів:
 * Експорт менше 100 сигналів ризикує перенавчанням на малому наборі виправлень.
 * Завдання має перевіряти `stats().total >= 100` перед експортом.
 */
export const NOTE_MIN_BATCH_EN =
  "Minimum batch of 100 signals: check stats().total >= 100 before exporting. " +
  "Batches below threshold are deferred to avoid overfitting. " +
  "Alert the ML team if 100 signals have not accumulated within 30 days.";

export const NOTE_MIN_BATCH_UK =
  "Мінімальний пакет 100 сигналів: перевіряти stats().total >= 100 перед експортом. " +
  "Пакети нижче порогу відкладаються для уникнення перенавчання. " +
  "Сповіщати ML-команду, якщо 100 сигналів не накопичились протягом 30 днів.";
