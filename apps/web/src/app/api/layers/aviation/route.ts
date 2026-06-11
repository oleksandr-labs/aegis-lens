/**
 * GET /api/layers/aviation — aviation tracking layer (ADS-B / OpenSky + military estimates)
 *
 * Strictly public ADS-B data. Military attributes are heuristic *estimates*.
 * Private-individual aircraft are redacted per the privacy policy.
 *
 * Query params (filter facets):
 *   region        — ISO 3166-2 oblast code
 *   category      — military | cargo | passenger | helicopter | private | drone | unknown
 *   type          — ICAO type code (e.g. "B738", "A124")
 *   operator      — ICAO operator designator (e.g. "AUI") or substring of operator name
 *   country       — ISO country of registration (e.g. "UA", "RU")
 *   minAltitude   — minimum baro altitude in metres
 *   maxAltitude   — maximum baro altitude in metres
 *   militaryOnly  — "true" = estimated-military flights only
 *   includeRedacted — "true" = include redacted private tracks (default false)
 *
 * Cache: 15s (near real-time).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

type AircraftCategory = "military" | "cargo" | "passenger" | "helicopter" | "private" | "drone" | "unknown";

interface AviationTrack {
  icao24: string;
  callsign: string | null;
  position: {
    lat: number;
    lon: number;
    baroAltitudeM: number | null;
    flightLevel: number | null;
    headingDeg: number | null;
    velocityMs: number | null;
    verticalRateMs: number | null;
    onGround: boolean;
  };
  category: AircraftCategory;
  categoryLabel: { en: string; uk: string };
  registration: string | null;
  typeCode: string | null;
  model: string | null;
  operator: string | null;
  operatorIcao: string | null;
  operatorCountry: string | null;
  countryOfRegistration: string | null;
  militaryEstimate?: { value: boolean; confidence: number };
  squawk: string | null;
  emergency?: "hijack" | "radio_failure" | "general" | null;
  inRestrictedAirspace: boolean;
  redacted: boolean;
  title: { en: string; uk: string };
  capturedAt: string;
  sourceId: string;
  regionCode?: string;
}

const CATEGORY_LABELS: Record<AircraftCategory, { en: string; uk: string }> = {
  military: { en: "Military (estimated)", uk: "Військове (оцінка)" },
  cargo: { en: "Cargo", uk: "Вантажне" },
  passenger: { en: "Passenger", uk: "Пасажирське" },
  helicopter: { en: "Helicopter", uk: "Гелікоптер" },
  private: { en: "Private", uk: "Приватне" },
  drone: { en: "Drone / UAV", uk: "Безпілотник" },
  unknown: { en: "Unknown", uk: "Невідомо" },
};

function flightLevel(altM: number | null): number | null {
  if (altM == null) return null;
  return Math.round((altM / 0.3048) / 100);
}

function mkTrack(p: Partial<AviationTrack> & {
  icao24: string; lat: number; lon: number; category: AircraftCategory; capturedAt: string;
}): AviationTrack {
  const baro = p.position?.baroAltitudeM ?? null;
  return {
    icao24: p.icao24,
    callsign: p.callsign ?? null,
    position: {
      lat: p.lat,
      lon: p.lon,
      baroAltitudeM: baro,
      flightLevel: flightLevel(baro),
      headingDeg: p.position?.headingDeg ?? null,
      velocityMs: p.position?.velocityMs ?? null,
      verticalRateMs: p.position?.verticalRateMs ?? null,
      onGround: p.position?.onGround ?? false,
    },
    category: p.category,
    categoryLabel: CATEGORY_LABELS[p.category],
    registration: p.registration ?? null,
    typeCode: p.typeCode ?? null,
    model: p.model ?? null,
    operator: p.operator ?? null,
    operatorIcao: p.operatorIcao ?? null,
    operatorCountry: p.operatorCountry ?? null,
    countryOfRegistration: p.countryOfRegistration ?? null,
    militaryEstimate: p.militaryEstimate,
    squawk: p.squawk ?? null,
    emergency: p.emergency ?? null,
    inRestrictedAirspace: p.inRestrictedAirspace ?? false,
    redacted: false,
    title: p.title ?? { en: p.callsign ?? p.icao24, uk: p.callsign ?? p.icao24 },
    capturedAt: p.capturedAt,
    sourceId: p.sourceId ?? "adsb_opensky",
    regionCode: p.regionCode,
  };
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const now = Date.now();

const DEMO_TRACKS: AviationTrack[] = [
  mkTrack({
    icao24: "508035", callsign: "AUI231", lat: 49.81, lon: 23.95, category: "passenger",
    position: { baroAltitudeM: 10600, headingDeg: 95, velocityMs: 235, verticalRateMs: 0, onGround: false } as AviationTrack["position"],
    registration: "UR-PSA", typeCode: "B738", model: "737-800",
    operator: "Ukraine International Airlines", operatorIcao: "AUI", operatorCountry: "UA",
    countryOfRegistration: "UA", squawk: "2456",
    title: { en: "AUI231 (737-800)", uk: "AUI231 (737-800)" },
    capturedAt: new Date(now - 30_000).toISOString(), regionCode: "UA-46",
  }),
  mkTrack({
    icao24: "508120", callsign: "ANT124", lat: 50.40, lon: 30.45, category: "cargo",
    position: { baroAltitudeM: 9200, headingDeg: 270, velocityMs: 210, verticalRateMs: 2, onGround: false } as AviationTrack["position"],
    registration: "UR-82027", typeCode: "A124", model: "An-124 Ruslan",
    operator: "Antonov Airlines", operatorIcao: "ADB", operatorCountry: "UA",
    countryOfRegistration: "UA", squawk: "3012",
    title: { en: "ANT124 (An-124 Ruslan)", uk: "ANT124 (Ан-124 «Руслан»)" },
    capturedAt: new Date(now - 45_000).toISOString(), regionCode: "UA-30",
  }),
  mkTrack({
    icao24: "ae1234", callsign: "RCH471", lat: 50.10, lon: 26.20, category: "military",
    position: { baroAltitudeM: 7600, headingDeg: 120, velocityMs: 180, verticalRateMs: 0, onGround: false } as AviationTrack["position"],
    registration: null, typeCode: "C30J", model: "C-130J Hercules",
    operator: null, operatorIcao: "RCH", operatorCountry: "US",
    countryOfRegistration: "US", squawk: "1377",
    militaryEstimate: { value: true, confidence: 0.85 }, inRestrictedAirspace: true,
    title: { en: "RCH471 (C-130J, est. military)", uk: "RCH471 (C-130J, ймовірно військовий)" },
    capturedAt: new Date(now - 20_000).toISOString(), regionCode: "UA-56",
  }),
  mkTrack({
    icao24: "508400", callsign: "WZZ7320", lat: 48.62, lon: 22.30, category: "passenger",
    position: { baroAltitudeM: 11300, headingDeg: 230, velocityMs: 245, verticalRateMs: 0, onGround: false } as AviationTrack["position"],
    registration: "HA-LXP", typeCode: "A321", model: "A321",
    operator: "Wizz Air", operatorIcao: "WZZ", operatorCountry: "HU",
    countryOfRegistration: "HU", squawk: "5521",
    title: { en: "WZZ7320 (A321)", uk: "WZZ7320 (A321)" },
    capturedAt: new Date(now - 60_000).toISOString(), regionCode: "UA-21",
  }),
  mkTrack({
    icao24: "3c6a01", callsign: "GAF123", lat: 49.20, lon: 28.50, category: "military",
    position: { baroAltitudeM: 8800, headingDeg: 60, velocityMs: 190, verticalRateMs: 0, onGround: false } as AviationTrack["position"],
    registration: null, typeCode: "E3TF", model: "E-3 Sentry AWACS",
    operator: null, operatorIcao: null, operatorCountry: "DE",
    countryOfRegistration: "DE", squawk: "7700",
    militaryEstimate: { value: true, confidence: 0.9 }, emergency: "general",
    title: { en: "AWACS (est. military, emergency)", uk: "AWACS (ймовірно військовий, аварія)" },
    capturedAt: new Date(now - 15_000).toISOString(), regionCode: "UA-05",
  }),
  // Private aircraft — redacted by default.
  mkTrack({
    icao24: "a00501", callsign: "N512JS", lat: 50.50, lon: 30.60, category: "private",
    position: { baroAltitudeM: 3000, headingDeg: 180, velocityMs: 120, verticalRateMs: -1, onGround: false } as AviationTrack["position"],
    registration: "N512JS", typeCode: "C25C", model: "Citation CJ4",
    operator: null, operatorIcao: null, operatorCountry: "US",
    countryOfRegistration: "US", squawk: "1200",
    title: { en: "N512JS (Citation CJ4)", uk: "N512JS (Citation CJ4)" },
    capturedAt: new Date(now - 25_000).toISOString(), regionCode: "UA-32",
  }),
];

// ── Privacy redaction (mirrors integrations/adsb privacy.ts policy) ─────────────

function isPIA(icao24: string): boolean {
  const n = parseInt(icao24, 16);
  return !Number.isNaN(n) && n >= 0xa00000 && n <= 0xa00fff;
}

function redact(track: AviationTrack): AviationTrack {
  // Public-interest categories never redacted.
  if (track.category === "military" || track.category === "cargo") return track;
  if (track.militaryEstimate?.value) return track;
  if (track.emergency) return track;
  const mustRedact = track.category === "private" || isPIA(track.icao24);
  if (!mustRedact) return track;
  return {
    ...track,
    callsign: null,
    registration: null,
    typeCode: null,
    model: null,
    operator: null,
    operatorIcao: null,
    countryOfRegistration: null,
    squawk: null,
    position: {
      ...track.position,
      lat: Math.round(track.position.lat * 100) / 100,
      lon: Math.round(track.position.lon * 100) / 100,
    },
    redacted: true,
    title: { en: "Private aircraft (redacted)", uk: "Приватне судно (приховано)" },
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:aviation:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const categoryFilter = url.searchParams.get("category") as AircraftCategory | null;
  const typeFilter = url.searchParams.get("type");
  const operatorFilter = url.searchParams.get("operator");
  const countryFilter = url.searchParams.get("country");
  const minAlt = url.searchParams.get("minAltitude") ? parseFloat(url.searchParams.get("minAltitude")!) : -Infinity;
  const maxAlt = url.searchParams.get("maxAltitude") ? parseFloat(url.searchParams.get("maxAltitude")!) : Infinity;
  const militaryOnly = url.searchParams.get("militaryOnly") === "true";
  const includeRedacted = url.searchParams.get("includeRedacted") === "true";

  // Apply privacy redaction first, then drop redacted tracks unless requested.
  let tracks = DEMO_TRACKS.map(redact);
  if (!includeRedacted) tracks = tracks.filter((t) => !t.redacted);

  if (regionFilter) tracks = tracks.filter((t) => t.regionCode === regionFilter);
  if (categoryFilter) tracks = tracks.filter((t) => t.category === categoryFilter);
  if (typeFilter) tracks = tracks.filter((t) => (t.typeCode ?? "").toUpperCase() === typeFilter.toUpperCase());
  if (operatorFilter) {
    const f = operatorFilter.toLowerCase();
    tracks = tracks.filter(
      (t) => (t.operatorIcao ?? "").toLowerCase() === f || (t.operator ?? "").toLowerCase().includes(f),
    );
  }
  if (countryFilter) tracks = tracks.filter((t) => (t.countryOfRegistration ?? "").toUpperCase() === countryFilter.toUpperCase());
  if (militaryOnly) tracks = tracks.filter((t) => t.militaryEstimate?.value === true);
  if (minAlt !== -Infinity || maxAlt !== Infinity) {
    tracks = tracks.filter((t) => {
      const a = t.position.baroAltitudeM;
      if (a == null) return false;
      return a >= minAlt && a <= maxAlt;
    });
  }

  const categories: AircraftCategory[] = ["military", "cargo", "passenger", "helicopter", "private", "drone", "unknown"];
  const meta = {
    total: tracks.length,
    byCategory: Object.fromEntries(categories.map((c) => [c, tracks.filter((t) => t.category === c).length])),
    estimatedMilitary: tracks.filter((t) => t.militaryEstimate?.value).length,
    redactedHidden: !includeRedacted,
    facets: {
      type: Array.from(new Set(tracks.map((t) => t.typeCode).filter(Boolean))),
      operator: Array.from(new Set(tracks.map((t) => t.operatorIcao).filter(Boolean))),
      country: Array.from(new Set(tracks.map((t) => t.countryOfRegistration).filter(Boolean))),
    },
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: tracks, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=30",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
