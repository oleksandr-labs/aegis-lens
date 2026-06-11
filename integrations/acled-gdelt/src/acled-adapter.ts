/**
 * ACLED per-event mapping → canonical Aegis Event v1. (TODO task 3)
 *
 * Maps ACLED `event_type` / `sub_event_type` to our `EventClass`, derives
 * severity from fatalities, and produces en/uk titles. Raw rows are kept on the
 * canonical event's `rawPayload` for ingest only and are stripped before any
 * public exposure (license: ACLED raw rows are not republishable).
 */

import type { AcledRawEvent, EventClass, NormalisedDatasetEvent } from "./types";
import {
  toCanonicalEvent,
  severityFromFatalities,
  type CanonicalEventV1,
  type ToCanonicalOptions,
} from "./adapter";

/** ISO3 → ISO2 for the countries we ingest (extend as coverage grows). */
const ISO3_TO_ISO2: Record<string, string> = {
  UKR: "UA", RUS: "RU", SYR: "SY", PSE: "PS", ISR: "IL",
  SDN: "SD", ETH: "ET", MMR: "MM", COD: "CD", SOM: "SO",
  MLI: "ML", NGA: "NG", YEM: "YE", AFG: "AF", IRQ: "IQ",
};

/** ACLED sub_event_type → canonical EventClass (most specific first). */
const SUB_EVENT_CLASS: Array<[RegExp, EventClass, string?]> = [
  [/air\/drone strike/i, "airstrike", "air_drone_strike"],
  [/drone/i, "drone"],
  [/shelling|artillery|missile/i, "artillery", "shelling_artillery_missile"],
  [/remote explosive|landmine|ied/i, "explosion", "remote_explosive"],
  [/grenade|explosion/i, "explosion"],
  [/armed clash/i, "ground_combat", "armed_clash"],
  [/attack/i, "ground_combat"],
  [/protest|demonstration|riot/i, "protest"],
  [/abduction|sexual violence|attack on civilians/i, "humanitarian"],
];

/** ACLED event_type → fallback EventClass when sub-type is unmatched. */
const EVENT_TYPE_CLASS: Record<string, EventClass> = {
  "Battles": "ground_combat",
  "Explosions/Remote violence": "explosion",
  "Violence against civilians": "humanitarian",
  "Protests": "protest",
  "Riots": "protest",
  "Strategic developments": "other",
};

function classifyAcled(row: AcledRawEvent): { eventClass: EventClass; subclass?: string } {
  for (const [re, cls, sub] of SUB_EVENT_CLASS) {
    if (re.test(row.sub_event_type) || re.test(row.event_type)) {
      return { eventClass: cls, subclass: sub };
    }
  }
  return { eventClass: EVENT_TYPE_CLASS[row.event_type] ?? "other" };
}

/** Geo precision 1–3 → rough uncertainty radius (meters). */
function uncertaintyFromGeoPrecision(p?: 1 | 2 | 3): number | undefined {
  if (p === 1) return 1_000;
  if (p === 2) return 10_000;
  if (p === 3) return 50_000;
  return undefined;
}

export function normaliseAcledEvent(row: AcledRawEvent): NormalisedDatasetEvent {
  const { eventClass, subclass } = classifyAcled(row);
  const iso2 = (row.iso3 && ISO3_TO_ISO2[row.iso3]) ?? "ZZ";
  const place = row.location ?? row.admin1 ?? row.country;

  // ACLED is vetted but a single-source aggregation; geo_precision tempers it.
  const confidence = row.geo_precision === 1 ? 0.85 : row.geo_precision === 2 ? 0.7 : 0.55;

  return {
    dataset: "acled",
    sourceEventId: `acled:${row.event_id_cnty}`,
    occurredAt: `${row.event_date}T00:00:00Z`,
    country: iso2,
    regionName: row.admin1,
    lat: row.latitude,
    lon: row.longitude,
    uncertaintyM: uncertaintyFromGeoPrecision(row.geo_precision),
    eventClass,
    subclass,
    fatalities: row.fatalities,
    severity: severityFromFatalities(row.fatalities),
    confidence,
    titleEn: `${row.sub_event_type} in ${place} (${row.country})`,
    titleUk: `${row.sub_event_type} — ${place} (${row.country})`,
    summaryEn: row.notes,
    actors: [row.actor1, row.actor2].filter(Boolean) as string[],
    sourceUrl: undefined, // ACLED does not publish per-row evidence URLs
    rawPayload: row,
  };
}

/**
 * Map ACLED rows → canonical Event v1.
 *
 * IMPORTANT: defaults `isPublic` to FALSE. ACLED's licence forbids republishing
 * raw rows; callers may only flip this when emitting derived/aggregated context,
 * not the raw event itself. `keepRawPayload` defaults to false for the same reason.
 */
export function acledToCanonical(
  rows: AcledRawEvent[],
  opts: Pick<ToCanonicalOptions, "orgId"> & Partial<ToCanonicalOptions>,
): CanonicalEventV1[] {
  const full: ToCanonicalOptions = {
    orgId: opts.orgId,
    isPublic: opts.isPublic ?? false,
    keepRawPayload: opts.keepRawPayload ?? false,
  };
  return rows.map((r) => toCanonicalEvent(normaliseAcledEvent(r), full));
}
