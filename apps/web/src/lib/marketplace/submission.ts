'use server';

/**
 * Marketplace — Plugin submission and review process.
 *
 * Manages the full lifecycle from developer draft through automated and
 * human security / content / performance / ToS review to final approval or
 * rejection. Immutable audit trail per submission.
 *
 * Повний цикл: чернетка → автоматичний та людський огляд → схвалення/відхилення.
 * Незмінний audit trail для кожної заявки.
 */

// ── SubmissionStatus ──────────────────────────────────────────────────────────

/**
 * Lifecycle status of a marketplace submission.
 *
 * Статус заявки на публікацію в маркетплейсі.
 */
export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "approved"
  | "rejected";

// ── SubmissionChecklist ───────────────────────────────────────────────────────

/**
 * Four-axis review checklist applied to every submission.
 * All four axes must pass for a submission to reach "approved".
 *
 * Чотири осі перевірки: безпека, контент, продуктивність, ToS.
 * Усі чотири мають бути пройдені для схвалення.
 */
export interface SubmissionChecklist {
  /**
   * Security review — sandbox isolation, no credential capture, no data exfil,
   * CSP compliance, dependency audit.
   *
   * Огляд безпеки: ізоляція, захист облікових даних, CSP, аудит залежностей.
   */
  securityPass: boolean | null;
  /**
   * Content review — accurate description, no misleading claims, no harmful content.
   *
   * Огляд контенту: точний опис, відсутність маніпулятивних тверджень.
   */
  contentPass: boolean | null;
  /**
   * Performance review — within CPU/memory budget, non-blocking, lazy-loaded assets.
   *
   * Огляд продуктивності: бюджет CPU/пам'яті, неблокуючий код, lazy-load.
   */
  performancePass: boolean | null;
  /**
   * ToS compliance — developer accepted platform ToS; no prohibited use cases.
   *
   * Відповідність ToS: розробник погодився з умовами; без заборонених сценаріїв.
   */
  tosPass: boolean | null;
}

// ── SubmissionRecord ──────────────────────────────────────────────────────────

export interface SubmissionRecord {
  id: string;
  pluginId: string;
  developerId: string;
  status: SubmissionStatus;
  checklist: SubmissionChecklist;
  /** Reviewer notes — set when status transitions to approved/rejected */
  reviewNotes?: string;
  /** ISO 8601 */
  submittedAt?: string;
  updatedAt: string;
  /** Version string being submitted */
  version: string;
}

// ── SubmissionStore ───────────────────────────────────────────────────────────

/**
 * In-memory submission tracking store.
 * In production, persist submissions to DB and integrate with the review queue.
 *
 * Сховище заявок у пам'яті.
 * У проді — зберігати в БД, інтегрувати з чергою ревʼю.
 */
export class SubmissionStore {
  /** Keyed by submission ID */
  private readonly submissions = new Map<string, SubmissionRecord>();

  private newId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private blankChecklist(): SubmissionChecklist {
    return {
      securityPass: null,
      contentPass: null,
      performancePass: null,
      tosPass: null,
    };
  }

  // ── Create ─────────────────────────────────────────────────────────────────

  /**
   * Create a draft submission. Developer can edit the plugin before calling submit().
   *
   * Створює чернетку заявки. Розробник може редагувати плагін перед відправкою.
   */
  createDraft(pluginId: string, developerId: string, version: string): SubmissionRecord {
    const record: SubmissionRecord = {
      id: this.newId(),
      pluginId,
      developerId,
      status: "draft",
      checklist: this.blankChecklist(),
      updatedAt: new Date().toISOString(),
      version,
    };
    this.submissions.set(record.id, record);
    return record;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  /**
   * Transition a draft to "submitted" and enter the review queue.
   *
   * Переводить чернетку у статус "submitted" і ставить у чергу ревʼю.
   */
  submit(submissionId: string): SubmissionRecord | undefined {
    const record = this.submissions.get(submissionId);
    if (!record || record.status !== "draft") return undefined;
    const now = new Date().toISOString();
    record.status = "submitted";
    record.submittedAt = now;
    record.updatedAt = now;
    return record;
  }

  /**
   * Transition to "under-review" when a human reviewer picks it up.
   *
   * Переводить у статус "under-review" коли ревʼювер починає перевірку.
   */
  beginReview(submissionId: string): SubmissionRecord | undefined {
    const record = this.submissions.get(submissionId);
    if (!record || record.status !== "submitted") return undefined;
    record.status = "under-review";
    record.updatedAt = new Date().toISOString();
    return record;
  }

  // ── Checklist ──────────────────────────────────────────────────────────────

  /**
   * Update individual checklist axes during review.
   *
   * Оновлює окремі осі checklist під час ревʼю.
   */
  updateChecklist(
    submissionId: string,
    update: Partial<SubmissionChecklist>,
  ): SubmissionRecord | undefined {
    const record = this.submissions.get(submissionId);
    if (!record) return undefined;
    Object.assign(record.checklist, update);
    record.updatedAt = new Date().toISOString();
    return record;
  }

  // ── Approve / Reject ───────────────────────────────────────────────────────

  /**
   * Approve a submission. All four checklist axes must be true.
   * Throws if checklist is incomplete.
   *
   * Схвалює заявку. Усі чотири осі checklist мають бути true.
   */
  approve(submissionId: string, reviewNotes?: string): SubmissionRecord {
    const record = this.submissions.get(submissionId);
    if (!record) throw new Error(`[submission] Unknown submission: ${submissionId}`);

    const { securityPass, contentPass, performancePass, tosPass } = record.checklist;
    if (!securityPass || !contentPass || !performancePass || !tosPass) {
      throw new Error(
        `[submission] Cannot approve ${submissionId}: not all checklist axes are true.`,
      );
    }

    record.status = "approved";
    record.reviewNotes = reviewNotes;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  /**
   * Reject a submission with mandatory review notes.
   *
   * Відхиляє заявку з обов'язковими нотатками ревʼювера.
   */
  reject(submissionId: string, reviewNotes: string): SubmissionRecord {
    const record = this.submissions.get(submissionId);
    if (!record) throw new Error(`[submission] Unknown submission: ${submissionId}`);
    record.status = "rejected";
    record.reviewNotes = reviewNotes;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  getById(submissionId: string): SubmissionRecord | undefined {
    return this.submissions.get(submissionId);
  }

  getByPlugin(pluginId: string): SubmissionRecord[] {
    return Array.from(this.submissions.values()).filter((s) => s.pluginId === pluginId);
  }

  getByDeveloper(developerId: string): SubmissionRecord[] {
    return Array.from(this.submissions.values()).filter((s) => s.developerId === developerId);
  }

  getQueue(): SubmissionRecord[] {
    return Array.from(this.submissions.values()).filter(
      (s) => s.status === "submitted" || s.status === "under-review",
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const submissionStore = new SubmissionStore();
