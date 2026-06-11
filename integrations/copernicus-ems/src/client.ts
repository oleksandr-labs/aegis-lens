/**
 * Task 1 — Client for Copernicus EMS Rapid Mapping activations (RSS + downloads).
 *
 * EMS publishes an activation feed (the "Rapid Mapping activations" list and an
 * RSS feed) at https://emergency.copernicus.eu. Each activation (EMSR…) links to
 * per-AOI product downloads (vector / raster / PDF map sheets).
 *
 * Access: the activation list & product downloads are PUBLIC and free (Copernicus
 * open data, public-domain — see COMPLIANCE.md). No API key is required. EMS asks
 * consumers to be polite (descriptive User-Agent, modest cadence) and to keep the
 * mandatory Copernicus attribution. We provide a small DEMO fixture + fallback so
 * the package is usable offline / without network.
 */

import type {
  EmsActivation,
  EmsFeedItem,
  EmsHazardType,
  EmsService,
} from "./types";

const ACTIVATIONS_RSS =
  "https://emergency.copernicus.eu/mapping/activations-rapid/feed";
const ACTIVATIONS_PAGE =
  "https://emergency.copernicus.eu/mapping/list-of-activations-rapid";
const USER_AGENT =
  "AegisLens/1.0 (crisis-mapping-osint; +https://aegis-lens.example) ua-map-copernicus-ems";

export interface CopernicusEmsClientConfig {
  rssUrl?: string;
  timeoutMs?: number;
  minRequestIntervalMs?: number;
}

/** Map EMS hazard keywords (in feed titles) → our hazard enum. */
const HAZARD_KEYWORDS: Array<[RegExp, EmsHazardType]> = [
  [/flood|inundation|deluge|повін/i, "flood"],
  [/wildfire|forest fire|\bfire\b|пожеж/i, "fire"],
  [/earthquake|seismic|землетрус/i, "earthquake"],
  [/storm|cyclone|hurricane|typhoon|шторм/i, "storm"],
  [/landslide|зсув/i, "landslide"],
  [/volcan|вулкан/i, "volcanic"],
  [/industrial|explosion|technological|аварі/i, "industrial"],
  [/conflict|war|humanitarian|damage assessment|destruction|воєн|руйнув/i, "conflict"],
];

export function classifyHazard(text: string): EmsHazardType {
  for (const [re, hz] of HAZARD_KEYWORDS) if (re.test(text)) return hz;
  return "other";
}

/** Infer the EMS service line from an activation code. */
export function serviceFromCode(code: string): EmsService {
  if (/^EMSR/i.test(code)) return "rapid_mapping";
  if (/^EMSN/i.test(code)) return "risk_recovery";
  return "validation";
}

// Country names → ISO-2 (subset relevant to UA + neighbours).
const COUNTRY_TO_ISO2: Record<string, string> = {
  ukraine: "UA",
  poland: "PL",
  moldova: "MD",
  romania: "RO",
  slovakia: "SK",
  hungary: "HU",
  belarus: "BY",
};

function extractCountries(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const [name, iso] of Object.entries(COUNTRY_TO_ISO2)) {
    if (lower.includes(name)) found.add(iso);
  }
  return [...found];
}

/** Very small, dependency-free RSS <item> extractor. */
function parseRssItems(xml: string): EmsFeedItem[] {
  const items: EmsFeedItem[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  const pick = (block: string, tag: string): string => {
    const m = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
    if (!m) return "";
    return m[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, "")
      .trim();
  };
  const blocks = xml.match(itemRe) ?? [];
  for (const block of blocks) {
    const title = pick(block, "title");
    const link = pick(block, "link");
    const pub = pick(block, "pubDate");
    const codeMatch = title.match(/\b(EMS[RN]\d{2,4})\b/i);
    const code = (codeMatch?.[1] ?? "").toUpperCase();
    if (!code) continue;
    items.push({
      code,
      title,
      link: link || `${ACTIVATIONS_PAGE}#${code}`,
      publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      hazard: classifyHazard(title),
      countries: extractCountries(title),
    });
  }
  return items;
}

export class CopernicusEmsApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`Copernicus EMS error ${status}: ${body.slice(0, 200)}`);
    this.name = "CopernicusEmsApiError";
  }
}

export class CopernicusEmsClient {
  private readonly rssUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private lastRequestAt = 0;

  constructor(config: CopernicusEmsClientConfig = {}) {
    this.rssUrl = config.rssUrl ?? ACTIVATIONS_RSS;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 2_000;
  }

  /**
   * Fetch the Rapid Mapping activation RSS feed. Falls back to the demo fixture
   * on any failure so the package is usable offline.
   */
  async getActivationFeed(opts: {
    hazards?: EmsHazardType[];
    country?: string; // ISO-2 filter
    sinceIso?: string;
  } = {}): Promise<EmsFeedItem[]> {
    let items: EmsFeedItem[];
    try {
      const xml = await this.fetchText(this.rssUrl);
      items = parseRssItems(xml);
      if (!items.length) items = DEMO_FEED_ITEMS;
    } catch {
      items = DEMO_FEED_ITEMS;
    }
    if (opts.hazards?.length) items = items.filter((i) => opts.hazards!.includes(i.hazard));
    if (opts.country) items = items.filter((i) => i.countries.includes(opts.country!));
    if (opts.sinceIso) {
      const since = Date.parse(opts.sinceIso);
      items = items.filter((i) => Date.parse(i.publishedAt) > since);
    }
    return items;
  }

  /**
   * Resolve the activation list as structured {@link EmsActivation} records.
   * (Demo-backed: the full HTML activation list parse is documented in
   * COMPLIANCE.md; here we promote feed items + the demo activations.)
   */
  async listActivations(opts: {
    service?: EmsService;
    country?: string;
    hazards?: EmsHazardType[];
  } = {}): Promise<EmsActivation[]> {
    const feed = await this.getActivationFeed({ country: opts.country, hazards: opts.hazards });
    const byCode = new Map<string, EmsActivation>();
    for (const a of DEMO_ACTIVATIONS) byCode.set(a.code, a);
    for (const f of feed) {
      if (byCode.has(f.code)) continue;
      byCode.set(f.code, {
        code: f.code,
        service: serviceFromCode(f.code),
        title: f.title,
        hazard: f.hazard,
        status: "ongoing",
        countries: f.countries,
        activatedAt: f.publishedAt,
        url: f.link,
      });
    }
    let out = [...byCode.values()];
    if (opts.service) out = out.filter((a) => a.service === opts.service);
    if (opts.country) out = out.filter((a) => a.countries.includes(opts.country!));
    if (opts.hazards?.length) out = out.filter((a) => opts.hazards!.includes(a.hazard));
    return out.sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt));
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }

  private async fetchText(url: string): Promise<string> {
    await this.throttle();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/rss+xml, application/xml, text/xml" },
        signal: controller.signal,
      });
      if (!res.ok) throw new CopernicusEmsApiError(res.status, await res.text());
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  }
}

// ── Demo fixtures (public-domain Copernicus EMS — illustrative) ──────────────────

export const DEMO_FEED_ITEMS: EmsFeedItem[] = [
  {
    code: "EMSR700",
    title: "EMSR700: Conflict damage assessment in eastern Ukraine",
    link: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700",
    publishedAt: "2026-05-28T08:00:00Z",
    hazard: "conflict",
    countries: ["UA"],
  },
  {
    code: "EMSR698",
    title: "EMSR698: Flooding along the Dnipro river, Ukraine",
    link: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698",
    publishedAt: "2026-05-20T06:30:00Z",
    hazard: "flood",
    countries: ["UA"],
  },
  {
    code: "EMSR695",
    title: "EMSR695: Wildfires in southern Ukraine",
    link: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR695",
    publishedAt: "2026-05-12T11:15:00Z",
    hazard: "fire",
    countries: ["UA"],
  },
];

export const DEMO_ACTIVATIONS: EmsActivation[] = [
  {
    code: "EMSR700",
    service: "rapid_mapping",
    title: "Conflict damage assessment in eastern Ukraine",
    hazard: "conflict",
    status: "ongoing",
    countries: ["UA"],
    activatedAt: "2026-05-28T08:00:00Z",
    centroid: [37.8, 48.02],
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700",
    productCount: 6,
  },
  {
    code: "EMSR698",
    service: "rapid_mapping",
    title: "Flooding along the Dnipro river, Ukraine",
    hazard: "flood",
    status: "ongoing",
    countries: ["UA"],
    activatedAt: "2026-05-20T06:30:00Z",
    centroid: [35.04, 48.46],
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698",
    productCount: 4,
  },
  {
    code: "EMSR695",
    service: "rapid_mapping",
    title: "Wildfires in southern Ukraine",
    hazard: "fire",
    status: "completed",
    countries: ["UA"],
    activatedAt: "2026-05-12T11:15:00Z",
    centroid: [35.14, 47.0],
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR695",
    productCount: 3,
  },
];
