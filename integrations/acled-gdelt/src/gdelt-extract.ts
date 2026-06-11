/**
 * GDELT per-actor / per-event-type extraction. (TODO task 7)
 *
 * Maps GDELT's CAMEO event codes + QuadClass into our canonical `EventClass`,
 * and normalises CAMEO actor codes into readable actor descriptors. Produces a
 * `NormalisedDatasetEvent` for the shared canonical adapter.
 *
 * CAMEO reference: https://www.gdeltproject.org/data/documentation/CAMEO.Manual.1.1b3.pdf
 * GDELT openly licenses these data and SOURCEURL links may be republished with
 * attribution (see COMPLIANCE.md).
 */

import type { EventClass, GdeltRawEvent, NormalisedDatasetEvent } from "./types";

/** FIPS (GDELT ActionGeo) → ISO 3166-1 alpha-2 (subset we ingest). */
const FIPS_TO_ISO2: Record<string, string> = {
  UP: "UA", RS: "RU", SY: "SY", IS: "IL", GZ: "PS",
  SU: "SD", ET: "ET", BM: "MM", CG: "CD", SO: "SO",
  ML: "ML", NI: "NG", YM: "YE", AF: "AF", IZ: "IQ",
};

/**
 * CAMEO event-code → canonical EventClass.
 * Root codes: 18 = Assault, 19 = Fight, 20 = Mass violence; specific 3-digit
 * codes refine where useful.
 */
const CAMEO_EVENT_CLASS: Array<[RegExp, EventClass, string?]> = [
  [/^195$/, "airstrike", "cameo_195_air_strike"],          // employ aerial weapons
  [/^194$/, "explosion", "cameo_194_bomb"],                 // bomb / IED
  [/^19[0-3]$/, "ground_combat", "cameo_conventional_force"],
  [/^196$/, "ground_combat", "cameo_196_occupy"],
  [/^20[0-3]$/, "humanitarian", "cameo_mass_violence"],     // ethnic cleansing / mass killing
  [/^18[0-3]$/, "ground_combat", "cameo_assault"],
  [/^145$/, "protest", "cameo_145_riot"],
  [/^14[0-4]$/, "protest", "cameo_protest"],
  [/^17[0-5]$/, "humanitarian", "cameo_coerce"],
];

/** CAMEO actor descriptor (best-effort, human-readable). */
export interface GdeltActor {
  code?: string;
  name?: string;
  countryCode?: string;
  /** True when the actor code carries a MIL/REB/INS role suffix. */
  isMilitary: boolean;
}

export function parseActor(
  code?: string,
  name?: string,
  countryCode?: string,
): GdeltActor | undefined {
  if (!code && !name) return undefined;
  const isMilitary = !!code && /(MIL|REB|INS|SEP|UAF|GOVMIL)/.test(code);
  return { code, name, countryCode, isMilitary };
}

export function classifyGdelt(row: GdeltRawEvent): { eventClass: EventClass; subclass?: string } {
  for (const [re, cls, sub] of CAMEO_EVENT_CLASS) {
    if (re.test(row.EventCode)) return { eventClass: cls, subclass: sub };
  }
  // QuadClass 4 = material conflict; treat unmatched conflict as ground_combat.
  if (row.QuadClass === 4) return { eventClass: "ground_combat", subclass: "cameo_material_conflict" };
  return { eventClass: "other" };
}

/** GDELT events carry no fatality count; derive severity from intensity proxies. */
function severityFromIntensity(row: GdeltRawEvent): 1 | 2 | 3 | 4 | 5 {
  // Highly-mentioned, very-negative-Goldstein conflict ≈ severe.
  const goldstein = row.GoldsteinScale ?? 0;
  const mentions = row.NumMentions ?? 0;
  if (row.QuadClass === 4 && goldstein <= -9 && mentions >= 200) return 5;
  if (row.QuadClass === 4 && goldstein <= -8) return 4;
  if (row.QuadClass === 4) return 3;
  if (row.QuadClass === 3) return 2;
  return 1;
}

function sqlDateToIso(sqldate: number): string {
  const s = String(sqldate);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00Z`;
}

export function normaliseGdeltEvent(row: GdeltRawEvent): NormalisedDatasetEvent {
  const { eventClass, subclass } = classifyGdelt(row);
  const iso2 = (row.ActionGeo_CountryCode && FIPS_TO_ISO2[row.ActionGeo_CountryCode]) ?? "ZZ";
  const place = row.ActionGeo_FullName ?? iso2;
  const a1 = parseActor(row.Actor1Code, row.Actor1Name, row.Actor1CountryCode);
  const a2 = parseActor(row.Actor2Code, row.Actor2Name, row.Actor2CountryCode);

  // Confidence proxy from corroboration breadth (sources/articles).
  const sources = row.NumSources ?? 1;
  const confidence = Math.min(0.85, 0.4 + Math.log10(sources + 1) / 5);

  const actorEn = [a1?.name, a2?.name].filter(Boolean).join(" → ") || "Unknown actors";

  return {
    dataset: "gdelt",
    sourceEventId: `gdelt:${row.GLOBALEVENTID}`,
    occurredAt: sqlDateToIso(row.SQLDATE),
    country: iso2,
    regionName: row.ActionGeo_FullName,
    lat: row.ActionGeo_Lat,
    lon: row.ActionGeo_Long,
    uncertaintyM: 25_000, // GDELT geocoding is coarse (often city/admin level)
    eventClass,
    subclass,
    fatalities: undefined,
    severity: severityFromIntensity(row),
    confidence: parseFloat(confidence.toFixed(2)),
    titleEn: `${actorEn}: CAMEO ${row.EventCode} near ${place}`,
    titleUk: `${actorEn}: подія CAMEO ${row.EventCode} поблизу ${place}`,
    summaryEn: `GDELT event ${row.GLOBALEVENTID} — QuadClass ${row.QuadClass}, Goldstein ${row.GoldsteinScale ?? "n/a"}, tone ${row.AvgTone ?? "n/a"}.`,
    actors: [a1?.name, a2?.name].filter(Boolean) as string[],
    sourceUrl: row.SOURCEURL, // republishable evidence link (attribution required)
    rawPayload: row,
  };
}

/** Aggregate a per-actor breakdown (extraction summary for trend/datasets pages). */
export interface ActorTally {
  name: string;
  events: number;
  /** Mean Goldstein across this actor's events. */
  avgGoldstein: number;
}

export function tallyByActor(rows: GdeltRawEvent[]): ActorTally[] {
  const map = new Map<string, { events: number; gSum: number }>();
  for (const r of rows) {
    const name = r.Actor1Name ?? r.Actor1Code ?? "UNKNOWN";
    const cur = map.get(name) ?? { events: 0, gSum: 0 };
    cur.events += 1;
    cur.gSum += r.GoldsteinScale ?? 0;
    map.set(name, cur);
  }
  return Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      events: v.events,
      avgGoldstein: parseFloat((v.gSum / v.events).toFixed(2)),
    }))
    .sort((a, b) => b.events - a.events);
}
