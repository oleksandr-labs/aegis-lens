/**
 * GET /api/layers/missiles — missile / ballistic / cruise weapon layer
 *
 * Query params:
 *   region        — ISO 3166-2 oblast code
 *   subtype       — ballistic | cruise | hypersonic | air_launched | atgm | mlrs | anti_radiation
 *   substatus     — launched | in_flight | intercepted | impact | unconfirmed
 *   model         — missile model (e.g. "kh_101")
 *   targetType    — energy_infrastructure | military_base | industrial | residential | ...
 *   minSeverity   — 1–5
 *   from          — ISO-8601
 *   to            — ISO-8601
 *   salvoId       — filter to a specific salvo
 *   verified      — "true" = verified only
 *
 * Cache: 60s (missiles update less frequently than drones)
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────────

type MissileSubtype = "ballistic" | "cruise" | "hypersonic" | "air_launched" | "atgm" | "mlrs" | "anti_radiation";
type MissileSubstatus = "launched" | "in_flight" | "intercepted" | "impact" | "unconfirmed";
type TargetType = "energy_infrastructure" | "military_base" | "industrial" | "residential" | "transport_hub" | "command_control" | "air_defense" | "unknown";
type MissileModel =
  | "iskander_m" | "iskander_k" | "kalibr" | "kh_101" | "kh_55" | "kh_22"
  | "kh_47_kinzhal" | "kh_31p" | "tochka_u" | "s_300_surface"
  | "himars_m31" | "himars_atacms" | "storm_shadow" | "scalp_eg"
  | "aim_120_amraam" | "harm_agm88" | "unknown";

interface MissileEvent {
  eventId: string;
  subtype: MissileSubtype;
  substatus: MissileSubstatus;
  model?: { value: MissileModel; confidence: number; sourceCount: number };
  lat?: number;
  lon?: number;
  launchLat?: number;
  launchLon?: number;
  targetType?: { value: TargetType; confidence: number };
  intercepted?: boolean;
  interceptSystem?: string;
  salvoId?: string;
  country: string;
  regionCode?: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  titleEn?: string;
  titleUk?: string;
  summaryEn?: string;
  summaryUk?: string;
  sourceUrls?: string[];
  linkedInfrastructureEventId?: string;
  occurredAt: string;
  verificationState: string;
  isPublic: boolean;
}

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_EVENTS: MissileEvent[] = [
  {
    eventId: "missile-001",
    subtype: "cruise",
    substatus: "impact",
    model: { value: "kh_101", confidence: 0.88, sourceCount: 4 },
    lat: 49.84,
    lon: 24.02,
    targetType: { value: "energy_infrastructure", confidence: 0.85 },
    country: "UA",
    regionCode: "UA-46",
    severity: 5,
    confidence: 0.88,
    titleEn: "Kh-101 cruise missile impact on energy infrastructure, Lviv Oblast",
    titleUk: "Удар крилатою ракетою Kh-101 по об'єкту енергетики, Львівська область",
    summaryEn: "Kh-101 cruise missile struck an energy substation in Lviv Oblast, causing regional power outages.",
    summaryUk: "Крилата ракета Kh-101 вразила підстанцію в Львівській області, спричинивши відключення світла.",
    sourceUrls: ["https://t.me/kpszsu"],
    linkedInfrastructureEventId: "infra-001",
    occurredAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "missile-002",
    subtype: "hypersonic",
    substatus: "impact",
    model: { value: "kh_47_kinzhal", confidence: 0.95, sourceCount: 6 },
    lat: 50.45,
    lon: 30.52,
    targetType: { value: "military_base", confidence: 0.8 },
    country: "UA",
    regionCode: "UA-30",
    severity: 5,
    confidence: 0.92,
    titleEn: "Kinzhal hypersonic missile strike on Kyiv",
    titleUk: "Удар гіперзвуковою ракетою «Кинджал» по Києву",
    summaryEn: "Kh-47 Kinzhal hypersonic missile struck Kyiv. Air defence was unable to intercept.",
    summaryUk: "Гіперзвукова ракета Х-47 «Кинджал» вразила Київ. Перехопити не вдалося.",
    salvoId: "salvo-001",
    occurredAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "missile-003",
    subtype: "ballistic",
    substatus: "intercepted",
    model: { value: "iskander_m", confidence: 0.87, sourceCount: 3 },
    lat: 49.99,
    lon: 36.23,
    intercepted: true,
    interceptSystem: "patriot",
    country: "UA",
    regionCode: "UA-63",
    severity: 2,
    confidence: 0.85,
    titleEn: "Iskander-M intercepted over Kharkiv",
    titleUk: "«Іскандер-М» збитий над Харковом",
    summaryEn: "Patriot battery intercepted an Iskander-M ballistic missile heading toward Kharkiv.",
    summaryUk: "Батарея Patriot збила балістичну ракету «Іскандер-М», що летіла у бік Харкова.",
    occurredAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "missile-004",
    subtype: "cruise",
    substatus: "impact",
    model: { value: "kalibr", confidence: 0.82, sourceCount: 3 },
    lat: 47.84,
    lon: 35.14,
    targetType: { value: "industrial", confidence: 0.75 },
    country: "UA",
    regionCode: "UA-23",
    severity: 4,
    confidence: 0.8,
    titleEn: "Kalibr cruise missile strike on industrial target, Zaporizhzhia",
    titleUk: "Удар ракетою «Калібр» по промисловому об'єкту, Запоріжжя",
    summaryEn: "Kalibr cruise missile hit an industrial facility in Zaporizhzhia Oblast.",
    summaryUk: "Ракета «Калібр» влучила в промисловий об'єкт Запорізької області.",
    salvoId: "salvo-001",
    occurredAt: new Date(Date.now() - 9 * 3600_000).toISOString(),
    verificationState: "verified",
    isPublic: true,
  },
  {
    eventId: "missile-005",
    subtype: "mlrs",
    substatus: "impact",
    model: { value: "himars_atacms", confidence: 0.9, sourceCount: 4 },
    lat: 48.0,
    lon: 37.8,
    targetType: { value: "military_base", confidence: 0.88 },
    country: "UA",
    regionCode: "UA-14",
    severity: 4,
    confidence: 0.88,
    titleEn: "ATACMS strike on Russian military position, Donetsk Oblast",
    titleUk: "Удар ATACMS по російській військовій позиції, Донецька область",
    summaryEn: "Ukrainian ATACMS missile struck a Russian military logistics hub in Donetsk Oblast.",
    summaryUk: "Українська ракета ATACMS вразила російський логістичний вузол у Донецькій області.",
    occurredAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    verificationState: "verified",
    isPublic: true,
  },
];

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`layers:missiles:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const regionFilter = url.searchParams.get("region");
  const subtypeFilter = url.searchParams.get("subtype") as MissileSubtype | null;
  const substatusFilter = url.searchParams.get("substatus") as MissileSubstatus | null;
  const modelFilter = url.searchParams.get("model");
  const targetFilter = url.searchParams.get("targetType") as TargetType | null;
  const minSev = parseInt(url.searchParams.get("minSeverity") ?? "1", 10);
  const fromMs = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!).getTime() : 0;
  const toMs = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!).getTime() : Infinity;
  const salvoId = url.searchParams.get("salvoId");
  const verifiedOnly = url.searchParams.get("verified") === "true";

  let events = DEMO_EVENTS.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= fromMs && t <= toMs;
  });

  if (regionFilter) events = events.filter((e) => e.regionCode === regionFilter);
  if (subtypeFilter) events = events.filter((e) => e.subtype === subtypeFilter);
  if (substatusFilter) events = events.filter((e) => e.substatus === substatusFilter);
  if (modelFilter) events = events.filter((e) => e.model?.value === modelFilter);
  if (targetFilter) events = events.filter((e) => e.targetType?.value === targetFilter);
  if (minSev > 1) events = events.filter((e) => e.severity >= minSev);
  if (salvoId) events = events.filter((e) => e.salvoId === salvoId);
  if (verifiedOnly) events = events.filter((e) => e.verificationState === "verified");

  const meta = {
    total: events.length,
    bySubtype: Object.fromEntries(
      ["ballistic","cruise","hypersonic","air_launched","atgm","mlrs","anti_radiation"].map(
        (st) => [st, events.filter((e) => e.subtype === st).length],
      ),
    ),
    bySubstatus: Object.fromEntries(
      ["launched","in_flight","intercepted","impact","unconfirmed"].map(
        (ss) => [ss, events.filter((e) => e.substatus === ss).length],
      ),
    ),
    interceptRate: events.length > 0
      ? parseFloat((events.filter((e) => e.intercepted).length / events.length).toFixed(2))
      : 0,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };

  return NextResponse.json(
    { data: events, meta },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
