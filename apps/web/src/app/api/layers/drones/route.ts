/**
 * GET /api/layers/drones — drone / UAV activity layer
 *
 * Query params:
 *   region        — ISO 3166-2 oblast code (e.g. "UA-63")
 *   subtype       — launch | sighting | intercept | debris | swarm | recon
 *   model         — drone model filter (e.g. "shahed_136")
 *   operator      — ru_armed_forces | ua_armed_forces | ua_volunteer | unknown
 *   minSeverity   — 1–5
 *   from          — ISO-8601 start time
 *   to            — ISO-8601 end time
 *   missionId     — filter to a specific mission
 *   verified      — "true" returns only verified events
 *
 * Cache: 30s (drone events are near-real-time)
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types (inlined to avoid transpile issues) ────────────────────────────────

type DroneSubtype = "launch" | "sighting" | "intercept" | "debris" | "swarm" | "recon";
type DroneModel =
  | "shahed_136" | "shahed_131" | "lancet_3" | "lancet_1"
  | "orlan_10" | "orlan_30" | "bayraktar_tb2" | "fpv_kamikaze"
  | "mavic" | "rb_341_forpost" | "zala" | "mugin_5" | "eleron_3" | "unknown";
type DroneOperator = "ru_armed_forces" | "ua_armed_forces" | "ua_volunteer" | "unknown";

interface DroneEvent {
  eventId: string;
  subtype: DroneSubtype;
  lat?: number;
  lon?: number;
  occurredAt: string;
  model?: { value: DroneModel; confidence: number; sourceCount: number };
  operator?: { value: DroneOperator; confidence: number; sourceCount: number };
  interceptSuccessful?: boolean;
  swarmSize?: number;
  missionId?: string;
  country: string;
  regionCode?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  titleEn?: string;
  titleUk?: string;
  summaryEn?: string;
  summaryUk?: string;
  sourceUrls?: string[];
  verificationState: string;
  isPublic: boolean;
}

// ── Demo data ────────────────────────────────────────────────────────────────

const DEMO_EVENTS: DroneEvent[] = [
  {
    eventId: "drone-001",
    subtype: "sighting",
    lat: 50.45,
    lon: 30.52,
    occurredAt: new Date(Date.now() - 3600_000).toISOString(),
    model: { value: "shahed_136", confidence: 0.9, sourceCount: 3 },
    operator: { value: "ru_armed_forces", confidence: 0.8, sourceCount: 2 },
    country: "UA",
    regionCode: "UA-30",
    severity: 5,
    confidence: 0.82,
    titleEn: "Shahed-136 sighting over Kyiv Oblast",
    titleUk: "Помічено Shahed-136 над Київською областю",
    summaryEn: "Multiple Shahed-136 loitering munitions heading toward Kyiv. Air defence on alert.",
    summaryUk: "Кілька ударних дронів Shahed-136 у напрямку Києва. Оголошено повітряну тривогу.",
    sourceUrls: ["https://t.me/kpszsu"],
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "drone-002",
    subtype: "intercept",
    lat: 50.41,
    lon: 30.67,
    occurredAt: new Date(Date.now() - 1800_000).toISOString(),
    model: { value: "shahed_136", confidence: 0.9, sourceCount: 3 },
    operator: { value: "ru_armed_forces", confidence: 0.8, sourceCount: 2 },
    interceptSuccessful: true,
    missionId: "mission-001",
    country: "UA",
    regionCode: "UA-30",
    severity: 2,
    confidence: 0.88,
    titleEn: "Shahed-136 intercepted east of Kyiv",
    titleUk: "Shahed-136 збитий на схід від Києва",
    summaryEn: "Ukrainian air defence intercepted a Shahed-136 east of Kyiv.",
    summaryUk: "Українська ППО збила Shahed-136 на схід від Києва.",
    sourceUrls: ["https://t.me/kpszsu"],
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "drone-003",
    subtype: "swarm",
    lat: 49.99,
    lon: 36.23,
    occurredAt: new Date(Date.now() - 7200_000).toISOString(),
    model: { value: "shahed_136", confidence: 0.85, sourceCount: 5 },
    operator: { value: "ru_armed_forces", confidence: 0.82, sourceCount: 4 },
    swarmSize: 14,
    country: "UA",
    regionCode: "UA-63",
    severity: 5,
    confidence: 0.85,
    titleEn: "Drone swarm (14 units) targeting Kharkiv",
    titleUk: "Рій дронів (14 одиниць) у напрямку Харкова",
    summaryEn: "Wave of 14 Shahed-136 drones detected heading toward Kharkiv Oblast.",
    summaryUk: "Зафіксовано 14 дронів Shahed-136 у напрямку Харківської області.",
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "drone-004",
    subtype: "launch",
    lat: 50.2,
    lon: 36.9,
    occurredAt: new Date(Date.now() - 9000_000).toISOString(),
    model: { value: "shahed_136", confidence: 0.75, sourceCount: 2 },
    operator: { value: "ru_armed_forces", confidence: 0.75, sourceCount: 2 },
    country: "UA",
    regionCode: "UA-63",
    severity: 5,
    confidence: 0.75,
    titleEn: "Drone launch detected near Kharkiv direction",
    titleUk: "Зафіксовано пуск дрона у напрямку Харкова",
    summaryEn: "Reports indicate a drone launch in the direction of Kharkiv from the eastern direction.",
    summaryUk: "Надходять повідомлення про пуск дрона в напрямку Харкова зі сходу.",
    verificationState: "in_review",
    isPublic: true,
  },
  {
    eventId: "drone-005",
    subtype: "recon",
    lat: 48.46,
    lon: 35.04,
    occurredAt: new Date(Date.now() - 5400_000).toISOString(),
    model: { value: "orlan_10", confidence: 0.8, sourceCount: 2 },
    operator: { value: "ru_armed_forces", confidence: 0.75, sourceCount: 1 },
    country: "UA",
    regionCode: "UA-23",
    severity: 2,
    confidence: 0.78,
    titleEn: "Orlan-10 reconnaissance drone observed, Zaporizhzhia",
    titleUk: "Розвідувальний дрон Orlan-10 помічено над Запоріжжям",
    summaryEn: "Orlan-10 reconnaissance drone observed conducting surveillance over Zaporizhzhia region.",
    summaryUk: "Розвідувальний дрон Orlan-10 помічено під час спостереження над Запорізькою областю.",
    verificationState: "verified",
    isPublic: true,
  },
];

// ── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:drones:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const subtypeFilter = url.searchParams.get("subtype") as DroneSubtype | null;
  const modelFilter = url.searchParams.get("model");
  const operatorFilter = url.searchParams.get("operator") as DroneOperator | null;
  const minSev = parseInt(url.searchParams.get("minSeverity") ?? "1", 10);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const missionId = url.searchParams.get("missionId");
  const verifiedOnly = url.searchParams.get("verified") === "true";

  const fromMs = fromParam ? new Date(fromParam).getTime() : 0;
  const toMs = toParam ? new Date(toParam).getTime() : Infinity;

  let events = DEMO_EVENTS.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= fromMs && t <= toMs;
  });

  if (regionFilter) events = events.filter((e) => e.regionCode === regionFilter);
  if (subtypeFilter) events = events.filter((e) => e.subtype === subtypeFilter);
  if (modelFilter) events = events.filter((e) => e.model?.value === modelFilter);
  if (operatorFilter) events = events.filter((e) => e.operator?.value === operatorFilter);
  if (minSev > 1) events = events.filter((e) => e.severity >= minSev);
  if (missionId) events = events.filter((e) => e.missionId === missionId);
  if (verifiedOnly) events = events.filter((e) => e.verificationState === "verified");

  const meta = {
    total: events.length,
    bySubtype: {
      launch: events.filter((e) => e.subtype === "launch").length,
      sighting: events.filter((e) => e.subtype === "sighting").length,
      intercept: events.filter((e) => e.subtype === "intercept").length,
      debris: events.filter((e) => e.subtype === "debris").length,
      swarm: events.filter((e) => e.subtype === "swarm").length,
      recon: events.filter((e) => e.subtype === "recon").length,
    },
    swarmTotal: events.reduce((sum, e) => sum + (e.swarmSize ?? 1), 0),
    interceptRate: events.length > 0
      ? parseFloat((events.filter((e) => e.subtype === "intercept" && e.interceptSuccessful).length / events.length).toFixed(2))
      : 0,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: events, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
