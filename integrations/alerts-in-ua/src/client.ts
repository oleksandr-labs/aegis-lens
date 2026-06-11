/**
 * Primary client for the alerts.in.ua API (task 1).
 *
 * Docs   : https://api.alerts.in.ua/  (v1)
 * Auth   : Bearer token (`?token=` or `Authorization: Bearer`) — from
 *          `process.env.ALERTS_IN_UA_TOKEN`. NEVER hardcode the token.
 * Tiers  : free (oblast-level, ~15s polite cadence) /
 *          commercial (raion+hromada, faster cadence) / enterprise (websocket).
 *
 * Key endpoints:
 *   GET /v1/alerts/active.json              — all currently active alerts
 *   GET /v1/iot/active_air_raid_alerts_by_oblast.json — compact per-oblast string
 *   GET /v1/regions/{uid}/alerts/active.json
 *
 * ToS-respecting behaviour:
 *   - polite minimum poll interval per tier (see TIER_CONFIG.minPollMs);
 *   - explicit User-Agent identifying this client;
 *   - never fans out below the tier's allowed granularity;
 *   - ships a DEMO fixture so the package is usable with no token.
 */

import type {
  AlertRecord,
  AlertsSnapshot,
  AlertsInUaTier,
  AlertLocation,
  OblastCode,
} from "./types";
import { OBLASTS } from "./types";

const BASE_URL = "https://api.alerts.in.ua/v1";
const USER_AGENT = "AegisLens/1.0 (+https://aegis-lens.app; alerts.in.ua integration)";

/** Per-tier operating envelope. Encodes the ToS-polite cadence + granularity. */
export interface TierConfig {
  tier: AlertsInUaTier;
  /** Minimum allowed delay between polls (ms). */
  minPollMs: number;
  /** Deepest admin level this tier may request. */
  maxGranularity: "oblast" | "raion" | "hromada";
  /** Whether websocket streaming is offered. */
  websocket: boolean;
}

export const TIER_CONFIG: Record<AlertsInUaTier, TierConfig> = {
  free:       { tier: "free",       minPollMs: 15_000, maxGranularity: "oblast",  websocket: false },
  commercial: { tier: "commercial", minPollMs: 3_000,  maxGranularity: "hromada", websocket: false },
  enterprise: { tier: "enterprise", minPollMs: 1_000,  maxGranularity: "hromada", websocket: true  },
};

/** alerts.in.ua raw alert object (subset of fields we consume). */
export interface AlertsInUaRawAlert {
  id: number | string;
  location_uid: string;
  location_title: string;
  location_type: string; // "oblast" | "raion" | "hromada" | "city"
  location_oblast?: string;
  location_oblast_uid?: string;
  alert_type: string;    // "air_raid" | "artillery" | "urban_fights" | "chemical" | "nuclear" | "info"
  started_at: string;
  finished_at?: string | null;
  updated_at?: string;
}

export interface AlertsInUaActiveResponse {
  alerts: AlertsInUaRawAlert[];
  meta?: { last_updated_at?: string; type?: string };
}

export interface AlertsInUaClientConfig {
  /** Bearer token. If omitted, the client serves the DEMO fixture only. */
  token?: string;
  tier?: AlertsInUaTier;
  baseUrl?: string;
  timeoutMs?: number;
}

// alerts.in.ua alert_type → shared AlertType
const TYPE_MAP: Record<string, AlertRecord["type"]> = {
  air_raid: "air_raid",
  artillery_shelling: "artillery",
  artillery: "artillery",
  urban_fights: "urban_fighting",
  street_fights: "urban_fighting",
  chemical: "chemical",
  nuclear: "nuclear",
  radiological: "radiological",
  info: "info",
};

// alerts.in.ua oblast title (uk) → ISO oblast code, so we can attach to OBLASTS.
const OBLAST_TITLE_TO_CODE: Record<string, OblastCode> = (() => {
  const m: Record<string, OblastCode> = {};
  for (const info of Object.values(OBLASTS)) {
    m[info.nameUk] = info.code;
  }
  // common alerts.in.ua spellings
  m["м. Київ"] = "UA-30";
  m["Київ"] = "UA-30";
  return m;
})();

/** Resolve an oblast code from a raw alert's oblast title / uid. */
function resolveOblast(raw: AlertsInUaRawAlert): OblastCode | null {
  const title = raw.location_oblast ?? (raw.location_type === "oblast" ? raw.location_title : undefined);
  if (title && OBLAST_TITLE_TO_CODE[title]) return OBLAST_TITLE_TO_CODE[title];
  // strip a trailing "область"
  if (title) {
    const stem = title.replace(/\s*область$/u, "").trim();
    for (const info of Object.values(OBLASTS)) {
      if (info.nameUk.startsWith(stem) || stem.startsWith(info.nameUk.replace(/а$/u, ""))) {
        return info.code;
      }
    }
  }
  return null;
}

function toLocation(raw: AlertsInUaRawAlert, oblastCode: OblastCode): AlertLocation {
  const kind = (["oblast", "raion", "hromada", "city"].includes(raw.location_type)
    ? raw.location_type
    : "oblast") as AlertLocation["kind"];
  return {
    locationUid: raw.location_uid,
    kind,
    oblastCode,
    raionCode: kind === "raion" || kind === "hromada" ? raw.location_uid : undefined,
    hromadaCode: kind === "hromada" ? raw.location_uid : undefined,
    nameUk: raw.location_title,
    center: kind === "oblast" ? OBLASTS[oblastCode]?.center : undefined,
  };
}

// ── DEMO fixture (usable with no token) ────────────────────────────────────────

export const DEMO_RAW_ALERTS: AlertsInUaRawAlert[] = [
  {
    id: "demo-1",
    location_uid: "31",
    location_title: "Харківська область",
    location_type: "oblast",
    location_oblast: "Харківська область",
    alert_type: "air_raid",
    started_at: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: "demo-2",
    location_uid: "9",
    location_title: "Дніпропетровська область",
    location_type: "oblast",
    location_oblast: "Дніпропетровська область",
    alert_type: "air_raid",
    started_at: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
  {
    id: "demo-3",
    location_uid: "14140",
    location_title: "Покровський район",
    location_type: "raion",
    location_oblast: "Донецька область",
    alert_type: "artillery",
    started_at: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
];

export class AlertsInUaClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  readonly tier: TierConfig;
  private lastPollMs = 0;

  constructor(private readonly config: AlertsInUaClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 8_000;
    this.tier = TIER_CONFIG[config.tier ?? "free"];
  }

  /** True when no token is configured — client returns the DEMO fixture. */
  get isDemo(): boolean {
    return !this.config.token;
  }

  /** ms until the polite poll window opens (0 = may poll now). */
  pollBackoffMs(now = Date.now()): number {
    return Math.max(0, this.tier.minPollMs - (now - this.lastPollMs));
  }

  /** Fetch all currently active alerts → normalized snapshot. */
  async getActiveAlerts(): Promise<AlertsSnapshot> {
    const fetchedAt = new Date().toISOString();

    const raw = this.isDemo
      ? DEMO_RAW_ALERTS
      : (await this.fetch<AlertsInUaActiveResponse>("/alerts/active.json")).alerts ?? [];

    this.lastPollMs = Date.now();

    const active: AlertRecord[] = [];
    const oblasts = new Set<OblastCode>();

    for (const r of raw) {
      const oblastCode = resolveOblast(r);
      if (!oblastCode) continue;

      // Respect tier granularity: free tier collapses sub-oblast to oblast.
      const location = toLocation(r, oblastCode);
      if (this.tier.maxGranularity === "oblast" && location.kind !== "oblast") {
        location.kind = "oblast";
        location.raionCode = undefined;
        location.hromadaCode = undefined;
      }

      const type = TYPE_MAP[r.alert_type] ?? "info";
      active.push({
        alertId: `${this.isDemo ? "demo" : "alerts_in_ua_api"}:${r.location_uid}:${type}`,
        source: this.isDemo ? "demo" : "alerts_in_ua_api",
        tier: this.tier.tier,
        location,
        type,
        status: r.finished_at ? "all_clear" : "active",
        startedAt: r.started_at,
        endedAt: r.finished_at ?? undefined,
        observedAt: r.updated_at ?? fetchedAt,
        text: { uk: r.location_title },
        evidenceUrl: "https://alerts.in.ua/",
      });
      oblasts.add(oblastCode);
    }

    return {
      fetchedAt,
      source: this.isDemo ? "demo" : "alerts_in_ua_api",
      tier: this.tier.tier,
      active,
      activeOblasts: Array.from(oblasts),
      count: active.length,
    };
  }

  private async fetch<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        signal: controller.signal,
      });
      if (!res.ok) throw new AlertsInUaApiError(res.status, await res.text());
      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class AlertsInUaApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`alerts.in.ua API error ${status}: ${body.slice(0, 200)}`);
    this.name = "AlertsInUaApiError";
  }
}
