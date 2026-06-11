/**
 * UCDP annual dataset import. (TODO task 8)
 *
 * UCDP (Uppsala Conflict Data Program) publishes the Georeferenced Event Dataset
 * (GED) as annual releases (CSV/Excel/RData) plus a JSON API:
 *   https://ucdp.uu.se/apidocs/
 * UCDP data is openly licensed for research with attribution and may be
 * republished with citation (see COMPLIANCE.md).
 *
 * This module imports a parsed UCDP GED export (array of rows) and normalises to
 * canonical Event v1. We bundle a small DEMO fixture so trend/baseline code is
 * usable without downloading the annual release.
 */

import type { EventClass, NormalisedDatasetEvent, UcdpRawEvent } from "./types";
import {
  toCanonicalEvents,
  severityFromFatalities,
  type CanonicalEventV1,
} from "./adapter";

/** UCDP country names → ISO2 (subset). */
const UCDP_COUNTRY_ISO2: Record<string, string> = {
  Ukraine: "UA", Russia: "RU", "Russia (Soviet Union)": "RU",
  Syria: "SY", Israel: "IL", Sudan: "SD", Ethiopia: "ET",
  Myanmar: "MM", "DR Congo (Zaire)": "CD", Somalia: "SO",
  Mali: "ML", Nigeria: "NG", Yemen: "YE", Afghanistan: "AF", Iraq: "IQ",
};

/** type_of_violence → canonical class + subclass. */
function classifyUcdp(row: UcdpRawEvent): { eventClass: EventClass; subclass?: string } {
  switch (row.type_of_violence) {
    case 1: return { eventClass: "ground_combat", subclass: "ucdp_state_based" };
    case 2: return { eventClass: "ground_combat", subclass: "ucdp_non_state" };
    case 3: return { eventClass: "humanitarian", subclass: "ucdp_one_sided" };
    default: return { eventClass: "other" };
  }
}

/** UCDP where_prec 1–7 → uncertainty radius (m). */
function uncertaintyFromPrec(p?: number): number | undefined {
  if (p == null) return undefined;
  if (p <= 1) return 2_000;
  if (p === 2) return 10_000;
  if (p === 3) return 50_000;
  if (p === 4) return 100_000;
  return 250_000;
}

export function normaliseUcdpEvent(row: UcdpRawEvent): NormalisedDatasetEvent {
  const { eventClass, subclass } = classifyUcdp(row);
  const iso2 = UCDP_COUNTRY_ISO2[row.country] ?? "ZZ";
  const place = row.adm_1 ?? row.region ?? row.country;

  // UCDP is a vetted, conservative academic dataset → high baseline confidence;
  // imprecise geocoding lowers it.
  const confidence = (row.where_prec ?? 7) <= 2 ? 0.9 : 0.75;

  return {
    dataset: "ucdp",
    sourceEventId: `ucdp:${row.id}`,
    occurredAt: `${row.date_start}T00:00:00Z`,
    country: iso2,
    regionName: row.adm_1,
    lat: row.latitude,
    lon: row.longitude,
    uncertaintyM: uncertaintyFromPrec(row.where_prec),
    eventClass,
    subclass,
    fatalities: row.best,
    severity: severityFromFatalities(row.best),
    confidence,
    titleEn: `${row.side_a} vs ${row.side_b} — ${place} (${row.country})`,
    titleUk: `${row.side_a} проти ${row.side_b} — ${place} (${row.country})`,
    summaryEn: `UCDP GED event: best estimate ${row.best} deaths${
      row.deaths_civilians != null ? ` (${row.deaths_civilians} civilian)` : ""
    }.`,
    actors: [row.side_a, row.side_b],
    sourceUrl: row.source_article,
    rawPayload: row,
  };
}

/** Import a parsed annual GED export → canonical Event v1 (public, attributed). */
export function importUcdpYear(
  rows: UcdpRawEvent[],
  orgId: string,
): CanonicalEventV1[] {
  const normalised = rows.map(normaliseUcdpEvent);
  return toCanonicalEvents(normalised, { orgId, isPublic: true, keepRawPayload: false });
}

/** DEMO fixture — synthetic UCDP-GED-shaped rows. */
export const DEMO_UCDP_EVENTS: UcdpRawEvent[] = [
  {
    id: 900001,
    conflict_new_id: 333,
    type_of_violence: 1,
    side_a: "Government of Ukraine",
    side_b: "Government of Russia",
    date_start: "2023-05-12",
    date_end: "2023-05-12",
    year: 2023,
    country: "Ukraine",
    region: "Europe",
    adm_1: "Donetsk",
    latitude: 48.14,
    longitude: 37.74,
    where_prec: 1,
    best: 14,
    low: 9,
    high: 20,
    deaths_civilians: 0,
    source_article: "https://example-archive.test/ucdp-source-1",
  },
  {
    id: 900002,
    conflict_new_id: 333,
    type_of_violence: 3,
    side_a: "Government of Russia",
    side_b: "Civilians",
    date_start: "2023-07-08",
    year: 2023,
    country: "Ukraine",
    region: "Europe",
    adm_1: "Kharkiv",
    latitude: 49.99,
    longitude: 36.23,
    where_prec: 2,
    best: 6,
    low: 4,
    high: 9,
    deaths_civilians: 6,
    source_article: "https://example-archive.test/ucdp-source-2",
  },
  {
    id: 900003,
    conflict_new_id: 410,
    type_of_violence: 1,
    side_a: "Government of Syria",
    side_b: "Syrian insurgents",
    date_start: "2016-09-01",
    year: 2016,
    country: "Syria",
    region: "Middle East",
    adm_1: "Aleppo",
    latitude: 36.2,
    longitude: 37.16,
    where_prec: 3,
    best: 32,
    low: 20,
    high: 50,
    deaths_civilians: 12,
    source_article: "https://example-archive.test/ucdp-source-3",
  },
];
