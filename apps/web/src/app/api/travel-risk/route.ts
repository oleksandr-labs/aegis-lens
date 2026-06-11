import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  scoreMilitaryDimension,
  scoreInfrastructureDimension,
  scoreWeatherDimension,
  computeCompositeRisk,
  generateAdvisoryText,
} from "@ua-map/travel-risk";
import { listEvents } from "@/lib/events-seed";

export const dynamic = "force-dynamic";

// Known cities with coordinates
const CITIES: Record<string, { name: string; nameUk: string; lat: number; lon: number }> = {
  kyiv: { name: "Kyiv", nameUk: "Київ", lat: 50.45, lon: 30.52 },
  kharkiv: { name: "Kharkiv", nameUk: "Харків", lat: 49.99, lon: 36.23 },
  odesa: { name: "Odesa", nameUk: "Одеса", lat: 46.48, lon: 30.74 },
  dnipro: { name: "Dnipro", nameUk: "Дніпро", lat: 48.46, lon: 35.05 },
  zaporizhzhia: { name: "Zaporizhzhia", nameUk: "Запоріжжя", lat: 47.84, lon: 35.14 },
  kherson: { name: "Kherson", nameUk: "Херсон", lat: 46.64, lon: 32.62 },
  lviv: { name: "Lviv", nameUk: "Львів", lat: 49.84, lon: 24.03 },
  mykolaiv: { name: "Mykolaiv", nameUk: "Миколаїв", lat: 46.97, lon: 31.99 },
  sumy: { name: "Sumy", nameUk: "Суми", lat: 50.91, lon: 34.80 },
  chernihiv: { name: "Chernihiv", nameUk: "Чернігів", lat: 51.50, lon: 31.29 },
};

/**
 * GET /api/travel-risk?city=kyiv
 *
 * Returns composite risk index for the requested city.
 * Uses live event data to compute military + infrastructure + weather dimensions.
 */
export async function GET(req: Request) {
  const ipKey = `travel-risk:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const url = new URL(req.url);
  const citySlug = url.searchParams.get("city")?.toLowerCase().trim();

  const baseHeaders = {
    "Cache-Control": "public, max-age=600, stale-while-revalidate=1200",
    "Access-Control-Allow-Origin": "*",
    ...rateLimitHeaders(rl),
  };

  if (!citySlug) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Query parameter 'city' is required.",
        availableCities: Object.keys(CITIES),
      },
      { status: 400, headers: { ...baseHeaders, "Cache-Control": "no-store" } },
    );
  }

  const city = CITIES[citySlug];
  if (!city) {
    return NextResponse.json(
      {
        error: "not_found",
        message: `City '${citySlug}' not found.`,
        availableCities: Object.keys(CITIES),
      },
      { status: 404, headers: { ...baseHeaders, "Cache-Control": "no-store" } },
    );
  }

  // Build risk signals from recent events (last 30 days)
  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const events = listEvents().filter((e) => e.occurredAt >= cutoff && e.location);

  const signals = events.map((e) => ({
    sourceId: e.sources?.[0]?.url ?? "unknown",
    lat: e.location!.lat,
    lon: e.location!.lon,
    severity: e.severity ?? 1,
    class: e.class,
    occurredAt: e.occurredAt,
    radiusKm: e.location!.precisionM ? e.location!.precisionM / 1000 : 5,
  }));

  const militaryDim = scoreMilitaryDimension(city.lat, city.lon, signals);
  const infraDim = scoreInfrastructureDimension(city.lat, city.lon, signals);
  const weatherDim = scoreWeatherDimension(signals);

  const dimensions = {
    militaryActivity: militaryDim,
    infrastructure: infraDim,
    civilUnrest: { name: "civilUnrest", score: 0, weight: 0.15, signals: [] },
    weather: weatherDim,
    accessibility: { name: "accessibility", score: 10, weight: 0.10, signals: [] },
  };

  const composite = computeCompositeRisk(dimensions);
  const advisory = generateAdvisoryText(city.name, composite, dimensions);

  return NextResponse.json(
    {
      data: {
        cityId: citySlug,
        cityName: city.name,
        cityNameUk: city.nameUk,
        countryCode: "UA",
        lat: city.lat,
        lon: city.lon,
        composite,
        dimensions,
        advisoryText: advisory,
        updatedAt: new Date().toISOString(),
      },
    },
    { headers: baseHeaders },
  );
}
