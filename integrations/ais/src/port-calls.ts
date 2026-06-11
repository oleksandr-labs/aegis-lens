/**
 * Port-call timeline per vessel.
 *
 * Derives discrete port calls (arrival → berth → departure) from a stream of AIS
 * positions by detecting when a vessel enters a known port polygon, slows below a
 * berth-speed threshold, and later leaves. STS (ship-to-ship) transfer zones —
 * common in shadow-fleet oil laundering — are modelled as pseudo-ports.
 */

import type { VesselPosition } from "./types";
import { haversineKm } from "./dark-vessel";

export interface PortDef {
  /** UN/LOCODE where available */
  locode: string;
  name_en: string;
  name_uk: string;
  country: string;
  latitude: number;
  longitude: number;
  /** Match radius in km */
  radius_km: number;
  /** True for STS transfer anchorages rather than berthed ports */
  is_sts_zone?: boolean;
}

export interface PortCall {
  locode: string;
  port_name_en: string;
  port_name_uk: string;
  country: string;
  is_sts_zone: boolean;
  arrived_at: string;
  departed_at: string | null;
  /** Hours alongside; null while still in port */
  duration_h: number | null;
  /** Minimum speed seen while in the port polygon (knots) */
  min_speed_knots: number | null;
}

/** Black Sea / Azov ports + known STS transfer anchorages. */
export const KNOWN_PORTS: PortDef[] = [
  { locode: "UAODS", name_en: "Odesa", name_uk: "Одеса", country: "UA", latitude: 46.49, longitude: 30.74, radius_km: 8 },
  { locode: "UACHO", name_en: "Chornomorsk", name_uk: "Чорноморськ", country: "UA", latitude: 46.30, longitude: 30.65, radius_km: 6 },
  { locode: "UAPIV", name_en: "Pivdennyi", name_uk: "Південний", country: "UA", latitude: 46.62, longitude: 31.00, radius_km: 6 },
  { locode: "UAIZM", name_en: "Izmail", name_uk: "Ізмаїл", country: "UA", latitude: 45.35, longitude: 28.84, radius_km: 5 },
  { locode: "RUNVS", name_en: "Novorossiysk", name_uk: "Новоросійськ", country: "RU", latitude: 44.72, longitude: 37.78, radius_km: 8 },
  { locode: "RUTUA", name_en: "Tuapse", name_uk: "Туапсе", country: "RU", latitude: 44.10, longitude: 39.07, radius_km: 6 },
  { locode: "TRSAM", name_en: "Samsun", name_uk: "Самсун", country: "TR", latitude: 41.30, longitude: 36.33, radius_km: 6 },
  { locode: "GEPTI", name_en: "Poti", name_uk: "Поті", country: "GE", latitude: 42.15, longitude: 41.66, radius_km: 5 },
  // STS transfer anchorages used by the shadow fleet
  { locode: "STS-KAVKAZ", name_en: "Kerch / Kavkaz STS anchorage", name_uk: "Керченський / Кавказький рейд STS", country: "RU", latitude: 45.13, longitude: 36.68, radius_km: 12, is_sts_zone: true },
  { locode: "STS-LACONIAN", name_en: "Laconian Gulf STS anchorage", name_uk: "Лаконійська затока STS", country: "GR", latitude: 36.55, longitude: 22.85, radius_km: 15, is_sts_zone: true },
];

const BERTH_SPEED_KNOTS = 0.8;

/** Find the port whose polygon contains a position, if any. */
export function portAt(lat: number, lon: number, ports: PortDef[] = KNOWN_PORTS): PortDef | null {
  for (const p of ports) {
    if (haversineKm(lat, lon, p.latitude, p.longitude) <= p.radius_km) return p;
  }
  return null;
}

/**
 * Build a port-call timeline from a chronological position history of ONE vessel.
 * Positions need not be perfectly ordered; we sort by timestamp defensively.
 */
export function buildPortCallTimeline(
  positions: VesselPosition[],
  ports: PortDef[] = KNOWN_PORTS,
): PortCall[] {
  const sorted = [...positions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const calls: PortCall[] = [];
  let current: { def: PortDef; call: PortCall } | null = null;

  for (const pos of sorted) {
    const here = portAt(pos.latitude, pos.longitude, ports);

    if (here) {
      if (!current || current.def.locode !== here.locode) {
        // close any open call at a different port first
        if (current) closeCall(current.call, pos.timestamp);
        current = { def: here, call: openCall(here, pos.timestamp) };
        calls.push(current.call);
      }
      // update min speed while alongside
      if (pos.speed_knots !== null) {
        current.call.min_speed_knots =
          current.call.min_speed_knots === null
            ? pos.speed_knots
            : Math.min(current.call.min_speed_knots, pos.speed_knots);
      }
    } else if (current) {
      closeCall(current.call, pos.timestamp);
      current = null;
    }
  }

  return calls;
}

/** True when the vessel appears berthed (in a port polygon and effectively stopped). */
export function isBerthed(pos: VesselPosition, ports: PortDef[] = KNOWN_PORTS): boolean {
  return (
    portAt(pos.latitude, pos.longitude, ports) !== null &&
    (pos.speed_knots ?? 99) <= BERTH_SPEED_KNOTS
  );
}

function openCall(p: PortDef, at: string): PortCall {
  return {
    locode: p.locode,
    port_name_en: p.name_en,
    port_name_uk: p.name_uk,
    country: p.country,
    is_sts_zone: !!p.is_sts_zone,
    arrived_at: at,
    departed_at: null,
    duration_h: null,
    min_speed_knots: null,
  };
}

function closeCall(call: PortCall, at: string): void {
  if (call.departed_at) return;
  call.departed_at = at;
  const ms = new Date(at).getTime() - new Date(call.arrived_at).getTime();
  call.duration_h = Math.round((ms / 3_600_000) * 10) / 10;
}
