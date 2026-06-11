'use server'
/**
 * Versioning + Scheduled Publish — content version tracking and publish scheduling.
 * Server-side module: mutates in-process store; wire to a real DB in production.
 *
 * Версіонування + відкладена публікація — відстеження версій контенту та планування.
 * Серверний модуль: мутує in-process сховище; підключити до реальної БД у продакшні.
 */

// ── Status enum ───────────────────────────────────────────────────────────────

/**
 * Lifecycle states for a content version.
 *
 * Стани життєвого циклу версії контенту.
 */
export enum VersionStatus {
  Draft = "draft",
  Scheduled = "scheduled",
  Published = "published",
  Archived = "archived",
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContentVersion {
  /** Unique version id (e.g. `${contentId}-v${n}`). */
  id: string;
  /** Parent content document id. / ID батьківського документа. */
  contentId: string;
  /** Monotonically increasing version number. / Монотонно зростаючий номер версії. */
  version: number;
  status: VersionStatus;
  /** ISO-8601 datetime when this version was created. */
  createdAt: string;
  /** ISO-8601 datetime for scheduled publish (only when status=scheduled). */
  scheduledAt?: string;
  /** ISO-8601 datetime when it was actually published. */
  publishedAt?: string;
  /** User id of the author who created this version. / ID автора версії. */
  authorId: string;
  /** Snapshot of the content at this version (opaque blob). */
  snapshot: unknown;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export class VersionStore {
  /** All versions keyed by version id. / Усі версії за version id. */
  private readonly versions = new Map<string, ContentVersion>();
  /** Next version counter keyed by contentId. / Лічильник версій за contentId. */
  private readonly counters = new Map<string, number>();

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Create a new draft version for a content document.
   *
   * Створює нову чернетку версії документа контенту.
   */
  createDraft(
    contentId: string,
    authorId: string,
    snapshot: unknown,
  ): ContentVersion {
    const n = (this.counters.get(contentId) ?? 0) + 1;
    this.counters.set(contentId, n);

    const version: ContentVersion = {
      id: `${contentId}-v${n}`,
      contentId,
      version: n,
      status: VersionStatus.Draft,
      createdAt: new Date().toISOString(),
      authorId,
      snapshot,
    };

    this.versions.set(version.id, version);
    return version;
  }

  /**
   * Schedule a draft version for future publish.
   * Throws if the version is not in Draft status.
   *
   * Планує чернетку для публікації у майбутньому.
   * Кидає помилку, якщо версія не є чернеткою.
   */
  schedulePublish(contentId: string, at: string): void {
    const version = this._latestDraft(contentId);
    if (!version) {
      throw new Error(
        `[cms/versioning] No draft found for contentId "${contentId}"`,
      );
    }

    version.status = VersionStatus.Scheduled;
    version.scheduledAt = at;
  }

  /**
   * Publish a scheduled version immediately.
   *
   * Публікує заплановану версію негайно.
   */
  publish(contentId: string): ContentVersion {
    const version =
      this._byStatus(contentId, VersionStatus.Scheduled) ??
      this._latestDraft(contentId);

    if (!version) {
      throw new Error(
        `[cms/versioning] Nothing to publish for contentId "${contentId}"`,
      );
    }

    version.status = VersionStatus.Published;
    version.publishedAt = new Date().toISOString();
    return version;
  }

  /**
   * Archive a published version.
   *
   * Архівує опубліковану версію.
   */
  archive(versionId: string): void {
    const v = this.versions.get(versionId);
    if (!v) throw new Error(`[cms/versioning] Version "${versionId}" not found`);
    v.status = VersionStatus.Archived;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Return all versions for a content document, newest first.
   *
   * Повертає всі версії документа, починаючи з найновішої.
   */
  listVersions(contentId: string): ContentVersion[] {
    return [...this.versions.values()]
      .filter((v) => v.contentId === contentId)
      .sort((a, b) => b.version - a.version);
  }

  /** Return the latest published version for a content document. */
  getPublished(contentId: string): ContentVersion | undefined {
    return this._byStatus(contentId, VersionStatus.Published);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _latestDraft(contentId: string): ContentVersion | undefined {
    return [...this.versions.values()]
      .filter(
        (v) => v.contentId === contentId && v.status === VersionStatus.Draft,
      )
      .sort((a, b) => b.version - a.version)[0];
  }

  private _byStatus(
    contentId: string,
    status: VersionStatus,
  ): ContentVersion | undefined {
    return [...this.versions.values()].find(
      (v) => v.contentId === contentId && v.status === status,
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-process version store. / Глобальне in-process сховище версій. */
export const versionStore = new VersionStore();

// ── Convenience re-export ─────────────────────────────────────────────────────

/**
 * Schedule a content version for publish at the given ISO-8601 datetime.
 *
 * Планує версію контенту для публікації у заданий момент ISO-8601.
 */
export function schedulePublish(contentId: string, at: string): void {
  versionStore.schedulePublish(contentId, at);
}
