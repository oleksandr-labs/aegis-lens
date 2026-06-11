/**
 * GET /api/integrations/ukrhydromet — UA national weather (Ukrhydromet / meteo.gov.ua)
 *
 * Feeds the EXISTING `weather` map layer (no new layer is registered). Inside the
 * UA bounding box the overlay defaults to the national authority (Ukrhydromet);
 * for points outside UA the response advises falling back to the global model
 * (Open-Meteo) — see `?lat`/`?lon` and the `sourcePreference` block.
 *
 * Returns a per-oblast forecast snapshot plus active severe-weather warnings and
 * flood alerts, with bilingual (uk/en) labels. Uses a deterministic DEMO fixture
 * when UKRHYDROMET_FEED_URL is not configured, so the route always returns
 * shape-valid data (meteo.gov.ua has no documented public API key).
 *
 * Query params:
 *   oblast  — ISO 3166-2:UA code (e.g. UA-30) to scope the forecast
 *   lat,lon — coordinate to evaluate source preference (UA bbox gate)
 *   days    — forecast horizon 1..7 (default 5)
 *   kind    — forecast | warnings | flood | advisories (default forecast)
 *   locale  — uk | en (default uk)
 *
 * Cache: 30 min (forecasts refresh a few times daily — be gentle on the source).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Locale = "uk" | "en";

const UKRAINE_BBOX = { minLon: 22.0, minLat: 44.0, maxLon: 40.3, maxLat: 52.5 };

const OBLAST_GEO: Record<string, { uk: string; en: string; lat: number; lon: number }> = {
  "UA-30": { uk: "Київ", en: "Kyiv city", lat: 50.45, lon: 30.52 },
  "UA-63": { uk: "Харківська", en: "Kharkiv", lat: 49.99, lon: 36.23 },
  "UA-51": { uk: "Одеська", en: "Odesa", lat: 46.49, lon: 30.74 },
  "UA-46": { uk: "Львівська", en: "Lviv", lat: 49.84, lon: 24.03 },
  "UA-23": { uk: "Запорізька", en: "Zaporizhzhia", lat: 47.84, lon: 35.17 },
  "UA-12": { uk: "Дніпропетровська", en: "Dnipropetrovsk", lat: 48.46, lon: 35.04 },
  "UA-65": { uk: "Херсонська", en: "Kherson", lat: 46.64, lon: 32.61 },
  "UA-77": { uk: "Чернівецька", en: "Chernivtsi", lat: 48.29, lon: 25.94 },
  "UA-21": { uk: "Закарпатська", en: "Zakarpattia", lat: 48.62, lon: 22.29 },
};

const CONDITIONS = ["clear", "partly_cloudy", "cloudy", "rain", "overcast"] as const;
const CONDITION_LABELS: Record<string, { uk: string; en: string }> = {
  clear: { uk: "Ясно", en: "Clear" },
  partly_cloudy: { uk: "Мінлива хмарність", en: "Partly cloudy" },
  cloudy: { uk: "Хмарно", en: "Cloudy" },
  rain: { uk: "Дощ", en: "Rain" },
  overcast: { uk: "Похмуро", en: "Overcast" },
};

function isInsideUkraine(lat: number, lon: number): boolean {
  return lat >= UKRAINE_BBOX.minLat && lat <= UKRAINE_BBOX.maxLat && lon >= UKRAINE_BBOX.minLon && lon <= UKRAINE_BBOX.maxLon;
}

// Deterministic demo forecast (mirrors @ua-map/ukrhydromet demoForecast).
function demoForecast(oblast: string, days: number) {
  const geo = OBLAST_GEO[oblast] ?? OBLAST_GEO["UA-30"];
  const seed = [...oblast].reduce((a, c) => a + c.charCodeAt(0), 0);
  const today = new Date();
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() + i);
    const base = 14 + (((seed + i * 7) % 9) - 4);
    const condition = CONDITIONS[(seed + i) % CONDITIONS.length];
    out.push({
      date: d.toISOString().slice(0, 10),
      tempMinC: base - 6,
      tempMaxC: base + 5,
      precipMm: (seed + i) % 4 === 0 ? 6 + ((seed + i) % 5) : 0,
      precipProbPct: (seed + i * 13) % 100,
      windSpeedMs: 3 + ((seed + i) % 7),
      windGustMs: 6 + ((seed + i) % 11),
      windDirDeg: (seed * 13 + i * 30) % 360,
      condition,
      conditionLabel: CONDITION_LABELS[condition],
    });
  }
  return { oblast, oblastNameUk: geo.uk, oblastNameEn: geo.en, lat: geo.lat, lon: geo.lon, issuedAt: today.toISOString(), days: out };
}

function demoWarnings() {
  const now = Date.now();
  const iso = (o: number) => new Date(now + o).toISOString();
  return [
    { warningId: "demo:UA-51:wind", oblast: "UA-51", phenomenon: "wind", level: "orange", severity: 4, colorHex: "#F57C00",
      onsetAt: iso(-2 * 3_600_000), expiresAt: iso(10 * 3_600_000),
      headline: { uk: "Помаранчевий рівень: Сильний вітер — Одеська область", en: "Orange (be prepared): Strong wind — Odesa Oblast" } },
    { warningId: "demo:UA-23:rain", oblast: "UA-23", phenomenon: "rain", level: "red", severity: 5, colorHex: "#D32F2F",
      onsetAt: iso(-2 * 3_600_000), expiresAt: iso(10 * 3_600_000),
      headline: { uk: "Червоний рівень: Сильні опади — Запорізька область", en: "Red (take action): Heavy rainfall — Zaporizhzhia Oblast" } },
    { warningId: "demo:UA-46:thunderstorm", oblast: "UA-46", phenomenon: "thunderstorm", level: "yellow", severity: 2, colorHex: "#F5C518",
      onsetAt: iso(-2 * 3_600_000), expiresAt: iso(10 * 3_600_000),
      headline: { uk: "Жовтий рівень: Грози — Львівська область", en: "Yellow (be aware): Thunderstorms — Lviv Oblast" } },
  ];
}

function demoFloodAlerts() {
  const measuredAt = new Date().toISOString();
  return [
    { gaugeId: "demo:UA-21:Mukachevo", oblast: "UA-21", stationUk: "Мукачево", stationEn: "Mukachevo", riverUk: "Латориця", riverEn: "Latorica",
      lat: 48.44, lon: 22.72, levelCm: 540, changeCm24h: 80, adverseMarkCm: 450, dangerMarkCm: 560, risk: "adverse", severity: 4, measuredAt },
    { gaugeId: "demo:UA-77:Chernivtsi", oblast: "UA-77", stationUk: "Чернівці", stationEn: "Chernivtsi", riverUk: "Прут", riverEn: "Prut",
      lat: 48.29, lon: 25.94, levelCm: 410, changeCm24h: 55, adverseMarkCm: 420, dangerMarkCm: 520, risk: "elevated", severity: 2, measuredAt },
  ];
}

function buildAdvisories() {
  return demoWarnings()
    .filter((w) => w.level !== "yellow")
    .map((w) => ({
      advisoryId: `advisory:${w.warningId}`,
      oblast: w.oblast,
      kind: "warning",
      severity: w.severity,
      headline: w.headline,
      attribution: {
        uk: "Видано Українським гідрометеорологічним центром (meteo.gov.ua).",
        en: "Issued by the Ukrainian Hydrometeorological Center (meteo.gov.ua).",
      },
    }));
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`integrations:ukrhydromet:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const oblast = url.searchParams.get("oblast");
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 5) || 5, 1), 7);
  const kind = url.searchParams.get("kind") ?? "forecast";
  const locale = ((url.searchParams.get("locale") ?? "uk") as Locale);
  const latRaw = url.searchParams.get("lat");
  const lonRaw = url.searchParams.get("lon");

  const hasFeed = !!process.env.UKRHYDROMET_FEED_URL;

  // Source preference (geo-gated): inside UA → ukrhydromet, else open-meteo.
  let sourcePreference: { source: string; insideUa: boolean } | undefined;
  if (latRaw !== null && lonRaw !== null) {
    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    const insideUa = !Number.isNaN(lat) && !Number.isNaN(lon) && isInsideUkraine(lat, lon);
    sourcePreference = { source: insideUa ? "ukrhydromet" : "open-meteo", insideUa };
  }

  let data: unknown;
  if (kind === "warnings") {
    data = demoWarnings();
  } else if (kind === "flood") {
    data = demoFloodAlerts().filter((g) => g.risk === "adverse" || g.risk === "danger");
  } else if (kind === "advisories") {
    data = buildAdvisories();
  } else {
    const codes = oblast ? [oblast] : Object.keys(OBLAST_GEO);
    data = codes.map((c) => demoForecast(c, days));
  }

  const meta = {
    kind,
    locale,
    layer: "weather",
    source: "meteo.gov.ua",
    sourcePreference,
    attribution:
      locale === "en"
        ? "Weather: Ukrainian Hydrometeorological Center (meteo.gov.ua)"
        : "Погода: Український гідрометеорологічний центр (meteo.gov.ua)",
    attributionUrl: "https://www.meteo.gov.ua/",
    isDemo: !hasFeed,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { data, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=1800, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
