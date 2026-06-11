/**
 * Report versioning — immutable snapshots + diff computation.
 * Every save creates a new version; versions are never mutated or deleted.
 *
 * Версіювання звітів — незмінні знімки + обчислення diff.
 * Кожне збереження створює нову версію; версії ніколи не змінюються і не видаляються.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportVersion {
  versionId: string;
  reportId: string;
  versionNumber: number;
  /** Full document snapshot at the time of save */
  snapshot: Record<string, unknown>;
  changelog: string;
  changelogUk: string;
  authorId: string;
  createdAt: string;
}

export interface ReportDiff {
  fromVersion: number;
  toVersion: number;
  addedSections: string[];
  removedSections: string[];
  modifiedSections: string[];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export class ReportVersionStore {
  private readonly versions = new Map<string, ReportVersion[]>();
  private versionCounter    = 0;

  /**
   * Saves a new immutable version for a report.
   * Зберігає нову незмінну версію для звіту.
   */
  saveVersion(
    reportId:  string,
    snapshot:  Record<string, unknown>,
    changelog: string,
    authorId:  string,
    changelogUk = "",
  ): ReportVersion {
    const history = this.versions.get(reportId) ?? [];
    const version: ReportVersion = {
      versionId:     `rv_${Date.now()}_${++this.versionCounter}`,
      reportId,
      versionNumber: history.length + 1,
      snapshot,
      changelog,
      changelogUk:   changelogUk || changelog,
      authorId,
      createdAt:     new Date().toISOString(),
    };
    history.push(version);
    this.versions.set(reportId, history);
    return version;
  }

  /**
   * Retrieves a specific version by number (1-based).
   * Отримує конкретну версію за номером (починаючи з 1).
   */
  getVersion(reportId: string, versionNumber: number): ReportVersion | undefined {
    const history = this.versions.get(reportId) ?? [];
    return history.find((v) => v.versionNumber === versionNumber);
  }

  /**
   * Lists all versions for a report, newest first.
   * Повертає всі версії звіту, найновіша — першою.
   */
  listVersions(reportId: string): ReportVersion[] {
    const history = this.versions.get(reportId) ?? [];
    return [...history].sort((a, b) => b.versionNumber - a.versionNumber);
  }

  /**
   * Computes a structural diff between two versions of a report.
   * Compares top-level section keys in the snapshot objects.
   *
   * Обчислює структурний diff між двома версіями звіту.
   * Порівнює ключі секцій верхнього рівня у снапшотах.
   */
  computeDiff(reportId: string, v1: number, v2: number): ReportDiff {
    const from = this.getVersion(reportId, v1);
    const to   = this.getVersion(reportId, v2);

    if (!from || !to) {
      return { fromVersion: v1, toVersion: v2, addedSections: [], removedSections: [], modifiedSections: [] };
    }

    const fromKeys = new Set(Object.keys(from.snapshot));
    const toKeys   = new Set(Object.keys(to.snapshot));

    const addedSections    = [...toKeys].filter((k) => !fromKeys.has(k));
    const removedSections  = [...fromKeys].filter((k) => !toKeys.has(k));
    const modifiedSections = [...fromKeys]
      .filter((k) => toKeys.has(k))
      .filter((k) => JSON.stringify(from.snapshot[k]) !== JSON.stringify(to.snapshot[k]));

    return { fromVersion: v1, toVersion: v2, addedSections, removedSections, modifiedSections };
  }
}

/** Module-level singleton */
export const reportVersionStore = new ReportVersionStore();

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const VERSIONING_NOTES_EN: string[] = [
  "immutable-versions: once a ReportVersion is saved it is never mutated; the UI must create a new version for every edit, never overwrite an existing one, to preserve a complete edit history.",
  "diff-for-audit-trail: computeDiff() provides section-level change detection; for character-level diffs within a section, pass the section content to a diff library (e.g. diff-match-patch) on the client side.",
];

export const VERSIONING_NOTES_UK: string[] = [
  "immutable-versions: після збереження ReportVersion вона ніколи не змінюється; UI має створювати нову версію для кожного редагування, а не перезаписувати наявну, щоб зберегти повну історію змін.",
  "diff-for-audit-trail: computeDiff() забезпечує виявлення змін на рівні секцій; для diff на рівні символів усередині секції — передати вміст секції до бібліотеки diff (напр. diff-match-patch) на стороні клієнта.",
];
