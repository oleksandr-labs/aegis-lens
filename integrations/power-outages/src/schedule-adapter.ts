/**
 * Scheduled blackout adapter.
 *
 * In production this would call the Ukrenergo API or parse their published
 * schedule. For now it returns a static demo schedule for a few oblasts.
 */

import type { OutageSignal } from "./types";

interface ScheduleEntry {
  regionCode: string;
  groupId: string; // 1-6 rotation group
  startHour: number; // local hour 0-23
  durationHours: number;
}

const DEMO_SCHEDULE: ScheduleEntry[] = [
  { regionCode: "UA-63", groupId: "1", startHour: 8,  durationHours: 4 },
  { regionCode: "UA-63", groupId: "3", startHour: 16, durationHours: 4 },
  { regionCode: "UA-12", groupId: "2", startHour: 6,  durationHours: 4 },
  { regionCode: "UA-12", groupId: "4", startHour: 18, durationHours: 4 },
  { regionCode: "UA-51", groupId: "5", startHour: 10, durationHours: 4 },
  { regionCode: "UA-14", groupId: "1", startHour: 12, durationHours: 4 },
  { regionCode: "UA-14", groupId: "2", startHour: 20, durationHours: 4 },
];

/**
 * Returns signals for scheduled outages currently in effect (UTC).
 * In production: fetch from Ukrenergo / DTEK APIs.
 */
export function getScheduledBlackoutSignals(nowUtc: Date = new Date()): OutageSignal[] {
  const kyivHour = (nowUtc.getUTCHours() + 3) % 24; // Ukraine is UTC+3 (EET)
  const signals: OutageSignal[] = [];

  for (const entry of DEMO_SCHEDULE) {
    const end = (entry.startHour + entry.durationHours) % 24;
    const inWindow =
      entry.startHour < end
        ? kyivHour >= entry.startHour && kyivHour < end
        : kyivHour >= entry.startHour || kyivHour < end;

    if (inWindow) {
      signals.push({
        source: "scheduled_blackout",
        regionCode: entry.regionCode,
        confidence: 0.95,
        detectedAt: nowUtc.toISOString(),
        cause: "scheduled",
        estimatedCoverage: 1 / 6, // one of 6 rotation groups ≈ 17%
        rawData: { groupId: entry.groupId, startHour: entry.startHour, durationHours: entry.durationHours },
      });
    }
  }

  return signals;
}
