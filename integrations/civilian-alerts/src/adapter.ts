/**
 * SourceAdapter for civilian alerts (air-raid sirens, evacuation orders).
 *
 * Polls the Ukraine Alarm API every 30 seconds.
 * Emits events only for status changes (alert start / all-clear) to avoid duplicates.
 * Latency budget: < 5s end-to-end (see TODO/layers/TODO_civilian_alerts.md).
 */

import type { CivilianAlert, OblastCode } from "./types";
import { UkraineAlarmClient } from "./client";
import { OBLASTS } from "./types";

export interface CivilianAlertEvent {
  eventId: string;
  class: "civilian_alert";
  subclass: string;
  type: "alert_start" | "alert_end";
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  alertType: CivilianAlert["type"];
  location: {
    lat: number;
    lon: number;
    country: string;
    region: string;
  };
  occurredAt: string;
  endedAt?: string;
  durationSec?: number;
  source: string;
  severity: 0 | 1 | 2 | 3 | 4 | 5;
  danger: number;
  summary: { en: string; uk: string };
}

// Severity/danger by alert type
const ALERT_SEVERITY: Record<CivilianAlert["type"], { severity: 0 | 1 | 2 | 3 | 4 | 5; danger: number }> = {
  air_raid:       { severity: 4, danger: 80 },
  artillery:      { severity: 4, danger: 75 },
  urban_fighting: { severity: 5, danger: 90 },
  chemical:       { severity: 5, danger: 95 },
  nuclear:        { severity: 5, danger: 100 },
  radiological:   { severity: 5, danger: 95 },
  info:           { severity: 1, danger: 10 },
};

function buildSummary(
  oblastNameEn: string,
  oblastNameUk: string,
  alertType: CivilianAlert["type"],
  type: "alert_start" | "alert_end",
): { en: string; uk: string } {
  const typeLabels: Record<CivilianAlert["type"], { en: string; uk: string }> = {
    air_raid:       { en: "Air raid alert", uk: "Повітряна тривога" },
    artillery:      { en: "Artillery threat", uk: "Загроза артилерії" },
    urban_fighting: { en: "Urban fighting warning", uk: "Попередження про бойові дії в місті" },
    chemical:       { en: "Chemical hazard alert", uk: "Хімічна небезпека" },
    nuclear:        { en: "Nuclear threat alert", uk: "Ядерна загроза" },
    radiological:   { en: "Radiological hazard", uk: "Радіаційна небезпека" },
    info:           { en: "Information notice", uk: "Інформаційне повідомлення" },
  };

  const label = typeLabels[alertType];

  if (type === "alert_start") {
    return {
      en: `${label.en} active in ${oblastNameEn}`,
      uk: `${label.uk} у ${oblastNameUk} обл.`,
    };
  }
  return {
    en: `${label.en} all-clear in ${oblastNameEn}`,
    uk: `${label.uk} знято у ${oblastNameUk} обл.`,
  };
}

export class CivilianAlertAdapter {
  private readonly client: UkraineAlarmClient;
  private activeAlertIds = new Set<string>();

  constructor(apiKey: string, baseUrl?: string) {
    this.client = new UkraineAlarmClient({ apiKey, baseUrl });
  }

  /** Poll once, return changed events (new alerts + cleared alerts) */
  async pollOnce(): Promise<CivilianAlertEvent[]> {
    const snapshot = await this.client.getActiveAlerts();
    const events: CivilianAlertEvent[] = [];
    const newActiveIds = new Set<string>();

    for (const alert of snapshot.activeAlerts) {
      const key = `${alert.oblastCode}:${alert.type}`;
      newActiveIds.add(key);

      if (!this.activeAlertIds.has(key)) {
        // New alert started
        const oblastInfo = OBLASTS[alert.oblastCode];
        if (!oblastInfo) continue;
        const { severity, danger } = ALERT_SEVERITY[alert.type];
        const summary = buildSummary(oblastInfo.nameEn, oblastInfo.nameUk, alert.type, "alert_start");

        events.push({
          eventId: `civil-${alert.oblastCode}-${alert.type}-${Date.now()}`,
          class: "civilian_alert",
          subclass: alert.type,
          type: "alert_start",
          oblastCode: alert.oblastCode,
          oblastNameUk: oblastInfo.nameUk,
          oblastNameEn: oblastInfo.nameEn,
          alertType: alert.type,
          location: {
            lat: oblastInfo.center[1],
            lon: oblastInfo.center[0],
            country: "Ukraine",
            region: oblastInfo.nameEn,
          },
          occurredAt: alert.startedAt,
          source: alert.source,
          severity,
          danger,
          summary,
        });
      }
    }

    // Detect cleared alerts
    for (const key of this.activeAlertIds) {
      if (!newActiveIds.has(key)) {
        const [oblastCode, alertType] = key.split(":") as [OblastCode, CivilianAlert["type"]];
        const oblastInfo = OBLASTS[oblastCode];
        if (!oblastInfo) continue;
        const summary = buildSummary(oblastInfo.nameEn, oblastInfo.nameUk, alertType, "alert_end");

        events.push({
          eventId: `civil-clear-${oblastCode}-${alertType}-${Date.now()}`,
          class: "civilian_alert",
          subclass: alertType,
          type: "alert_end",
          oblastCode,
          oblastNameUk: oblastInfo.nameUk,
          oblastNameEn: oblastInfo.nameEn,
          alertType,
          location: {
            lat: oblastInfo.center[1],
            lon: oblastInfo.center[0],
            country: "Ukraine",
            region: oblastInfo.nameEn,
          },
          occurredAt: new Date().toISOString(),
          source: "ukrainealarm.com",
          severity: 0,
          danger: 0,
          summary,
        });
      }
    }

    this.activeAlertIds = newActiveIds;
    return events;
  }

  /** Returns current snapshot for API serving */
  async getCurrentSnapshot() {
    return this.client.getActiveAlerts();
  }
}
