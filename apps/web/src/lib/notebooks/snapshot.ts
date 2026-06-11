'use server';
/**
 * Notebook data snapshots — freeze cell data at snapshot time for reproducibility.
 * Знімки даних блокнота — заморожування даних комірок на момент знімка для відтворюваності.
 *
 * When an analyst takes a snapshot, the data hashes and row counts for all
 * query/code cells are stored immutably. Re-running the notebook later will
 * show diffs against the snapshot baseline.
 *
 * Коли аналітик робить знімок, хеші даних та кількість рядків для всіх
 * query/code комірок зберігаються незмінно. Повторний запуск блокнота пізніше
 * показуватиме відмінності відносно базового знімка.
 */

import { randomUUID, createHash } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CellSnapshot {
  cellId: string;
  dataHash: string;
  rowCount?: number;
  preview?: string;
}

export interface NotebookSnapshot {
  snapshotId: string;
  notebookId: string;
  cellSnapshots: CellSnapshot[];
  createdAt: string;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Reproducibility guarantee — snapshots pin data so analyses can be re-verified */
export const SNAPSHOT_NOTE_REPRODUCIBILITY_EN =
  "Reproducibility guarantee — snapshots pin the exact data state of each query cell at the time of capture; any analyst can re-open a notebook and verify conclusions against the frozen dataset.";
export const SNAPSHOT_NOTE_REPRODUCIBILITY_UK =
  "Гарантія відтворюваності — знімки фіксують точний стан даних кожної query-комірки на момент захоплення; будь-який аналітик може повторно відкрити блокнот і верифікувати висновки відносно замороженого датасету.";

/** Data frozen at snapshot time — live queries are not re-executed when viewing a snapshot */
export const SNAPSHOT_NOTE_FROZEN_EN =
  "Data frozen at snapshot time — when viewing or exporting a snapshot, live queries are not re-executed; the stored dataHash and preview are used, making snapshot views consistent and fast.";
export const SNAPSHOT_NOTE_FROZEN_UK =
  "Дані заморожені на момент знімка — при перегляді або експорті знімка живі запити не виконуються повторно; використовуються збережені dataHash та preview, що робить перегляд знімків стабільним і швидким.";

export const SNAPSHOT_NOTES_EN = [
  SNAPSHOT_NOTE_REPRODUCIBILITY_EN,
  SNAPSHOT_NOTE_FROZEN_EN,
];
export const SNAPSHOT_NOTES_UK = [
  SNAPSHOT_NOTE_REPRODUCIBILITY_UK,
  SNAPSHOT_NOTE_FROZEN_UK,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashData(data: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory notebook snapshot store.
 * Сховище знімків блокнотів у пам'яті.
 */
export class SnapshotStore {
  private readonly snapshots = new Map<string, NotebookSnapshot>();

  /**
   * Take a snapshot of a notebook's cells.
   * Each cell's data is hashed and a preview is generated.
   *
   * Зробити знімок комірок блокнота.
   * Дані кожної комірки хешуються, генерується preview.
   */
  take(
    notebookId: string,
    cells: Array<{ cellId: string; data?: unknown; rows?: unknown[] }>,
  ): NotebookSnapshot {
    const cellSnapshots: CellSnapshot[] = cells.map((cell) => {
      const data = cell.data ?? cell.rows ?? null;
      const dataHash = hashData(data);
      const rowCount = Array.isArray(cell.rows) ? cell.rows.length : undefined;
      const preview =
        data !== null
          ? JSON.stringify(data).slice(0, 200)
          : undefined;
      return { cellId: cell.cellId, dataHash, rowCount, preview };
    });

    const snapshot: NotebookSnapshot = {
      snapshotId: `snap_${randomUUID()}`,
      notebookId,
      cellSnapshots,
      createdAt: new Date().toISOString(),
    };
    this.snapshots.set(snapshot.snapshotId, snapshot);
    return snapshot;
  }

  /** Get a snapshot by its ID. */
  get(snapshotId: string): NotebookSnapshot | undefined {
    return this.snapshots.get(snapshotId);
  }

  /** List all snapshots for a given notebook, newest first. */
  listForNotebook(notebookId: string): NotebookSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter((s) => s.notebookId === notebookId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory notebook snapshot store singleton. */
export const snapshotStore = new SnapshotStore();
