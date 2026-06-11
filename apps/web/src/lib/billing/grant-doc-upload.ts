'use server';

/**
 * Grant Document Upload — Trust Center pipeline for grant verification docs.
 *
 * Users applying for journalist, NGO, academic, or OSS grants upload supporting
 * documents here. Documents are stored as opaque file references (CDN URL or
 * object-storage key) and reviewed by the Trust Center team.
 *
 * Завантаження документів для верифікації грантів у Trust Center.
 */

// ── GrantDocType ───────────────────────────────────────────────────────────────

/**
 * Types of documents accepted for grant verification.
 * Типи документів для верифікації гранту.
 */
export type GrantDocType =
  | "press-card"          // journalist press credential / редакційне посвідчення
  | "org-registration"    // NGO/academic org registration document / реєстраційний документ
  | "student-id"          // student ID or enrolment letter / студентський квиток або листівка
  | "github-profile"      // OSS grant: GitHub profile screenshot / профіль GitHub для OSS-гранту
  | "tax-exemption"       // non-profit tax exemption certificate / свідоцтво про звільнення від податку
  | "other";              // any other supporting document / інший документ

// ── GrantDocument ──────────────────────────────────────────────────────────────

export interface GrantDocument {
  id: string;
  userId: string;
  type: GrantDocType;
  /**
   * Opaque file reference: either a CDN URL or an object-storage key.
   * Never store raw file content in this store.
   *
   * Посилання на файл (CDN URL або ключ об'єктного сховища). Без бінарного вмісту.
   */
  fileRef: string;
  /** MIME type of the uploaded file, e.g. "application/pdf" or "image/jpeg" */
  mimeType: string;
  /** Original filename provided by the user */
  originalName: string;
  /** Review status */
  status: "pending" | "approved" | "rejected";
  /** ISO timestamp of upload */
  uploadedAt: string;
  /** ISO timestamp of review decision, or null */
  reviewedAt: string | null;
  /** Reviewer note (internal, not shown to user) */
  reviewNote: string;
}

// ── GrantDocStore ──────────────────────────────────────────────────────────────

export class GrantDocStore {
  /** Map<userId, GrantDocument[]> */
  private readonly docs = new Map<string, GrantDocument[]>();
  private counter = 0;

  // ── uploadDoc ──────────────────────────────────────────────────────────────

  /**
   * Register an uploaded document for grant verification.
   * `fileRef` must be a CDN URL or storage key — not raw binary data.
   *
   * Реєструє завантажений документ. fileRef — URL або ключ сховища, не бінарні дані.
   */
  uploadDoc(
    userId: string,
    type: GrantDocType,
    fileRef: string,
    options?: { mimeType?: string; originalName?: string },
  ): GrantDocument {
    if (!fileRef.trim()) {
      throw new Error("[grant-doc-upload] fileRef must not be empty.");
    }

    const doc: GrantDocument = {
      id: `gdoc-${++this.counter}-${Date.now()}`,
      userId,
      type,
      fileRef,
      mimeType: options?.mimeType ?? "application/octet-stream",
      originalName: options?.originalName ?? "document",
      status: "pending",
      uploadedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: "",
    };

    if (!this.docs.has(userId)) {
      this.docs.set(userId, []);
    }
    this.docs.get(userId)!.push(doc);

    return doc;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * List all documents uploaded by a user, newest first.
   * Список документів користувача, від нових до старих.
   */
  listForUser(userId: string): GrantDocument[] {
    return [...(this.docs.get(userId) ?? [])].reverse();
  }

  /**
   * Find a specific document by ID.
   * Пошук документа за ID.
   */
  findById(docId: string): GrantDocument | null {
    for (const docs of this.docs.values()) {
      const found = docs.find((d) => d.id === docId);
      if (found) return found;
    }
    return null;
  }

  // ── Review ─────────────────────────────────────────────────────────────────

  /** Approve a document (called by Trust Center reviewer). */
  approve(docId: string, reviewNote = ""): void {
    this._setReviewStatus(docId, "approved", reviewNote);
  }

  /** Reject a document (called by Trust Center reviewer). */
  reject(docId: string, reviewNote = ""): void {
    this._setReviewStatus(docId, "rejected", reviewNote);
  }

  private _setReviewStatus(
    docId: string,
    status: "approved" | "rejected",
    reviewNote: string,
  ): void {
    const doc = this.findById(docId);
    if (!doc) throw new Error(`[grant-doc-upload] Document "${docId}" not found.`);
    doc.status = status;
    doc.reviewedAt = new Date().toISOString();
    doc.reviewNote = reviewNote;
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory grant document store. */
export const grantDocStore = new GrantDocStore();
