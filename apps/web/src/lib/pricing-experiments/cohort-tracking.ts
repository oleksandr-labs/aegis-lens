/**
 * Cohort tracking for pricing experiments.
 *
 * Відстеження когорт для цінових експериментів.
 *
 * Uses a ring buffer to cap memory usage at MAX_ENTRIES regardless of
 * how many users are enrolled.
 */

import type { CohortRetentionRecord } from "./types";

// ── CohortEntry ────────────────────────────────────────────────────────────────

/**
 * A single user's cohort membership record.
 * Запис участі одного користувача у когорті.
 */
export interface CohortEntry {
  /** Composite key: experimentId + ":" + armId + ":" + cohortMonth */
  cohortId: string;
  experimentId: string;
  armId: string;
  userId: string;
  /** ISO-8601 timestamp of when the user joined the cohort */
  joinedAt: string;
  /** Active plan at time of cohort entry, e.g. "pro", "observer" */
  plan: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_ENTRIES = 10_000;

// ── CohortStore ────────────────────────────────────────────────────────────────

/**
 * In-memory cohort store with a ring buffer (max 10 k entries).
 * Replace with a durable store (Postgres, ClickHouse) in production.
 *
 * In-memory сховище когорт із кільцевим буфером (макс. 10 тис. записів).
 */
export class CohortStore {
  /** Ring buffer */
  private readonly buffer: Array<CohortEntry | undefined> = new Array(MAX_ENTRIES).fill(undefined);
  /** Points to the slot where the next write will go */
  private head = 0;
  /** Total entries ever written (may exceed MAX_ENTRIES) */
  private totalWritten = 0;

  // ── addToCohort ─────────────────────────────────────────────────────────────

  /**
   * Add a user to a cohort. If the ring buffer is full, the oldest entry
   * is overwritten.
   *
   * Додає користувача до когорти. При переповненні перезаписує найстаріший запис.
   */
  addToCohort(
    experimentId: string,
    armId: string,
    userId: string,
    plan: string,
    joinedAt?: string,
  ): CohortEntry {
    const now = joinedAt ?? new Date().toISOString();
    const cohortMonth = now.slice(0, 7); // "YYYY-MM"
    const entry: CohortEntry = {
      cohortId: `${experimentId}:${armId}:${cohortMonth}`,
      experimentId,
      armId,
      userId,
      joinedAt: now,
      plan,
    };
    this.buffer[this.head] = entry;
    this.head = (this.head + 1) % MAX_ENTRIES;
    this.totalWritten += 1;
    return entry;
  }

  // ── getRetention ────────────────────────────────────────────────────────────

  /**
   * Compute a synthetic retention snapshot for a given experiment + arm + month.
   *
   * NOTE: In a real implementation this would join against activity events.
   * Here we return a placeholder record (all fractions are 0.0) until
   * actual event data is wired in.
   *
   * Обчислює знімок утримання для конкретного arm та місяця когорти.
   * До підключення реальних подій активності повертає нульові значення.
   */
  getRetention(
    experimentId: string,
    armId: string,
    cohortMonth: string,
  ): CohortRetentionRecord {
    const members = this.getMembersForCohort(experimentId, armId, cohortMonth);

    // Placeholder fractions — wire real event data here
    const retained = members.length > 0
      ? { day7: 0, day30: 0, day90: 0 }
      : { day7: 0, day30: 0, day90: 0 };

    return {
      experimentId,
      armId,
      cohortMonth,
      retainedDay7: retained.day7,
      retainedDay30: retained.day30,
      retainedDay90: retained.day90,
    };
  }

  // ── exportCohortCSV ─────────────────────────────────────────────────────────

  /**
   * Export all entries for a given experimentId as CSV text.
   * Suitable for downloading from an admin route.
   *
   * Експортує всі записи для експерименту у форматі CSV.
   */
  exportCohortCSV(experimentId: string): string {
    const header = "cohortId,experimentId,armId,userId,joinedAt,plan\n";
    const rows: string[] = [];

    for (const entry of this.buffer) {
      if (!entry || entry.experimentId !== experimentId) continue;
      // Escape any commas / quotes in values
      const cols = [
        entry.cohortId,
        entry.experimentId,
        entry.armId,
        entry.userId,
        entry.joinedAt,
        entry.plan,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      rows.push(cols.join(","));
    }

    return header + rows.join("\n");
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private getMembersForCohort(
    experimentId: string,
    armId: string,
    cohortMonth: string,
  ): CohortEntry[] {
    const results: CohortEntry[] = [];
    for (const entry of this.buffer) {
      if (!entry) continue;
      if (
        entry.experimentId === experimentId &&
        entry.armId === armId &&
        entry.joinedAt.startsWith(cohortMonth)
      ) {
        results.push(entry);
      }
    }
    return results;
  }

  /** Total entries ever written (may exceed ring buffer capacity). */
  get size(): number {
    return this.totalWritten;
  }

  /** Entries currently in the ring buffer (max MAX_ENTRIES). */
  get capacity(): number {
    return MAX_ENTRIES;
  }
}

/**
 * Module-level singleton.
 * Одиночний екземпляр на рівні модуля.
 */
export const cohortStore = new CohortStore();
