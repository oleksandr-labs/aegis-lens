/**
 * Client for the Ukraine Alarm API (api.ukrainealarm.com).
 *
 * Docs: https://api.ukrainealarm.com/swagger/index.html
 * Auth: Bearer token (API key from ukrainealarm.com)
 *
 * Key endpoints:
 *   GET /api/v3/alerts              — current active alerts across all regions
 *   GET /api/v3/alerts/{regionId}   — alert status for a specific region
 *   GET /api/v3/alarmHistory/{regionId}/{period}  — historical alerts
 */

import type { CivilianAlert, AlertFeedSnapshot, OblastCode } from "./types";

export interface UkraineAlarmRegionStatus {
  regionId: string;
  regionName: string;
  regionType: string;
  lastUpdate: string;
  activeAlerts: Array<{
    regionId: string;
    regionType: string;
    lastUpdate: string;
    activeAlerts: Array<{
      regionId: string;
      regionType: string;
      type: string;     // AIR_RAID | ARTILLERY | URBAN_FIGHTING | CHEMICAL | NUCLEAR | RADIOLOGICAL | INFO
      lastUpdate: string;
    }>;
  }>;
}

export interface UkraineAlarmClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

const BASE_URL = "https://api.ukrainealarm.com/api/v3";

// Map Ukraine Alarm API types to our AlertType
const TYPE_MAP: Record<string, CivilianAlert["type"]> = {
  AIR_RAID: "air_raid",
  ARTILLERY: "artillery",
  URBAN_FIGHTING: "urban_fighting",
  CHEMICAL: "chemical",
  NUCLEAR: "nuclear",
  RADIOLOGICAL: "radiological",
  INFO: "info",
};

// Map Ukraine Alarm region IDs to OblastCodes (subset — extend as needed)
const REGION_TO_OBLAST: Record<string, OblastCode> = {
  "3": "UA-63",   // Kharkiv
  "4": "UA-14",   // Donetsk
  "5": "UA-09",   // Luhansk
  "6": "UA-23",   // Zaporizhzhia
  "7": "UA-65",   // Kherson
  "8": "UA-51",   // Odesa
  "9": "UA-48",   // Mykolaiv
  "10": "UA-71",  // Cherkasy
  "11": "UA-12",  // Dnipropetrovsk
  "12": "UA-35",  // Kirovohrad
  "13": "UA-05",  // Vinnytsia
  "14": "UA-68",  // Khmelnytskyi
  "15": "UA-61",  // Ternopil
  "16": "UA-46",  // Lviv
  "17": "UA-21",  // Zakarpattia
  "18": "UA-26",  // Ivano-Frankivsk
  "19": "UA-77",  // Chernivtsi
  "20": "UA-56",  // Rivne
  "21": "UA-07",  // Volyn
  "22": "UA-59",  // Sumy
  "23": "UA-74",  // Chernihiv
  "24": "UA-32",  // Kyiv oblast
  "25": "UA-30",  // Kyiv city
  "26": "UA-53",  // Poltava
  "27": "UA-18",  // Zhytomyr
};

export class UkraineAlarmClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: UkraineAlarmClientConfig) {
    this.baseUrl = config.baseUrl ?? BASE_URL;
    this.timeoutMs = config.timeoutMs ?? 10_000;
  }

  /** Fetch all currently active alerts */
  async getActiveAlerts(): Promise<AlertFeedSnapshot> {
    const data = await this.fetch<UkraineAlarmRegionStatus[]>("/alerts");
    const fetchedAt = new Date().toISOString();
    const activeAlerts: CivilianAlert[] = [];
    const activeOblastCodes = new Set<OblastCode>();

    for (const region of data) {
      const oblastCode = REGION_TO_OBLAST[region.regionId];
      if (!oblastCode) continue;

      for (const nested of region.activeAlerts ?? []) {
        for (const alert of nested.activeAlerts ?? []) {
          const type = TYPE_MAP[alert.type] ?? "info";
          const alertId = `ua-alarm-${alert.regionId}-${type}-${Date.now()}`;

          const civilianAlert: CivilianAlert = {
            alertId,
            oblastCode,
            type,
            status: "active",
            startedAt: alert.lastUpdate ?? fetchedAt,
            source: "ukrainealarm.com",
          };

          activeAlerts.push(civilianAlert);
          activeOblastCodes.add(oblastCode);
        }
      }
    }

    return {
      fetchedAt,
      activeAlerts,
      activeOblastCodes: Array.from(activeOblastCodes),
      alertCount: activeAlerts.length,
    };
  }

  /** Fetch historical alerts for a region over the past N days */
  async getAlertHistory(
    regionId: string,
    periodDays: 1 | 3 | 7 | 30 = 7,
  ): Promise<CivilianAlert[]> {
    const data = await this.fetch<Array<{
      regionId: string;
      type: string;
      startDate: string;
      endDate?: string;
    }>>(`/alarmHistory/${regionId}/${periodDays}`);

    const oblastCode = REGION_TO_OBLAST[regionId];
    if (!oblastCode) return [];

    return data.map((item, idx) => {
      const startMs = Date.parse(item.startDate);
      const endMs = item.endDate ? Date.parse(item.endDate) : undefined;
      const durationSec = endMs ? Math.round((endMs - startMs) / 1000) : undefined;

      return {
        alertId: `ua-history-${regionId}-${idx}-${startMs}`,
        oblastCode,
        type: TYPE_MAP[item.type] ?? "info",
        status: item.endDate ? "all_clear" : "active",
        startedAt: item.startDate,
        endedAt: item.endDate,
        durationSec,
        source: "ukrainealarm.com",
      } satisfies CivilianAlert;
    });
  }

  private async fetch<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: this.config.apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new UkraineAlarmApiError(response.status, await response.text());
      }

      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }
}

export class UkraineAlarmApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`Ukraine Alarm API error ${status}: ${body.slice(0, 200)}`);
    this.name = "UkraineAlarmApiError";
  }
}
