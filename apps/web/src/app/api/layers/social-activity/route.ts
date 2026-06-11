/**
 * GET /api/layers/social-activity — social media activity heatmap layer
 *
 * Aggregated social-signal intensity per region. No per-account data.
 *
 * Query params:
 *   region      — ISO 3166-2 oblast code
 *   platform    — telegram | twitter | youtube | reddit | all (default: all)
 *   language    — BCP-47 (e.g. "uk", "ru", "en")
 *   topic       — filter by detected topic slug
 *   from        — ISO-8601
 *   to          — ISO-8601
 *   minIntensity — 0–1 (minimum normalised intensity)
 *
 * Cache: 120s
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type SocialPlatform = "telegram" | "twitter" | "youtube" | "reddit";
type SocialTopic =
  | "air_alert"
  | "explosion_report"
  | "power_outage"
  | "military_movement"
  | "humanitarian"
  | "evacuation"
  | "ceasefire_rumor"
  | "other";

interface SocialRegionSignal {
  signalId: string;
  regionCode: string;
  regionName: string;
  /** Time bucket start (hourly) */
  bucketStart: string;
  platforms: SocialPlatform[];
  /** Dominant language(s) detected */
  languages: string[];
  topic: SocialTopic;
  /** 0–1 normalised against max activity in last 7 days */
  intensity: number;
  /** Posts per hour */
  postsPerHour: number;
  /** Ratio vs 7-day baseline (>1 = elevated) */
  vsBaseline: number;
  /** Post velocity trend: rising | stable | falling */
  velocityTrend: "rising" | "stable" | "falling";
  /** Source diversity: 1 = single channel, 1.0 = max diverse */
  sourceDiversityScore: number;
  /** Avg sentiment -1 to +1 */
  sentiment: number;
  /** Cross-reference: is there a verified event in this region/window? */
  linkedEventId?: string;
  lat: number;
  lon: number;
}

// Oblast centroids for demo data
const OBLAST_CENTROIDS: Record<string, { en: string; lat: number; lon: number }> = {
  "UA-63": { en: "Kharkiv", lat: 49.99, lon: 36.23 },
  "UA-30": { en: "Kyiv City", lat: 50.45, lon: 30.52 },
  "UA-14": { en: "Donetsk", lat: 48.0, lon: 37.8 },
  "UA-23": { en: "Zaporizhzhia", lat: 47.84, lon: 35.14 },
  "UA-65": { en: "Kherson", lat: 46.65, lon: 32.61 },
  "UA-48": { en: "Mykolaiv", lat: 46.97, lon: 31.99 },
  "UA-51": { en: "Odesa", lat: 46.48, lon: 30.73 },
  "UA-46": { en: "Lviv", lat: 49.84, lon: 24.02 },
  "UA-12": { en: "Dnipropetrovsk", lat: 48.46, lon: 35.04 },
  "UA-59": { en: "Sumy", lat: 50.91, lon: 34.8 },
};

function buildDemoSignals(): SocialRegionSignal[] {
  const now = Date.now();
  const hourMs = 3600_000;
  const signals: SocialRegionSignal[] = [];
  let i = 0;

  // Simulate hourly buckets for the last 6 hours across several oblasts
  const REGION_ACTIVITY: Array<{
    regionCode: string;
    topic: SocialTopic;
    intensity: number;
    vsBaseline: number;
    trend: "rising" | "stable" | "falling";
    platforms: SocialPlatform[];
    sentiment: number;
    linkedEventId?: string;
  }> = [
    { regionCode: "UA-63", topic: "air_alert", intensity: 0.92, vsBaseline: 4.5, trend: "rising", platforms: ["telegram", "twitter"], sentiment: -0.7, linkedEventId: "drone-003" },
    { regionCode: "UA-30", topic: "air_alert", intensity: 0.78, vsBaseline: 3.2, trend: "stable", platforms: ["telegram"], sentiment: -0.6, linkedEventId: "drone-001" },
    { regionCode: "UA-14", topic: "explosion_report", intensity: 0.85, vsBaseline: 5.1, trend: "rising", platforms: ["telegram", "twitter"], sentiment: -0.8 },
    { regionCode: "UA-23", topic: "explosion_report", intensity: 0.65, vsBaseline: 2.8, trend: "stable", platforms: ["telegram"], sentiment: -0.6, linkedEventId: "missile-004" },
    { regionCode: "UA-65", topic: "humanitarian", intensity: 0.45, vsBaseline: 1.3, trend: "stable", platforms: ["telegram", "twitter", "youtube"], sentiment: -0.3 },
    { regionCode: "UA-48", topic: "power_outage", intensity: 0.55, vsBaseline: 2.1, trend: "falling", platforms: ["telegram"], sentiment: -0.5 },
    { regionCode: "UA-46", topic: "air_alert", intensity: 0.7, vsBaseline: 2.9, trend: "rising", platforms: ["telegram", "twitter"], sentiment: -0.65, linkedEventId: "missile-001" },
    { regionCode: "UA-12", topic: "power_outage", intensity: 0.4, vsBaseline: 1.6, trend: "stable", platforms: ["telegram"], sentiment: -0.4 },
    { regionCode: "UA-59", topic: "military_movement", intensity: 0.5, vsBaseline: 1.8, trend: "rising", platforms: ["telegram"], sentiment: -0.5 },
    { regionCode: "UA-51", topic: "air_alert", intensity: 0.35, vsBaseline: 1.4, trend: "stable", platforms: ["telegram"], sentiment: -0.45 },
  ];

  for (const act of REGION_ACTIVITY) {
    const centroid = OBLAST_CENTROIDS[act.regionCode];
    if (!centroid) continue;
    signals.push({
      signalId: `social-${i++}`,
      regionCode: act.regionCode,
      regionName: centroid.en,
      bucketStart: new Date(Math.floor(now / hourMs) * hourMs).toISOString(),
      platforms: act.platforms,
      languages: act.regionCode === "UA-46" ? ["uk"] : ["uk", "ru"],
      topic: act.topic,
      intensity: act.intensity,
      postsPerHour: Math.round(act.intensity * 800),
      vsBaseline: act.vsBaseline,
      velocityTrend: act.trend,
      sourceDiversityScore: parseFloat((act.platforms.length / 4).toFixed(2)),
      sentiment: act.sentiment,
      linkedEventId: act.linkedEventId,
      lat: centroid.lat,
      lon: centroid.lon,
    });
  }

  return signals.sort((a, b) => b.intensity - a.intensity);
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:social-activity:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const platformFilter = url.searchParams.get("platform");
  const languageFilter = url.searchParams.get("language");
  const topicFilter = url.searchParams.get("topic") as SocialTopic | null;
  const minIntensity = parseFloat(url.searchParams.get("minIntensity") ?? "0");

  let signals = buildDemoSignals();

  if (regionFilter) signals = signals.filter((s) => s.regionCode === regionFilter);
  if (platformFilter && platformFilter !== "all") {
    signals = signals.filter((s) => s.platforms.includes(platformFilter as SocialPlatform));
  }
  if (languageFilter) signals = signals.filter((s) => s.languages.includes(languageFilter));
  if (topicFilter) signals = signals.filter((s) => s.topic === topicFilter);
  if (minIntensity > 0) signals = signals.filter((s) => s.intensity >= minIntensity);

  const meta = {
    total: signals.length,
    topTopic: signals[0]?.topic ?? null,
    avgIntensity: signals.length > 0
      ? parseFloat((signals.reduce((s, r) => s + r.intensity, 0) / signals.length).toFixed(2))
      : 0,
    elevatedRegions: signals.filter((s) => s.vsBaseline > 2).length,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: signals, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=240",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
