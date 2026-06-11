import type { AircraftRecord, AircraftCategory } from "./types";

/**
 * Aircraft database: resolves ICAO24 hex → registration, operator, type, category.
 *
 * In production: backed by OpenSky's aircraft database CSV (updated weekly)
 * or a commercial provider (ADS-B Exchange, PlaneFinder, etc.).
 *
 * This module provides the interface + an in-memory stub.
 */

export interface AircraftDatabase {
  lookup(icao24: string): Promise<AircraftRecord | null>;
  /** Bulk load from CSV (OpenSky format) */
  loadCSV?(csvContent: string): Promise<number>;
}

/**
 * Military ICAO hex ranges for common countries.
 * Source: public OSINT research, FAA, Eurocontrol docs.
 */
const MILITARY_HEX_RANGES: Array<{ min: number; max: number; country: string }> = [
  { min: 0xae0000, max: 0xafffff, country: "US" },  // USAF / USN
  { min: 0x430000, max: 0x4307ff, country: "FR" },  // French military
  { min: 0x3f4000, max: 0x3f7fff, country: "DE" },  // German military
  { min: 0x43c000, max: 0x43cfff, country: "GB" },  // RAF
  { min: 0x700000, max: 0x7fffff, country: "RU" },  // Russian (partially)
  { min: 0xa00001, max: 0xa3ffff, country: "UA" },  // Ukrainian
];

function hexToNum(hex: string): number {
  return parseInt(hex.toLowerCase(), 16);
}

export function inferMilitary(icao24: string): { is_military: boolean; country: string | null } {
  const n = hexToNum(icao24);
  for (const range of MILITARY_HEX_RANGES) {
    if (n >= range.min && n <= range.max) {
      return { is_military: true, country: range.country };
    }
  }
  return { is_military: false, country: null };
}

/**
 * In-memory aircraft database backed by a flat Map.
 * Suitable for loading the OpenSky aircraft database CSV.
 */
export class InMemoryAircraftDatabase implements AircraftDatabase {
  private readonly db = new Map<string, AircraftRecord>();

  async lookup(icao24: string): Promise<AircraftRecord | null> {
    const key = icao24.toLowerCase();
    const record = this.db.get(key);
    if (record) return record;

    // Fall back to military inference
    const mil = inferMilitary(icao24);
    if (mil.is_military) {
      return {
        icao24: key,
        registration: null,
        manufacturer: null,
        model: null,
        type_code: null,
        operator: null,
        operator_callsign: null,
        operator_country: mil.country,
        category: "military",
        is_military: true,
        owner: null,
      };
    }

    return null;
  }

  async loadCSV(csv: string): Promise<number> {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return 0;

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    let count = 0;

    for (const line of lines.slice(1)) {
      const parts = this.parseCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => (row[h] = (parts[i] ?? "").replace(/"/g, "").trim()));

      const icao24 = row.icao24?.toLowerCase();
      if (!icao24) continue;

      const category = this.inferCategory(row.typecode ?? "", row.operator ?? "");

      this.db.set(icao24, {
        icao24,
        registration: row.registration || null,
        manufacturer: row.manufacturername || null,
        model: row.model || null,
        type_code: row.typecode || null,
        operator: row.operatoriata || row.operator || null,
        operator_callsign: row.operatorcallsign || null,
        operator_country: row.operatorcountry || null,
        category,
        is_military: category === "military",
        owner: row.owner || null,
      });
      count++;
    }

    return count;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  private inferCategory(typeCode: string, operator: string): AircraftCategory {
    const tc = typeCode.toUpperCase();
    const op = operator.toUpperCase();
    if (op.includes("AIR FORCE") || op.includes("NAVY") || op.includes("MILITARY") || op.includes("ARMY")) return "military";
    if (["H60", "AS50", "EC35", "R44"].some((h) => tc.includes(h))) return "helicopter";
    if (tc.startsWith("B7") || tc.startsWith("A3") || tc.startsWith("A2")) return "passenger";
    if (["B74", "B77", "B78"].some((h) => tc.includes(h))) return "cargo";
    return "unknown";
  }
}
