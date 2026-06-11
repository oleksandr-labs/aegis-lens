/**
 * Source adapter for Cloudflare Radar internet outage signals.
 *
 * Maps country-level availability drops into Aegis events.
 * Availability < 90% = warning; < 70% = critical.
 * Polls every 15 minutes (radar data has ~15min lag).
 */

import { CloudflareRadarClient, type RadarCountryOutageSignal } from "./client";

export interface OutageEvent {
  eventId: string;
  class: "communications_outage";
  subclass: "internet_degradation" | "internet_outage";
  countryCode: string;
  countryName: string;
  availability: number;
  severity: 1 | 2 | 3 | 4 | 5;
  danger: number;
  summary: { en: string; uk: string };
  occurredAt: string;
  source: string;
}

function availabilityToSeverity(availability: number): { severity: 1 | 2 | 3 | 4 | 5; danger: number; subclass: OutageEvent["subclass"] } {
  if (availability < 50) return { severity: 5, danger: 90, subclass: "internet_outage" };
  if (availability < 70) return { severity: 4, danger: 70, subclass: "internet_outage" };
  if (availability < 80) return { severity: 3, danger: 50, subclass: "internet_degradation" };
  if (availability < 90) return { severity: 2, danger: 30, subclass: "internet_degradation" };
  return { severity: 1, danger: 10, subclass: "internet_degradation" };
}

export class CloudflareRadarAdapter {
  private readonly client: CloudflareRadarClient;
  private lastSignals = new Map<string, number>(); // countryCode → last availability

  constructor(apiToken: string) {
    this.client = new CloudflareRadarClient({ apiToken });
  }

  async pollOnce(): Promise<OutageEvent[]> {
    const signals = await this.client.getUkraineOutageSignals();
    const events: OutageEvent[] = [];

    for (const signal of signals) {
      const lastAvail = this.lastSignals.get(signal.countryCode);

      // Only emit if degradation from last reading or first reading below threshold
      const isNewDegradation = lastAvail !== undefined && signal.availability < lastAvail - 5;
      const isSignificant = signal.availability < 90;

      if ((isNewDegradation || lastAvail === undefined) && isSignificant) {
        const { severity, danger, subclass } = availabilityToSeverity(signal.availability);

        events.push({
          eventId: `cf-radar-${signal.countryCode}-${Date.now()}`,
          class: "communications_outage",
          subclass,
          countryCode: signal.countryCode,
          countryName: signal.countryName,
          availability: signal.availability,
          severity,
          danger,
          summary: {
            en: `Internet availability in ${signal.countryName} at ${signal.availability}% (${subclass.replace("_", " ")})`,
            uk: `Доступність інтернету в ${signal.countryName}: ${signal.availability}% (${subclass === "internet_outage" ? "відключення" : "деградація"})`,
          },
          occurredAt: signal.detectedAt,
          source: "cloudflare-radar",
        });
      }

      this.lastSignals.set(signal.countryCode, signal.availability);
    }

    return events;
  }
}
