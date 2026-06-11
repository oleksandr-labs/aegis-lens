/**
 * GET /api/layers/civilian-alerts — current active air-raid alerts
 *
 * Returns the active alert snapshot for all Ukrainian oblasts.
 * In production, backed by the UkraineAlarmClient polling worker.
 * Latency budget: < 5s end-to-end.
 *
 * Cache: 30s (aligned to poll interval).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type OblastCode = string;
type AlertType = "air_raid" | "artillery" | "urban_fighting" | "chemical" | "nuclear" | "info";

interface OblastInfo {
  code: OblastCode;
  nameUk: string;
  nameEn: string;
  center: [number, number];
  population: number;
}

interface ActiveAlert {
  alertId: string;
  oblastCode: OblastCode;
  oblastInfo: OblastInfo;
  type: AlertType;
  status: "active";
  startedAt: string;
  description: { en: string; uk: string };
  source: string;
}

const OBLASTS: Record<OblastCode, OblastInfo> = {
  "UA-63": { code: "UA-63", nameUk: "Харківська",       nameEn: "Kharkiv",        center: [36.23, 49.99], population: 2700000 },
  "UA-14": { code: "UA-14", nameUk: "Донецька",         nameEn: "Donetsk",        center: [37.80, 48.01], population: 4200000 },
  "UA-09": { code: "UA-09", nameUk: "Луганська",        nameEn: "Luhansk",        center: [38.92, 48.57], population: 2200000 },
  "UA-23": { code: "UA-23", nameUk: "Запорізька",       nameEn: "Zaporizhzhia",   center: [35.17, 47.84], population: 1770000 },
  "UA-65": { code: "UA-65", nameUk: "Херсонська",       nameEn: "Kherson",        center: [32.61, 46.64], population: 1070000 },
  "UA-51": { code: "UA-51", nameUk: "Одеська",          nameEn: "Odesa",          center: [30.74, 46.49], population: 2400000 },
  "UA-48": { code: "UA-48", nameUk: "Миколаївська",     nameEn: "Mykolaiv",       center: [31.99, 47.05], population: 1160000 },
  "UA-12": { code: "UA-12", nameUk: "Дніпропетровська", nameEn: "Dnipropetrovsk", center: [35.04, 48.46], population: 3200000 },
  "UA-59": { code: "UA-59", nameUk: "Сумська",          nameEn: "Sumy",           center: [34.80, 51.02], population: 1080000 },
  "UA-74": { code: "UA-74", nameUk: "Чернігівська",     nameEn: "Chernihiv",      center: [31.29, 51.50], population: 1000000 },
  "UA-30": { code: "UA-30", nameUk: "Київ",             nameEn: "Kyiv city",      center: [30.52, 50.45], population: 2900000 },
  "UA-32": { code: "UA-32", nameUk: "Київська",         nameEn: "Kyiv oblast",    center: [30.57, 50.07], population: 1800000 },
  "UA-46": { code: "UA-46", nameUk: "Львівська",        nameEn: "Lviv",           center: [24.03, 49.84], population: 2500000 },
};

// Demo snapshot — in production populated by background poll worker
const DEMO_ALERTS: ActiveAlert[] = [
  {
    alertId: "demo-kharkiv-air-001",
    oblastCode: "UA-63",
    oblastInfo: OBLASTS["UA-63"]!,
    type: "air_raid",
    status: "active",
    startedAt: new Date(Date.now() - 1800_000).toISOString(),
    source: "ukrainealarm.com (demo)",
    description: {
      en: "Air raid alert active in Kharkiv Oblast",
      uk: "Повітряна тривога у Харківській обл.",
    },
  },
  {
    alertId: "demo-sumy-air-001",
    oblastCode: "UA-59",
    oblastInfo: OBLASTS["UA-59"]!,
    type: "air_raid",
    status: "active",
    startedAt: new Date(Date.now() - 600_000).toISOString(),
    source: "ukrainealarm.com (demo)",
    description: {
      en: "Air raid alert active in Sumy Oblast",
      uk: "Повітряна тривога у Сумській обл.",
    },
  },
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:civilian-alerts:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const oblast = url.searchParams.get("oblast");

  let alerts = DEMO_ALERTS;
  if (oblast) {
    alerts = alerts.filter((a) => a.oblastCode === oblast);
  }

  const activeOblastCodes = [...new Set(alerts.map((a) => a.oblastCode))];

  return NextResponse.json(
    {
      data: alerts,
      meta: {
        activeCount: alerts.length,
        activeOblasts: activeOblastCodes,
        fetchedAt: new Date().toISOString(),
        isDemo: true,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
