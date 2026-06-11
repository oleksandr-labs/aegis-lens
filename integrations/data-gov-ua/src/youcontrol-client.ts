/**
 * Client for YouControl (https://youcontrol.com.ua) — entity verification /
 * due-diligence analytics on Ukrainian legal entities.
 *
 * YouControl is a COMMERCIAL due-diligence platform with a contract-gated API
 * (YouControl API / YouScore). An API key (process.env.YOUCONTROL_API_KEY) is
 * required for live access and the data is PROPRIETARY analytics. This client
 * therefore:
 *   - reads the key from process.env (never hardcoded);
 *   - normalizes the verification signal into CompanyRecord fields
 *     (status, risk flag, registered address/officers);
 *   - marks provenance license `proprietary` → link-out only (republication gate).
 *
 * Its distinct value vs. OpenDataBot is the RISK / VERIFICATION signal
 * (`flaggedRisk`), used to corroborate or dispute an entity. We surface the flag
 * and a link to the YouControl profile; we do not re-host YouControl's analytics.
 *
 * Without a key it returns a DEMO verification so the package is usable offline.
 *
 * Endpoint (subset): GET /api/v1/companies/{edrpou}  (Authorization: Bearer key)
 */

import type { CompanyRecord, CompanyStatus, RegistryOfficer } from "./types";
import { normalizeEdrpou } from "./types";

const BASE_URL = "https://api.youcontrol.com.ua";
const USER_AGENT =
  "AegisLens/1.0 (civic-tech-osint; +https://aegis-lens.example) ua-map-youcontrol";

export interface YouControlConfig {
  apiKey?: string; // process.env.YOUCONTROL_API_KEY
  baseUrl?: string;
  timeoutMs?: number;
  minRequestIntervalMs?: number;
}

/** Verification verdict — corroboration signal for an entity. */
export interface YouControlVerification {
  edrpou: string;
  status: CompanyStatus;
  /** True if YouControl flags risk markers (sanctions, court debts, fictitious). */
  flaggedRisk: boolean;
  /** Short list of risk-marker labels (localized). */
  riskMarkers: Array<{ en: string; uk?: string }>;
  profileUrl: string;
}

interface YcCompany {
  edrpou?: string;
  name?: string;
  state?: string;
  address?: string;
  head?: string;
  risk_factors?: Array<{ type?: string; description?: string }>;
}

interface YcResponse {
  data?: YcCompany;
}

function mapYcStatus(raw?: string): CompanyStatus {
  const s = (raw ?? "").toLowerCase();
  if (/(зареєстр|active|registered)/.test(s)) return "active";
  if (/(припин|terminat)/.test(s)) return /(стан|ing|process)/.test(s) ? "terminating" : "terminated";
  if (/(банкрут|bankrupt)/.test(s)) return "bankrupt";
  return "unknown";
}

export function mapYcVerification(c: YcCompany): YouControlVerification {
  const edrpou = normalizeEdrpou(c.edrpou ?? "");
  const markers = (c.risk_factors ?? []).map((r) => ({
    en: r.description ?? r.type ?? "risk marker",
    uk: r.description,
  }));
  return {
    edrpou,
    status: mapYcStatus(c.state),
    flaggedRisk: markers.length > 0,
    riskMarkers: markers,
    profileUrl: `https://youcontrol.com.ua/catalog/company_details/${edrpou}/`,
  };
}

/** Merge a verification verdict into a CompanyRecord (additive corroboration). */
export function applyVerification(
  record: CompanyRecord,
  v: YouControlVerification,
): CompanyRecord {
  const now = new Date().toISOString();
  const officers: RegistryOfficer[] | undefined = record.officers;
  return {
    ...record,
    // YouControl's status wins only when the base record had none.
    status: record.status === "unknown" ? v.status : record.status,
    flaggedRisk: record.flaggedRisk || v.flaggedRisk,
    officers,
    providers: record.providers.includes("youcontrol")
      ? record.providers
      : [...record.providers, "youcontrol"],
    sources: [
      ...record.sources,
      { provider: "youcontrol", url: v.profileUrl, license: "proprietary", capturedAt: now },
    ],
    updatedAt: now,
  };
}

export class YouControlClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly minInterval: number;
  private readonly apiKey?: string;
  private lastRequestAt = 0;

  constructor(config: YouControlConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 15_000;
    this.minInterval = config.minRequestIntervalMs ?? 1_500;
    this.apiKey = config.apiKey ?? process.env.YOUCONTROL_API_KEY;
  }

  /** Verify one entity by ЄДРПОУ. Returns a DEMO verdict if no key/network. */
  async verify(edrpou: string): Promise<YouControlVerification> {
    const code = normalizeEdrpou(edrpou);
    if (!this.apiKey) return demoVerification(code);
    try {
      await this.throttle();
      const url = `${this.baseUrl}/api/v1/companies/${encodeURIComponent(code)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) return demoVerification(code);
        const data = (await res.json()) as YcResponse;
        return data.data ? mapYcVerification(data.data) : demoVerification(code);
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return demoVerification(code);
    }
  }

  private async throttle(): Promise<void> {
    const wait = this.lastRequestAt + this.minInterval - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }
}

export function demoVerification(edrpou: string): YouControlVerification {
  return {
    edrpou,
    status: "active",
    flaggedRisk: false,
    riskMarkers: [],
    profileUrl: `https://youcontrol.com.ua/catalog/company_details/${edrpou}/`,
  };
}
