/**
 * AISStream.io WebSocket client.
 * Docs: https://aisstream.io/documentation
 *
 * Provides real-time AIS position data over WebSocket.
 * Free tier: 3 bounding boxes, 1 connection.
 */

import type { VesselPosition, NavigationStatus, ShipType } from "./types";

export interface AISStreamConfig {
  apiKey: string;
  /** Bounding boxes [[sw_lat, sw_lng, ne_lat, ne_lng], ...] */
  boundingBoxes?: number[][];
  filterMsgTypes?: number[];
}

// Default: Black Sea + Sea of Azov + surrounding waters
const DEFAULT_BBOXES = [
  [40.5, 27.5, 47.5, 41.5], // Black Sea
  [45.0, 33.5, 47.5, 39.5], // Sea of Azov
];

interface AISStreamMessage {
  MessageType: string;
  MetaData: {
    MMSI: number;
    ShipName: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
  Message: {
    PositionReport?: {
      Mmsi: number;
      NavigationalStatus: number;
      Sog: number;
      Cog: number;
      TrueHeading: number;
      Latitude: number;
      Longitude: number;
    };
    ShipStaticData?: {
      Mmsi: number;
      ImoNumber: number;
      CallSign: string;
      Name: string;
      TypeOfShipAndCargo: number;
      Destination: string;
      Draught: number;
    };
  };
}

const NAV_STATUS_MAP: Record<number, NavigationStatus> = {
  0: "under_way_engine",
  1: "at_anchor",
  2: "not_under_command",
  3: "restricted_maneuverability",
  4: "constrained_by_draught",
  5: "moored",
  6: "aground",
  7: "engaged_fishing",
  8: "under_way_sailing",
};

function inferShipType(typeCode: number): ShipType {
  if (typeCode >= 80 && typeCode <= 89) return "tanker";
  if (typeCode >= 70 && typeCode <= 79) return "cargo";
  if (typeCode >= 60 && typeCode <= 69) return "passenger";
  if (typeCode >= 50 && typeCode <= 59) return "tugboat";
  if (typeCode === 35) return "military";
  if (typeCode >= 30 && typeCode <= 32) return "fishing";
  if (typeCode === 36 || typeCode === 37) return "sailing";
  if (typeCode === 51 || typeCode === 52) return "pilot";
  if (typeCode === 55) return "sar";
  return "unknown";
}

/** Infer flag country from MMSI prefix (MID) */
function inferFlag(mmsi: string): string | null {
  const mid = mmsi.slice(0, 3);
  const MID_MAP: Record<string, string> = {
    "272": "UA", "273": "RU", "212": "CY", "271": "TR",
    "240": "GR", "248": "MT", "211": "DE", "269": "GE",
  };
  return MID_MAP[mid] ?? null;
}

export type AISMessageHandler = (position: VesselPosition) => void;

export class AISStreamClient {
  private ws: WebSocket | null = null;
  private handlers: AISMessageHandler[] = [];

  constructor(private readonly config: AISStreamConfig) {}

  onMessage(handler: AISMessageHandler): void {
    this.handlers.push(handler);
  }

  connect(): void {
    this.ws = new WebSocket("wss://stream.aisstream.io/v0/stream");

    this.ws.onopen = () => {
      this.ws!.send(
        JSON.stringify({
          APIKey: this.config.apiKey,
          BoundingBoxes: this.config.boundingBoxes ?? DEFAULT_BBOXES,
          FilterMessageTypes: this.config.filterMsgTypes ?? ["PositionReport"],
        }),
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: AISStreamMessage = JSON.parse(event.data as string);
        const position = this.parseMessage(msg);
        if (position) this.handlers.forEach((h) => h(position));
      } catch {
        // malformed message — ignore
      }
    };

    this.ws.onerror = () => {
      setTimeout(() => this.connect(), 5_000);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connect(), 5_000);
    };
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  private parseMessage(msg: AISStreamMessage): VesselPosition | null {
    const meta = msg.MetaData;
    const pos = msg.Message.PositionReport;
    const stat = msg.Message.ShipStaticData;

    if (!meta || (!pos && !stat)) return null;

    const mmsi = String(meta.MMSI);

    return {
      mmsi,
      imo: stat?.ImoNumber ? String(stat.ImoNumber) : null,
      callsign: stat?.CallSign?.trim() || null,
      ship_name: meta.ShipName?.trim() || stat?.Name?.trim() || null,
      ship_type: inferShipType(stat?.TypeOfShipAndCargo ?? 0),
      latitude: pos?.Latitude ?? meta.latitude,
      longitude: pos?.Longitude ?? meta.longitude,
      speed_knots: pos?.Sog ?? null,
      course_deg: pos?.Cog ?? null,
      heading_deg: pos?.TrueHeading !== 511 ? (pos?.TrueHeading ?? null) : null,
      nav_status: NAV_STATUS_MAP[pos?.NavigationalStatus ?? 15] ?? "unknown",
      timestamp: meta.time_utc,
      msg_type: pos ? 1 : 5,
      destination: stat?.Destination?.trim() || null,
      draught_m: stat?.Draught ?? null,
      flag: inferFlag(mmsi),
    };
  }
}
