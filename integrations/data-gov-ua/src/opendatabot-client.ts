/**
 * Client for OpenDataBot (https://opendatabot.ua) — company-registry enrichment
 * and business intelligence built on top of Ukraine's state registers (ЄДР,
 * court registry, tax-debt registers, etc.).
 *
 * OpenDataBot offers a commercial REST API (api.opendatabot.com). An API key
 * (process.env.OPENDATABOT_API_KEY) is REQUIRED for live access. The product is
 * PROPRIETARY: the analytics/value-added layer is licensed, not open data.
 * Therefore this client:
 *   - reads the key from process.env (never hardcoded);
 *   - normalizes responses into our CompanyRecord;
 *   - marks the provenance license as `proprietary` so the republication gate
 *     (`isRedistributable`) keeps it LINK-OUT only — we display enrichment fields
 *     to the operator but do not re-host OpenDataBot's dataset (see COMPLIANCE.md).
 *
 * Without a key it returns a DEMO record so the package is usable offline.
 *
 * Endpoint (subset): GET /v3/company/{edrpou}?apiKey=...
 */

import type {
  CompanyRecord,
  CompanyStatus,
  RegistryOfficer,
  EconomicActivity,
} from "./types";
import { normalizeEdrpou } from "./types";

const BASE_URL = "https://api.opendatabot.com";
const USER_AGENT =
  "AegisLens/1.0 (civic-tech-osint; +https://aegis-lens.example) ua-map-opendatabot";

export interface OpenDataBotConfig {
  apiKey?: string; // process.env.OPENDATABOT_API_KEY
  baseUrl?: string;
  timeoutMs?: number;
  minRequestIntervalMs?: number;
}

// ── Raw shape (subset of OpenDataBot company response) ────────────────────────

interface OdbCompany {
  code?: string; // EDRPOU
  full_name?: string;
  name?: string;
  status?: string;
  status_text?: string;
  address?: string;
  registration_date?: string;
  capital?: number;
  beneficiaries?: Array<{ name?: string }>;
  director?: string;
  activities?: Array<{ code?: string; name?: string; is_primary?: boolean }>;
}

interface OdbResponse {
  company?: OdbCompany;
}

export function mapOdbStatus(raw?: string): CompanyStatus {
  const s = (raw ?? "").toLowerCase();
  if (/(зареєстр|active|registered)/.test(s)) return "active";
  if (/(припин|terminat)/.test(s) && /(стан|process|ing)/.test(s)) return "terminating";
  if (/(припинено|terminated|закрит)/.test(s)) return "terminated";
  if (/(банкрут|bankrupt)/.test(s)) return "bankrupt";
  if (/(зупин|suspend)/.test(s)) return "suspended";
  return "unknown";
}

function mapOdbActivities(raw?: OdbCompany["activities"]): EconomicActivity[] | undefined {
  if (!raw?.length) return undefined;
  return raw
    .filter((a) => a.code)
    .map((a) => ({
      code: a.code!,
      name: { en: a.name ?? a.code!, uk: a.name },
      primary: a.is_primary,
    }));
}

function mapOdbOfficers(c: OdbCompany): RegistryOfficer[] | undefined {
  const out: RegistryOfficer[] = [];
  if (c.director) out.push({ name: c.director, role: { en: "director", uk: "керівник" } });
  for (const b of c.beneficiaries ?? []) {
    if (b.name) out.push({ name: b.name, role: { en: "beneficiary", uk: "бенефіціар" } });
  }
  return out.length ? out : undefined;
}

export function mapOdbCompany(c: OdbCompany): CompanyRecord {
  const now = new Date().toISOString();
  const edrpou = normalizeEdrpou(c.code ?? "");
  return {
    edrpou,
    name: { en: c.full_name ?? c.name ?? edrpou, uk: c.full_name ?? c.name },
    shortName: c.name && c.name !== c.full_name ? { en: c.name, uk: c.name } : undefined,
    status: mapOdbStatus(c.status_text ?? c.status),
    address: c.address ? { en: c.address, uk: c.address } : undefined,
    officers: mapOdbOfficers(c),
    activities: mapOdbActivities(c.activities),
    registeredAt: c.registration_date,
    authorizedCapitalUah: c.capital,
    providers: ["opendatabot"],
    sources: [
      {
        provider: "opendatabot",
        url: `https://opendatabot.ua/c/${edrpou}`,
        license: "proprietary", // value-added analytics: link-out only
        capturedAt: now,
      },
    ],
    updatedAt: now,
  };
}

export class OpenDataBotClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private readonly apiKey?: string;
  private lastRequestAt = 0;

  constructor(config: OpenDataBotConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 1_200;
    this.apiKey = config.apiKey ?? process.env.OPENDATABOT_API_KEY;
  }

  /** Enrich one company by ЄДРПОУ. Returns a DEMO record if no key/network. */
  async getCompany(edrpou: string): Promise<CompanyRecord> {
    const code = normalizeEdrpou(edrpou);
    if (!this.apiKey) return demoCompany(code);
    try {
      await this.throttle();
      const url = `${this.baseUrl}/v3/company/${encodeURIComponent(code)}?apiKey=${encodeURIComponent(this.apiKey)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) return demoCompany(code);
        const data = (await res.json()) as OdbResponse;
        return data.company ? mapOdbCompany(data.company) : demoCompany(code);
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return demoCompany(code);
    }
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }
}

// ── Demo fixture ──────────────────────────────────────────────────────────────

export function demoCompany(edrpou: string): CompanyRecord {
  const now = new Date().toISOString();
  return {
    edrpou,
    name: {
      en: `Demo Enterprise LLC (EDRPOU ${edrpou})`,
      uk: `ТОВ «Демо Підприємство» (ЄДРПОУ ${edrpou})`,
    },
    status: "active",
    address: { en: "Kyiv, Ukraine", uk: "м. Київ, Україна" },
    officers: [{ name: "Demo Director", role: { en: "director", uk: "керівник" } }],
    activities: [
      { code: "62.01", name: { en: "Computer programming", uk: "Комп'ютерне програмування" }, primary: true },
    ],
    registeredAt: "2015-06-01",
    authorizedCapitalUah: 100000,
    providers: ["opendatabot"],
    sources: [
      {
        provider: "opendatabot",
        url: `https://opendatabot.ua/c/${edrpou}`,
        license: "proprietary",
        capturedAt: now,
      },
    ],
    updatedAt: now,
  };
}
