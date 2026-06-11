import { DroneEvent, DroneMission } from "./types";

/** Group sighting events that likely belong to the same mission. */
export function groupIntoMissions(events: DroneEvent[]): Map<string, DroneEvent[]> {
  const groups = new Map<string, DroneEvent[]>();

  // If the event already has a missionId, use it directly
  for (const ev of events) {
    if (ev.missionId) {
      const arr = groups.get(ev.missionId) ?? [];
      arr.push(ev);
      groups.set(ev.missionId, arr);
    }
  }

  // Heuristic: cluster unassigned events by time proximity + spatial proximity
  const unassigned = events.filter((ev) => !ev.missionId);
  const MAX_GAP_MS = 30 * 60 * 1000; // 30 min
  const MAX_DIST_KM = 150;

  let missionCounter = groups.size;

  for (const ev of unassigned) {
    let assigned = false;
    for (const [missionId, members] of groups) {
      const last = members[members.length - 1];
      const timeDiff = Math.abs(new Date(ev.occurredAt).getTime() - new Date(last.occurredAt).getTime());
      if (timeDiff > MAX_GAP_MS) continue;

      const dist = ev.lat != null && ev.lon != null && last.lat != null && last.lon != null
        ? haversineKm(ev.lat, ev.lon, last.lat, last.lon)
        : 0;

      if (dist <= MAX_DIST_KM) {
        members.push(ev);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      const id = `mission_auto_${++missionCounter}`;
      groups.set(id, [ev]);
    }
  }

  return groups;
}

/** Build a DroneMission from a group of events. */
export function buildMission(missionId: string, events: DroneEvent[]): DroneMission {
  const sorted = [...events].sort((a, b) =>
    new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  const trajectory = sorted
    .filter((e) => e.lat != null && e.lon != null)
    .map((e) => ({ lat: e.lat!, lon: e.lon!, ts: e.occurredAt }));

  const interceptEvent = sorted.find((e) => e.subtype === "intercept");
  const regions = [...new Set(sorted.map((e) => e.regionCode).filter(Boolean) as string[])];

  return {
    missionId,
    eventIds: sorted.map((e) => e.eventId),
    estimatedLaunchAt: sorted[0]?.occurredAt,
    trajectory,
    intercepted: !!interceptEvent,
    interceptedAt: interceptEvent?.occurredAt,
    impactLat: interceptEvent?.lat,
    impactLon: interceptEvent?.lon,
    affectedRegions: regions,
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
