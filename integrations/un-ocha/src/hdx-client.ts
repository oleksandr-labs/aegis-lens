/**
 * Client for the Humanitarian Data Exchange (HDX), https://data.humdata.org.
 *
 * HDX runs CKAN. The public Action API is read-only and needs no key for open
 * datasets; an API key (process.env.HDX_API_KEY) raises rate limits and unlocks
 * member-restricted datasets.
 *
 * Key endpoints (CKAN Action API, base /api/3/action):
 *   GET package_search?q=...&fq=...&rows=...   — search datasets
 *   GET package_show?id=<slug>                  — one dataset + resources
 *   GET organization_show?id=<org>              — org metadata
 *
 * ToS / crawler discipline: HDX asks for polite use. We send a descriptive
 * User-Agent, cap rows, and apply a minimum inter-request delay. We do NOT
 * bulk-mirror; we fetch metadata + resource URLs and let the ingest layer pull
 * individual resources on demand.
 *
 * License note: license is mapped from CKAN `license_id` → HumanitarianLicense.
 * The COMPLIANCE.md gates republication on that value. Never republish records
 * from a non-redistributable / closed-license dataset.
 */

import type { HdxDataset, HdxResource, HumanitarianLicense } from "./types";

const BASE_URL = "https://data.humdata.org/api/3/action";
const USER_AGENT = "AegisLens/1.0 (humanitarian-osint; +https://aegis-lens.example) ua-map-un-ocha";

export interface HdxClientConfig {
  apiKey?: string;          // process.env.HDX_API_KEY
  baseUrl?: string;
  timeoutMs?: number;
  /** Minimum ms between requests (polite rate limit). */
  minRequestIntervalMs?: number;
}

/** Map CKAN license_id → our HumanitarianLicense enum. */
export function mapHdxLicense(licenseId?: string): HumanitarianLicense {
  switch ((licenseId ?? "").toLowerCase()) {
    case "cc-by": return "cc-by";
    case "cc-by-igo": return "cc-by-igo";
    case "cc-by-sa": return "cc-by-sa";
    case "cc-by-nc":
    case "cc-by-nc-4.0": return "cc-by-nc";
    case "cc-by-nd": return "cc-by-nd";
    case "cc-zero":
    case "cc0-1.0": return "cc-zero";
    case "hdx-other": return "hdx-other";
    case "other-pd":
    case "public-domain": return "other-pd";
    case "":
    case "notspecified": return "unknown";
    default:
      return licenseId?.startsWith("other") ? "other-closed" : "unknown";
  }
}

/** Licenses we consider safe to REPUBLISH (with attribution). */
export const REDISTRIBUTABLE_LICENSES: ReadonlySet<HumanitarianLicense> = new Set([
  "cc-by", "cc-by-igo", "cc-by-sa", "cc-zero", "other-pd",
]);

export function isRedistributable(license: HumanitarianLicense): boolean {
  return REDISTRIBUTABLE_LICENSES.has(license);
}

// ── CKAN raw response shapes (subset) ─────────────────────────────────────────

interface CkanResource {
  id: string;
  name: string;
  format: string;
  url: string;
  description?: string;
  last_modified?: string;
  created?: string;
  size?: number;
}

interface CkanPackage {
  id: string;
  name: string;
  title: string;
  notes?: string;
  organization?: { title?: string; name?: string };
  dataset_source?: string;
  license_id?: string;
  groups?: Array<{ name: string }>;   // country iso codes
  tags?: Array<{ name: string }>;
  dataset_date?: string;
  last_modified?: string;
  metadata_modified?: string;
  has_quickcharts?: boolean;
  is_crisis_related?: boolean;
  resources?: CkanResource[];
}

interface CkanResult<T> {
  success: boolean;
  result: T;
}

function mapResource(r: CkanResource): HdxResource {
  return {
    id: r.id,
    name: r.name,
    format: (r.format || "").toUpperCase(),
    url: r.url,
    description: r.description,
    lastModified: r.last_modified ?? r.created,
    size: r.size,
  };
}

export function mapPackage(p: CkanPackage): HdxDataset {
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    notes: p.notes,
    organization: p.organization?.title ?? p.organization?.name ?? "unknown",
    source: p.dataset_source,
    license: mapHdxLicense(p.license_id),
    countries: (p.groups ?? []).map((g) => g.name.toUpperCase()),
    tags: (p.tags ?? []).map((t) => t.name),
    datasetDate: p.dataset_date,
    lastModified: p.last_modified ?? p.metadata_modified,
    resources: (p.resources ?? []).map(mapResource),
    hasQuickcharts: p.has_quickcharts,
    isCrisisRelated: p.is_crisis_related,
    pageUrl: `https://data.humdata.org/dataset/${p.name}`,
  };
}

export class HdxClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private lastRequestAt = 0;

  constructor(private readonly config: HdxClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 1_000;
  }

  /**
   * Search datasets. Returns mapped HdxDataset[] (metadata only — resources are
   * URLs, not downloaded). Falls back to the demo fixture on network failure so
   * the package is usable without connectivity/secrets.
   */
  async searchDatasets(opts: {
    query?: string;
    country?: string;        // ISO 3166-1 alpha-2
    organization?: string;
    tags?: string[];
    rows?: number;
  } = {}): Promise<HdxDataset[]> {
    const params = new URLSearchParams();
    params.set("q", opts.query ?? "*:*");
    const fq: string[] = [];
    if (opts.country) fq.push(`groups:${opts.country.toLowerCase()}`);
    if (opts.organization) fq.push(`organization:${opts.organization}`);
    for (const t of opts.tags ?? []) fq.push(`tags:"${t}"`);
    if (fq.length) params.set("fq", fq.join(" "));
    params.set("rows", String(Math.min(opts.rows ?? 25, 100)));

    try {
      const data = await this.fetch<CkanResult<{ results: CkanPackage[] }>>(
        `/package_search?${params.toString()}`,
      );
      if (!data.success) return DEMO_HDX_DATASETS;
      return data.result.results.map(mapPackage);
    } catch {
      return DEMO_HDX_DATASETS;
    }
  }

  /** Fetch a single dataset by CKAN slug. */
  async getDataset(slug: string): Promise<HdxDataset | null> {
    try {
      const data = await this.fetch<CkanResult<CkanPackage>>(
        `/package_show?id=${encodeURIComponent(slug)}`,
      );
      if (!data.success) return null;
      return mapPackage(data.result);
    } catch {
      return DEMO_HDX_DATASETS.find((d) => d.name === slug) ?? null;
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
    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    };
    if (this.config.apiKey) headers["Authorization"] = this.config.apiKey;

    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      if (!res.ok) throw new HdxApiError(res.status, await res.text());
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class HdxApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`HDX API error ${status}: ${body.slice(0, 200)}`);
    this.name = "HdxApiError";
  }
}

// ── Demo fixture (no secrets / no network) ────────────────────────────────────

export const DEMO_HDX_DATASETS: HdxDataset[] = [
  {
    id: "ds-ukraine-idp",
    name: "ukraine-idp-figures",
    title: "Ukraine: Internally Displaced Persons — IOM DTM figures",
    notes: "Aggregate IDP stock and flow figures by oblast. No individual-level data.",
    organization: "International Organization for Migration (IOM)",
    source: "IOM DTM Ukraine",
    license: "cc-by-igo",
    countries: ["UA"],
    tags: ["displacement", "idps", "dtm", "hxl"],
    datasetDate: "2026-01-01/2026-03-31",
    lastModified: "2026-04-04T09:00:00Z",
    resources: [
      {
        id: "res-idp-csv",
        name: "ukraine_idp_admin1.csv",
        format: "CSV",
        url: "https://data.humdata.org/dataset/ukraine-idp-figures/resource/idp.csv",
        lastModified: "2026-04-04T09:00:00Z",
      },
    ],
    isCrisisRelated: true,
    pageUrl: "https://data.humdata.org/dataset/ukraine-idp-figures",
  },
  {
    id: "ds-ukraine-hno",
    name: "ukraine-humanitarian-needs",
    title: "Ukraine: Humanitarian Needs Overview (HNO) — People in Need by cluster",
    notes: "People-in-need and targeted figures per humanitarian cluster and oblast.",
    organization: "OCHA Ukraine",
    source: "OCHA HNO 2026",
    license: "cc-by",
    countries: ["UA"],
    tags: ["humanitarian needs", "pin", "clusters", "hxl"],
    datasetDate: "2026-01-01",
    lastModified: "2026-02-15T12:00:00Z",
    resources: [
      {
        id: "res-hno-xlsx",
        name: "ukraine_hno_2026.xlsx",
        format: "XLSX",
        url: "https://data.humdata.org/dataset/ukraine-humanitarian-needs/resource/hno.xlsx",
        lastModified: "2026-02-15T12:00:00Z",
      },
    ],
    isCrisisRelated: true,
    pageUrl: "https://data.humdata.org/dataset/ukraine-humanitarian-needs",
  },
  {
    id: "ds-ukraine-aid-corridors",
    name: "ukraine-humanitarian-access",
    title: "Ukraine: Humanitarian Access & Aid Convoy Corridors",
    notes: "Approved inter-agency convoy routes and access constraints by route (aggregate).",
    organization: "OCHA Ukraine",
    source: "OCHA Access Unit",
    license: "cc-by",
    countries: ["UA"],
    tags: ["humanitarian access", "convoys", "corridors"],
    datasetDate: "2026-03-31",
    lastModified: "2026-04-01T08:30:00Z",
    resources: [
      {
        id: "res-corridors-geojson",
        name: "aid_corridors.geojson",
        format: "GEOJSON",
        url: "https://data.humdata.org/dataset/ukraine-humanitarian-access/resource/corridors.geojson",
        lastModified: "2026-04-01T08:30:00Z",
      },
    ],
    isCrisisRelated: true,
    pageUrl: "https://data.humdata.org/dataset/ukraine-humanitarian-access",
  },
];
