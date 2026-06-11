/**
 * Client for data.gov.ua — Ukraine's national open-data portal.
 *
 * data.gov.ua runs CKAN. The public Action API (base /api/3/action) is read-only
 * and needs no key for open datasets. We use it to discover datasets relevant to
 * entity enrichment: EDR (ЄДР/ЄДРПОУ company registry), address registers, and
 * infrastructure datasets — and to read their resource (download) URLs.
 *
 * Key endpoints (CKAN Action API):
 *   GET package_search?q=...&fq=...&rows=...   — search datasets
 *   GET package_show?id=<slug>                  — one dataset + resources
 *   GET organization_show?id=<org>              — org metadata
 *
 * ToS / crawler discipline: descriptive User-Agent, capped `rows`, minimum
 * inter-request delay. We fetch METADATA + resource URLs only — we do NOT bulk
 * mirror the (often very large) EDR dumps; the sync layer pulls individual
 * resources on demand.
 *
 * License: per-dataset `license_id` → OpenDataLicense (`mapLicense`). The portal
 * default is Ukraine's open-data reuse terms (CMU resolution 835), mapped here as
 * `ogl-ua` and treated as redistributable with attribution. Republication is
 * gated on `isRedistributable` — see COMPLIANCE.md.
 *
 * Usable WITHOUT network/secrets via the DEMO fixture fallback below.
 */

import type {
  DataGovDataset,
  DataGovResource,
  DataGovTopic,
  OpenDataLicense,
} from "./types";
import { mapLicense } from "./types";

const BASE_URL = "https://data.gov.ua/api/3/action";
const USER_AGENT =
  "AegisLens/1.0 (civic-tech-osint; +https://aegis-lens.example) ua-map-data-gov-ua";

export interface DataGovClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  /** Minimum ms between requests (polite rate limit). */
  minRequestIntervalMs?: number;
  /** Optional API key (raises rate limits); read from process.env by caller. */
  apiKey?: string;
}

// ── CKAN raw shapes (subset) ──────────────────────────────────────────────────

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
  license_id?: string;
  tags?: Array<{ name: string }>;
  metadata_modified?: string;
  resources?: CkanResource[];
}

interface CkanResult<T> {
  success: boolean;
  result: T;
}

// ── Topic classification (keyword heuristic on slug/title/tags) ───────────────

const TOPIC_KEYWORDS: Array<{ topic: DataGovTopic; rx: RegExp }> = [
  { topic: "edr", rx: /\b(edr|edrpou|єдр|єдрпоу|registr|реєстр\s*юридичн|company|компан)\b/i },
  { topic: "addresses", rx: /\b(address|адрес)\b/i },
  { topic: "infrastructure", rx: /\b(infrastructur|інфраструктур|road|дорог|energ|енерг|water|вод|transport|транспорт|utility)\b/i },
  { topic: "budget", rx: /\b(budget|бюджет|spend|видатк|tender|закупівл)\b/i },
  { topic: "transport", rx: /\b(transport|транспорт|railway|залізни|aviation|авіа)\b/i },
];

export function classifyTopic(p: { name: string; title: string; tags: string[] }): DataGovTopic {
  const hay = `${p.name} ${p.title} ${p.tags.join(" ")}`;
  for (const { topic, rx } of TOPIC_KEYWORDS) if (rx.test(hay)) return topic;
  return "other";
}

function mapResource(r: CkanResource): DataGovResource {
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

export function mapPackage(p: CkanPackage): DataGovDataset {
  const tags = (p.tags ?? []).map((t) => t.name);
  return {
    id: p.id,
    name: p.name,
    title: p.title,
    notes: p.notes,
    organization: p.organization?.title ?? p.organization?.name ?? "unknown",
    topic: classifyTopic({ name: p.name, title: p.title, tags }),
    license: mapLicense(p.license_id) === "unknown" ? "ogl-ua" : mapLicense(p.license_id),
    tags,
    lastModified: p.metadata_modified,
    resources: (p.resources ?? []).map(mapResource),
    pageUrl: `https://data.gov.ua/dataset/${p.name}`,
  };
}

export class DataGovApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`data.gov.ua API error ${status}: ${body.slice(0, 200)}`);
    this.name = "DataGovApiError";
  }
}

export class DataGovClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private lastRequestAt = 0;

  constructor(private readonly config: DataGovClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 1_000;
  }

  /**
   * Search datasets. Returns mapped DataGovDataset[] (metadata only — resources
   * are URLs, not downloaded). Falls back to the demo fixture on network failure.
   */
  async searchDatasets(opts: {
    query?: string;
    organization?: string;
    tags?: string[];
    rows?: number;
  } = {}): Promise<DataGovDataset[]> {
    const params = new URLSearchParams();
    params.set("q", opts.query ?? "*:*");
    const fq: string[] = [];
    if (opts.organization) fq.push(`organization:${opts.organization}`);
    for (const t of opts.tags ?? []) fq.push(`tags:"${t}"`);
    if (fq.length) params.set("fq", fq.join(" "));
    params.set("rows", String(Math.min(opts.rows ?? 25, 100)));

    try {
      const data = await this.fetch<CkanResult<{ results: CkanPackage[] }>>(
        `/package_search?${params.toString()}`,
      );
      if (!data.success) return DEMO_DATASETS;
      return data.result.results.map(mapPackage);
    } catch {
      return DEMO_DATASETS;
    }
  }

  /** Fetch a single dataset by CKAN slug. */
  async getDataset(slug: string): Promise<DataGovDataset | null> {
    try {
      const data = await this.fetch<CkanResult<CkanPackage>>(
        `/package_show?id=${encodeURIComponent(slug)}`,
      );
      if (!data.success) return null;
      return mapPackage(data.result);
    } catch {
      return DEMO_DATASETS.find((d) => d.name === slug) ?? null;
    }
  }

  /** Convenience: only datasets matching a topic of interest. */
  async datasetsByTopic(topic: DataGovTopic, rows = 25): Promise<DataGovDataset[]> {
    const all = await this.searchDatasets({ rows });
    return all.filter((d) => d.topic === topic);
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
      if (!res.ok) throw new DataGovApiError(res.status, await res.text());
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

// ── Demo fixture (no secrets / no network) ────────────────────────────────────

const OGL: OpenDataLicense = "ogl-ua";

export const DEMO_DATASETS: DataGovDataset[] = [
  {
    id: "ds-edr",
    name: "edr-uo",
    title: "Єдиний державний реєстр юридичних осіб, ФОП та громадських формувань (ЄДР)",
    notes:
      "Unified State Register of legal entities, sole proprietors and civic formations. Core EDRPOU registry dump (open dataset).",
    organization: "Ministry of Justice of Ukraine",
    topic: "edr",
    license: OGL,
    tags: ["edr", "edrpou", "реєстр", "юридичні особи", "company"],
    datasetDate: "2026-05-01",
    lastModified: "2026-05-01T06:00:00Z",
    resources: [
      {
        id: "res-edr-xml",
        name: "EDR_UO_full.xml",
        format: "XML",
        url: "https://data.gov.ua/dataset/edr-uo/resource/edr-full.xml",
        lastModified: "2026-05-01T06:00:00Z",
      },
    ],
    pageUrl: "https://data.gov.ua/dataset/edr-uo",
  },
  {
    id: "ds-addresses",
    name: "address-registry",
    title: "Державний реєстр адрес (адресний реєстр)",
    notes: "State Address Register — address objects with codes.",
    organization: "Ministry for Communities and Territories Development",
    topic: "addresses",
    license: OGL,
    tags: ["address", "адреси", "реєстр"],
    datasetDate: "2026-04-15",
    lastModified: "2026-04-15T09:00:00Z",
    resources: [
      {
        id: "res-addr-csv",
        name: "addresses.csv",
        format: "CSV",
        url: "https://data.gov.ua/dataset/address-registry/resource/addresses.csv",
        lastModified: "2026-04-15T09:00:00Z",
      },
    ],
    pageUrl: "https://data.gov.ua/dataset/address-registry",
  },
  {
    id: "ds-critical-infra",
    name: "critical-infrastructure-objects",
    title: "Перелік об'єктів критичної інфраструктури (агреговано)",
    notes:
      "Aggregated catalog of critical-infrastructure objects (categories, oblast-level). No precise coordinates of protected sites.",
    organization: "Cabinet of Ministers of Ukraine",
    topic: "infrastructure",
    license: OGL,
    tags: ["infrastructure", "інфраструктура", "energy", "transport"],
    datasetDate: "2026-03-20",
    lastModified: "2026-03-20T12:00:00Z",
    resources: [
      {
        id: "res-infra-json",
        name: "critical_infra.json",
        format: "JSON",
        url: "https://data.gov.ua/dataset/critical-infrastructure-objects/resource/infra.json",
        lastModified: "2026-03-20T12:00:00Z",
      },
    ],
    pageUrl: "https://data.gov.ua/dataset/critical-infrastructure-objects",
  },
];
