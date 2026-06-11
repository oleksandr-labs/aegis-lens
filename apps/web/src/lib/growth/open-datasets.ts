/**
 * Open Datasets — curated, anonymised public data releases.
 *
 * Quarterly releases of verified event datasets under CC-BY-4.0.
 * Drives academic citations, researcher goodwill, and SEO backlinks.
 *
 * Відкриті датасети: квартальні випуски перевірених подій під ліцензією CC-BY-4.0.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** SPDX license identifier for all open dataset releases. / SPDX-ліцензія. */
export const DATASET_LICENSE = "CC-BY-4.0";

/** Cadence at which datasets are released. / Частота виходу датасетів. */
export const DATASET_RELEASE_CADENCE = "quarterly";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface OpenDataset {
  /** Unique dataset ID (e.g. "aegis-events-2024-q1"). / Унікальний ID датасету. */
  id: string;
  /** Human-readable title. / Назва. */
  title: string;
  /** ISO-8601 date the dataset period starts. / Початок охоплюваного periodу. */
  periodStart: string;
  /** ISO-8601 date the dataset period ends. / Кінець охоплюваного periodу. */
  periodEnd: string;
  /** ISO-8601 release date. / Дата публікації. */
  releasedAt: string;
  /** Download URL (Zenodo, GitHub Release, etc.). / URL для завантаження. */
  downloadUrl: string;
  /** DOI if archived on Zenodo. / DOI на Zenodo (якщо є). */
  doi?: string;
  /** Number of records in the dataset. / Кількість записів. */
  recordCount: number;
  /** Fields included (column headers). / Поля датасету. */
  fields: string[];
  /** Any anonymisation steps applied. / Кроки анонімізації. */
  anonymisationNotes: string;
  /** License identifier. / Ліцензія. */
  license: string;
  /** Format of the released file. / Формат файлу. */
  format: "csv" | "geojson" | "parquet" | "json";
  /** SHA-256 checksum of the file. / Контрольна сума SHA-256. */
  sha256?: string;
}

// ── README builder ────────────────────────────────────────────────────────────

/**
 * Build a Markdown README for a dataset release.
 *
 * Генерує Markdown README для датасету.
 */
export function buildDatasetReadme(ds: OpenDataset): string {
  const fieldList = ds.fields.map((f) => `- \`${f}\``).join("\n");
  const doiLine = ds.doi ? `\n- **DOI**: ${ds.doi}` : "";
  const checksumLine = ds.sha256 ? `\n- **SHA-256**: \`${ds.sha256}\`` : "";

  return `# ${ds.title}

## Overview

| Field | Value |
|---|---|
| Dataset ID | \`${ds.id}\` |
| Period | ${ds.periodStart} — ${ds.periodEnd} |
| Released | ${ds.releasedAt} |
| Records | ${ds.recordCount.toLocaleString()} |
| Format | ${ds.format.toUpperCase()} |
| License | [${ds.license}](https://creativecommons.org/licenses/by/4.0/) |${doiLine}${checksumLine}

## Download

${ds.downloadUrl}

## Fields

${fieldList}

## Anonymisation

${ds.anonymisationNotes}

## Citation

Please cite this dataset as:
> Aegis Lens Team. (${ds.releasedAt.slice(0, 4)}). *${ds.title}* [Dataset]. ${ds.doi ?? ds.downloadUrl}. License: ${ds.license}.

---
*Released on a ${DATASET_RELEASE_CADENCE} cadence. Data is provided for research and journalistic use.*
`;
}

// ── OpenDatasetStore ──────────────────────────────────────────────────────────

export class OpenDatasetStore {
  private readonly datasets = new Map<string, OpenDataset>();

  /**
   * Register a dataset release.
   *
   * Реєструє випуск датасету.
   */
  register(ds: OpenDataset): void {
    this.datasets.set(ds.id, { ...ds, license: DATASET_LICENSE });
  }

  /**
   * Get a dataset by ID.
   *
   * Повертає датасет за ID.
   */
  get(id: string): OpenDataset | undefined {
    return this.datasets.get(id);
  }

  /**
   * List all datasets, most recently released first.
   *
   * Повертає всі датасети, найновіші першими.
   */
  list(): OpenDataset[] {
    return Array.from(this.datasets.values()).sort(
      (a, b) => b.releasedAt.localeCompare(a.releasedAt),
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global open dataset store. */
export const openDatasetStore = new OpenDatasetStore();
