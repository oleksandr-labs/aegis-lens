/**
 * Oryx blog / Google-Sheets parser.
 *
 * Oryx publishes losses as HTML lists. Each model is a heading followed by a
 * sequence of numbered links, where each link's text encodes the loss status
 * and points at the evidence photo/video. A simplified raw shape looks like:
 *
 *   T-72B3: (5, destroyed)
 *     1 destroyed https://i.postimg.cc/....
 *     2 captured  https://twitter.com/....
 *
 * Community Google-Sheets mirrors expose the same rows in tabular form.
 *
 * Because Oryx markup is hand-maintained and changes shape over time, this
 * module parses a NORMALISED intermediate (`OryxRawRow`) rather than raw HTML.
 * `client.ts` is responsible for producing those rows (from HTML, CSV export,
 * or — by default — the bundled DEMO fixture). Keeping the brittle HTML/CSV
 * extraction at the edge keeps this mapping logic stable and testable.
 */

import type {
  OryxEntry,
  OryxEquipmentCategory,
  OryxLossStatus,
  OryxSide,
  LocalizedName,
} from "./types";
import { transliterateModel, equipmentNameUk } from "./i18n";

/** A single normalised row extracted from an Oryx list or sheet. */
export interface OryxRawRow {
  side: OryxSide;
  category: OryxEquipmentCategory;
  /** Model name exactly as published (English). */
  modelEn: string;
  /** Ordinal within the model's loss list (1-based). */
  seq: number;
  /** Raw status token from Oryx ("destroyed" / "damaged" / "abandoned" / "captured"). */
  statusRaw: string;
  evidenceUrl?: string;
  /** Coarse location text as published, if any. */
  locationText?: string;
  /** Raw date string as published, if any. */
  dateRaw?: string;
  oryxPostUrl: string;
}

const STATUS_TOKENS: Record<string, OryxLossStatus> = {
  destroyed: "destroyed",
  damaged: "damaged",
  abandoned: "abandoned",
  captured: "captured",
};

/** Map a free-text Oryx status token to a canonical status (defaults to destroyed). */
export function normaliseStatus(raw: string): OryxLossStatus {
  const key = raw.trim().toLowerCase();
  for (const token of Object.keys(STATUS_TOKENS)) {
    if (key.includes(token)) return STATUS_TOKENS[token];
  }
  return "destroyed";
}

/** Slugify an equipment model name into the canonical KG join key. */
export function modelToSlug(modelEn: string): string {
  return modelEn
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Parse Oryx's loose date strings into an ISO date + an "approximate" flag. */
export function normaliseDate(raw?: string): { date?: string; approximate: boolean } {
  if (!raw) return { approximate: true };
  const trimmed = raw.trim();
  // Full ISO date.
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) return { date: trimmed, approximate: false };
  // Month-only (YYYY-MM) — treat as approximate, pin to first of month.
  const ym = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (ym) return { date: `${trimmed}-01`, approximate: true };
  // Year-only.
  const y = /^(\d{4})$/.exec(trimmed);
  if (y) return { date: `${trimmed}-01-01`, approximate: true };
  return { approximate: true };
}

function buildName(modelEn: string): LocalizedName {
  return {
    en: modelEn,
    uk: equipmentNameUk(modelEn),
    translit: transliterateModel(modelEn),
  };
}

/** Convert a batch of raw rows into typed, normalised OryxEntry records. */
export function parseRows(rows: OryxRawRow[]): OryxEntry[] {
  const ingestedAt = new Date().toISOString();
  return rows.map((row) => {
    const modelSlug = modelToSlug(row.modelEn);
    const { date, approximate } = normaliseDate(row.dateRaw);
    return {
      entryId: `oryx-${row.side}-${modelSlug}-${row.seq}`,
      side: row.side,
      category: row.category,
      model: buildName(row.modelEn),
      modelSlug,
      status: normaliseStatus(row.statusRaw),
      date,
      dateApproximate: approximate,
      locationText: row.locationText
        ? { en: row.locationText, uk: row.locationText }
        : undefined,
      evidenceUrl: row.evidenceUrl,
      oryxPostUrl: row.oryxPostUrl,
      ingestedAt,
    } satisfies OryxEntry;
  });
}

// ── Demo fixture ──────────────────────────────────────────────────────────────

const RU_POST = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html";
const UA_POST = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html";

/**
 * Small, representative demo set of raw rows so the package is usable without
 * live network access. Evidence URLs use Oryx's typical image-host pattern.
 */
export const DEMO_ROWS: OryxRawRow[] = [
  { side: "russia", category: "tanks", modelEn: "T-72B3", seq: 1, statusRaw: "destroyed", dateRaw: "2024-03-12", locationText: "near Avdiivka, Donetsk Oblast", evidenceUrl: "https://i.postimg.cc/oryx/t72b3-1.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "tanks", modelEn: "T-72B3", seq: 2, statusRaw: "captured", dateRaw: "2024-03", locationText: "Kharkiv Oblast", evidenceUrl: "https://i.postimg.cc/oryx/t72b3-2.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "tanks", modelEn: "T-90M Proryv", seq: 1, statusRaw: "abandoned", dateRaw: "2024-04-02", locationText: "near Robotyne, Zaporizhzhia Oblast", evidenceUrl: "https://i.postimg.cc/oryx/t90m-1.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "infantry_fighting_vehicles", modelEn: "BMP-2", seq: 1, statusRaw: "destroyed", dateRaw: "2024-02-20", locationText: "Bakhmut, Donetsk Oblast", evidenceUrl: "https://i.postimg.cc/oryx/bmp2-1.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "self_propelled_artillery", modelEn: "2S19 Msta-S", seq: 1, statusRaw: "damaged", dateRaw: "2024-01", locationText: "Luhansk Oblast", evidenceUrl: "https://i.postimg.cc/oryx/msta-1.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "surface_to_air_missile", modelEn: "S-400 Triumf", seq: 1, statusRaw: "destroyed", dateRaw: "2023-09-14", locationText: "occupied Crimea", evidenceUrl: "https://i.postimg.cc/oryx/s400-1.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "aircraft", modelEn: "Su-34", seq: 1, statusRaw: "destroyed", dateRaw: "2024-02-17", locationText: "near front line, Donetsk Oblast", evidenceUrl: "https://i.postimg.cc/oryx/su34-1.jpg", oryxPostUrl: RU_POST },
  { side: "russia", category: "naval", modelEn: "Project 11356 frigate", seq: 1, statusRaw: "damaged", dateRaw: "2023-09", locationText: "Sevastopol, occupied Crimea", evidenceUrl: "https://i.postimg.cc/oryx/frigate-1.jpg", oryxPostUrl: RU_POST },

  { side: "ukraine", category: "tanks", modelEn: "T-64BV", seq: 1, statusRaw: "destroyed", dateRaw: "2024-03-05", locationText: "Donetsk Oblast", evidenceUrl: "https://i.postimg.cc/oryx/t64bv-1.jpg", oryxPostUrl: UA_POST },
  { side: "ukraine", category: "tanks", modelEn: "Leopard 2A6", seq: 1, statusRaw: "abandoned", dateRaw: "2023-06-08", locationText: "near Robotyne, Zaporizhzhia Oblast", evidenceUrl: "https://i.postimg.cc/oryx/leo2a6-1.jpg", oryxPostUrl: UA_POST },
  { side: "ukraine", category: "infantry_fighting_vehicles", modelEn: "M2A2 Bradley", seq: 1, statusRaw: "damaged", dateRaw: "2024-02-12", locationText: "near Avdiivka, Donetsk Oblast", evidenceUrl: "https://i.postimg.cc/oryx/bradley-1.jpg", oryxPostUrl: UA_POST },
  { side: "ukraine", category: "self_propelled_artillery", modelEn: "2S1 Gvozdika", seq: 1, statusRaw: "destroyed", dateRaw: "2024-01-19", locationText: "Kherson Oblast", evidenceUrl: "https://i.postimg.cc/oryx/gvozdika-1.jpg", oryxPostUrl: UA_POST },
];

/** Build the bundled demo snapshot entries directly. */
export function demoEntries(): OryxEntry[] {
  return parseRows(DEMO_ROWS);
}
