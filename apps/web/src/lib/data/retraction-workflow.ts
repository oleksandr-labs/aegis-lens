'use server';
/**
 * Retraction Workflow — in-memory store, policy constants, and helpers.
 * Робочий процес відкликання — сховище в пам'яті, константи політики та хелпери.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Reason a retraction was requested.
 * Причина запиту на відкликання.
 */
export type RetractionReason =
  | "false-information"
  | "source-retracted"
  | "privacy-violation"
  | "legal-request"
  | "duplicate"
  | "manual-review";

/**
 * Lifecycle status of a retraction request.
 * Статус життєвого циклу запиту на відкликання.
 */
export type RetractionStatus =
  | "pending"
  | "under-review"
  | "approved"
  | "rejected"
  | "completed";

/**
 * A single retraction request record.
 * Запис одного запиту на відкликання.
 */
export interface RetractionRequest {
  /** Unique retraction request identifier. */
  id: string;
  /** The event (or entity) being retracted. */
  eventId: string;
  /** User or system that submitted the request. */
  requestedBy: string;
  /** Reason for the retraction. */
  reason: RetractionReason;
  /** Current lifecycle status. */
  status: RetractionStatus;
  /** Unix timestamp (ms) when the request was created. */
  createdAt: number;
  /** Unix timestamp (ms) when the request was resolved, or null if still open. */
  resolvedAt: number | null;
  /** Free-text notes from the reviewer. */
  notes: string;
}

// ---------------------------------------------------------------------------
// Policy constants
// ---------------------------------------------------------------------------

export const RETRACTION_POLICY_EN =
  "Retractions follow a soft-delete model: the record is marked retracted and returns HTTP 410, " +
  "but the underlying data is archived, never deleted. " +
  "A public retraction notice is published on the platform immediately upon approval. " +
  "Corrections replace the original with a linked correction post explaining what changed and why.";

export const RETRACTION_POLICY_UK =
  "Відкликання застосовують модель м'якого видалення: запис позначається як відкликаний і повертає HTTP 410, " +
  "але базові дані архівуються, а не видаляються. " +
  "Публічне повідомлення про відкликання публікується на платформі одразу після затвердження. " +
  "Виправлення замінюють оригінал із посиланням на публікацію-виправлення, яка пояснює, що і чому змінилося.";

export const RETRACTION_SLA_EN =
  "Retraction SLA: acknowledged within 2 hours of submission. " +
  "Clear-cut cases (confirmed false information, privacy violation, legal request) resolved within 24 hours. " +
  "Contested cases (disputed facts, editorial judgment calls) resolved within 7 calendar days.";

export const RETRACTION_SLA_UK =
  "SLA відкликання: підтвердження протягом 2 годин з моменту подання. " +
  "Очевидні випадки (підтверджена дезінформація, порушення конфіденційності, юридичний запит) вирішуються протягом 24 годин. " +
  "Спірні випадки (оскаржені факти, редакційні рішення) вирішуються протягом 7 календарних днів.";

export const RETRACTION_AUDIT_NOTE_EN =
  "All retraction requests and decisions are logged immutably to the audit store. " +
  "No user — including platform administrators — can delete or alter a retraction audit entry. " +
  "The full public log is accessible at `/corrections` and in the quarterly CC-BY data export.";

export const RETRACTION_AUDIT_NOTE_UK =
  "Усі запити на відкликання та рішення щодо них незмінно реєструються в журналі аудиту. " +
  "Жоден користувач — включно з адміністраторами платформи — не може видалити або змінити запис аудиту відкликання. " +
  "Повний публічний журнал доступний за адресою `/corrections` та в щоквартальному експорті даних CC-BY.";

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

/**
 * In-memory retraction request store.
 * Operates as a singleton; replace with a DB-backed implementation in production.
 * Сховище запитів на відкликання в пам'яті.
 * Працює як синглтон; в продакшені замінити реалізацією з БД.
 */
export class RetractionStore {
  private readonly requests: Map<string, RetractionRequest> = new Map();

  /**
   * Submit a new retraction request.
   * Подати новий запит на відкликання.
   */
  requestRetraction(
    params: Omit<RetractionRequest, "status" | "createdAt" | "resolvedAt">,
  ): RetractionRequest {
    const record: RetractionRequest = {
      ...params,
      status: "pending",
      createdAt: Date.now(),
      resolvedAt: null,
    };
    this.requests.set(record.id, record);
    return record;
  }

  /**
   * Update the status (and optional notes) of an existing retraction request.
   * Оновити статус (та додаткові нотатки) наявного запиту на відкликання.
   */
  updateStatus(
    id: string,
    status: RetractionStatus,
    notes?: string,
  ): RetractionRequest | null {
    const existing = this.requests.get(id);
    if (!existing) return null;
    const resolved =
      status === "completed" || status === "rejected" || status === "approved"
        ? Date.now()
        : existing.resolvedAt;
    const updated: RetractionRequest = {
      ...existing,
      status,
      resolvedAt: resolved,
      notes: notes !== undefined ? notes : existing.notes,
    };
    this.requests.set(id, updated);
    return updated;
  }

  /**
   * Retrieve all retraction requests for a given event ID.
   * Отримати всі запити на відкликання для зазначеного ідентифікатора події.
   */
  getByEventId(eventId: string): RetractionRequest[] {
    return Array.from(this.requests.values()).filter(
      (r) => r.eventId === eventId,
    );
  }

  /**
   * Retrieve all requests currently awaiting review.
   * Отримати всі запити, що очікують рецензування.
   */
  getPendingQueue(): RetractionRequest[] {
    return Array.from(this.requests.values()).filter(
      (r) => r.status === "pending" || r.status === "under-review",
    );
  }
}

/** Singleton retraction store instance. */
export const retractionStore = new RetractionStore();
