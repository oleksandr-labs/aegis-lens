/**
 * GET /api/layers/thermal — thermal anomaly layer (FIRMS / Sentinel-3 / Landsat)
 *
 * Surfaces fire hotspots, industrial heat signatures, and anomalies
 * from satellite infrared bands.
 *
 * Query params:
 *   region        — ISO 3166-2 oblast code
 *   type          — fire | industrial | vehicle | unknown (default: all)
 *   from          — ISO-8601
 *   to            — ISO-8601
 *   minIntensity  — 0–1
 *   source        — firms | sentinel3 | landsat (default: all)
 *
 * Cache: 1800s (satellite passes every 6–12 hours)
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type ThermalAnomalyType = "fire" | "industrial" | "vehicle" | "unknown";
type ThermalSource = "firms" | "sentinel3" | "landsat";

interface ThermalAnomaly {
  anomalyId: string;
  type: ThermalAnomalyType;
  source: ThermalSource;
  lat: number;
  lon: number;
  country: string;
  regionCode?: string;
  /** Satellite acquisition time (UTC) */
  acquiredAt: string;
  /** Brightness temperature in Kelvin */
  brightnessK?: number;
  /** Normalised fire radiative power (0–1) */
  frpNorm?: number;
  /** 0–1 confidence from FIRMS algorithm */
  confidence: number;
  /** Is this above the 7-day baseline for this pixel? */
  isAnomaly: boolean;
  /** Ratio vs 7-day baseline brightness */
  vsBaseline?: number;
  /** Likely cause classification */
  likelyCause?: string;
  titleEn?: string;
  titleUk?: string;
}

const DEMO_ANOMALIES: ThermalAnomaly[] = [
  {
    anomalyId: "thermal-001",
    type: "fire",
    source: "firms",
    lat: 49.95,
    lon: 36.35,
    country: "UA",
    regionCode: "UA-63",
    acquiredAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    brightnessK: 340,
    frpNorm: 0.78,
    confidence: 0.88,
    isAnomaly: true,
    vsBaseline: 3.2,
    likelyCause: "infrastructure_fire_post_strike",
    titleEn: "High thermal anomaly — Kharkiv, possible post-strike fire",
    titleUk: "Висока теплова аномалія — Харків, можлива пожежа після удару",
  },
  {
    anomalyId: "thermal-002",
    type: "fire",
    source: "firms",
    lat: 47.88,
    lon: 33.43,
    country: "UA",
    regionCode: "UA-12",
    acquiredAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    brightnessK: 365,
    frpNorm: 0.91,
    confidence: 0.92,
    isAnomaly: true,
    vsBaseline: 4.5,
    likelyCause: "large_fire",
    titleEn: "Large fire detected, Dnipropetrovsk Oblast",
    titleUk: "Виявлено велику пожежу, Дніпропетровська область",
  },
  {
    anomalyId: "thermal-003",
    type: "industrial",
    source: "landsat",
    lat: 48.46,
    lon: 35.04,
    country: "UA",
    regionCode: "UA-12",
    acquiredAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    brightnessK: 310,
    frpNorm: 0.35,
    confidence: 0.75,
    isAnomaly: false,
    vsBaseline: 1.05,
    likelyCause: "steelworks",
    titleEn: "Industrial thermal signature — steelworks, Dnipro",
    titleUk: "Промислова теплова сигнатура — металургійний завод, Дніпро",
  },
  {
    anomalyId: "thermal-004",
    type: "fire",
    source: "sentinel3",
    lat: 46.65,
    lon: 32.61,
    country: "UA",
    regionCode: "UA-65",
    acquiredAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    brightnessK: 325,
    frpNorm: 0.55,
    confidence: 0.8,
    isAnomaly: true,
    vsBaseline: 2.1,
    likelyCause: "ground_fire",
    titleEn: "Thermal anomaly — Kherson Oblast",
    titleUk: "Теплова аномалія — Херсонська область",
  },
  {
    anomalyId: "thermal-005",
    type: "fire",
    source: "firms",
    lat: 50.01,
    lon: 37.89,
    country: "UA",
    regionCode: "UA-63",
    acquiredAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    brightnessK: 355,
    frpNorm: 0.82,
    confidence: 0.9,
    isAnomaly: true,
    vsBaseline: 3.8,
    likelyCause: "post_strike_fire",
    titleEn: "Post-strike fire thermal signature, northeast Kharkiv Oblast",
    titleUk: "Теплова сигнатура пожежі після удару, північ Харківської області",
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:thermal:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const typeFilter = url.searchParams.get("type") as ThermalAnomalyType | null;
  const sourceFilter = url.searchParams.get("source") as ThermalSource | null;
  const fromMs = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!).getTime() : 0;
  const toMs = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!).getTime() : Infinity;
  const minIntensity = parseFloat(url.searchParams.get("minIntensity") ?? "0");

  let anomalies = DEMO_ANOMALIES.filter((a) => {
    const t = new Date(a.acquiredAt).getTime();
    return t >= fromMs && t <= toMs;
  });

  if (regionFilter) anomalies = anomalies.filter((a) => a.regionCode === regionFilter);
  if (typeFilter) anomalies = anomalies.filter((a) => a.type === typeFilter);
  if (sourceFilter) anomalies = anomalies.filter((a) => a.source === sourceFilter);
  if (minIntensity > 0) anomalies = anomalies.filter((a) => (a.frpNorm ?? 0) >= minIntensity);

  const meta = {
    total: anomalies.length,
    anomalyCount: anomalies.filter((a) => a.isAnomaly).length,
    byType: {
      fire: anomalies.filter((a) => a.type === "fire").length,
      industrial: anomalies.filter((a) => a.type === "industrial").length,
      vehicle: anomalies.filter((a) => a.type === "vehicle").length,
      unknown: anomalies.filter((a) => a.type === "unknown").length,
    },
    generatedAt: new Date().toISOString(),
    isDemo: true,
    note: "Coarse resolution — do not over-interpret individual pixels.",
  };

  return NextResponse.json(
    { data: anomalies, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
