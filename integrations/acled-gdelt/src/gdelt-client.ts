/**
 * GDELT client — BigQuery public-dataset access. (TODO task 5)
 *
 * GDELT 2.0 is mirrored as a Google BigQuery public dataset:
 *   `gdelt-bq.gdeltv2.events`   (also `eventmentions`, `gkg`).
 * It is queryable by anyone with a Google Cloud project (the data is free; you
 * pay only for bytes scanned). GDELT is openly licensed (CC-BY-style) and its
 * SOURCEURL evidence links may be republished with attribution.
 *
 * This client is a typed *query builder* + executor abstraction. We do NOT bundle
 * the BigQuery SDK (kept dependency-free, matching sibling integrations); instead
 * `execute()` accepts an injected runner so the host app can wire @google-cloud/bigquery
 * (or any SQL runner) at the edge. Without a runner it serves the DEMO fixture.
 *
 * Auth/secrets: a real runner reads GOOGLE_APPLICATION_CREDENTIALS / project id
 * from process.env — never hardcoded here.
 */

import type { GdeltRawEvent } from "./types";

export const GDELT_EVENTS_TABLE = "gdelt-bq.gdeltv2.events";

export interface GdeltQuerySpec {
  /** FIPS country code for ActionGeo, e.g. "UP" (Ukraine), "SY" (Syria). */
  actionGeoCountry?: string;
  /** Inclusive SQLDATE lower bound (YYYYMMDD int). */
  sqlDateFrom?: number;
  sqlDateTo?: number;
  /** Restrict to these CAMEO root codes (e.g. ["19","18"]). */
  eventRootCodes?: string[];
  /** Restrict to these QuadClass values (3,4 = conflict). */
  quadClasses?: Array<1 | 2 | 3 | 4>;
  limit?: number;
}

/** A SQL runner the host injects (e.g. wrapping @google-cloud/bigquery). */
export type BigQueryRunner = (sql: string) => Promise<GdeltRawEvent[]>;

export interface GdeltClientConfig {
  runner?: BigQueryRunner;
  /** Defaults to demo when no runner is supplied. */
  demoMode?: boolean;
}

/**
 * Build a parameter-safe BigQuery SQL string. Only whitelisted, validated values
 * are interpolated (no free-text) so this is injection-safe for the documented
 * inputs. Selects the subset of the 61-column schema we map.
 */
export function buildGdeltQuery(spec: GdeltQuerySpec): string {
  const where: string[] = [];
  if (spec.actionGeoCountry && /^[A-Z]{2}$/.test(spec.actionGeoCountry)) {
    where.push(`ActionGeo_CountryCode = '${spec.actionGeoCountry}'`);
  }
  if (Number.isInteger(spec.sqlDateFrom)) where.push(`SQLDATE >= ${spec.sqlDateFrom}`);
  if (Number.isInteger(spec.sqlDateTo)) where.push(`SQLDATE <= ${spec.sqlDateTo}`);
  if (spec.eventRootCodes?.length) {
    const codes = spec.eventRootCodes.filter((c) => /^\d{1,2}$/.test(c));
    if (codes.length) where.push(`EventRootCode IN (${codes.map((c) => `'${c}'`).join(",")})`);
  }
  if (spec.quadClasses?.length) {
    const qc = spec.quadClasses.filter((q) => [1, 2, 3, 4].includes(q));
    if (qc.length) where.push(`QuadClass IN (${qc.join(",")})`);
  }
  const limit = Math.min(Math.max(spec.limit ?? 1000, 1), 100_000);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return [
    "SELECT GLOBALEVENTID, SQLDATE, Actor1Code, Actor1Name, Actor1CountryCode,",
    "       Actor2Code, Actor2Name, Actor2CountryCode, EventCode, EventRootCode,",
    "       QuadClass, GoldsteinScale, NumMentions, NumSources, NumArticles, AvgTone,",
    "       ActionGeo_CountryCode, ActionGeo_FullName, ActionGeo_Lat, ActionGeo_Long,",
    "       SOURCEURL, DATEADDED",
    `FROM \`${GDELT_EVENTS_TABLE}\``,
    whereClause,
    "ORDER BY SQLDATE DESC",
    `LIMIT ${limit}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export class GdeltClient {
  private readonly runner?: BigQueryRunner;
  private readonly demoMode: boolean;

  constructor(config: GdeltClientConfig = {}) {
    this.runner = config.runner;
    this.demoMode = config.demoMode ?? !config.runner;
  }

  get isDemo(): boolean {
    return this.demoMode;
  }

  /** Build + run a query. Demo mode filters the bundled fixture. */
  async query(spec: GdeltQuerySpec): Promise<GdeltRawEvent[]> {
    if (this.demoMode || !this.runner) {
      return filterFixture(DEMO_GDELT_EVENTS, spec);
    }
    return this.runner(buildGdeltQuery(spec));
  }
}

function filterFixture(rows: GdeltRawEvent[], spec: GdeltQuerySpec): GdeltRawEvent[] {
  return rows.filter((r) => {
    if (spec.actionGeoCountry && r.ActionGeo_CountryCode !== spec.actionGeoCountry) return false;
    if (Number.isInteger(spec.sqlDateFrom) && r.SQLDATE < spec.sqlDateFrom!) return false;
    if (Number.isInteger(spec.sqlDateTo) && r.SQLDATE > spec.sqlDateTo!) return false;
    if (spec.eventRootCodes?.length && !spec.eventRootCodes.includes(r.EventRootCode ?? "")) return false;
    if (spec.quadClasses?.length && !spec.quadClasses.includes(r.QuadClass)) return false;
    return true;
  });
}

/** DEMO fixture — synthetic GDELT-shaped rows (UP = Ukraine FIPS). */
export const DEMO_GDELT_EVENTS: GdeltRawEvent[] = [
  {
    GLOBALEVENTID: 1_400_000_001,
    SQLDATE: 20240321,
    Actor1Code: "RUSMIL",
    Actor1Name: "RUSSIA",
    Actor1CountryCode: "RUS",
    Actor2Code: "UKR",
    Actor2Name: "UKRAINE",
    Actor2CountryCode: "UKR",
    EventCode: "190",
    EventRootCode: "19",
    QuadClass: 4,
    GoldsteinScale: -10,
    NumMentions: 240,
    NumSources: 40,
    NumArticles: 210,
    AvgTone: -7.4,
    ActionGeo_CountryCode: "UP",
    ActionGeo_FullName: "Kharkiv, Ukraine",
    ActionGeo_Lat: 49.99,
    ActionGeo_Long: 36.23,
    SOURCEURL: "https://example-news.test/kharkiv-strike",
    DATEADDED: 20240321120000,
  },
  {
    GLOBALEVENTID: 1_400_000_002,
    SQLDATE: 20240322,
    Actor1Code: "UKRGOV",
    Actor1Name: "UKRAINE",
    Actor1CountryCode: "UKR",
    Actor2Code: "RUSMIL",
    Actor2Name: "RUSSIA",
    Actor2CountryCode: "RUS",
    EventCode: "193",
    EventRootCode: "19",
    QuadClass: 4,
    GoldsteinScale: -10,
    NumMentions: 120,
    NumSources: 22,
    NumArticles: 110,
    AvgTone: -6.1,
    ActionGeo_CountryCode: "UP",
    ActionGeo_FullName: "Donetsk, Ukraine",
    ActionGeo_Lat: 48.14,
    ActionGeo_Long: 37.74,
    SOURCEURL: "https://example-news.test/donetsk-clash",
    DATEADDED: 20240322090000,
  },
  {
    GLOBALEVENTID: 1_400_000_003,
    SQLDATE: 20240320,
    Actor1Code: "UKRGOV",
    Actor1Name: "UKRAINE",
    Actor1CountryCode: "UKR",
    Actor2Code: "RUS",
    Actor2Name: "RUSSIA",
    Actor2CountryCode: "RUS",
    EventCode: "036",
    EventRootCode: "03",
    QuadClass: 1,
    GoldsteinScale: 4,
    NumMentions: 60,
    NumSources: 18,
    NumArticles: 55,
    AvgTone: 1.2,
    ActionGeo_CountryCode: "UP",
    ActionGeo_FullName: "Kyiv, Ukraine",
    ActionGeo_Lat: 50.45,
    ActionGeo_Long: 30.52,
    SOURCEURL: "https://example-news.test/kyiv-diplomacy",
    DATEADDED: 20240320150000,
  },
];
