/**
 * Per-dataset citation builder — cite explicitly per page. (TODO task 12)
 *
 * Academic credibility requires that every trend/datasets page carries a precise,
 * dated citation for each dataset it draws on. This builds citation strings (en/uk)
 * + a structured citation object from the dataset catalog, and asserts the
 * republication gate (raw vs derived).
 */

import type { DatasetId } from "./types";
import { getDataset, type DatasetCatalogEntry } from "./datasets";

export interface DatasetCitation {
  datasetId: DatasetId;
  /** Full attribution line, English. */
  textEn: string;
  /** Full attribution line, Ukrainian. */
  textUk: string;
  homepageUrl: string;
  /** ISO date the page accessed the data. */
  accessedAt: string;
  /** Whether the page may show raw rows or only derived metrics. */
  rawRepublishable: boolean;
}

export interface CitationOptions {
  /** ISO-8601 access date; defaults to now. */
  accessedAt?: string;
  /** Optional dataset release/version label, e.g. "GED v24.1". */
  version?: string;
}

export function buildCitation(id: DatasetId, opts: CitationOptions = {}): DatasetCitation {
  const ds = getDataset(id);
  const accessedAt = opts.accessedAt ?? new Date().toISOString();
  const date = accessedAt.slice(0, 10);
  const ver = opts.version ? ` (${opts.version})` : "";

  return {
    datasetId: id,
    textEn: `${ds.publisher.en}. ${ds.name.en}${ver}. ${ds.homepageUrl}. ${ds.attribution} Accessed ${date}.`,
    textUk: `${ds.publisher.uk}. ${ds.name.uk}${ver}. ${ds.homepageUrl}. ${ds.attributionUk} Дата доступу: ${date}.`,
    homepageUrl: ds.homepageUrl,
    accessedAt,
    rawRepublishable: ds.rawRepublishable,
  };
}

/** Build citations for every dataset a page used. */
export function buildCitations(ids: DatasetId[], opts: CitationOptions = {}): DatasetCitation[] {
  return dedupe(ids).map((id) => buildCitation(id, opts));
}

/**
 * Republication gate: throws if a page tries to expose RAW rows from a dataset
 * whose licence forbids it (e.g. ACLED). Use before serializing raw events.
 */
export function assertCanRepublishRaw(id: DatasetId): void {
  const ds: DatasetCatalogEntry = getDataset(id);
  if (!ds.rawRepublishable) {
    throw new CitationLicenseError(
      `Dataset "${id}" (${ds.name.en}) does not permit raw-row republication; expose derived metrics + citation only.`,
    );
  }
}

export class CitationLicenseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CitationLicenseError";
  }
}

function dedupe(ids: DatasetId[]): DatasetId[] {
  return Array.from(new Set(ids));
}
