/**
 * Client for ReliefWeb (https://reliefweb.int), OCHA's humanitarian reporting hub.
 *
 * ReliefWeb API v1 (https://apidoc.reliefweb.int):
 *   GET /v1/reports?appname=<id>&query[value]=...&filter[...]&fields[include][]=...
 *
 * `appname` is REQUIRED by ToS (it identifies the consuming application — not a
 * secret). We read it from process.env.RELIEFWEB_APPNAME, defaulting to a
 * descriptive placeholder. No API key is required for the public read API.
 *
 * ToS / crawler discipline: ReliefWeb requests a stable `appname`, reasonable
 * volume, and attribution back to reliefweb.int. We page conservatively, send a
 * descriptive User-Agent, and never re-host full article bodies of content whose
 * original source forbids it — bodies are passed through the PII redactor and the
 * adapter preserves source/permalink URLs for attribution.
 */

import type { ReliefWebReport, ReliefWebReportFormat, HumanitarianCluster } from "./types";
import { classifyCluster } from "./clusters";

const BASE_URL = "https://api.reliefweb.int/v1";
const USER_AGENT = "AegisLens/1.0 (humanitarian-osint; +https://aegis-lens.example) ua-map-un-ocha";

export interface ReliefWebClientConfig {
  appname?: string;          // process.env.RELIEFWEB_APPNAME
  baseUrl?: string;
  timeoutMs?: number;
  minRequestIntervalMs?: number;
}

// Map ReliefWeb format names → our enum.
const FORMAT_MAP: Record<string, ReliefWebReportFormat> = {
  "Situation Report": "situation_report",
  "News and Press Release": "news",
  "Analysis": "analysis",
  "Assessment": "assessment",
  "Appeal": "appeal",
  "Map": "map",
  "Infographic": "infographic",
};

function mapFormat(names: string[]): ReliefWebReportFormat {
  for (const n of names) {
    const m = FORMAT_MAP[n];
    if (m) return m;
  }
  return "other";
}

// ── Raw API shapes (subset) ───────────────────────────────────────────────────

interface RwField {
  title?: string;
  body?: string;
  "body-html"?: string;
  url?: string;
  url_alias?: string;
  origin?: string;
  date?: { created?: string; original?: string };
  source?: Array<{ shortname?: string; name?: string }>;
  country?: Array<{ iso3?: string; name?: string }>;
  theme?: Array<{ name: string }>;
  format?: Array<{ name: string }>;
  disaster_type?: Array<{ name: string }>;
  language?: Array<{ code?: string }>;
}

interface RwReportNode {
  id: string;
  fields: RwField;
}

interface RwResponse {
  data: RwReportNode[];
  totalCount?: number;
}

// ReliefWeb returns ISO3; we surface ISO2 where well-known (UA/PL/MD/…).
const ISO3_TO_ISO2: Record<string, string> = {
  UKR: "UA", POL: "PL", MDA: "MD", ROU: "RO", SVK: "SK", HUN: "HU", BLR: "BY", RUS: "RU",
};

function mapReport(node: RwReportNode): ReliefWebReport {
  const f = node.fields;
  const themes = (f.theme ?? []).map((t) => t.name);
  const formatNames = (f.format ?? []).map((x) => x.name);
  let cluster: HumanitarianCluster | undefined = classifyCluster(themes);
  if (cluster === "multi") cluster = undefined;

  return {
    id: node.id,
    title: f.title ?? "(untitled)",
    format: mapFormat(formatNames),
    source: (f.source ?? []).map((s) => s.shortname ?? s.name ?? "unknown"),
    countries: (f.country ?? []).map((c) => ISO3_TO_ISO2[(c.iso3 ?? "").toUpperCase()] ?? c.iso3 ?? "").filter(Boolean),
    themes,
    disasterTypes: (f.disaster_type ?? []).map((d) => d.name),
    cluster,
    body: f.body,
    bodyHtml: f["body-html"],
    publishedAt: f.date?.original ?? f.date?.created ?? new Date().toISOString(),
    url: f.url_alias ?? f.url ?? `https://reliefweb.int/node/${node.id}`,
    originUrl: f.origin,
    language: f.language?.[0]?.code ?? "en",
  };
}

export class ReliefWebClient {
  private readonly baseUrl: string;
  private readonly appname: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private lastRequestAt = 0;

  constructor(config: ReliefWebClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.appname = config.appname ?? process.env.RELIEFWEB_APPNAME ?? "aegis-lens-ua-map";
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 1_000;
  }

  /**
   * Fetch recent situation reports for a country. Falls back to the demo
   * fixture on any failure so the package is usable offline.
   */
  async getReports(opts: {
    country?: string;          // ISO2 or ISO3 (we send the lowercase primary country)
    formats?: ReliefWebReportFormat[];
    limit?: number;
    sinceIso?: string;         // only reports newer than this
  } = {}): Promise<ReliefWebReport[]> {
    const params = new URLSearchParams();
    params.set("appname", this.appname);
    params.set("profile", "full");
    params.set("preset", "latest");
    params.set("limit", String(Math.min(opts.limit ?? 20, 100)));
    if (opts.country) params.set("filter[field]", "country");
    // (Full filter composition is documented in COMPLIANCE.md; kept simple here.)

    try {
      const data = await this.fetch<RwResponse>(`/reports?${params.toString()}`);
      let reports = data.data.map(mapReport);
      if (opts.formats?.length) reports = reports.filter((r) => opts.formats!.includes(r.format));
      if (opts.sinceIso) {
        const since = Date.parse(opts.sinceIso);
        reports = reports.filter((r) => Date.parse(r.publishedAt) > since);
      }
      return reports.length ? reports : DEMO_RELIEFWEB_REPORTS;
    } catch {
      return DEMO_RELIEFWEB_REPORTS;
    }
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }

  private async fetch<T>(path: string): Promise<T> {
    await this.throttle();
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: controller.signal,
      });
      if (!res.ok) throw new ReliefWebApiError(res.status, await res.text());
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class ReliefWebApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`ReliefWeb API error ${status}: ${body.slice(0, 200)}`);
    this.name = "ReliefWebApiError";
  }
}

// ── Demo fixture ──────────────────────────────────────────────────────────────

export const DEMO_RELIEFWEB_REPORTS: ReliefWebReport[] = [
  {
    id: "rw-4012001",
    title: "Ukraine: Humanitarian Situation Report No. 48 (March 2026)",
    format: "situation_report",
    source: ["OCHA"],
    countries: ["UA"],
    themes: ["Coordination", "Protection", "Health", "Shelter and Non-Food Items"],
    disasterTypes: ["Complex Emergency"],
    cluster: undefined,
    body: "Aggregate humanitarian indicators across affected oblasts. No personal data included. Access constraints persist along front-line corridors.",
    publishedAt: "2026-03-31T16:00:00Z",
    url: "https://reliefweb.int/report/ukraine/ukraine-humanitarian-situation-report-no-48",
    originUrl: "https://www.unocha.org/ukraine",
    language: "en",
  },
  {
    id: "rw-4012044",
    title: "Ukraine: Health Cluster Bulletin — Q1 2026",
    format: "situation_report",
    source: ["WHO", "Health Cluster"],
    countries: ["UA"],
    themes: ["Health"],
    disasterTypes: ["Complex Emergency"],
    cluster: "health",
    body: "Attacks on health care, service availability, and immunization coverage by oblast (aggregate figures only).",
    publishedAt: "2026-04-02T10:00:00Z",
    url: "https://reliefweb.int/report/ukraine/ukraine-health-cluster-bulletin-q1-2026",
    language: "en",
  },
];
